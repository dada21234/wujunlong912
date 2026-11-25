# WJL 课程实践项目

- 学号：24001010912
- 姓名：wujunlong
- 项目名称：WJL 课程实践项目
- 项目类别：自选

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | 原生 HTML / CSS / JavaScript（无任何第三方库、框架、CDN） |
| 后端 | Node.js + Express，RESTful + MVC，接口统一 `/api/` 前缀，端口 8912 |
| 数据库 | MySQL |

## 目录结构

```text
wjlproject/
├─ frontend/              # 前端静态资源（express.static 托管）
│  ├─ index.html          # 首页（个人信息 + 页面导航 + canvas 背景动画）
│  ├─ css/                # 样式文件
│  ├─ js/                 # 脚本文件
│  ├─ fonts/              # iconfont 图标文件
│  └─ images/             # 图片资源
├─ backend/               # 后端服务
│  ├─ server.js           # 入口：中间件、静态托管、服务启动
│  ├─ config/             # 配置（MySQL 连接池）
│  ├─ controllers/        # 控制器层
│  ├─ models/             # 模型层
│  ├─ routes/             # 路由层
│  ├─ .env                # 数据库凭据（不纳入版本管理）
│  ├─ wjl_interface.md    # 接口变更记录
│  └─ wjl_database.md     # 数据库变更记录
├─ AGENTS.md              # 项目开发规则
├─ wujunlong_prompt.md    # 开发指令记录
└─ readme.md
```

## 快速开始

```bash
# 1. 安装后端依赖（已切换国内镜像源）
npm config set registry https://registry.npmmirror.com
cd backend
npm i

# 2. 配置数据库凭据（backend/.env）
# DB_USER / DB_PASSWORD / DB_HOST / DB_NAME

# 3. 启动服务
npm start
```

- 首页：http://localhost:8912/index.html
- 健康检查：http://localhost:8912/api/health

## 接口响应约定

```json
{ "code": 0, "msg": "提示信息", "data": {} }
```

`code = 0` 表示成功，非 0 表示失败。
