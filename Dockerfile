FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache build-base python3
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]
