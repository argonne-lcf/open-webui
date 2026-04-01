<script lang="ts">
    import Switch from '$lib/components/common/Switch.svelte';
    import Textarea from '$lib/components/common/Textarea.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import Info from '$lib/components/icons/Info.svelte';
	import { getContext } from 'svelte';

	const i18n = getContext('i18n');

	export let onChange: (params: any) => void = () => {};

	export let admin = false;
	export let custom = false;

	const defaultParams = {
		stream_response: null, // Set stream responses for this model individually
		frequency_penalty: null,
		logprobs: null,
		max_completion_tokens: null,
		modalities: null,
		n: null,
		presence_penalty: null,
		reasoning_effort: null,
		seed: null,
		service_tier: null,
		temperature: null,
		top_logprobs: null,
		top_p: null,
	};

	export let params = defaultParams;
	$: if (params) {
		onChange(params);
	}
	
	// State variables for info displays
	let showStreamResponseInfo = false;
	let showFrequencyPenaltyInfo = false;
	let showLogprobsInfo = false;
	let showMaxCompletionTokensInfo = false;
	let showModalitiesInfo = false;
	let showNInfo = false;
	let showPresencePenaltyInfo = false;
	let showReasoningEffortInfo = false;
	let showSeedInfo = false;
	let showServiceTierInfo = false;
	let showTemperatureInfo = false;
	let showTopLogprobsInfo = false;
	let showTopPInfo = false;

</script>

