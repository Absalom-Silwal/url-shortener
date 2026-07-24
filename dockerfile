FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install 

COPY . .

ENV PORT=5000
EXPOSE 5000
RUN npm run build
CMD ["node", "dist/index.js"]
