FROM node:14.19.0
RUN mkdir -p /opt/obsrv-query-api/
WORKDIR /opt/obsrv-query-api/
COPY package*.json ./
RUN npm install
RUN npm install -g typescript@4.8.4
COPY . .
EXPOSE 3000
RUN tsc
CMD ["node", "dist/app.js"]