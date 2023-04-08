<script>
  // TODO: Add `docker system prune` functionality
  // TODO: Add `docker volume prune` functionality
  // TODO: Add `docker log container` functionality
  import World from './World.svelte';
  import SystemInfo from './SystemInfo.svelte';
  import logo from '../assets/logo.transparentbg.png';

  export let username = null;
  
  let ready = false;
  let newworld = {id: '(new)', name: 'Generate World', state: 'new', port: 'survival', by: username};
  let disconnectedworld = {id: '(error)', name: 'Disconnected', state: 'disconnected'};
  let worlds = [newworld];
  const adjectives = ['nifty', 'golden', 'pristine', 'dark', 'red', 'shadow', 'shining', 'magnificent', 'dangerous', 'pure', 'white', 'iron', 'diamond', 'copper', 'frozen', 'lofty', 'splendid', 'mysterious', 'magical', 'strange', 'hidden', 'fancy', 'scary', 'shimmering', 'tricky', 'puny'];
  const nouns = ['pickaxe', 'sword', 'allay', 'jungle', 'mountains', 'skies', 'caves', 'forge', 'smithy', 'village', 'forest', 'grassland', 'seas', 'islands', 'desert', 'piglin', 'cobblestone', 'deepslate', 'compass', 'ocelot', 'lava', 'farm', 'golem', 'creeper', 'slime', 'witch', 'zombie', 'dragon', 'pillager', 'netherite'];
  
  class Dashboard {
    static async create() {
      if (!confirm('Create new world?')) return;
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      console.log('adjectives', adjectives.length);
      console.log('nouns', nouns.length);
      console.log('total', adjectives.length*nouns.length);
      const settings = {
        'servername': `${adjective}-${noun}`,
        'gamemode': 'survival',
        'difficulty': 'easy',
      };
      await fetch('/api/world/create', { method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(settings) });
      setTimeout(() => Dashboard.list(), 2000);
    }
    static async list() {
      try {
        worlds = [newworld].concat(await fetch('/api/world/list').then(r => r.json()));
        if (worlds.length > 8) {
          worlds.shift();
        }
        console.log('Worlds loaded,all ready');
        setTimeout(() => ready = true, 100);
      } catch (err) {
        worlds = [];
      }
    }
  }
  setTimeout(() => Dashboard.list(), 100);

</script>

<main class={ready ? 'd-block' : 'd-none'}>
  <div class="heading pt-4 mx-auto d-flex justify-content-between">
    <h1><img src={logo} alt="ROCKY: minecraft bedrock server controller"/></h1>
    <div class="systeminfo d-flex justify-content-right align-items-end"><SystemInfo /></div>
  </div>

  <section>
    <button class="btn btn-light" on:click={ () => fetch('/api/server/containers') }>
      list containers
    </button>
    <button class="btn btn-light" on:click={Dashboard.list}>
      list worlds
    </button>
    <button class="btn btn-light" on:click={ () => fetch('/api/world/stopAll', {method: 'POST'}).then(() => Dashboard.list()) }>
      stop worlds
    </button>
    <button class="btn btn-light" on:click={ () => fetch('/api/world', {method: 'DELETE'}).then(() => Dashboard.list()) }>
      remove stopped worlds
    </button>
  </section>

  <section class="worlds">
    {#if !worlds}
      <World id="disconnected" name="disconnected"/>
    {/if}
    {#each worlds as world}
      <World {...world} on:stopped={Dashboard.list} on:started={Dashboard.list} on:deleted={Dashboard.list} on:create={Dashboard.create}/>
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
  .systeminfo {
    width: 240px; 
    height: 105px;
  }
  section {
    padding-top: 1.5em;
  }
  .worlds {
    display: flex;
    flex-wrap: wrap;
  }
  @media all and (max-width: 760px) { 
    .worlds {
      justify-content: space-evenly;
    }
    .heading {
      flex-direction: column;
      text-align: center;
    }
    .systeminfo {
      width: 100%;
      height: auto;
    }
  }
</style>
