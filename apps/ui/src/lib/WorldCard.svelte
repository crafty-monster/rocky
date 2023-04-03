<script>
	import { createEventDispatcher } from 'svelte';
  import * as timeago from 'timeago.js';
  const assets = import.meta.glob("../assets/map.*.png");
  const dispatch = createEventDispatcher();
  export let id;
  export let name;
  export let description;
  export let state;
  export let port;
  export let created;
  const images = {};
  for (const path in assets) {
    assets[path]().then(({ default: imageUrl }) => {
      images[path.split('/').pop()] = imageUrl;
    });
  }
</script>

<div id={id} class="card">
  <div class="card-image">
    <small>{String(id).substr(0,12)}</small>
    <a href="minecraft://?addExternalServer={name}|play.crafty.monster:{port}">
      <img src="{'/src/assets/map.' + String(id).substr(0,2) + '.png'}" alt="rover" onerror="this.onerror=null;this.src='/src/assets/map.--.png'"/>
    </a>
  </div>
  <div class="card-body">
    <div style="display:flex;">
      <span class="tag tag-{state}">{state}</span>
      <span class="tag float-end">{port}</span>
    </div>
    <h4>
      {name}
    </h4>
    <p>
      {description || 'The future can be scary, but there are ways to deal with that fear.'}
    </p>
    <div class="user">
      <img
        src="https://yt3.ggpht.com/TeP-iwah77PBR8PcbVds-qlVTPrp3Dq1mEq_qp9xNp6StUYJd8N_ASY45Vhij95hfkM-mFAyOQ=s176-c-k-c0x00ffffff-no-rj"
        alt="user" />
      <div class="user-info">
        <h5>Xavier</h5>
        <small>{timeago.format(created)}</small>
      </div>
    </div>
    <div class="tools">
      {#if state === 'exited'}
        <button class="btn btn-success" on:click={() => fetch(`/api/world/${id}/start`, {method: 'POST'}).then(() => dispatch('started', {id}))}>Start</button>
        <button class="btn btn-danger" on:click={() => confirm(`Delete "${name}"?\n\nYou will lose all your data.`) && fetch(`/api/world/${id}`, {method: 'DELETE'}).then(() => dispatch('deleted', {id}))}>Delete</button>
      {:else}
        <button class="btn btn-warning" on:click={() => fetch(`/api/world/${id}/stop`, {method: 'POST'}).then(() => dispatch('stopped', {id}))}>Stop</button>
      {/if}
    </div>
  </div>
</div>


<style>
* {
  box-sizing: border-box;
}
.card {
  margin: 10px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  width: 300px;
}
.card-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.card-image small {
  position: absolute;
  color: white;
  right: 5px;
  top: 5px;
  font-size: 80%;
  opacity: 0.8;
}
.card-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  min-height: 250px;
}
.card-body h4 {
  margin-top: 5px;
  font-weight: bold;
}
.tag {
  background: #666;
  border-radius: 50px;
  font-size: 12px;
  margin: 0 3px 0 0;
  color: #fff;
  padding: 2px 10px;
  text-transform: uppercase;
  cursor: pointer;
}
.tag-started {
  background-color: #33cb4a;
}
.tag-running {
  background-color: #5babcd;
}
.tag-stopped {
  background-color: rgb(164, 164, 164);
}
.tag-exited {
  background-color: rgb(177, 65, 65);
}

.card-body p {
  font-size: 13px;
  margin: 0 0 40px;
}
.user {
  display: flex;
  margin-top: auto;
}

.user img {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-right: 10px;
}
.user-info h5 {
  margin: 0;
}
.user-info small {
  color: #545d7a;
}
.tools {
  margin-top: 10px;
  font-size: 80%;
}
</style>
