new Vue({
  el: '#app',
  data: {
    worlds: [],
    hostname: location.hostname,
  },
  methods: {
    timeago: (d) => timeago.format(d),
    // Deterministically picks one of the 256 pre-generated avatar sprites
    // (/admin/images/profile/{00..ff}.png) for a given username.
    // md5() comes from the vendored md5.js (loaded before this script).
    spriteIndex(username) {
      const hash = parseInt(md5(username || '').slice(0, 8), 16);
      return (hash % 256).toString(16).padStart(2, '0');
    },
  },
  async mounted() {
    this.worlds = await fetch('/api/world').then(r => r.json());
    if (!this.worlds.length) {
      this.worlds.push({
        id: '--',
        name: 'No worlds created',
        description: 'Please create some worlds for people to play with. You\'ll need your username and password.',
        port: 'blank',
        by: 'nobody',
      });
    }
  },
});
