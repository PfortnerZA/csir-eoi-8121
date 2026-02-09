FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY service-worker.js ./

EXPOSE 443

CMD ["node", "service-worker.js"]