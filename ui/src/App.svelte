<script>
  import WorldCard from './lib/WorldCard.svelte';
  import SystemInfo from './lib/SystemInfo.svelte';
  import logo from './assets/logo.transparentbg.png';

  let newworld = {id: '(new)', name: 'Generate World', state: 'new', port: 'survival'}
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
        worlds = [newworld].concat(await fetch('/api/world/list').then(r => r.json()));
      } catch (err) {
        worlds = [{port: String(err).substr(0,8), ...disconnectedworld}];
      }
    }
  }
  setTimeout(() => App.list(), 1000);
</script>

<main>
  <div class="heading pt-4 mx-auto d-flex justify-content-between">
    <h1><img src={logo} alt="ROCKY: minecraft bedrock server controller"/></h1>
    <div class="systeminfo d-flex justify-content-right align-items-end"><SystemInfo /></div>
  </div>

  <section>
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
    max-width: 1000px;
    margin: 0 auto;
  }
  .heading h1 img {
    width: 340px;
  }
  .heading .systeminfo {
    width: 240px; 
    height: 105px;
  }
  section {
    padding-top: 2em;
  }
  .worlds {
    display: flex;
    flex-wrap: wrap;
  }
  @media all and (max-width: 760px) { 
    .worlds {
      justify-content: space-evenly;
    }
  }
</style>
