<script>
  import WorldCard from './lib/WorldCard.svelte'

  let worlds = [];
  const adjectives = ['nifty', 'golden', 'pristine', 'dark', 'red', 'shadow', 'shining', 'magnificent', 'dangerous', 'pure', 'white', 'iron', 'diamond', 'copper', 'frozen', 'lofty', 'splendid', 'mysterious', 'magical', 'strange', 'hidden', 'fancy', 'scary', 'shimmering', 'tricky', 'puny'];
  const nouns = ['pickaxe', 'sword', 'allay', 'jungle', 'mountains', 'skies', 'caves', 'forge', 'smithy', 'village', 'forest', 'grassland', 'seas', 'desert', 'piglin', 'cobblestone', 'deepslate', 'compass', 'ocelot', 'lava', 'farm', 'golem', 'creeper', 'slime', 'witch', 'zombie', 'dragon', 'pillager', 'netherite'];
  
  class App {
    static async create() {
      if (!confirm('Create new world?')) return;
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
      setTimeout(() => App.list(), 1000);
    }
    static async list() {
      worlds = await fetch('/api/world/list').then(r => r.json());
    }
  }
  setTimeout(() => App.list(), 1000);
</script>

<main>
  <div class="container py-4 px-3 mx-auto">
    <h1>rocky: Minecraft Server Manager</h1>
  </div>

  <ul class="nav nav-pills">
    <li class="nav-item">
      <a class="nav-link active" aria-current="page" href="#">Main</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="#">Other</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="#">Link</a>
    </li>
    <li class="nav-item">
      <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
    </li>
  </ul>

  <section>
    <button class="btn btn-light" on:click={ () => fetch('/api/healthcheck') }>
      healthcheck
    </button>
    <button class="btn btn-light" on:click={ () => fetch('/api/server/up') }>
      server up
    </button>
    <button class="btn btn-light" on:click={ () => fetch('/api/server/info') }>
      server info
    </button>
    <button class="btn btn-light" on:click={ () => fetch('/api/server/containers') }>
      list containers
    </button>
    <button class="btn btn-light" on:click={App.list}>
      list worlds
    </button>
    <button class="btn btn-light" on:click={App.create}>
      create world
    </button>
    <button class="btn btn-light" on:click={ () => fetch('/api/world/stopAll', {method: 'POST'}) }>
      stop worlds
    </button>
    <button class="btn btn-light" on:click={ () => fetch('/api/world', {method: 'DELETE'}) }>
      remove stopped worlds
    </button>
  </section>

  <section class="worlds">
    {#each worlds as world}
      <WorldCard {...world} on:stopped={App.list} on:started={App.list} on:deleted={App.list}/>
    {/each}
  </section>
</main>

<style>
  main {
    max-width: 1300px;
    margin: 0 auto;
  }
  section {
    padding-top: 2em;
  }
  .worlds {
    display: flex;
    flex-wrap: wrap;
  }
  /** REMOVE BELOW */
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
