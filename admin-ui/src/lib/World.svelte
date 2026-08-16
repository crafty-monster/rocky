<script>
// @ts-nocheck

import * as timeago from 'timeago.js';
import {spriteIndex} from '../../../utils/index';
const assets = import.meta.glob("../assets/map.*.png");
const hostname = window.location.hostname;
let { id = null, name = null, image = null, description = null, state = null, port = null, created = null, by = null, oncreate, onstarted, ondeleted, onstopped, onstatus, onterminal } = $props();
const images = {};

for (const path in assets) {
  assets[path]().then(({ default: imageUrl }) => {
    images[path.split('/').pop()] = imageUrl;
  });
}
</script>

<div id={id} class={`cards state-${state}`}>
  <div class="card-image">
    <small>{String(id).substr(0,12)}</small>
    {#if state === 'new'}
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a href="javascript:;" onclick={() => oncreate?.()}>
        <h4>{name}</h4>
        <img src="images/thumbs/map.(new).jpg" alt="new"/>
      </a>
    {:else}
      <a href="minecraft://?addExternalServer={name}|{hostname}:{port}">
        <h4>{name}</h4>
        <img src="{'images/thumbs/' + image}" alt={name} onerror={(e) => { e.target.onerror = null; e.target.src = 'images/thumbs/map.--.jpg'; }}/>
      </a>
    {/if}
  </div>
  <div class="card-body">
    <div style="display:flex; margin-bottom: 1rem;">
      <span class="tag tag-{state}">{state}</span>
      {#if port}
      <span class="tag">{port}</span>
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
      <span class="avatar">
        <img src={`images/profile/${spriteIndex(by ?? 'you')}.png`} alt="user"/>
      </span>
      <div class="user-info">
        <h5>{by ?? 'you'}</h5>
        <small>{timeago.format(created)}</small>
      </div>
    </div>
    <div class="tools">
      {#if state === 'new'}
        <button class="button is-link" onclick={() => oncreate?.()}>Generate</button>
      {:else if state === 'exited'}
        <button class="button is-success" onclick={() => fetch(`/api/world/${id}/start`, {method: 'POST'}).then(() => onstarted?.({id}))}>Start</button>
        <button class="button is-danger" onclick={() => confirm(`Delete "${name}"?\n\nYou will lose all your data.`) && fetch(`/api/world/${id}`, {method: 'DELETE'}).then(() => ondeleted?.({id}))}>Delete</button>
      {:else}
        <button class="button is-warning" onclick={() => confirm(`Stop "${name}"?.`) && fetch(`/api/world/${id}/stop`, {method: 'POST'}).then(() => onstopped?.({id}))}>Stop</button>
      {/if}
      <div class="tools-right">
        {#if state === '-----'}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="info" role="button" tabindex="0" onclick={() => onstatus?.()}>
          <i class="fa fa-circle-info fa-xl"></i>
        </div>
        {/if}
        {#if state !== 'new'}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="terminal" role="button" tabindex="0" onclick={() => onterminal?.()}>
          <span><i class="fa fa-terminal fa-sm"></i></span>
        </div>
        {/if}
      </div>
    </div>
  </div>
</div>


<style>
* {
  box-sizing: border-box;
}
.cards {
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
.state-exited .card-image img {
  filter: grayscale();
  opacity: 0.8;
}
.state-new .card-image img {
  filter: sepia();
}
.card-image h4 {
  font-size: 1.4em;
  font-weight: bold;
  position: absolute;
  z-index: 1;
  margin: 20px;
  top: 113px;
  color: white;
  text-shadow: 0 2px 2px black, 0 -2px 3px black, 0 1px 3px black;
}
.card-image small {
  position: absolute;
  z-index: 1;
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
.user .avatar {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-right: 10px;
  background-color: #e2e4ec;
  overflow: hidden;
  flex-shrink: 0;
}
.user .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.25);
}
.user-info h5 {
  margin: 0;
  font-weight: bold;
  font-size: 0.8em;
}
.user-info small {
  color: #545d7a;
  font-size: 80%;
}
.tools {
  width: 100%;
  margin-top: 10px;
  font-size: 80%;
  display: flex;
}
.tools .button {
  margin-right: 6px;
}
.tools-right {
  margin-left: auto;
  display: flex;
  padding-top: 14px;
}
.tools-right .info,
.tools-right .terminal {
  cursor: pointer;
  opacity: 0.4;
}
.tools-right .info {
  color: black;
  font-size: 115%;
  margin: 1px 14px 0 0;
}
.tools-right .terminal span {
  background: black;
  padding: 3px 5px;
  margin-top: 14px;
  border-radius: 4px;
  color: white;
  line-height: 22px;
}
.tools-right .info:hover,
.tools-right .terminal:hover {
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
