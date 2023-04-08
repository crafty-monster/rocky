<script>
  // @ts-nocheck

  import Modal from './Modal.svelte';

  export let show = false;
  export let world = {};
  let loading = false;
  let status = {};
  let players = '0 of 10';
  let version = '';

  $: fetchStatus(world);
  
  async function fetchStatus() {
    console.log('fetchStatus()', world.id);
    if (!world.id) return;
    loading = true;
    status = await fetch(`/api/world/${world.id}/status`).then(r => r.json());
    if (status && status.version) {
      version = status.version;
      players = `${status.onlinePlayers} of ${status.maxPlayers}`;
    }
    loading = false;
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
        <a href="javascript:;"class="nav-link active">Status</a>
      </li>
      <li class="pt-1" style="margin-left: auto">
        <i class={`fa fa-refresh fa-lg ${loading ? 'fa-spin': ''}`} on:click={() => fetchLogs(100)} on:keyup={() => fetchLogs(100)}></i>
      </li>
    </ul>
    <div class="mb-3">
      <label for="version" class="form-label">Version</label>
      <input type="text" bind:value={version} class="form-control" id="version">
    </div>
    <div class="mb-3">
      <label for="players" class="form-label">Players</label>
      <input type="text" bind:value={players} class="form-control" id="players">
    </div>
  </div>
</Modal>

<style>
  .main {
    width: 40vw;
    min-height: 40vh;
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
  select, input {
    background: #fffced
  }
  /* PHABLET STYLES */
  @media all and (max-width: 760px) { 
    .main {
      width: 85vw;
    }
  }
</style>