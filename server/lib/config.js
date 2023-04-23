
const {DOCKER_HOST, DOCKER_PORT} = process.env;
const ROCKY_MAX_WORLDS = process.env.ROCKY_MAX_WORLDS || 9;
const ROCKY_MAX_WORLDS_PER_USER = process.env.ROCKY_MAX_WORLDS_PER_USER || 9;
const config = {
  DOCKER_HOST,
  DOCKER_PORT,
  ROCKY_MAX_WORLDS,
  ROCKY_MAX_WORLDS_PER_USER,
};

for (const k of Object.keys(config)) {
  console.log(k, config[k]);
}

export default config;
