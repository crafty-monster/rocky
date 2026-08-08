new Vue({
  el: '#app',
  data: {
    worlds: [],
    hostname: location.hostname,
  },
  methods: {
    timeago: (d) => timeago.format(d),
    imageBackground(username) {
      return `hsl(${Math.abs(this.hashCode(username))%359}, 70%, 90%)`; // hsl(250, 69%, 90%),
    },
    hashCode(str) {
      let hash = 0;
      for (let i = 0, len = str.length; i < len; i++) {
        const chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }
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
