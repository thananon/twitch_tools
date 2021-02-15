FROM node:14.15.5-alpine3.10

WORKDIR /twitch_tools

COPY . .

RUN npm i

CMD ["npm", "start"]