<script>
  // @ts-nocheck

  import Modal from './Modal.svelte';
  import {timeAgo} from '../../../utils/index';
  import {createEventDispatcher} from 'svelte';

  export let show = false;
  export let worlds = [];
  
  let loading = false;
  let backups = [];
  let missing = [];

  const dispatch = createEventDispatcher();

  $: fetchBackups(show);
  
  async function fetchBackups() {
    console.log('fetchBackups()');
    loading = true;
    backups = await fetch(`/api/backup`).then(r => r.json());
    missing = worlds.filter(w => {
      return !backups.find(b => b.name === w.name);
    });
    loading = false;
  }
  fetchBackups();
</script>

<Modal bind:show={show} buttonOk={false}>
  <div class={`main`}>
    <h3>
      Backups
    </h3>
    <ul class="backups">
      {#if (!backups?.length && !missing?.length)}
        <li>No backups</li>
      {:else}
        {#each backups as backup}
        <li style="diplay:flex;">
          <div class="thumb inactive">
            <img src="{'images/thumbs/' + backup.image}" alt={backup.name}/>
            <i class="fa fa-file-zipper fa-xl"></i>
          </div>
          <div>
            <em>{backup.name}</em>
            <small>{timeAgo(backup.created)}</small>
            <div class="tools">
              <button class="button is-warning" on:click={() => confirm(`Restore "${backup.name}" backup?.`) && fetch('/api/backup/' + backup.id, {method: 'PUT'}).then(() => dispatch('restored'))}>Restore</button>
              <button class="button is-danger" on:click={() => confirm(`Delete "${backup.name}" backup?.`) && fetch('/api/backup/' + backup.id, {method: 'DELETE'}).then(fetchBackups)}>Delete</button>
            </div>
          </div>
        </li>
        {/each}
        {#each missing as world}
        <li style="diplay:flex;">
          <div class="thumb">
            <img src="{'images/thumbs/' + world.image}" alt={world.name}/>
          </div>
          <div>
            <em>{world.name}</em>
            <small>n/a</small>
            <div class="tools">
              <button class="button is-success" on:click={() => confirm(`Create "${world.name}" backup?.`) && fetch('/api/world/' + world.id + '/backup', {method: 'POST'}).then(fetchBackups)}>Create</button>
            </div>
          </div>
        </li>
        {/each}
      {/if}
    </ul>
  </div>
</Modal>

<style>
  .main {
    width: 80vw;
    min-height: 60vh;
    overflow: hidden;
  }
  h3 {
    font-size: 120%;
    font-weight: bolder;
    padding: 0 0 10px;
    border-bottom: 1px solid #ccc;
  }
  ul.backups img {
    width: 150px;
    height: 110px;
    margin-right: 1em;
    margin-left: 1em;
    border-radius: 10px;
    filter: grayscale(1);
    opacity: 0.8;
  }
  ul.backups .thumb {
    position: relative
  }
  ul.backups .thumb i {
    position: absolute;
    color: white;
    bottom: 30px;
    left: 30px;
  }
  ul.backups li {
    display: flex;
    padding: 20px 0 16px;
    border-bottom: 1px dashed #ccc;
  }
  ul.backups li:nth-child(even) {
    background: #f6f6f6;
}
  ul.backups li em {
    display: block;
    font-size: 140%;
    font-weight: 700;
    line-height: 1.3em;
  }
  ul.backups li small {
    font-size: 80%;
    color: #666;
  }
  ul.backups div.tools {
    margin-top: 18px;
  }
  /* PHABLET STYLES */
  @media all and (max-width: 760px) { 
    .main {
      width: 70vw;
    }
  }
</style>