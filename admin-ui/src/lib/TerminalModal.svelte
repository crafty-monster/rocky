<script>
  // @ts-nocheck

  import Modal from './Modal.svelte';

  export let show = false;
  export let world = {};
  let disabled = false;
  let loading = false;

  $: fetchLogs(undefined, world), disabled = (world.state !== 'running');
  $: clearLogs(show);
  
  let logs = [];
  const el = {
    pre: null,
    command: null,
  };
  let command = '';

  function clearLogs() {
    console.log('clearLogs()');
    logs = [];
  }

  async function fetchLogs(n) {
    console.log('fetchLogs()', n, world.id);
    if (!world.id) return;
    loading = true;
    logs = await fetch(`/api/world/${world.id}/logs/${n ?? 18}`).then(r => r.json());
    loading = false;
    setTimeout(scrollToBottom, 50);
  }

  function scrollToBottom() {
    const pre = el.pre;
    if (pre?.scrollHeight) {
      pre.scrollTop = pre.scrollHeight;
      // pre.scrollLeft = pre.scrollWidth;
    }
  }

  function setCommand(cmd) {
    command = cmd;
    el.command.focus();
  }

  async function keypress(event) {
    console.log('keypress', event);
    if (event?.key === 'Enter' && command?.length) {
      const headers = {'Content-Type': 'application/json'};
      const body = JSON.stringify({command});
      await fetch(`/api/world/${world.id}/execute`, {method: 'POST', headers, body});
      setTimeout(fetchLogs, 500);
      command = '';
    }
  }
</script>


<Modal bind:show={show} buttonOk={false}>
  <div class={`main state-${world.state}`}>
    <h3>
      <img src="{'images/thumbs/map.' + String(world.id).substr(0,2) + '.jpg'}" alt={world.name}/>
      {world.name}
    </h3>
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <!-- svelte-ignore a11y-invalid-attribute -->
        <a href="javascript:;"class="nav-link active">Console</a>
      </li>
      <li class="pt-1" style="margin-left: auto">
        <i class={`fa fa-refresh fa-lg ${loading ? 'fa-spin': ''}`} on:click={() => fetchLogs(100)} on:keyup={() => fetchLogs(100)}></i>
      </li>
    </ul>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <pre class="terminal" bind:this={el.pre} on:click={() => el.command.focus()}>{logs.join('\n')}</pre>
    <input disabled={disabled} placeholder=">" bind:this={el.command} type="text" class="command" bind:value={command} on:keypress={keypress}>
    <small>Common commands:</small>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('help')}>Help</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('list')}>List Players</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('op Bob')}>Add Operator</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('op @a')}>Add Operator x All</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('teleport Bob Mary')}>Teleport</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('difficulty easy')}>Set Difficulty</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('gamerule showcoordinates true')}>Show coordinates</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('gamerule doinsomnia false')}>Stop Phantoms Spawning</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('gamerule pvp false')}>Stop Player Fighting</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('tell @a Hello guys')}>Message to all</button>
  </div>
</Modal>

<style>
  .main {
    width: 80vw;
    min-height: 70vh;
    overflow: hidden;
  }
  img {
    width: 60px;
    height: 60px;
    margin-right: 10px;
    border-radius: 100%;
  }
  ul {
    margin: 20px 0;
  }
  ul .fa-refresh {
    cursor: pointer;
    color: #aaa;
  }
  pre.terminal {
    font-size: 75%;
    background: #111;
    padding: 10px;
    color: #eee;
    border-radius: 5px;
    overflow-y: scroll;
    overflow-x: hidden;
    height: 46vh;
    margin-bottom: 0;
  }
  pre.terminal::-webkit-scrollbar {
    width: 10px;
  }
  pre.terminal::-webkit-scrollbar-track {
    background-color: rgba(255,255,255,0.2);
  }
  pre.terminal::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: rgba(255,255,255,0.5);
  }
  .state-exited pre {
    background: #333;
    color: #ccc;
  }
  select, input {
    background: #fffced
  }
  input.command {
    display: block;
    width: 100%;
    padding: 5px 10px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 75%;
    font-weight: bold;
    background: #111;
    color: #eee;
    border-radius: 3px;
    border: 1px solid black;
    margin-bottom: 10px;
  }
  .state-exited input.command {
    background: #333;
    color: #ccc;
  }
  /* PHABLET STYLES */
  @media all and (max-width: 760px) { 
    .main {
      width: 85vw;
    }
  }
</style>