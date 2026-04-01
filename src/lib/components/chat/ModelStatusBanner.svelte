<script lang="ts">
  import { getContext } from 'svelte';
  import type { i18n as i18nType } from 'i18next';
  import { fade } from 'svelte/transition';
  import ArchiveBox from '../icons/ArchiveBox.svelte'; // Use ArchiveBox directly

  export let selectedModels: string[] = [];
  export let models: any[] = [];

  const i18n: i18nType = getContext('i18n');

  // Debug logging for props
  $: console.log('ModelStatusBanner - Props received:', {
    selectedModels,
    modelsCount: models.length,
    models: models.map(m => ({ id: m.id, name: m.name, status: m.status }))
  });

  // Find all selected models that are starting, queued or offline
  $: warningModels = selectedModels
    .map((id) => {
      const model = models.find((m) => m.id === id);
      console.log(`ModelStatusBanner - Looking for model ${id}:`, model);
      return model;
    })
    .filter((m) => {
      const isWarning = m && (m.status === 'starting' || m.status === 'queued' || m.status === 'offline');
      console.log(`ModelStatusBanner - Model ${m?.id} status check:`, {
        model: m?.id,
        status: m?.status,
        isWarning
      });
      return isWarning;
    });

  $: showBanner = warningModels.length > 0;
  
  // Debug logging for computed values
  $: console.log('ModelStatusBanner - Computed values:', {
    warningModels: warningModels.map(m => ({ id: m.id, name: m.name, status: m.status })),
    showBanner,
    selectedModelsCount: selectedModels.length,
    modelsCount: models.length
  });

  function getStatusText(status: string) {
    // These keys should be added to translation files:
    // 'is starting and will be live soon'
    // 'is currently queued and may take time to respond'
    // 'is offline, will be queued when used'
    if (status === 'queued') {
      return i18n?.t?.('is currently queued and may take time to respond', { defaultValue: 'is currently queued and may take time to respond' }) || 'is currently queued and may take time to respond';
    } else if (status === 'offline') {
      return i18n?.t?.('is offline, will be queued when used', { defaultValue: 'is offline, will be queued when used' }) || 'is offline, will be queued when used';
    } else if (status === 'starting') {
      return i18n?.t?.('is starting, will be live soon', { defaultValue: 'is starting, will be live soon' }) || 'is starting, will be live soon';
    }
    return '';
  }
</script>

{#if showBanner && warningModels.length > 0}
  <div class="banner-container" in:fade={{ duration: 200 }} out:fade={{ duration: 300 }}>
    <div class="model-status-banner">
      <div class="banner-content">
        <div class="icon">
          <ArchiveBox />
        </div>
        <div class="text">
          {#each warningModels as model, i}
            <span class="model-name">{model.name ?? model.id}</span>
            <span class="status-text">{getStatusText(model.status)}</span>
            {#if i < warningModels.length - 1}
              <span class="separator">&nbsp;|&nbsp;</span>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  </div>
{:else}
  <!-- Debug: Show when banner should NOT be displayed -->
  <div style="display: none;">
    Debug: Banner not showing - showBanner: {showBanner}, warningModels.length: {warningModels.length}
  </div>
{/if}

<style>
.banner-container {
  width: 100%;
  max-width: 72rem; /* max-w-6xl equivalent */
  margin: 0 auto;
  padding: 0 0.625rem; /* px-2.5 equivalent */
}

.model-status-banner {
  position: relative;
  margin: 0.5rem auto;
  background: rgba(255, 165, 0, 0.15); /* orange, very light */
  border: 1px solid rgba(255, 165, 0, 0.3);
  color: #d97706; /* amber-600 for light theme */
  border-radius: 0.75rem;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 1rem;
  font-weight: 500;
  pointer-events: none; /* Ensure it doesn't block interactions */
}

/* Dark theme overrides */
:global(.dark) .model-status-banner {
  background: rgba(255, 165, 0, 0.2);
  border-color: rgba(255, 165, 0, 0.4);
  color: #fbbf24; /* amber-400 for dark theme */
}
.banner-content {
  display: flex;
  align-items: center;
}
.icon {
  margin-right: 0.75rem;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  color: #d97706; /* amber-600 for light theme */
  opacity: 0.95;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dark theme overrides */
:global(.dark) .icon {
  color: #fbbf24; /* amber-400 for dark theme */
}
.text {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.model-name {
  font-weight: bold;
  margin-right: 0.25rem;
}
.status-text {
  margin-right: 0.5rem;
}
.separator {
  color: #d97706; /* amber-600 for light theme */
  opacity: 0.7;
}

/* Dark theme overrides */
:global(.dark) .separator {
  color: #fbbf24; /* amber-400 for dark theme */
}
@media (max-width: 600px) {
  .banner-container {
    padding: 0 0.625rem; /* px-2.5 equivalent */
  }
  .model-status-banner {
    font-size: 0.9rem;
    padding: 0.4rem 0.7rem;
  }
}
</style> 
