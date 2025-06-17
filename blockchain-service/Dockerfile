FROM alpine:3.21

RUN apk update && apk add --no-cache nodejs npm

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .


CMD [ "npm", "start" ]
