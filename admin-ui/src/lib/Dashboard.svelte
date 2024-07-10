<script>
  // @ts-nocheck
  // TODO: Download backup
  // TODO: Upload restore backup
  import { onMount } from 'svelte';
  import World from './World.svelte';
  import SystemInfo from './SystemInfo.svelte';
  import TerminalModal from './TerminalModal.svelte';
  import StatusModal from './StatusModal.svelte';
  import BackupModal from './BackupModal.svelte';
  import logo from '../assets/logo.transparentbg.png';

  export let username = null;
  
  let ready = false;
  let disconnected = false;
  let newworld = {id: '(new)', name: 'New World', state: 'new', port: 'survival', by: username};
  let worlds = null;
  let server = null;
  const adjectives = ['nifty', 'golden', 'pristine', 'dark', 'red', 'shadow', 'shining', 'magnificent', 'dangerous', 'pure', 'white', 'iron', 'diamond', 'copper', 'frozen', 'lofty', 'splendid', 'mysterious', 'magical', 'strange', 'hidden', 'fancy', 'scary', 'shimmering', 'fantastic', 'amazing', 'tricky', 'puny'];
  const nouns = ['pickaxe', 'sword', 'allay', 'jungle', 'mountains', 'skies', 'caves', 'forge', 'smithy', 'village', 'forest', 'grassland', 'seas', 'islands', 'desert', 'piglin', 'cobblestone', 'deepslate', 'compass', 'ocelot', 'lava', 'farm', 'golem', 'creeper', 'slime', 'witch', 'zombie', 'dragon', 'pillager', 'netherite'];
  const terminalModal = {
    show: false,
    world: {},
  };
  const statusModal = {
    show: false,
    world: {},
  }
  const backupModal = {
    show: false,
    worlds: [],
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
      const response = await fetch('/api/world/create', { method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(settings) });
      if (response.status !== 200) {
        const json = await response.json();
        console.error(json);
        alert(json?.message);
      }
      setTimeout(Dashboard.list, 2000);
    }
    static async list() {
      console.log('Dashboard.list()');
      try { 
        worlds = await fetch('/api/world/list').then(r => r.json());
        const worldsForUser = worlds.filter(w => w.by === username);
        const {ROCKY_MAX_WORLDS, ROCKY_MAX_WORLDS_PER_USER} = server?.config || {};
        const maxWorldsReached = (worlds.length >= ROCKY_MAX_WORLDS || worldsForUser.length >= ROCKY_MAX_WORLDS_PER_USER);
        if (!maxWorldsReached) {
          worlds.push(newworld);
        }
        console.log('Worlds loaded,all ready');
        setTimeout(() => ready = true, 100);
      } catch (err) {
        worlds = [];
        console.error(err);
      }
    }
    static backups() {
      console.log('Dashboard.backups()');
      backupModal.show = true;
      backupModal.worlds = worlds?.filter(w => w != newworld);
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

<main class={ready ? 'is-block' : 'is-hidden'}>
  <header class="pt-4 mx-auto is-flex is-justify-content-space-between">
    <h1><img src={logo} alt="ROCKY: minecraft bedrock server controller"/></h1>
    <div class="systeminfo is-flex is-justify-content-right is-align-items-flex-end"><SystemInfo bind:server /></div>
  </header>

  <TerminalModal bind:show={terminalModal.show} world={terminalModal.world} />
  <StatusModal bind:show={statusModal.show} world={statusModal.world} />
  <BackupModal bind:show={backupModal.show} worlds={backupModal.worlds} />

  <section class="px-3">
    <button disabled={disconnected} class="button is-light" on:click={Dashboard.list}>
      refresh worlds
    </button>
    <button disabled={disconnected} class="button is-light" on:click={ () => confirm('Stop all running worlds?') && fetch('/api/world/stopAll', {method: 'POST'}).then(Dashboard.list) }>
      stop worlds
    </button>
    <button disabled={disconnected} class="button is-light" on:click={Dashboard.backups}>
      backups
    </button>
    <button disabled={disconnected} class="button is-light" on:click={ () => confirm('Are you sure you want to delete all stopped worlds?') && fetch('/api/world', {method: 'DELETE'}).then(Dashboard.list) }>
      remove stopped worlds
    </button>
    <button disabled={disconnected} class="button is-light" on:click={ () => confirm('This will clean up unused space in the server.\n\nDo you want to go ahead?') && fetch('/api/server/prune', {method: 'POST'}).then(r => r.json()).then(r => alert(`Saved ${r.totalMb}MB space`)).then(Dashboard.list) }>
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
  header h1 img {
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
    header {
      flex-direction: column;
      text-align: center;
    }
    .systeminfo {
      width: 100%;
      height: auto;
    }
  }
</style>
