<script>
  // @ts-nocheck

  import Modal from './Modal.svelte';
  import {timeAgo} from '../../../utils/index';

  let { show = $bindable(false), worlds = [], onrestored } = $props();

  let loading = false;
  let backups = $state([]);
  let missing = $state([]);

  $effect(() => { fetchBackups(show); });

  function track(item, action, promise) {
    item.busy = action;
    backups = backups;
    missing = missing;
    promise.finally(() => {
      item.busy = null;
      backups = backups;
      missing = missing;
    });
    return promise;
  }

  async function fetchBackups() {
    console.log('fetchBackups()');
    loading = true;
    backups = await fetch(`/api/backup`).then(r => r.json());
    missing = worlds.filter(w => {
      if (w.id === '(new)') return false;
      return !backups.find(b => b.name === w.name);
    });
    loading = false;
  }
  fetchBackups();

  let fileInput;

  async function handleUpload(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    loading = true;
    const res = await fetch('/api/backup/' + encodeURIComponent(file.name), {method: 'POST', body: file});
    loading = false;
    if (!res.ok) {
      alert(`Upload failed: ${await res.text()}`);
      return;
    }
    fetchBackups();
  }
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
          <a class="thumb inactive" href={'/api/backup/' + backup.id} download title="Download {backup.name} backup">
            <img src="{'images/thumbs/' + backup.image}" alt={backup.name}/>
            <i class="fa fa-file-zipper fa-xl"></i>
            <i class="fa fa-download fa-xl download-hint"></i>
          </a>
          <div>
            <em>{backup.name}</em>
            <small>{timeAgo(backup.created)}</small>
            <div class="tools">
              <button class="button is-warning" disabled={backup.busy} onclick={() => confirm(`Restore "${backup.name}" backup?.`) && track(backup, 'restore', fetch('/api/backup/' + backup.id, {method: 'PUT'}).then(() => onrestored?.()))}>{#if backup.busy === 'restore'}<i class="fa fa-spinner fa-spin"></i>{/if} Restore</button>
              <button class="button is-danger" disabled={backup.busy} onclick={() => confirm(`Delete "${backup.name}" backup?.`) && track(backup, 'delete', fetch('/api/backup/' + backup.id, {method: 'DELETE'}).then(fetchBackups))}>{#if backup.busy === 'delete'}<i class="fa fa-spinner fa-spin"></i>{/if} Delete</button>
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
              <button class="button is-success" disabled={world.busy} onclick={() => confirm(`Create "${world.name}" backup?.`) && track(world, 'create', fetch('/api/world/' + world.id + '/backup', {method: 'POST'}).then(fetchBackups))}>{#if world.busy === 'create'}<i class="fa fa-spinner fa-spin"></i>{/if} Create</button>
            </div>
          </div>
        </li>
        {/each}
      {/if}
    </ul>
    <div class="upload">
      <input bind:this={fileInput} type="file" style="display:none" onchange={handleUpload} />
      <button class="button is-info is-small" onclick={() => fileInput.click()}><i class="fa fa-upload"></i> Upload Backup</button>
    </div>
  </div>
</Modal>

<style>
  .main {
    width: 80vw;
    max-height: 60vh;
    display: flex;
    flex-direction: column;
  }
  h3 {
    flex-shrink: 0;
    font-size: 120%;
    font-weight: bolder;
    padding: 0 0 10px;
    border-bottom: 1px solid #ccc;
  }
  ul.backups {
    overflow-y: scroll;
    min-height: 0;
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
    display: block;
    position: relative;
  }
  ul.backups .thumb.inactive:hover img {
    filter: grayscale(0);
    opacity: 1;
  }
  ul.backups .thumb i {
    position: absolute;
    color: white;
    bottom: 30px;
    left: 30px;
  }
  ul.backups .thumb .download-hint {
    top: 50%;
    left: 50%;
    bottom: auto;
    transform: translate(-50%, -50%);
    z-index: 1;
    opacity: 0;
  }
  ul.backups .thumb.inactive:hover .download-hint {
    opacity: 1;
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
  .upload {
    flex-shrink: 0;
    padding-top: 1em;
  }
  /* PHABLET STYLES */
  @media all and (max-width: 760px) { 
    .main {
      width: 70vw;
    }
  }
</style>