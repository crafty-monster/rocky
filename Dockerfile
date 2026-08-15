FROM node:24.18-slim
WORKDIR /var/task
COPY . /var/task/
RUN npm ci
RUN npm run build
# We copied the static files during `npm run build`
# so only need to start up express
# (which hosts the static files)
CMD ["npm", "run", "start:server"]
