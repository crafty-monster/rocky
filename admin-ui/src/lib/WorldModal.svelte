<script>
  // @ts-nocheck

  import Modal from './Modal.svelte';

  export let show = false;
  export let world = {};
  export let view = 'console';
  let disabled = false;
  let loading = false;

  $: fetchLogs(world), disabled = world.state !== 'running';
  $: clearLogs(show);
  
  let logs = [];
  const el = {
    pre: null,
    command: null,
  };
  let command = '';

  function toggle(v) {
    console.log('toggle()', v);
    view = v;
    if (v === 'console') {
      fetchLogs();
    }
  }

  function clearLogs() {
    console.log('clearLogs()');
    logs = [];
  }

  async function fetchLogs() {
    console.log('fetchLogs()', world.id);
    if (!world.id) return;
    loading = true;
    logs = await fetch(`/api/world/${world.id}/logs/16`).then(r => r.json());
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
      setTimeout(fetchLogs, 100);
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
      <!-- <li class="nav-item">
        <a href="javascript:;" on:click={() => toggle('actions')} on:keyup={() => toggle('actions')} class={'nav-link ' + (view === 'actions' ? 'active' : '')} >Actions</a>
      </li> -->
      <li class="nav-item">
        <!-- svelte-ignore a11y-invalid-attribute -->
        <a href="javascript:;" on:click={() => toggle('console')} on:keyup={() => toggle('console')} class={'nav-link ' + (view === 'console' ? 'active' : '')} >Console</a>
      </li>
      <li class="pt-1" style="margin-left: auto">
        <i class={`fa fa-refresh fa-lg ${loading ? 'fa-spin': ''}`} on:click={fetchLogs} on:keyup={fetchLogs}></i>
      </li>
    </ul>
    {#if (view === 'console')}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <pre bind:this={el.pre} on:click={() => el.command.focus()}>{logs.join('\n')}</pre>
    <input disabled={disabled} placeholder=">" bind:this={el.command} type="text" class="command" bind:value={command} on:keypress={keypress}>
    <small>Common commands:</small>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('help')}>Help</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('op Bob')}>Add Operator</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('teleport Bob Mary')}>Teleport</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('difficulty easy')}>Set Difficulty</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('gamerule showcoordinates true')}>Show coordinates</button>
    <button disabled={disabled} class="btn btn-light btn-sm" on:click={() => setCommand('tell @a Hello guys')}>Message to all</button>
    {:else}
    <label for="difficulty" class="form-label">Difficulty</label>
    <select id="difficulty" class="form-select">
      <option selected value="peaceful">peaceful</option>
      <option value="easy">easy</option>
      <option value="medium">medium</option>
      <option value="hard">hard</option>
    </select>
    {/if}
  </div>
</Modal>

<style>
  .main {
    width: 80vw;
    height: 70vh;
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
  pre {
    font-size: 75%;
    background: #111;
    padding: 10px;
    color: #eee;
    border-radius: 5px;
    overflow-y: scroll;
    overflow-x: hidden;
    height: 40vh;
    margin-bottom: 0;
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
</style>