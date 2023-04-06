<script>
    import Dashboard from "./lib/Dashboard.svelte";
    import Splash from "./lib/Splash.svelte";

    fetch('/api/user/me').then(r => r.json()).then(start);

    let loading = true;
    let authenticated = false;

    async function start(user) {
      if (user?.id) {
        authenticated = true;
        setTimeout(() => loading = false, 1000);
      }
    }
</script>

<main>
  {#if (loading)}
    <Splash />
  {/if}
  {#if (authenticated)}
    <Dashboard />
  {/if}
</main>

<style>

</style>
