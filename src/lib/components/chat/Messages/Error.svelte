<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { i18n as i18nType } from 'i18next';

	import Info from '$lib/components/icons/Info.svelte';

	const i18n = getContext<Writable<i18nType>>('i18n');
	const dispatch = createEventDispatcher();

	export let content = '';

	const handleClear = () => {
		dispatch('clear');
	};
</script>

<div class="flex my-2 gap-2.5 border px-4 py-3 border-red-600/10 bg-red-600/10 rounded-lg">
	<div class="self-start mt-0.5">
		<Info className="size-5 text-red-700 dark:text-red-400" />
	</div>

	<div class=" self-center text-sm">
		<div>
			{#if typeof content === 'string'}
				{content}
			{:else if typeof content === 'object' && content !== null}
				{#if content?.error && content?.error?.message}
					{content.error.message}
				{:else if content?.detail}
					{content.detail}
				{:else if content?.message}
					{content.message}
				{:else}
					{JSON.stringify(content)}
				{/if}
			{:else}
				{JSON.stringify(content)}
			{/if}
		</div>
		<button
			type="button"
			class="self-start rounded-md border border-red-500/40 bg-transparent px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-500/10 dark:text-red-300"
			on:click={handleClear}
		>
			{$i18n.t('Clear')}
		</button>
	</div>
</div>
