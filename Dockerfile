FROM node:14.19.0
RUN mkdir -p /opt/obsrv-api-service
WORKDIR /opt/obsrv-api-service/
COPY package*.json ./
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]