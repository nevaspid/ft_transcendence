FROM node:24-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 4002
CMD ["npm", "run", "preview", "--", "--host"]