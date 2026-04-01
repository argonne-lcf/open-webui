<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { i18n as i18nType } from 'i18next';

	import Info from '$lib/components/icons/Info.svelte';

	// [ADDITION BEGINS] - Clear button to dismiss errors and continue the chat
	const i18n = getContext<Writable<i18nType>>('i18n');
	const dispatch = createEventDispatcher();

	const handleClear = () => {
		dispatch('clear');
	};
	// [ADDITION ENDS]

	export let content: unknown = '';

	const getErrorMessage = (value: unknown): string => {
		if (typeof value === 'string') {
			return value;
		}

		if (typeof value === 'object' && value !== null) {
			const error = 'error' in value ? value.error : null;

			if (
				typeof error === 'object' &&
				error !== null &&
				'message' in error &&
				typeof error.message === 'string'
			) {
				return error.message;
			}

			if ('detail' in value && typeof value.detail === 'string') {
				return value.detail;
			}

			if ('message' in value && typeof value.message === 'string') {
				return value.message;
			}

			return JSON.stringify(value) ?? String(value);
		}

		return JSON.stringify(value) ?? String(value);
	};

	$: message = getErrorMessage(content) || 'Error submitting message';
</script>

<div
	class="my-1.5 flex w-full items-start gap-2 rounded-2xl bg-black/[0.03] px-3 py-2 text-gray-500 dark:bg-white/[0.04] dark:text-gray-400"
>
	<Info className="mt-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-500" strokeWidth="1.8" />

	<div class="min-w-0 break-words text-[0.8125rem] leading-5">
		<div>
			{message}
		</div>
		<!-- [ADDITION] - Clear button -->
		<button
			type="button"
			class="self-start mt-1 rounded-md border border-red-500/40 bg-transparent px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-500/10 dark:text-red-300"
			on:click={handleClear}
		>
			{$i18n.t('Clear')}
		</button>
	</div>
</div>
