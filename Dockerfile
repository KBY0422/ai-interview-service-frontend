# 1️⃣ build stage
FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build   # 👉 build/ 디렉토리 생성됨

# 2️⃣ nginx stage
FROM nginx:alpine

# 👉 CRA는 dist가 아니라 build
COPY --from=build /app/build /usr/share/nginx/html

# React Router 대응
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
