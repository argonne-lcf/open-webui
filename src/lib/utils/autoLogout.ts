import { userSignOut, userOauthSignOut } from '$lib/apis/auths';
import { user } from '$lib/stores';
import { toast } from 'svelte-sonner';

// Development mode configuration
// Set this to true to enable shorter timeouts for testing
const DEV_MODE = false;

export interface AutoLogoutConfig {
	inactivityTimeout: number; // in minutes
	warningTime: number; // in minutes - show warning before logout
	checkInterval: number; // in seconds - how often to check for inactivity
	devMode?: boolean; // for testing - uses shorter timeouts
}

export class AutoLogoutManager {
	private config: AutoLogoutConfig;
	private lastActivityTime: number;
	private inactivityTimer: NodeJS.Timeout | null = null;
	private warningTimer: NodeJS.Timeout | null = null;
	private checkTimer: NodeJS.Timeout | null = null;
	private isWarningShown = false;
	private i18n: any;

	constructor(config: AutoLogoutConfig = {
		inactivityTimeout: 60, // 60 minutes
		warningTime: 5, // 5 minutes warning
		checkInterval: 30 // check every 30 seconds
	}) {
		// Apply dev mode adjustments if enabled
		if (config.devMode || DEV_MODE) {
			config.inactivityTimeout = 1; // 1 minute for testing
			config.warningTime = 0.5; // 30 seconds warning for testing
			config.checkInterval = 10; // check every 10 seconds for testing
		}
		
		this.config = config;
		this.lastActivityTime = Date.now();
		this.i18n = null;
	}

	public start(): void {
		this.resetActivity();
		this.setupEventListeners();
		this.startInactivityCheck();
	}

	public stop(): void {
		this.clearTimers();
		this.removeEventListeners();
	}

	public resetActivity(): void {
		this.lastActivityTime = Date.now();
		this.isWarningShown = false;
		
		// Clear existing timers
		this.clearTimers();
		
		// Set new timers
		this.setupTimers();
	}

