FROM node:12 


WORKDIR /app  

COPY package*.json ./  

RUN npm install --silent

COPY . .    

EXPOSE 4000

RUN npm run dev