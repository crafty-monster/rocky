FROM node:16.16-slim
WORKDIR /var/task
RUN apt update && apt install -yqq curl
COPY . /
RUN npm ci
RUN npm run build
# We copied the static files during `npm run build`
# so only need to start up express
# (which hosts the static files)
CMD ["npm", "run", "start:api"]
