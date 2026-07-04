# Dockerfile for WebRTC signaling server
FROM node:20-alpine

WORKDIR /app

COPY package.json .
RUN npm install --production

COPY signaling-server.js .

EXPOSE 3001

CMD ["node", "signaling-server.js"]
