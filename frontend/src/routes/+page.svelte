<script lang="ts">
  import BinCard from '$lib/components/BinCard.svelte';
  import { onMount } from 'svelte';

  const API_URL = 'http://localhost:4000/api';

  interface Bin {
    id: string;
    location: string;
    fullnessPercentage: number;
    status: 'empty' | 'partial' | 'full';
    lastCollected: string;
  }

  let bins: Bin[] = $state([]);
  let newLocation = $state('');
  let loading = $state(true);
  let submitting = $state(false);
  let error = $state('');

  async function fetchBins() {
    try {
      console.log('Fetching bins...');
      const res = await fetch(`${API_URL}/bins`);
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Fetched bins:', data);
      bins = data;
    } catch (e) {
      console.error('Fetch error:', e);
      error = 'Failed to fetch bins: ' + (e instanceof Error ? e.message : 'Unknown error');
    } finally {
      loading = false;
    }
  }

  async function addBin(e: Event) {
    e.preventDefault();
    if (!newLocation.trim()) return;

    submitting = true;
    try {
      const res = await fetch(`${API_URL}/bins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: newLocation.trim(),
          fullnessPercentage: 0
        })
      });

      if (res.ok) {
        const newBin = await res.json();
        bins = [newBin, ...bins];
        newLocation = '';
      }
    } catch (e) {
      error = 'Failed to add bin';
    } finally {
      submitting = false;
    }
  }

  async function updateBin(id: string, fullnessPercentage: number) {
    try {
      const res = await fetch(`${API_URL}/bins/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullnessPercentage })
      });

      if (res.ok) {
        const updatedBin = await res.json();
        bins = bins.map(b => b.id === id ? { ...updatedBin, id: updatedBin.id || updatedBin._id } : b);
      }
    } catch (e) {
      console.error('Update error:', e);
    }
  }

  onMount(fetchBins);
</script>

<svelte:head>
  <title>Waste Management - Bin Tracker</title>
</svelte:head>

<main>
  <header>
    <h1>🗑️ Bin Tracker</h1>
    <p>Monitor and manage waste collection bins</p>
  </header>

  <form class="add-bin-form" onsubmit={addBin}>
    <input
      type="text"
      bind:value={newLocation}
      placeholder="Enter bin location..."
      disabled={submitting}
    />
    <button type="submit" disabled={submitting || !newLocation.trim()}>
      {submitting ? 'Adding...' : '+ Add Bin'}
    </button>
  </form>

  {#if loading}
    <div class="loading">Loading bins...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if bins.length === 0}
    <div class="empty">No bins found. Add one above!</div>
  {:else}
    <div class="bins-grid">
      {#each bins as bin (bin.id)}
        <BinCard {bin} onUpdate={updateBin} />
      {/each}
    </div>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    min-height: 100vh;
    color: #f1f5f9;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem;
    background: linear-gradient(90deg, #38bdf8, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  header p {
    color: #94a3b8;
    margin: 0;
  }

  .add-bin-form {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  input {
    flex: 1;
    padding: 0.875rem 1rem;
    border: 2px solid #334155;
    border-radius: 8px;
    background: #1e293b;
    color: #f1f5f9;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #38bdf8;
  }

  input::placeholder {
    color: #64748b;
  }

  button {
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #38bdf8, #818cf8);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
  }

  button:hover:not(:disabled) {
    transform: scale(1.02);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .bins-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .loading,
  .error,
  .empty {
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
  }

  .error {
    color: #ef4444;
  }
</style>
