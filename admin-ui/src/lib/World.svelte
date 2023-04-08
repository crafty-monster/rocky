<script>
// @ts-nocheck

import {createEventDispatcher} from 'svelte';
import * as timeago from 'timeago.js';
import {hashCode} from '../../../utils/index';
const assets = import.meta.glob("../assets/map.*.png");
const hostname = window.location.hostname;
const dispatch = createEventDispatcher();
export let id = null;
export let name = null;
export let description = null;
export let state = null;
export let port = null;
export let created = null;
export let by = null;
const images = {}; 
const imageBackground = (username) => `hsl(${Math.abs(hashCode(username))%359}, 70%, 90%)`; // hsl(250, 69%, 90%)

for (const path in assets) {
  assets[path]().then(({ default: imageUrl }) => {
    images[path.split('/').pop()] = imageUrl;
  });
}
</script>

<div id={id} class="card">
  <div class="card-image">
    <small>{String(id).substr(0,12)}</small>
    <h4>{name}</h4>
    {#if state === 'new'}
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="javascript:;" on:click={() => dispatch('create')}>
        <img src="images/thumbs/map.(new).jpg" alt="new"/>
      </a>
    {:else if state === 'disconnected'}
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="javascript:;">
        <img src="images/thumbs/map.(disconnected).jpg" alt="disconnected"/>
      </a>
    {:else}
      <a href="minecraft://?addExternalServer={name}|{hostname}:{port}">
        <img src="{'images/thumbs/map.' + String(id).substr(0,2) + '.jpg'}" alt="rover" onerror="this.onerror=null;this.src='images/thumbs/map.--.jpg'"/>
      </a>
    {/if}
  </div>
  <div class="card-body">
    <div style="display:flex; margin-bottom: 1rem;">
      <span class="tag tag-{state}">{state}</span>
      {#if port}
      <span class="tag float-end">{port}</span>
      {/if}
    </div>
    <p>
      {#if state === 'new'}
        Life gets boring when you stay within the limits of what you already know.
      {:else}
        {description || 'The future can be scary, but there are ways to deal with that fear.'}
      {/if}
    </p>
    <div class="user">
      <img
        src="images/user.2.png"
        alt="user"
        style={'background-color: ' + imageBackground(by)}/>
      <div class="user-info">
        <h5>{by ?? 'you'}</h5>
        <small>{timeago.format(created)}</small>
      </div>
    </div>
    <div class="tools">
      {#if state === 'new'}
        <button class="btn btn-primary" on:click={() => dispatch('create')}>Generate</button>
      {:else if state === 'disconnected'}
        <button class="btn btn-primary" disabled>Create New</button>
      {:else if state === 'exited'}
        <button class="btn btn-success" on:click={() => fetch(`/api/world/${id}/start`, {method: 'POST'}).then(() => dispatch('started', {id}))}>Start</button>
        <button class="btn btn-danger" on:click={() => confirm(`Delete "${name}"?\n\nYou will lose all your data.`) && fetch(`/api/world/${id}`, {method: 'DELETE'}).then(() => dispatch('deleted', {id}))}>Delete</button>
      {:else}
        <button class="btn btn-warning" on:click={() => fetch(`/api/world/${id}/stop`, {method: 'POST'}).then(() => dispatch('stopped', {id}))}>Stop</button>
      {/if}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <i class="fa fa-gear fa-xl" on:click={() => fetch(`/api/world/${id}/logs`)}></i>
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
  height: 180px;
  object-fit: cover;
}
.card-image h4 {
  font-size: 1.2em;
  font-weight: bold;
  position: absolute;
  margin: 20px;
  top: 117px;
  color: white;
  text-shadow: 0 2px 2px black, 0 -2px 3px black, 0 1px 3px black;
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
.card-body p {
  font-size: 13px;
  min-height: 80px;
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
.tag-new {
  background-color: #6eb518;
}
.tag-started {
  background-color: #3ac182;
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
.user {
  display: flex;
  margin-bottom: 10px;
}

.user img {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-right: 10px;
  background-color: hsl(250, 69%, 90%);
}
.user-info h5 {
  margin: 0;
  font-weight: bold;
  font-size: 0.8em;
}
.user-info small {
  color: #545d7a;
}
.tools {
  margin-top: 10px;
  font-size: 80%;
}
.tools i.fa-gear {
  flex-grow: 1;
  text-align: right;
  position: absolute;
  right: 20px;
  line-height: 41px;
  opacity: 0.4;
  cursor: pointer;
}
.tools i.fa-gear:hover {
  opacity: 0.8;
}

/* PHABLET STYLES */
/* @media all and (max-width: 760px) { 
  .card {
    width: 200px;
  }
  .card-body h4 {
    font-size: 1em;
  }
  .card-image img {
    height: 150px;
  }
} */
</style>
