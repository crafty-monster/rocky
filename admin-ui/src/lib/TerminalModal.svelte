<script>
  // @ts-nocheck

  import Modal from './Modal.svelte';

  let { show = $bindable(false), world = {} } = $props();
  let disabled = $state(false);
  let loading = $state(false);

  $effect(() => {
    fetchLogs(undefined, world);
    disabled = (world.state !== 'running');
  });
  $effect(() => { clearLogs(show); });

  let logs = $state([]);
  const el = {
    pre: null,
    command: null,
  };
  let command = $state('');

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
      command = '';
      await fetch(`/api/world/${world.id}/execute`, {method: 'POST', headers, body});
      setTimeout(fetchLogs, 1000);
    }
  }
</script>


<Modal bind:show={show} buttonOk={false}>
  <div class={`main state-${world.state}`}>
    <h3 class="is-flex is-align-items-center">
      <img src="{'images/thumbs/map.' + String(world.id).substr(0,2) + '.jpg'}" alt={world.name}/>
      {world.name}
    </h3>
    <div class="tabs is-boxed mb-0 is-small">
      <ul class="my-3">
        <li class="is-active">
          <!-- svelte-ignore a11y_invalid_attribute -->
          <a href="javascript:;"class="nav-link active">Console</a>
        </li>
        <li class="pt-1" style="margin-left: auto">
          <i class={`fa fa-refresh fa-lg ${loading ? 'fa-spin': ''}`} role="button" tabindex="0" onclick={() => fetchLogs(100)} onkeyup={() => fetchLogs(100)}></i>
        </li>
      </ul>
    </div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <pre class="terminal" bind:this={el.pre} onclick={() => el.command.focus()}>{logs.join('\n')}</pre>
    <input disabled={disabled} placeholder=">" bind:this={el.command} type="text" class="command" bind:value={command} onkeypress={keypress}>
    <p class="buttons are-small" style="line-height: 35px">
      <button disabled={disabled} class="button is-info" onclick={() => setCommand('help')}>Help</button>
      <button disabled={disabled} class="button is-info" onclick={() => setCommand('list')}>List Players</button>
      <button disabled={disabled} class="button is-danger" onclick={() => setCommand('op Bob')}>Add Operator</button>
      <button disabled={disabled} class="button is-danger" onclick={() => setCommand('op @a')}>Add Operator x All</button>
      <button disabled={disabled} class="button is-link" onclick={() => setCommand('teleport Bob Mary')}>Teleport</button>
      <button disabled={disabled} class="button is-primary" onclick={() => setCommand('difficulty easy')}>Set Difficulty</button>
      <button disabled={disabled} class="button is-primary" onclick={() => setCommand('time set day')}>Set Daytime</button>
      <button disabled={disabled} class="button is-primary" onclick={() => setCommand('weather clear')}>Set Weather</button>
      <button disabled={disabled} class="button is-warning" onclick={() => setCommand('changesetting allow-cheats true')}>Allow cheats</button>
      <button disabled={disabled} class="button is-warning" onclick={() => setCommand('gamerule showcoordinates true')}>Show coordinates</button>
      <button disabled={disabled} class="button is-warning" onclick={() => setCommand('gamerule doinsomnia false')}>No Phantoms</button>
      <button disabled={disabled} class="button is-warning" onclick={() => setCommand('gamerule pvp false')}>No Player Fighting</button>
      <button disabled={disabled} class="button is-success" onclick={() => setCommand('tell @a Hello guys')}>Message Everyone</button>  
    </p>
  </div>
</Modal>

<style>
  .main {
    width: 80vw;
    min-height: 70vh;
    overflow: hidden;
  }

  .main h3 {
    font-size: 130%;
    font-weight: bold;
  }
  .main .tabs {
    overflow-x: hidden;
  }
  img {
    width: 40px;
    height: 40px;
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
    font-size: 70%;
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
  input {
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
  p.buttons {
    padding-bottom: 10px;
  }
  p.buttons .button {
    height: 25px;
    padding: 0 10px;
  }
  /* PHABLET STYLES */
  @media all and (max-width: 760px) { 
    .main {
      width: 85vw;
    }
  }
</style>