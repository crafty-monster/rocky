<script>
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'

  const adjectives = ['nifty', 'golden', 'pristine', 'dark', 'red', 'shadow', 'shining', 'magnificent', 'dangerous', 'pure', 'white', 'iron', 'diamond', 'copper', 'frozen', 'lofty', 'splendid', 'mysterious', 'magical', 'strange'];
  const nouns = ['pickaxe', 'sword', 'allay', 'jungle', 'mountains', 'skies', 'caves', 'forge', 'smithy', 'village', 'forest', 'grassland', 'seas', 'desert', 'pigling', 'cobblestone', 'deepslate', 'compass', 'ocelot', 'lava'];
  const create = () => {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    console.log('adjectives', adjectives.length);
    console.log('nouns', nouns.length);
    console.log('total', adjectives.length*nouns.length);
    const settings = {
      'server-name': `${adjective}-${noun}`,
      'gamemode': 'survival',
      'difficulty': 'easy',
    };
    fetch('/api/world/create', { method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(settings) });
  }
</script>

<main>
  <div>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>

  <div class="card">
    <button on:click={ () => fetch('/api/healthcheck') }>
      healthcheck
    </button>
    <button on:click={ () => fetch('/api/server/up') }>
      server up
    </button>
    <button on:click={ () => fetch('/api/server/info') }>
      server info
    </button>
    <button on:click={ () => fetch('/api/server/containers') }>
      list containers
    </button>
    <button on:click={ () => fetch('/api/world/list') }>
      list worlds
    </button>
    <button on:click={create}>
      create world
    </button>
    <button on:click={ () => fetch('/api/world/stopAll', {method: 'POST'}) }>
      stop worlds
    </button>
    <button on:click={ () => fetch('/api/world', {method: 'DELETE'}) }>
      remove stopped worlds
    </button>
  </div>

  <div class="card">
    <Counter />
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Vite and Svelte logos to learn more
  </p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
