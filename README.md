# TL/DR

ROCKY is a container manager for Minecraft Bedrock instances.

It uses the [Docker Engine API](https://docs.docker.com/engine/api/v1.38/) to create, run, stop and manage existing containers.

Each world is a self-contained instance running an image of minecraft bedrock.

![branding/thumbnail.png](branding/thumbnail.png)

##  Powered by:

![docker](branding/vendor/logo.docker.png)
![node.js](branding/vendor/logo.nodejs.png)
![express.js](branding/vendor/logo.express.png)
![vite.js](branding/vendor/logo.vite.png)
![svelte](branding/vendor/logo.svelte.png)
![bootstrap](branding/vendor/logo.bootstrap.png)


# Installation

You will need [Docker](https://docs.docker.com/get-docker/) installed. 

It has been developed using version `1.19.03` but any newer version should work fine.

```sh
$ git clone https://github.com/crafty-monster/rocky.git
$ cd rocky
$ docker -v
Docker version 19.03.1, build 74b1e89e8a
$ docker build -t rocky .
$ docker run -p 48000:48000 -v /var/run/docker.sock:/var/run/docker.sock rocky
```

Then open https://localhost:48000. 

You can also expose ports 48000-49000 through your home router if you want to share your minecraft worlds with your friends.

# Updates

Install [Docker Compose](https://docs.docker.com/compose/install/) to make it easier to update your installation with `docker-compose build` and `docker-compose restart` commands.

```sh
# Install & start the server
$ git clone https://github.com/crafty-monster/rocky.git
$ cd rocky
$ docker-compose up --build
```

```sh
# Update to latest version
$ git pull
$ docker-compose up --build
```

You can automate updates by installing the updater.

```
$ cd .updater
$ ./install.sh
*/1 * * * * cd /root/projects/rocky/.updater && ./check.sh >> update.log 2>&1
0 * * * * cd /root/projects/rocky/.updater && tail -1000 update.log | cat > update.log

Rocky updater installed. Check the 'update.log' in a minute or two.
```

# Development

You will need `node.js` installed. Version `16.16.0`.

```sh
$ node -v
v16.16.0
$ npm i
$ npm run dev
```

Then open http://localhost:5173/.

