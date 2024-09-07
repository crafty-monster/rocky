<script>
  // @ts-nocheck

  import Modal from './Modal.svelte';

  export let show = false;
  let loading = false;
  let data = {};
  let tab = 'header';

  $: init();
  
  async function init() {
    console.log('init()');
    loading = true;
    data = await fetch('/db/ui/').then(r => r.json()) || {};
    loading = false;
    console.log('loaded', {data});
  }

  async function save() {
    console.log('save()', data);
    const { header, footer } = data;
    const body = JSON.stringify({ header, footer });
    const headers = { 'Content-Type': 'application/json' };
    data = await fetch('/db/ui/', { method: 'PUT', body, headers }).then(r => r.json()) || {};
    console.log('done', { data });
  }
</script>


<Modal bind:show={show} buttonOk={false}>
  <div class={`main`}>
    <h3>
      📄 Branding (Front Page)
    </h3>
    <div class="tabs is-boxed">
      <ul>
        <li class={tab === 'header' ? 'is-active' : ''} on:click={ () => tab = 'header' } on:keyup={ () => tab = 'header' }>
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a href="javascript:;" class="nav-link active">Header</a>
        </li>
        <li class={tab === 'footer' ? 'is-active' : ''} on:click={ () => tab = 'footer' } on:keyup={ () => tab = 'footer' }>
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a href="javascript:;" class="nav-link">Footer</a>
        </li>
      </ul>
    </div>
    {#if (tab === 'header')}
    <div class="mb-3">
      <textarea bind:value={data.header} class="form-control" id="header" placeholder="<header>My Logo</header>"></textarea>
    </div>
    {/if}
    {#if (tab === 'footer')}
    <div class="mb-3">
      <textarea bind:value={data.footer} class="form-control" id="footer" placeholder="<footer>Custom Footer</footer>"></textarea>
    </div>
    {/if}
    <p style="font-size: 80%; margin: -1em 0 5px;">After saving. Check the <a href=".." target="_blank">main page</a>.</p>
    <p class="buttons are-small" style="line-height: 35px">
      <button class="button is-info" on:click={() => save()}>Save</button>
    </p>
  </div>
</Modal>

<style>
  .main {
    width: 40vw;
    min-height: 40vh;
    overflow: hidden;
  }
  div.tabs.is-boxed {
    margin-bottom: 0;
  }
  ul {
    margin: 20px 0;
  }
  textarea {
    padding: 2px;
    width: 100%;
    height: 300px;
    background: #fffced
  }
  /* PHABLET STYLES */
  @media all and (max-width: 760px) { 
    .main {
      width: 70vw;
    }
  }
</style>