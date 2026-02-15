# Multi-stage build for Next.js application
FROM node:18-alpine AS base

# ----------------------------------------------------------------
# Stage 1: 安裝依賴
# ----------------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# ----------------------------------------------------------------
# Stage 2: 建置應用程式
# ----------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create production environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# ----------------------------------------------------------------
# Stage 3: 最終運行的 Production Image
# ----------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 【關鍵新增】在最終的 production image 中安裝 curl
# 必須在切換到 nextjs 這個非 root 使用者之前執行
RUN apk add --no-cache curl

# 建立一個非 root 的使用者和群組來運行應用，更安全
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 從 builder 階段複製必要的產物
COPY --from=builder /app/public ./public
# 根據 Next.js standalone output 的要求，複製對應的資料夾
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切換到非 root 使用者
USER nextjs

EXPOSE 3000

ENV PORT=3000
# 讓 Node.js 服務監聽所有網路介面，而不是只有 localhost
ENV HOSTNAME="0.0.0.0"

# 啟動 Node.js 伺服器.
CMD ["node", "server.js"]