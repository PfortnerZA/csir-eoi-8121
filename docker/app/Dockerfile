FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy .dev and lib and res folders and index.js
COPY .dev ./.dev
COPY lib ./lib
COPY res ./res
COPY index.js ./index.js

# Copy .env file
COPY .env ./.env

RUN npm run compile

EXPOSE 80
EXPOSE 443

CMD ["node", "index.js"]