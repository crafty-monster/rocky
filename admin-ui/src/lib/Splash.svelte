<script>
  import logo from '../assets/logo.icon.128.png';
</script>

<main>
  <img class="fadeInOut" src={logo} alt="ROCKY"/>
</main>

<style>
  main {
    background-color: #f7f8fc;
    position: absolute;
    z-index: 100;
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    justify-content:center;
    align-items:center;
  }
  .fadeInOut {
    animation: fadeInOut 20s linear 1 forwards;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; }
    10% { opacity: 1; }
    20% { opacity: 0; }
    30% { opacity: 1; }
    40% { opacity: 0; }
    50% { opacity: 1; }
    60% { opacity: 0; }
    70% { opacity: 1; }
    80% { opacity: 0; }
    90% { opacity: 1; }
    100% { opacity: 0; }
  }
</style>