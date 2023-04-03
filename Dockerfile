FROM node:16.16-slim

WORKDIR /var/task

COPY package*.json ./

RUN npm ci

COPY . ./

RUN ls -la

CMD ['npm', 'start']
