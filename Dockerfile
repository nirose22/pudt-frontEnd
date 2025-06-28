# 多階段構建 - 構建階段
FROM node:18-alpine as build-stage

WORKDIR /app

# 複製 package 文件
COPY package*.json pnpm-lock.yaml ./

# 安裝 pnpm
RUN npm install -g pnpm

# 安裝依賴
RUN pnpm install

# 複製源代碼
COPY . .

# 構建應用
RUN pnpm run build

# 生產階段 - 使用 nginx 提供靜態文件
FROM nginx:alpine

# 移除默認 nginx 配置
RUN rm /etc/nginx/conf.d/default.conf

# 複製自定義 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/

# 從構建階段複製構建好的文件
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"] 