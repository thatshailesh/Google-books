FROM node:16-alpine

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN npm install

COPY . /app

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]
