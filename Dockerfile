FROM node:14.19.0
RUN mkdir -p /opt/obsrv-api-service
WORKDIR /opt/obsrv-api-service/
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/app.js"]