<div class=" space-y-1 text-xs pb-safe-bottom">

	<!-- stream responses -->
	<div class=" py-0.5 w-full justify-between">
		<div class="flex w-full justify-between">
			<div class="flex items-center gap-1">
				<div class=" self-center text-xs font-medium">
					{'stream_response'}
				</div>
				<button
					class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
					type="button"
					on:click={() => {
						showStreamResponseInfo = !showStreamResponseInfo;
					}}
				>
					<Info className="size-3" />
				</button>
			</div>

			<button
				class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
				type="button"
				on:click={() => {
					params.stream_response =
						(params?.stream_response ?? null) === null
							? true
							: params.stream_response
								? false
								: null;
				}}
			>
				{#if params.stream_response === true}
					<span class="ml-2 self-center">{$i18n.t('On')}</span>
				{:else if params.stream_response === false}
					<span class="ml-2 self-center">{$i18n.t('Off')}</span>
				{:else}
					<span class="ml-2 self-center">{$i18n.t('Default')}</span>
				{/if}
			</button>
		</div>
		
		{#if showStreamResponseInfo}
			<div class="mt-1 p-2 text-xs bg-muted rounded-md">
				{$i18n.t('When enabled, the model will respond to each chat message in real-time, generating a response as soon as the user sends a message. This mode is useful for live chat applications, but may impact performance on slower hardware.')}
			</div>
		{/if}

	</div>
    <!-- frequency_penalty -->
    <div class=" py-0.5 w-full justify-between">
		<div class="flex w-full justify-between">
			<div class="flex items-center gap-1">
				<div class=" self-center text-xs font-medium">
					{'frequency_penalty'}
				</div>
				<button
					class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
					type="button"
					on:click={() => {
						showFrequencyPenaltyInfo = !showFrequencyPenaltyInfo;
					}}
				>
					<Info className="size-3" />
				</button>
			</div>

			<button
				class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
				type="button"
				on:click={() => {
					params.frequency_penalty = (params?.frequency_penalty ?? null) === null ? 1.1 : null;
				}}
			>
				{#if (params?.frequency_penalty ?? null) === null}
					<span class="ml-2 self-center">{$i18n.t('Default')}</span>
				{:else}
					<span class="ml-2 self-center">{$i18n.t('Custom')}</span>
				{/if}
			</button>
		</div>
		
		{#if showFrequencyPenaltyInfo}
			<div class="mt-1 p-2 text-xs bg-muted rounded-md">
				{$i18n.t('Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model\'s likelihood to repeat the same line verbatim.')}
			</div>
		{/if}

		{#if (params?.frequency_penalty ?? null) !== null}
			<div class="flex mt-0.5 space-x-2">
				<div class=" flex-1">
					<input
						id="steps-range"
						type="range"
						min="-2"
						max="2"
						step="0.05"
						bind:value={params.frequency_penalty}
						class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
					/>
				</div>
				<div>
					<input
						bind:value={params.frequency_penalty}
						type="number"
						class=" bg-transparent text-center w-14"
						min="-2"
						max="2"
						step="any"
					/>
				</div>
			</div>
		{/if}
	</div>


    <!-- logprobs -->
    <div class=" py-0.5 w-full justify-between">
        <div class="flex w-full justify-between">
            <div class="flex items-center gap-1">
                <div class=" self-center text-xs font-medium">
                    {'logprobs'}
                </div>
                <button
                    class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                    on:click={() => {
                        showLogprobsInfo = !showLogprobsInfo;
                    }}
                >
                    <Info className="size-3" />
                </button>
            </div>
            <button
                class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
                type="button"
                on:click={() => {
                    params.logprobs = (params?.logprobs ?? null) === null ? true : null;
                }}
            >
                {#if (params?.logprobs ?? null) === null}
                    <span class="ml-2 self-center"> {$i18n.t('Default')} </span>
                {:else}
                    <span class="ml-2 self-center"> {$i18n.t('Custom')} </span>
                {/if}
            </button>
        </div>
        
        {#if showLogprobsInfo}
            <div class="mt-1 p-2 text-xs bg-muted rounded-md">
                {$i18n.t('Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities of each output token returned in the content of message.')}
            </div>
        {/if}
    
        {#if (params?.logprobs ?? null) !== null}
            <div class="flex justify-between items-center mt-1">
                <div class="text-xs text-gray-500">
                    {params.logprobs ? 'Enabled' : 'Disabled'}
                </div>
                <div class=" pr-2">
                    <Switch bind:state={params.logprobs} />
                </div>
            </div>
        {/if}
    </div>

    <!-- max_completion_token -->
    <div class=" py-0.5 w-full justify-between">
		<div class="flex w-full justify-between">
			<div class="flex items-center gap-1">
				<div class=" self-center text-xs font-medium">
					{'max_completion_tokens'}
				</div>
				<button
					class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
					type="button"
					on:click={() => {
						showMaxCompletionTokensInfo = !showMaxCompletionTokensInfo;
					}}
				>
					<Info className="size-3" />
				</button>
			</div>

			<button
				class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
				type="button"
				on:click={() => {
					params.max_completion_tokens = (params?.max_completion_tokens ?? null) === null ? 128 : null;
				}}
			>
				{#if (params?.max_completion_tokens ?? null) === null}
					<span class="ml-2 self-center">{$i18n.t('Default')}</span>
				{:else}
					<span class="ml-2 self-center">{$i18n.t('Custom')}</span>
				{/if}
			</button>
		</div>
		
		{#if showMaxCompletionTokensInfo}
			<div class="mt-1 p-2 text-xs bg-muted rounded-md">
				{$i18n.t('An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.')}
			</div>
		{/if}

		{#if (params?.max_completion_tokens ?? null) !== null}
			<div class="flex mt-0.5 space-x-2">
				<div class=" flex-1">
					<input
						id="steps-range"
						type="range"
						min="0"
						max="128000"
						step="1"
						bind:value={params.max_completion_tokens}
						class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
					/>
				</div>
				<div>
					<input
						bind:value={params.max_completion_tokens}
						type="number"
						class=" bg-transparent text-center w-14"
						min="0"
						step="1"
					/>
				</div>
			</div>
		{/if}
	</div>

    <!-- modalities -->
    <div class=" py-0.5 w-full justify-between">
        <div class="flex w-full justify-between">
            <div class="flex items-center gap-1">
                <div class=" self-center text-xs font-medium">
                    {'modalities'}
                </div>
                <button
                    class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                    on:click={() => {
                        showModalitiesInfo = !showModalitiesInfo;
                    }}
                >
                    <Info className="size-3" />
                </button>
            </div>
            <button
                class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
                type="button"
                on:click={() => {
                    params.modalities = (params?.modalities ?? null) === null ? ['text'] : null;
                }}
            >
                {#if (params?.modalities ?? null) === null}
                    <span class="text-muted-foreground">Default</span>
                {:else}
                    <span class="text-foreground">Custom</span>
                {/if}
            </button>
        </div>
        
        {#if showModalitiesInfo}
            <div class="mt-1 p-2 text-xs bg-muted rounded-md">
                {$i18n.t('Output types that you would like the model to generate. Choose from "text" and/or "audio". Must include at least one.')}
            </div>
        {/if}
    </div>
    
    {#if (params?.modalities ?? null) !== null}
        <div class="flex flex-col gap-2 mt-2">
            <div class="flex flex-wrap gap-2">
                <label class="flex items-center gap-2 text-xs">
                    <input
                        type="checkbox"
                        checked={params.modalities.includes('text')}
                        on:change={(e) => {
                            if (e.target.checked) {
                                if (!params.modalities.includes('text')) {
                                    params.modalities = [...params.modalities, 'text'];
                                }
                            } else {
                                if (params.modalities.length > 1) {
                                    params.modalities = params.modalities.filter(m => m !== 'text');
                                }
                            }
                        }}
                    />
                    text
                </label>
                <label class="flex items-center gap-2 text-xs">
                    <input
                        type="checkbox"
                        checked={params.modalities.includes('audio')}
                        on:change={(e) => {
                            if (e.target.checked) {
                                if (!params.modalities.includes('audio')) {
                                    params.modalities = [...params.modalities, 'audio'];
                                }
                            } else {
                                if (params.modalities.length > 1) {
                                    params.modalities = params.modalities.filter(m => m !== 'audio');
                                }
                            }
                        }}
                    />
                    audio
                </label>
            </div>
            {#if params.modalities.length === 0}
                <div class="text-xs text-red-500">At least one modality must be selected</div>
            {/if}
        </div>
    {/if}

    <!-- n -->
	<div class=" py-0.5 w-full justify-between">
		<div class="flex w-full justify-between">
			<div class="flex items-center gap-1">
				<div class=" self-center text-xs font-medium">
					{'n'}
				</div>
				<button
					class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
					type="button"
					on:click={() => {
						showNInfo = !showNInfo;
					}}
				>
					<Info className="size-3" />
				</button>
			</div>
			<button
				class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
				type="button"
				on:click={() => {
					params.n = (params?.n ?? null) === null ? 1 : null;
				}}
			>
				{#if (params?.n ?? null) === null}
					<span class="ml-2 self-center">{$i18n.t('Default')}</span>
				{:else}
					<span class="ml-2 self-center">{$i18n.t('Custom')}</span>
				{/if}
			</button>
		</div>
		
		{#if showNInfo}
			<div class="mt-1 p-2 text-xs bg-muted rounded-md">
				{$i18n.t('How many chat completion choices to generate for each input message. Note that you will be charged based on the number of generated tokens across all of the choices. Keep n as 1 to minimize costs.')}
			</div>
		{/if}

		{#if (params?.n ?? null) !== null}
			<div class="flex mt-0.5 space-x-2">
				<div class=" flex-1">
					<input
						id="steps-range"
						type="range"
						min="1"
						max="4"
						step="1"
						bind:value={params.n}
						class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
					/>
				</div>
				<div>
					<input
						bind:value={params.n}
						type="number"
						class=" bg-transparent text-center w-14"
						min="1"
						max="128"
						step="1"
					/>
				</div>
			</div>
		{/if}
	</div>

    <!-- presence_penalty -->
    <div class=" py-0.5 w-full justify-between">
		<div class="flex w-full justify-between">
			<div class="flex items-center gap-1">
				<div class=" self-center text-xs font-medium">
					{'presence_penalty'}
				</div>
				<button
					class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
					type="button"
					on:click={() => {
						showPresencePenaltyInfo = !showPresencePenaltyInfo;
					}}
				>
					<Info className="size-3" />
				</button>
			</div>

			<button
				class="p-1 px-3 text-xs flex rounded transition flex-shrink-0 outline-none"
				type="button"
				on:click={() => {
					params.presence_penalty = (params?.presence_penalty ?? null) === null ? 0.0 : null;
				}}
			>
				{#if (params?.presence_penalty ?? null) === null}
					<span class="ml-2 self-center">{$i18n.t('Default')}</span>
				{:else}
					<span class="ml-2 self-center">{$i18n.t('Custom')}</span>
				{/if}
			</button>
		</div>
		
		{#if showPresencePenaltyInfo}
			<div class="mt-1 p-2 text-xs bg-muted rounded-md">
				{$i18n.t('Sets a flat bias against tokens that have appeared at least once. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient. At 0, it is disabled.')}
			</div>
		{/if}

		{#if (params?.presence_penalty ?? null) !== null}
			<div class="flex mt-0.5 space-x-2">
				<div class=" flex-1">
					<input
						id="steps-range"
						type="range"
						min="-2"
						max="2"
						step="0.05"
						bind:value={params.presence_penalty}
						class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
					/>
				</div>
				<div>
					<input
						bind:value={params.presence_penalty}
						type="number"
						class=" bg-transparent text-center w-14"
						min="-2"
						max="2"
						step="any"
					/>
				</div>
			</div>
		{/if}
	</div>

    <!-- reasoning_effort -->
    <div class=" py-0.5 w-full justify-between">
		<div class="flex w-full justify-between">
			<div class="flex items-center gap-1">
				<div class=" self-center text-xs font-medium">
					{$i18n.t('reasoning_effort')}
				</div>
				<button
					class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
					type="button"
					on:click={() => {
						showReasoningEffortInfo = !showReasoningEffortInfo;
					}}
				>
					<Info className="size-3" />
				</button>
			</div>
			<button
				class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
				type="button"
				on:click={() => {
					params.reasoning_effort = (params?.reasoning_effort ?? null) === null ? 'medium' : null;
				}}
			>
				{#if (params?.reasoning_effort ?? null) === null}
					<span class="ml-2 self-center"> {$i18n.t('Default')} </span>
				{:else}
					<span class="ml-2 self-center"> {$i18n.t('Custom')} </span>
				{/if}
			</button>
		</div>
		
		{#if showReasoningEffortInfo}
			<div class="mt-1 p-2 text-xs bg-muted rounded-md">
				{$i18n.t('Constrains effort on reasoning for reasoning models. Currently supported values are low, medium, and high. Reducing reasoning effort can result in faster responses and fewer tokens used on reasoning in a response.')}
			</div>
		{/if}

		{#if (params?.reasoning_effort ?? null) !== null}
			<div class="flex mt-0.5 space-x-2">
				<div class="flex items-center gap-2">
					<label class="flex items-center gap-2 text-xs">
						<input
							type="radio"
							bind:group={params.reasoning_effort}
							value="low"
						/>
						low
					</label>
					<label class="flex items-center gap-2 text-xs">
						<input
							type="radio"
							bind:group={params.reasoning_effort}
							value="medium"
						/>
						medium
					</label>
					<label class="flex items-center gap-2 text-xs">
						<input
							type="radio"
							bind:group={params.reasoning_effort}
							value="high"
						/>
						high
					</label>
				</div>
			</div>
		{/if}
	</div>

    <!-- seed -->
    <div class=" py-0.5 w-full justify-between">
		<div class="flex w-full justify-between">
			<div class="flex items-center gap-1">
				<div class=" self-center text-xs font-medium">
					{$i18n.t('seed')}
				</div>
				<button
					class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
					type="button"
					on:click={() => {
						showSeedInfo = !showSeedInfo;
					}}
				>
					<Info className="size-3" />
				</button>
			</div>

			<button
				class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
				type="button"
				on:click={() => {
					params.seed = (params?.seed ?? null) === null ? 0 : null;
				}}
			>
				{#if (params?.seed ?? null) === null}
					<span class="ml-2 self-center"> {$i18n.t('Default')} </span>
				{:else}
					<span class="ml-2 self-center"> {$i18n.t('Custom')} </span>
				{/if}
			</button>
		</div>
		
		{#if showSeedInfo}
			<div class="mt-1 p-2 text-xs bg-muted rounded-md">
				{$i18n.t('This feature is in Beta. If specified, our system will make a best effort to sample deterministically, such that repeated requests with the same seed and parameters should return the same result. Determinism is not guaranteed.')}
			</div>
		{/if}

		{#if (params?.seed ?? null) !== null}
			<div class="flex mt-0.5 space-x-2">
				<div class=" flex-1">
					<input
						id="steps-range"
						type="range"
						min="0"
						max="10000000"
						step="1"
						bind:value={params.seed}
						class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
					/>
				</div>
				<div>
					<input
						bind:value={params.seed}
						type="number"
						class=" bg-transparent text-center w-20"
						min="0"
						max="4294967296"
						step="1"
					/>
				</div>
			</div>
		{/if}
	</div>

	<!-- service_tier -->
	<div class=" py-0.5 w-full justify-between">
		<div class="flex w-full justify-between">
			<div class="flex items-center gap-1">
				<div class=" self-center text-xs font-medium">
					{'service_tier'}
				</div>
				<button
					class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
					type="button"
					on:click={() => {
						showServiceTierInfo = !showServiceTierInfo;
					}}
				>
					<Info className="size-3" />
				</button>
			</div>
			<button
				class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
				type="button"
				on:click={() => {
					params.service_tier = (params?.service_tier ?? null) === null ? 'auto' : null;
				}}
			>
				{#if (params?.service_tier ?? null) === null}
					<span class="ml-2 self-center">{$i18n.t('Default')}</span>
				{:else}
					<span class="ml-2 self-center">{$i18n.t('Custom')}</span>
				{/if}
			</button>
		</div>
		
		{#if showServiceTierInfo}
			<div class="mt-1 p-2 text-xs bg-muted rounded-md">
				{$i18n.t('When the service_tier parameter is set, the response body will include the service_tier value based on the processing mode actually used to serve the request. This response value may be different from the value set in the parameter.')}
			</div>
		{/if}

		{#if (params?.service_tier ?? null) !== null}
			<div class="flex mt-0.5 space-x-2">
				<div class="flex items-center gap-2">
					<label class="flex items-center gap-2 text-xs">
						<input
							type="radio"
							bind:group={params.service_tier}
							value="auto"
						/>
						auto
					</label>
					<label class="flex items-center gap-2 text-xs">
						<input
							type="radio"
							bind:group={params.service_tier}
							value="default"
						/>
						default
					</label>
				</div>
			</div>
		{/if}
	</div>

    <!-- temperature -->
    <div class=" py-0.5 w-full justify-between">
		<div class="flex w-full justify-between">
			<div class="flex items-center gap-1">
				<div class=" self-center text-xs font-medium">
					{$i18n.t('temperature')}
				</div>
				<button
					class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
					type="button"
					on:click={() => {
						showTemperatureInfo = !showTemperatureInfo;
					}}
				>
					<Info className="size-3" />
				</button>
			</div>
			<button
				class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
				type="button"
				on:click={() => {
					params.temperature = (params?.temperature ?? null) === null ? 0.8 : null;
				}}
			>
				{#if (params?.temperature ?? null) === null}
					<span class="ml-2 self-center"> {$i18n.t('Default')} </span>
				{:else}
					<span class="ml-2 self-center"> {$i18n.t('Custom')} </span>
				{/if}
			</button>
		</div>
		
		{#if showTemperatureInfo}
			<div class="mt-1 p-2 text-xs bg-muted rounded-md">
				{$i18n.t('What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. We generally recommend altering this or top_p but not both.')}
			</div>
		{/if}

		{#if (params?.temperature ?? null) !== null}
			<div class="flex mt-0.5 space-x-2">
				<div class=" flex-1">
					<input
						id="steps-range"
						type="range"
						min="0"
						max="2"
						step="0.05"
						bind:value={params.temperature}
						class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
					/>
				</div>
				<div>
					<input
						bind:value={params.temperature}
						type="number"
						class=" bg-transparent text-center w-14"
						min="0"
						max="2"
						step="any"
					/>
				</div>
			</div>
		{/if}
	</div>

	<!-- top_logprobs -->
	<div class=" py-0.5 w-full justify-between">
		<div class="flex w-full justify-between">
			<div class="flex items-center gap-1">
				<div class=" self-center text-xs font-medium">
					{'top_logprobs'}
				</div>
				<button
					class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
					type="button"
					on:click={() => {
						showTopLogprobsInfo = !showTopLogprobsInfo;
					}}
				>
					<Info className="size-3" />
				</button>
			</div>
			<button
				class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
				type="button"
				on:click={() => {
					params.top_logprobs = (params?.top_logprobs ?? null) === null ? 0 : null;
				}}
			>
				{#if (params?.top_logprobs ?? null) === null}
					<span class="ml-2 self-center">{$i18n.t('Default')}</span>
				{:else}
					<span class="ml-2 self-center">{$i18n.t('Custom')}</span>
				{/if}
			</button>
		</div>
		
		{#if showTopLogprobsInfo}
			<div class="mt-1 p-2 text-xs bg-muted rounded-md">
				{$i18n.t('An integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability. logprobs must be set to true if this parameter is used.')}
			</div>
		{/if}

		{#if (params?.top_logprobs ?? null) !== null}
			<div class="flex mt-0.5 space-x-2">
				<div class=" flex-1">
					<input
						id="steps-range"
						type="range"
						min="0"
						max="20"
						step="1"
						bind:value={params.top_logprobs}
						class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
					/>
				</div>
				<div>
					<input
						bind:value={params.top_logprobs}
						type="number"
						class=" bg-transparent text-center w-14"
						min="0"
						max="20"
						step="1"
					/>
				</div>
			</div>
		{/if}
	</div>

    <!-- top_p -->
    <div class=" py-0.5 w-full justify-between">
		<div class="flex w-full justify-between">
			<div class="flex items-center gap-1">
				<div class=" self-center text-xs font-medium">
					{'top_p'}
				</div>
				<button
					class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
					type="button"
					on:click={() => {
						showTopPInfo = !showTopPInfo;
					}}
				>
					<Info className="size-3" />
				</button>
			</div>

			<button
				class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
				type="button"
				on:click={() => {
					params.top_p = (params?.top_p ?? null) === null ? 0.9 : null;
				}}
			>
				{#if (params?.top_p ?? null) === null}
					<span class="ml-2 self-center">{$i18n.t('Default')}</span>
				{:else}
					<span class="ml-2 self-center">{$i18n.t('Custom')}</span>
				{/if}
			</button>
		</div>
		
		{#if showTopPInfo}
			<div class="mt-1 p-2 text-xs bg-muted rounded-md">
				{$i18n.t('An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered. Generally recommend altering this or temperature but not both.')}
			</div>
		{/if}

		{#if (params?.top_p ?? null) !== null}
			<div class="flex mt-0.5 space-x-2">
				<div class=" flex-1">
					<input
						id="steps-range"
						type="range"
						min="0"
						max="1"
						step="0.05"
						bind:value={params.top_p}
						class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
					/>
				</div>
				<div>
					<input
						bind:value={params.top_p}
						type="number"
						class=" bg-transparent text-center w-14"
						min="0"
						max="1"
						step="any"
					/>
				</div>
			</div>
		{/if}
	</div>

	{#if admin}

		{#if custom && admin}
			<div class="flex flex-col justify-center">
				{#each Object.keys(params?.custom_params ?? {}) as key}
					<div class=" py-0.5 w-full justify-between mb-1">
						<div class="flex w-full justify-between">
							<div class=" self-center text-xs font-medium">
								<input
									type="text"
									class=" text-xs w-full bg-transparent outline-none"
									placeholder={$i18n.t('Custom Parameter Name')}
									value={key}
									on:change={(e) => {
										const newKey = e.target.value.trim();
										if (newKey && newKey !== key) {
											params.custom_params[newKey] = params.custom_params[key];
											delete params.custom_params[key];
											params = {
												...params,
												custom_params: { ...params.custom_params }
											};
										}
									}}
								/>
							</div>
							<button
								class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden"
								type="button"
								on:click={() => {
									delete params.custom_params[key];
									params = {
										...params,
										custom_params: { ...params.custom_params }
									};
								}}
							>
								{$i18n.t('Remove')}
							</button>
						</div>
						<div class="flex mt-0.5 space-x-2">
							<div class=" flex-1">
								<input
									bind:value={params.custom_params[key]}
									type="text"
									class="text-sm w-full bg-transparent outline-hidden outline-none"
									placeholder={$i18n.t('Custom Parameter Value')}
								/>
							</div>
						</div>
					</div>
				{/each}

				<button
					class=" flex gap-2 items-center w-full text-center justify-center mt-1 mb-5"
					type="button"
					on:click={() => {
						params.custom_params = (params?.custom_params ?? {}) || {};
						params.custom_params['custom_param_name'] = 'custom_param_value';
					}}
				>
					<div>
						<Plus />
					</div>
					<div>{$i18n.t('Add Custom Parameter')}</div>
				</button>
			</div>
		{/if}
	{/if}
</div>
