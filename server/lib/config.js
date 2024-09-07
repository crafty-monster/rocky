
const {DOCKER_HOST, DOCKER_PORT} = process.env;
const ROCKY_SERVER_IMAGE = 'itzg/minecraft-bedrock-server';
const ROCKY_MAX_WORLDS = Number(process.env.ROCKY_MAX_WORLDS) || 9;
const ROCKY_MAX_WORLDS_PER_USER = Number(process.env.ROCKY_MAX_WORLDS_PER_USER) || 9;
const CHAT_TURN_CREDS = process.env.CHAT_TURN_CREDS;

// This is visible to all admins
// careful what you add.
const config = {
  DOCKER_HOST,
  DOCKER_PORT,
  CHAT_TURN_CREDS,
  ROCKY_SERVER_IMAGE,
  ROCKY_MAX_WORLDS,
  ROCKY_MAX_WORLDS_PER_USER,
};

// Show during initialization
for (const k of Object.keys(config)) {
  console.log(k, config[k]);
}

export default config;
