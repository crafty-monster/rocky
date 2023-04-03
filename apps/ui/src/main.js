import './scss/app.scss'
import App from './App.svelte'

// Import all of Bootstrap's JS
// import * as bootstrap from 'bootstrap'

const app = new App({
  target: document.getElementById('app'),
})

export default app
