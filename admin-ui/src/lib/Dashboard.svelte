<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import World from './World.svelte';
  import SystemInfo from './SystemInfo.svelte';
  import TerminalModal from './TerminalModal.svelte';
  import StatusModal from './StatusModal.svelte';
  import logo from '../assets/logo.transparentbg.png';

  export let username = null;
  
  let ready = false;
  let disconnected = false;
  let newworld = {id: '(new)', name: 'Generate World', state: 'new', port: 'survival', by: username};
  let worlds = null;
  const adjectives = ['nifty', 'golden', 'pristine', 'dark', 'red', 'shadow', 'shining', 'magnificent', 'dangerous', 'pure', 'white', 'iron', 'diamond', 'copper', 'frozen', 'lofty', 'splendid', 'mysterious', 'magical', 'strange', 'hidden', 'fancy', 'scary', 'shimmering', 'tricky', 'puny'];
  const nouns = ['pickaxe', 'sword', 'allay', 'jungle', 'mountains', 'skies', 'caves', 'forge', 'smithy', 'village', 'forest', 'grassland', 'seas', 'islands', 'desert', 'piglin', 'cobblestone', 'deepslate', 'compass', 'ocelot', 'lava', 'farm', 'golem', 'creeper', 'slime', 'witch', 'zombie', 'dragon', 'pillager', 'netherite'];
  const terminalModal = {
    show: false,
    worldId: null,
  };
  const statusModal = {
    show: false,
    worldId: null,
  }

  class Dashboard {
    static async mounted() {
      const r = await fetch('/api/server/connected');
      disconnected = !r.ok;
      if (!disconnected) {
        await Dashboard.list()
      }
      ready = true;
    }
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
      setTimeout(Dashboard.list, 2000);
    }
    static async list() {
      console.log('Dashboard.list()');
      try {
        worlds = await fetch('/api/world/list').then(r => r.json());
        if (worlds.length < 9) {
          worlds.push(newworld);
        }
        console.log('Worlds loaded,all ready');
        setTimeout(() => ready = true, 100);
      } catch (err) {
        worlds = [];
        console.error(err);
      }
    }
    static status(world) {
      console.log('Dashboard.status()', world);
      statusModal.show = true;
      statusModal.world = world;
    }
    static terminal(world) {
      console.log('Dashboard.terminal()', world);
      terminalModal.show = true;
      terminalModal.world = world;
    }
  }
  onMount(Dashboard.mounted);
</script>

<main class={ready ? 'd-block' : 'd-none'}>
  <div class="heading pt-4 mx-auto d-flex justify-content-between">
    <h1><img src={logo} alt="ROCKY: minecraft bedrock server controller"/></h1>
    <div class="systeminfo d-flex justify-content-right align-items-end"><SystemInfo /></div>
  </div>

  <TerminalModal bind:show={terminalModal.show} world={terminalModal.world} />
  <StatusModal show={false} world={statusModal.world} />

  <section>
    <button disabled={disconnected} class="btn btn-light" on:click={ () => fetch('/api/server/containers') }>
      list containers
    </button>
    <button disabled={disconnected} class="btn btn-light" on:click={Dashboard.list}>
      list worlds
    </button>
    <button disabled={disconnected} class="btn btn-light" on:click={ () => confirm('Stop all running worlds?') && fetch('/api/world/stopAll', {method: 'POST'}).then(Dashboard.list) }>
      stop worlds
    </button>
    <button disabled={disconnected} class="btn btn-light" on:click={ () => confirm('Are you sure you want to delete all stopped worlds?') && fetch('/api/world', {method: 'DELETE'}).then(Dashboard.list) }>
      remove stopped worlds
    </button>
    <button disabled={disconnected} class="btn btn-light" on:click={ () => confirm('This will clean up unused space in the server.\n\nDo you want to go ahead?') && fetch('/api/server/prune', {method: 'POST'}).then(r => r.json()).then(r => alert(`Saved ${r.totalMb}MB space`)).then(Dashboard.list) }>
      cleanup unused space
    </button>
  </section>

  <section class="worlds">
    {#if (disconnected || !worlds)}
      <div class="disconnected">
        <p><i class="fa fa-brands fa-docker"></i></p>
        <p><strong>Unable to connect!</strong></p>
        <p>Is Docker installed and running?</p>
      </div>
    {:else}
      {#each worlds as world}
        <World {...world} on:stopped={Dashboard.list} on:started={Dashboard.list} on:deleted={Dashboard.list} on:create={Dashboard.create} on:terminal={() => Dashboard.terminal(world)} on:status={() => Dashboard.status(world)}/>
      {/each}
    {/if}
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
  .disconnected {
    padding: 100px 0;
    margin: 0 10px;
    text-align: center;
    width: 100%;
    background: white;
    border-radius: 10px;
    box-shadow: 0 0 5px #ccc;
  }
  .disconnected i.fa {
    opacity: 0.2;
    font-size: 120px;
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
