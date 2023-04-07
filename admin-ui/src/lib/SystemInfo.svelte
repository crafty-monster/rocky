<script>
  let info = {};
  let connected = {};
  const updateInfo = async () => info = await fetch('/api/server').then(r => r.json());
  const updateConnected = async () => connected = await fetch('/api/server/connected').then(r => r.json());

  updateInfo();
  updateConnected();
  setInterval(updateConnected, 20*1000);
</script>

<ul class="w-100 me-3" style="font-size: 12px; color: #666">
  <li class="connected {connected.up && 'on'}"><em></em>{connected.up ? 'Connected' : 'Disconnected'}</li>
  <li class="lighter">{connected.path}</li>
  <li class="lighter">Docker v{info.ServerVersion || 'N/A'}</li>
  <li class="lighter">vCPUs {Math.round(info.NCPU)}</li>
  <li class="lighter">{(Math.round(info.MemTotal / 1024 / 1024 / 1024 * 10) / 10)}gb RAM</li>
</ul>

<style>
  ul {
    margin: 0;
    padding: 0;
    text-align: right;
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