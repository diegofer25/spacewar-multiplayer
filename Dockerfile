FROM node:22-alpine3.19 AS build

WORKDIR /app

COPY . .

RUN npm i @rollup/rollup-linux-x64-musl \
	npm install \
	cd client \
	npm install 
