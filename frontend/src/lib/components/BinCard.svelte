<script lang="ts">
  interface Bin {
    id: string;
    location: string;
    fullnessPercentage: number;
    status: 'empty' | 'partial' | 'full';
    lastCollected: string;
  }

  let { bin, onUpdate }: { bin: Bin; onUpdate?: (id: string, fullness: number) => Promise<void> } = $props();

  let editing = $state(false);
  let newFullness = $state(bin.fullnessPercentage);
  let updating = $state(false);

  const statusColors = {
    empty: { bg: '#10b981', text: 'Empty' },
    partial: { bg: '#f59e0b', text: 'Partial' },
    full: { bg: '#ef4444', text: 'Full' }
  };

  async function handleUpdate() {
    if (!onUpdate) return;
    updating = true;
    await onUpdate(bin.id, newFullness);
    updating = false;
    editing = false;
  }
</script>

<div class="bin-card">
  <div class="bin-header">
    <span class="location">{bin.location}</span>
    <span class="status-badge" style="background-color: {statusColors[bin.status].bg}">
      {statusColors[bin.status].text}
    </span>
  </div>
  
  <div class="fullness-container">
    <div class="fullness-label">
      <span>Fullness</span>
      <span class="fullness-value">{bin.fullnessPercentage}%</span>
    </div>
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        style="width: {bin.fullnessPercentage}%; background-color: {statusColors[bin.status].bg}"
      ></div>
    </div>
  </div>

  {#if editing}
    <div class="edit-section">
      <input 
        type="range" 
        min="0" 
        max="100" 
        bind:value={newFullness}
        class="slider"
      />
      <span class="slider-value">{newFullness}%</span>
      <div class="edit-buttons">
        <button class="btn-save" onclick={handleUpdate} disabled={updating}>
          {updating ? '...' : 'Save'}
        </button>
        <button class="btn-cancel" onclick={() => { editing = false; newFullness = bin.fullnessPercentage; }}>
          Cancel
        </button>
      </div>
    </div>
  {:else}
    <button class="btn-edit" onclick={() => editing = true}>
      ✏️ Update Fullness
    </button>
  {/if}
  
  <div class="last-collected">
    Last collected: {new Date(bin.lastCollected).toLocaleDateString()}
  </div>
</div>

<style>
  .bin-card {
    background: linear-gradient(145deg, #1e293b, #0f172a);
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1.25rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .bin-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  .bin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .location {
    font-size: 1.1rem;
    font-weight: 600;
    color: #f1f5f9;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
  }

  .fullness-container {
    margin-bottom: 1rem;
  }

  .fullness-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
  }

  .fullness-value {
    font-weight: 600;
    color: #f1f5f9;
  }

  .progress-bar {
    height: 8px;
    background: #334155;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .edit-section {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #334155;
    border-radius: 8px;
  }

  .slider {
    flex: 1;
    min-width: 100px;
    accent-color: #38bdf8;
  }

  .slider-value {
    font-weight: 600;
    color: #38bdf8;
    min-width: 40px;
  }

  .edit-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .btn-save, .btn-cancel, .btn-edit {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .btn-save {
    background: #10b981;
    color: white;
  }

  .btn-cancel {
    background: #64748b;
    color: white;
  }

  .btn-edit {
    width: 100%;
    background: #334155;
    color: #94a3b8;
    margin-bottom: 1rem;
  }

  .btn-edit:hover {
    background: #475569;
    color: #f1f5f9;
  }

  .btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .last-collected {
    font-size: 0.75rem;
    color: #64748b;
  }
</style>
