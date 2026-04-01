<script>
	import { toast } from 'svelte-sonner';

	import { onMount, getContext, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// [ADDITION]
	let errorMessage = '';

	import { getBackendConfig } from '$lib/apis';
	import { userSignOut } from '$lib/apis/auths';

	import { WEBUI_API_BASE_URL, WEBUI_BASE_URL } from '$lib/constants';
	import { WEBUI_NAME, config, user, socket } from '$lib/stores';

	import { generateInitialsImage, canvasPixelTest } from '$lib/utils';

	import Spinner from '$lib/components/common/Spinner.svelte';
	import OnBoarding from '$lib/components/OnBoarding.svelte';

	const i18n = getContext('i18n');

	let loaded = false;

	async function setLogoImage() {
		await tick();
		const logo = document.getElementById('logo');

		if (logo) {
			const isDarkMode = document.documentElement.classList.contains('dark');

			if (isDarkMode) {
				const darkImage = new Image();
				darkImage.src = '/static/favicon-dark.png';

				darkImage.onload = () => {
					logo.src = '/static/favicon-dark.png';
					logo.style.filter = ''; // Ensure no inversion is applied if favicon-dark.png exists
				};

				darkImage.onerror = () => {
					logo.style.filter = 'invert(1)'; // Invert image if favicon-dark.png is missing
				};
			}
		}
	}

	onMount(async () => {
		
		// [ADDITION]
		// Extract error message from URL parameters
		const urlParams = new URLSearchParams(window.location.search);
		errorMessage = urlParams.get('error') || '';
		
		loaded = true
		return null
	});
</script>

<svelte:head>
	<title>
		{`${$WEBUI_NAME}`}
	</title>
</svelte:head>

<div class="w-full h-screen max-h-[100dvh] relative">
	<div class="w-full h-full absolute top-0 left-0 bg-white dark:bg-black"></div>

	<div class="w-full absolute top-0 left-0 right-0 h-8 drag-region" />

	{#if loaded}
		<div class="fixed m-10 z-50">
			<div class="flex space-x-2">
				<div class=" self-center">
					<img
						id="logo"
						crossorigin="anonymous"
						src="{WEBUI_BASE_URL}/static/favicon.png"
						class=" w-6 rounded-full"
						alt=""
					/>
				</div>
			</div>
		</div>

		<div
			class="absolute w-full h-full backdrop-blur-lg bg-white/10 dark:bg-gray-900/50 flex justify-center"
		>
			<div class="m-auto pb-10 flex flex-col justify-center">
				<div class="max-w-md">
					<div
						class="text-center text-2xl font-medium z-50 text-black dark:text-white"
						style="white-space: pre-wrap;"
					>
						{$i18n.t('Account Not Authorized')}<br />
						<!-- {$i18n.t('Contact Admin for WebUI Access')} -->
					</div>

					<!-- [ADDITION] -->
					{#if errorMessage}
						<div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
							<div class="text-sm text-red-700 dark:text-red-300 break-words">
								{errorMessage}
							</div>
						</div>
					{/if}

					<div class="mt-4 text-center text-sm text-gray-700 dark:text-gray-200 w-full">
						<span>{$i18n.t('If you used Globus to sign in, please')}</span>
						<a href="https://auth.globus.org/v2/web/logout" target="_blank" rel="noopener" class="underline text-blue-600 dark:text-blue-400 mx-1">
							{$i18n.t('sign out from Globus')}
						</a>
						<span>{$i18n.t('and sign in again with the correct organization.')}</span>
					</div>

					<div class=" mt-6 mx-auto relative group w-fit">
						<button
							class="relative z-20 flex px-5 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-none hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white transition font-medium text-sm"
							on:click={async () => {
								const res = await userSignOut();
								user.set(null);
								localStorage.removeItem('token');
								location.href = '/auth';
							}}
						>
							{$i18n.t('Return')}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
