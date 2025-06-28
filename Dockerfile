# 多階段構建 - 構建階段
FROM node:18-alpine AS build-stage

WORKDIR /app

# 設置環境變量
ENV NODE_ENV=development
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV GENERATE_SOURCEMAP=false

# 複製包配置文件
COPY package*.json ./

# 清理並安裝依賴
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

# 複製源代碼
COPY . .

# 檢查關鍵文件和依賴
RUN echo "=== 檢查項目文件 ===" && \
    ls -la && \
    echo "=== 檢查 vite.config.ts ===" && \
    cat vite.config.ts && \
    echo "=== 檢查安裝的依賴 ===" && \
    npm list --depth=0 | grep -E "(vite|vue|quill)" || true

# 構建應用
RUN npm run build

# 驗證構建結果
RUN ls -la dist/ && echo "✅ 構建成功，dist 目錄內容如上" || (echo "❌ 構建失敗，dist 目錄不存在" && exit 1)

# 生產階段 - 使用 nginx 提供靜態文件
FROM nginx:alpine

# 移除默認 nginx 配置
RUN rm /etc/nginx/conf.d/default.conf

# 複製自定義 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/

# 從構建階段複製構建好的文件
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 驗證複製的文件
RUN ls -la /usr/share/nginx/html/ && echo "✅ 靜態文件複製成功"

# 暴露端口
EXPOSE 80

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]