<script>
    import Dashboard from "./lib/Dashboard.svelte";
    import Splash from "./lib/Splash.svelte";

    fetch('/api/user/me').then(r => r.json()).then(start);

    let loading = true;
    let username = null;

    async function start(user) {
      if (user?.id && user?.username) {
        username = user.username;
        setTimeout(() => loading = false, 1000);
      }
    }
</script>

<main>
  {#if (loading)}
    <Splash />
  {/if}
  {#if (username)}
    <Dashboard username={username}/>
  {/if}
</main>

<style>

</style>
