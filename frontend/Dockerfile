FROM node:20-alpine

WORKDIR /app

ENV NEXT_PUBLIC_API_URL=http://localhost:4000/api

ENV PORT=3000

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
