<script>
  import {createEventDispatcher} from 'svelte';
  const dispatch = createEventDispatcher();
  export let show = false;
  export let title = '';
  export let buttonOk = true;

  function close() {
    show = false;
    dispatch('close');
  }
</script>

{#if (show)}
<div class="mask"></div>
<div class="main">
  <i class="close-modal fa fa-times fa-2x" on:click={close} on:keyup={close}></i>
  <h2>{title}</h2>
  <div class="main-body">
    <slot></slot>
  </div>
  <div class="buttons">
    {#if (buttonOk)}
    <button class="btn btn-primary">Ok</button>
    {/if}
  </div>
</div>
{/if}

<style>
  .mask {
    background-color: #333;
    opacity: 0.5;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 100vh;
  }
  .main {
    position: fixed;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 90vw;
    max-height: 90vh;
    background: white;
    padding: 2rem;
    border-radius: 10px;
  }
  .main h2 {
    padding-right: 2em;
  }
  .close-modal {
    position: absolute;
    cursor: pointer;
    color: #666;
    top: 1.5rem;
    right: 1.5rem;
  }
  .buttons {
    text-align: right;
  }
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes fadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }
</style>