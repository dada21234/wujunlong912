/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：后端入口文件，负责加载环境变量、装配中间件、托管前端静态资源并启动服务。
 */
require('dotenv').config();

const wjl_express = require('express');
const wjl_cors = require('cors');
const wjl_path = require('path');
const wjl_apiRouter = require('./routes/wjl_api');

const wjl_app = wjl_express();
const wjl_port = 8912;

// 课程作业：开放全部跨域访问
wjl_app.use(wjl_cors());
wjl_app.use(wjl_express.json());
wjl_app.use(wjl_express.urlencoded({ extended: true }));

// 所有接口统一以 /api 为前缀
wjl_app.use('/api', wjl_apiRouter);

// 托管 frontend/ 静态资源
wjl_app.use(wjl_express.static(wjl_path.join(__dirname, '..', 'frontend')));

// 未匹配到的接口统一返回 JSON
wjl_app.use('/api', (wjl_req, wjl_res) => {
  wjl_res.status(404).json({ code: 404, msg: '接口不存在', data: null });
});

// 全局异常处理，保证响应格式统一
wjl_app.use((wjl_err, wjl_req, wjl_res, wjl_next) => {
  console.error('[wjl_server] 未捕获异常：', wjl_err);
  wjl_res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
});

wjl_app.listen(wjl_port, () => {
  console.log(`[wjl_server] 服务已启动：http://localhost:${wjl_port}`);
  console.log(`[wjl_server] 首页地址：http://localhost:${wjl_port}/index.html`);
});
