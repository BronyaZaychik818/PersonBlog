# Xiaodu Blog

极简风格个人博客系统，前后端分离架构。

## 功能

- **博客展示**：Markdown 渲染 + LaTeX 数学公式 + 代码高亮，支持文章目录、全文搜索
- **在线编辑**：左右分栏 Markdown 编辑器，实时预览，支持导入 TXT / Markdown / Word 文档
- **个人信息**：可配置头像、Banner、用户名、邮箱、社交链接
- **明暗主题**：亮色 / 暗色模式一键切换
- **权限控制**：游客只读，管理员可发布 / 编辑 / 删除博客
- **安全防护**：JWT 认证 + 登录限流（5 次/分钟/IP）+ bcrypt 密码加密
- **响应式布局**：PC / 手机端自适应

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | Vue 3, Vite 5, Vue Router 4, Pinia, Axios |
| Markdown | markdown-it, LaTeX, highlight.js |
| 后端 | Node.js, Express |
| 数据库 | SQLite (better-sqlite3) |
| 认证 | JWT (jsonwebtoken), bcrypt |
| 安全 | express-rate-limit |

## 快速开始

```bash
# 克隆项目
git clone https://github.com/BronyaZaychik818/PersonBlog.git
cd PersonBlog

# 安装依赖
cd backend && npm install
cd ../frontend && npm install

# 一键启动（Windows）
cd ..
start.bat

# 或手动启动
cd backend && node src/index.js   # 后端 :3000
cd frontend && npx vite           # 前端 :5173
```

浏览器打开 `http://localhost:5173`。

**默认管理员密码：** `admin123`（登录后可在个人信息页修改）

## 项目结构

```
PersonBlog/
├── frontend/                  # Vue 3 + Vite 前端
│   ├── src/
│   │   ├── api/index.js       # Axios 封装 + JWT 拦截器
│   │   ├── router/index.js    # 路由 + 导航守卫
│   │   ├── stores/auth.js     # Pinia 认证状态
│   │   ├── utils/markdown.js  # Markdown 渲染引擎
│   │   └── views/
│   │       ├── Home.vue       # 主页布局
│   │       ├── BlogList.vue   # 博客列表（全部/最近/目录/搜索）
│   │       ├── BlogDetail.vue # 博客详情
│   │       ├── Login.vue      # 管理员登录
│   │       ├── Admin.vue      # 管理后台
│   │       ├── BlogEdit.vue   # 博客编辑器
│   │       └── ProfileEdit.vue # 个人信息设置
│   └── public/
├── backend/                   # Express 后端
│   ├── src/
│   │   ├── index.js           # 入口 + 优雅关闭
│   │   ├── database.js        # SQLite 初始化
│   │   ├── routes/
│   │   │   ├── auth.js        # 登录 + 修改密码
│   │   │   ├── blog.js        # 博客 CRUD + 搜索 + 最近
│   │   │   ├── profile.js     # 个人信息 + 图片上传
│   │   │   └── upload.js      # 文档解析导入
│   │   └── middleware/
│   │       ├── auth.js        # JWT 认证中间件
│   │       └── rateLimiter.js # 登录限流
│   └── uploads/
└── start.bat                  # Windows 一键启动脚本
```

## API 接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/login` | 管理员登录 | 公开（限流） |
| PUT | `/api/auth/password` | 修改密码 | 管理员 |
| GET | `/api/profile` | 获取个人信息 | 公开 |
| PUT | `/api/profile` | 修改个人信息 | 管理员 |
| POST | `/api/profile/avatar` | 上传头像 | 管理员 |
| POST | `/api/profile/banner` | 上传 Banner | 管理员 |
| GET | `/api/blog/list` | 博客列表（已发布） | 公开 |
| GET | `/api/blog/recent` | 最近 30 天博客 | 公开 |
| GET | `/api/blog/search?q=` | 搜索博客 | 公开 |
| GET | `/api/blog/all` | 全部博客（含草稿） | 管理员 |
| GET | `/api/blog/:id` | 博客详情 | 公开 |
| POST | `/api/blog` | 发布博客 | 管理员 |
| PUT | `/api/blog/:id` | 编辑博客 | 管理员 |
| DELETE | `/api/blog/:id` | 删除博客 | 管理员 |
| POST | `/api/upload/parse` | 文档解析导入 | 管理员 |

## 部署

```bash
# 构建前端
cd frontend && npm run build   # 输出到 dist/

# 后端可直接部署，或配合 Nginx 反向代理
cd backend && node src/index.js
```

生产环境建议：
- 修改 `backend/.env` 中的 `JWT_SECRET`
- 使用 Nginx 反向代理前端静态文件 + 后端 API
- 配合 PM2 或 systemd 守护后端进程

## 云服务器部署（阿里云 + Ubuntu 22.04）

### 1. 环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Nginx
sudo apt install -y nginx

# 安装 PM2
sudo npm install -g pm2

# 验证
node -v   # >= 20
npm -v
```

### 2. 上传项目

```bash
# 方式一：git clone
git clone https://github.com/BronyaZaychik818/PersonBlog.git
cd PersonBlog

# 方式二：scp 上传
# scp -r ./PersonBlog root@<公网IP>:/var/www/
```

### 3. 安装依赖 & 构建前端

```bash
cd backend && npm install
cd ../frontend && npm install && npm run build
```

### 4. 配置后端环境变量

```bash
cd backend
# 生成随机 JWT 密钥
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
echo "PORT=3000" >> .env
```

### 5. 启动后端（PM2 守护）

```bash
cd backend
pm2 start src/index.js --name xiaodu-blog
pm2 save
pm2 startup   # 开机自启
```

### 6. 配置 Nginx

```nginx
# /etc/nginx/sites-available/xiaodu-blog
server {
    listen 80;
    server_name <你的域名或IP>;

    # 前端静态文件
    root /var/www/PersonBlog/frontend/dist;
    index index.html;

    # 前端路由 history 模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 上传文件
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
    }

    # 头像
    location /avatar.jpeg {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/xiaodu-blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. 配置 HTTPS（可选）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d <你的域名>
sudo certbot renew --dry-run  # 测试自动续期
```

### 8. 阿里云安全组

在阿里云控制台 → 安全组规则中开放：

| 端口 | 协议 | 说明 |
|------|------|------|
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |

部署完成后访问 `http://<公网IP>` 即可。

### 更新部署

```bash
cd /var/www/PersonBlog
git pull
cd frontend && npm install && npm run build
cd ../backend && npm install
pm2 restart xiaodu-blog
```
