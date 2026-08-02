# -------------------------------------------------------------
# 智慧医疗内镜云平台 - 生产环境 Docker 镜像构建
# -------------------------------------------------------------

# 第一阶段：构建前端与后端运行依赖
FROM node:22-alpine AS builder

WORKDIR /app

# 复制 package 配置并安装依赖
COPY package*.json ./
RUN npm ci

# 复制项目所有源码
COPY . .

# 构建前端静态文件 dist
RUN npm run build

# 第二阶段：生产运行镜像
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# 复制构建物与服务端资源
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules ./node_modules

# 确保 SQLite 数据库及图片上传目录存在
RUN mkdir -p /app/server/uploads

EXPOSE 3001

CMD ["npx", "tsx", "server/index.ts"]