	private setupEventListeners(): void {
		// User activity events
		const events = [
			'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click',
			'focus', 'visibilitychange'
		];

		events.forEach(event => {
			document.addEventListener(event, () => this.resetActivity(), { passive: true });
		});

		// Handle visibility change specifically
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') {
				this.resetActivity();
			}
		});
	}

	private removeEventListeners(): void {
		const events = [
			'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click',
			'focus', 'visibilitychange'
		];

		events.forEach(event => {
			document.removeEventListener(event, () => this.resetActivity());
		});
	}

	private setupTimers(): void {
		const warningTimeMs = this.config.warningTime * 60 * 1000;
		const logoutTimeMs = this.config.inactivityTimeout * 60 * 1000;

		// Set warning timer
		this.warningTimer = setTimeout(() => {
			this.showWarning();
		}, logoutTimeMs - warningTimeMs);

		// Set logout timer
		this.inactivityTimer = setTimeout(() => {
			this.performLogout();
		}, logoutTimeMs);
	}

	private clearTimers(): void {
		if (this.warningTimer) {
			clearTimeout(this.warningTimer);
			this.warningTimer = null;
		}
		if (this.inactivityTimer) {
			clearTimeout(this.inactivityTimer);
			this.inactivityTimer = null;
		}
		if (this.checkTimer) {
			clearInterval(this.checkTimer);
			this.checkTimer = null;
		}
	}

	private startInactivityCheck(): void {
		// Check for inactivity every checkInterval seconds
		this.checkTimer = setInterval(() => {
			const now = Date.now();
			const timeSinceLastActivity = now - this.lastActivityTime;
			const warningTimeMs = this.config.warningTime * 60 * 1000;
			const logoutTimeMs = this.config.inactivityTimeout * 60 * 1000;

			// Show warning if we're within warning time and haven't shown it yet
			if (timeSinceLastActivity >= logoutTimeMs - warningTimeMs && !this.isWarningShown) {
				this.showWarning();
			}

			// Perform logout if timeout exceeded
			if (timeSinceLastActivity >= logoutTimeMs) {
				this.performLogout();
			}
		}, this.config.checkInterval * 1000);
	}

	private showWarning(): void {
		this.isWarningShown = true;
		const warningMessage = this.i18n?.t?.('You will be automatically signed out in {minutes} minutes due to inactivity.', { minutes: this.config.warningTime }) || 
			`You will be automatically signed out in ${this.config.warningTime} minutes due to inactivity.`;
		
		toast.warning(warningMessage, {
			duration: 10000, // 10 seconds
			action: {
				label: this.i18n?.t?.('Stay Logged In') || 'Stay Logged In',
				onClick: () => this.resetActivity()
			}
		});
	}

	private async performLogout(): Promise<void> {
		try {
			// Clear all timers
			this.clearTimers();
			
			// Check if user is using OAuth by looking for oauth_provider cookie
			console.log('Auto-logout:');
			
			// Perform OAuth signout if applicable (using location.href for auto-logout)
			await this.performAutoLogoutOAuthSignout("globus");
			
			// Perform regular logout
			const res = await userSignOut();
			user.set(undefined);
			localStorage.removeItem('token');

			// Show logout message
			toast.info(this.i18n?.t?.('You have been automatically signed out due to inactivity.') || 
				'You have been automatically signed out due to inactivity.');

			// Redirect to auth page
			location.href = res?.redirect_url ?? '/auth';
		} catch (error) {
			console.error('Auto-logout error:', error);
			// Force redirect even if logout API fails
			user.set(undefined);
			localStorage.removeItem('token');
			location.href = '/auth';
		}
	}

	private async performAutoLogoutOAuthSignout(provider: string): Promise<void> {
		// For auto-logout, use location.href to navigate to OAuth logout page
		// This avoids popup blocker issues during automatic processes
		
		if (provider === 'globus') {
			try {
				// Get OAuth configuration to find the client ID
				const configResponse = await fetch(`${window.location.origin}/api/config`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: 'include'
				});

				if (configResponse.ok) {
					const config = await configResponse.json();
					const globusClientId = config.oauth?.client_ids?.globus;
					
					const logoutUrl = globusClientId 
						? `https://auth.globus.org/v2/web/logout?client_id=${globusClientId}`
						: 'https://auth.globus.org/v2/web/logout';
					
					console.log('Auto-logout: Navigating to Globus logout page');
					window.location.href = logoutUrl;
				} else {
					console.log('Auto-logout: Navigating to Globus logout page (fallback)');
					window.location.href = 'https://auth.globus.org/v2/web/logout';
				}
			} catch (error) {
				console.error('Auto-logout: Error fetching OAuth config:', error);
				console.log('Auto-logout: Navigating to Globus logout page (error fallback)');
				window.location.href = 'https://auth.globus.org/v2/web/logout';
			}
		} else {
			// For other providers, use the regular userOauthSignOut function
			try {
				await userOauthSignOut(localStorage.token);
			} catch (error) {
				console.warn('Auto-logout: OAuth signout failed for non-Globus provider:', error);
			}
		}
	}

	private getOAuthProvider(): string | null {
		// Try to get OAuth provider from cookies
		const cookies = document.cookie.split(';');
		for (const cookie of cookies) {
			const [name, value] = cookie.trim().split('=');
			if (name === 'oauth_provider') {
				return value;
			}
		}
		return null;
	}

	public getTimeUntilLogout(): number {
		const now = Date.now();
		const timeSinceLastActivity = now - this.lastActivityTime;
		const logoutTimeMs = this.config.inactivityTimeout * 60 * 1000;
		return Math.max(0, logoutTimeMs - timeSinceLastActivity);
	}

	public getTimeUntilWarning(): number {
		const now = Date.now();
		const timeSinceLastActivity = now - this.lastActivityTime;
		const warningTimeMs = this.config.warningTime * 60 * 1000;
		const logoutTimeMs = this.config.inactivityTimeout * 60 * 1000;
		return Math.max(0, logoutTimeMs - warningTimeMs - timeSinceLastActivity);
	}

	public setI18n(i18n: any): void {
		this.i18n = i18n;
	}

	// Test method to verify OAuth detection (for development only)
	public testOAuthDetection(): string | null {
		return this.getOAuthProvider();
	}
}

// Create a singleton instance
let autoLogoutManager: AutoLogoutManager | null = null;

export function getAutoLogoutManager(config?: AutoLogoutConfig): AutoLogoutManager {
	if (!autoLogoutManager) {
		autoLogoutManager = new AutoLogoutManager(config);
	}
	return autoLogoutManager;
}

export function startAutoLogout(config?: AutoLogoutConfig): AutoLogoutManager {
	const manager = getAutoLogoutManager(config);
	manager.start();
	return manager;
}

export function stopAutoLogout(): void {
	if (autoLogoutManager) {
		autoLogoutManager.stop();
	}
}

export function resetAutoLogoutActivity(): void {
	if (autoLogoutManager) {
		autoLogoutManager.resetActivity();
	}
} 
