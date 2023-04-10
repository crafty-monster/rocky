<script>
  let server = {};
  const updateInfo = async () => server = await fetch('/api/server').then(r => r.json());
  const updateConnected = async () => server.up = await fetch('/api/server/connected').then(r => r.json()).then(s => s.connected);

  updateInfo();
  setInterval(updateConnected, 20*1000);
</script>

<ul class="mr-4">
  <li class="connected {server?.up && 'on'}"><em></em>{server?.up ? 'Connected' : 'Disconnected'}</li>
  <li class="lighter">{server?.path}</li>
  <li class="lighter">Docker v{server?.info?.ServerVersion || 'N/A'}</li>
  <li class="lighter">vCPUs {Math.round(server?.info?.NCPU)}</li>
  <li class="lighter">{(Math.round(server?.info?.MemTotal / 1024 / 1024 / 1024 * 10) / 10)}gb RAM</li>
</ul>

<style>
  ul {
    width: 100%; 
    font-size: 12px; 
    color: #666;
    text-align: right;
    margin: 0;
    padding: 0;
  }
  li {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
  em {
    font-style: normal;
    font-weight: bold;
  }
  .lighter {
    opacity: 0.75;
  }
  .connected {
    color: red;
  }
  .connected.on {
    color: green;
  }
  .connected em {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background: red;
    margin-right: 5px;
  }
  .connected.on em {
    background: green;
  }
  @media all and (max-width: 760px) { 
    ul {
      text-align: center;
    }
    .lighter {
      display: none;
    }
  }
</style>