FROM node:10.19
MAINTAINER Kim Woo Jae <woojae9488@naver.com>
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g http-server && npm install
COPY . ./
EXPOSE 8080
CMD [ "npm", "start" ]