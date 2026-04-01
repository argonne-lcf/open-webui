# Auto-Logout Feature

## Overview

The auto-logout feature automatically signs out users when they are inactive for a specified period of time. This enhances security by ensuring that user sessions don't remain active indefinitely when users are not actively using the application.

## Features

- **Configurable timeout**: Default 60 minutes of inactivity before logout
- **Warning notification**: Shows a warning 5 minutes before automatic logout
- **User activity detection**: Monitors mouse, keyboard, scroll, and touch events
- **Tab visibility awareness**: Resets timer when tab becomes visible
- **Internationalization support**: Warning messages are translated
- **Development mode**: Shorter timeouts for testing

## Configuration

The auto-logout feature is configured in `src/routes/+layout.svelte`:

```typescript
startAutoLogout({
    inactivityTimeout: 60, // 60 minutes
    warningTime: 5, // 5 minutes warning
    checkInterval: 30 // check every 30 seconds
});
```

### Parameters

- `inactivityTimeout`: Time in minutes before automatic logout (default: 60)
- `warningTime`: Time in minutes before logout to show warning (default: 5)
- `checkInterval`: How often to check for inactivity in seconds (default: 30)
- `devMode`: Enable shorter timeouts for testing (default: false)

## User Experience

1. **Normal operation**: Users can interact normally with the application
2. **Warning phase**: 5 minutes before logout, users see a warning toast with:
   - Message: "You will be automatically signed out in 5 minutes due to inactivity."
   - Action button: "Stay Logged In" to reset the timer
3. **Automatic logout**: After the timeout period, users are automatically signed out and redirected to the login page
   - **OAuth users**: Globus users navigated directly to logout page, other providers use popup approach
   - **Regular users**: Standard logout process

## Activity Detection

The system monitors the following user activities:
- Mouse movements and clicks
- Keyboard input
- Scrolling
- Touch events
- Tab focus/visibility changes
- Any DOM focus events

## Development and Testing

To test the auto-logout functionality with shorter timeouts:

1. **Enable dev mode**: Set `DEV_MODE = true` in `src/lib/utils/autoLogout.ts`
2. **Or use devMode parameter**: Pass `devMode: true` to the startAutoLogout function

In dev mode:
- Inactivity timeout: 1 minute
- Warning time: 30 seconds
- Check interval: 10 seconds

## Implementation Details

### Files Modified

- `src/lib/utils/autoLogout.ts` - Core auto-logout functionality
- `src/routes/+layout.svelte` - Integration with main layout
- `src/lib/i18n/locales/en-US/translation.json` - English translations
- `src/lib/i18n/locales/en-GB/translation.json` - British English translations

### OAuth Detection

The system detects OAuth users by checking for an `oauth_provider` cookie set by the backend during OAuth authentication. When this cookie is present (e.g., "globus", "google", "microsoft"), the auto-logout process will:

1. Call `userOauthSignOut()` to sign out from the OAuth provider
2. Call `userSignOut()` to clean up the local session
3. Redirect to the login page

### OAuth Logout Flow

The system uses different OAuth logout approaches depending on the context:

**Regular Sign-out (Manual)**:
- Uses `userOauthSignOut()` function with popup-based approach
- Opens OAuth provider logout page in new tab
- Simple and reliable for user-initiated actions

**Auto-logout**:
- Uses direct navigation (`location.href`) for Globus users to avoid popup blockers
- Uses regular popup approach for other OAuth providers
- Optimized for automatic processes where popup blockers are more restrictive

### Key Components

- `AutoLogoutManager` class: Manages timers and event listeners
- `startAutoLogout()`: Initializes the auto-logout system
- `stopAutoLogout()`: Cleans up timers and listeners
- `resetAutoLogoutActivity()`: Resets the inactivity timer
- `getOAuthProvider()`: Detects OAuth provider from `oauth_provider` cookie
- `performLogout()`: Handles logout by calling `performAutoLogoutOAuthSignout()` and `userSignOut()`
- `performAutoLogoutOAuthSignout()`: Specialized OAuth logout for auto-logout scenarios

## Security Considerations

- The feature only activates when users are logged in
- All timers and listeners are properly cleaned up on logout
- The system respects existing authentication flows
- **OAuth support**: Automatically detects and handles OAuth sign-out for providers like Google, Globus, Microsoft, GitHub, etc.
- **OAuth logout flow**: Hybrid approach - popup-based for manual logout, direct navigation for auto-logout
- No sensitive data is stored locally

## Customization

To customize the auto-logout behavior:

1. Modify the configuration in `src/routes/+layout.svelte`
2. Add translations for new languages in the i18n files
3. Adjust the activity detection events in `AutoLogoutManager`
4. Customize the warning UI by modifying the toast implementation

## Troubleshooting

### Common Issues

1. **Auto-logout not working**: Check if the user is properly authenticated
2. **Warning not showing**: Verify i18n translations are loaded
3. **Timer not resetting**: Ensure activity events are being captured
4. **OAuth logout**: Manual logout uses popups, auto-logout uses direct navigation for Globus to avoid popup blockers

### Debug Mode

Enable console logging by adding debug statements to the `AutoLogoutManager` class methods. 