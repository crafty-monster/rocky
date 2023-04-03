<script>
  import WorldCard from './lib/WorldCard.svelte';
  import logo from './assets/logo.transparentbg.png';

  let newworld = {id: '(new)', name: 'Create World', state: 'new', port: 'survival'}
  let disconnectedworld = {id: '(error)', name: 'Disconnected', state: 'disconnected'}
  let worlds = [newworld];
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
      try {
        worlds = await fetch('/api/world/list').then(r => r.json());
        worlds.push(newworld);
      } catch (err) {
        worlds = [{port: String(err).substr(0,8), ...disconnectedworld}];
      }
    }
  }
  setTimeout(() => App.list(), 1000);
</script>

<main>
  <div class="pt-4 mx-auto">
    <h1><img src={logo} alt="rocky: Minecraft Server Manager"/></h1>
  </div>

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
    <button class="btn btn-light" on:click={ () => fetch('/api/world/stopAll', {method: 'POST'}).then(() => App.list()) }>
      stop worlds
    </button>
    <button class="btn btn-light" on:click={ () => fetch('/api/world', {method: 'DELETE'}).then(() => App.list()) }>
      remove stopped worlds
    </button>
  </section>

  <section class="worlds">
    {#if !worlds}
      <WorldCard id="disconnected" name="disconnected"/>
    {/if}
    {#each worlds as world}
      <WorldCard {...world} on:stopped={App.list} on:started={App.list} on:deleted={App.list} on:create={App.create}/>
    {/each}
  </section>
</main>

<style>
  main {
    max-width: 1300px;
    margin: 0 auto;
  }
  main h1 img {
    width: 340px;
  }
  section {
    padding-top: 2em;
  }
  .worlds {
    display: flex;
    flex-wrap: wrap;
  }
  /** REMOVE BELOW 
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
  }*/
</style>
