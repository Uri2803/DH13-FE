# --- Stage 1: Build FE ---
FROM node:20-slim AS build
# dùng Debian slim (glibc) cho đỡ rắc rối với musl

WORKDIR /app

# Copy file khai báo dependency
COPY package*.json ./

# Cài dependency
RUN npm ci

# Copy toàn bộ source vào container
COPY . .

# FIX lỗi Rollup native: ép dùng bản JS thuần
ENV ROLLUP_SKIP_NODEJS_NATIVE=1

# Build production
RUN npm run build

# --- Stage 2: Serve bằng Nginx ---
FROM nginx:alpine

# Copy nginx.conf bạn đã tạo ở root project
# (nếu bạn đặt chỗ khác thì sửa lại path tương ứng)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output sang thư mục serve của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
