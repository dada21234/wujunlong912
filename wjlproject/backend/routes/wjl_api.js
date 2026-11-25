/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：接口路由层，统一挂载在 /api 前缀下。
 */
const wjl_express = require('express');
const wjl_fs = require('fs');
const wjl_path = require('path');
const wjl_multer = require('multer');
const wjl_healthController = require('../controllers/wjl_healthController');
const wjl_databaseController = require('../controllers/wjl_databaseController');
const wjl_newsController = require('../controllers/wjl_newsController');
const wjl_galleryController = require('../controllers/wjl_galleryController');
const wjl_chatController = require('../controllers/wjl_chatController');
const wjl_serviceController = require('../controllers/wjl_serviceController');
const wjl_kbController = require('../controllers/wjl_kbController');
const wjl_visionController = require('../controllers/wjl_visionController');
const wjl_asrController = require('../controllers/wjl_asrController');

const wjl_router = wjl_express.Router();

// 知识库上传目录与 multer 配置（单文件，最大 20MB）
const wjl_uploadDir = wjl_path.join(__dirname, '..', 'uploads');
wjl_fs.mkdirSync(wjl_uploadDir, { recursive: true });

const wjl_storage = wjl_multer.diskStorage({
  destination: function (wjl_req, wjl_file, wjl_cb) {
    wjl_cb(null, wjl_uploadDir);
  },
  filename: function (wjl_req, wjl_file, wjl_cb) {
    const wjl_ext = wjl_path.extname(wjl_file.originalname).toLowerCase();
    const wjl_stamp = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    wjl_cb(null, 'wjl_kb_' + wjl_stamp + wjl_ext);
  }
});

const wjl_upload = wjl_multer({
  storage: wjl_storage,
  limits: { fileSize: 20 * 1024 * 1024 }
});

// 图像识别使用内存存储，直接转 base64 发送给视觉模型
const wjl_imageUpload = wjl_multer({
  storage: wjl_multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// 语音识别使用内存存储，直接转发音频给转写接口
const wjl_audioUpload = wjl_multer({
  storage: wjl_multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// 服务健康检查
wjl_router.get('/health', wjl_healthController.wjl_getHealth);

// 数据库连接测试
wjl_router.post('/database/test', wjl_databaseController.wjl_testConnection);

// 科技新闻列表
wjl_router.get('/news', wjl_newsController.wjl_getNewsList);

// 图文列表
wjl_router.get('/gallery', wjl_galleryController.wjl_getGalleryList);

// AI 聊天（硅基流动）
wjl_router.post('/chat', wjl_chatController.wjl_getChatReply);

// 在线客服（七牛云）
wjl_router.post('/service', wjl_serviceController.wjl_getServiceReply);

// 知识库（RAG）：上传、列表、删除、切片、问答
wjl_router.post('/kb/upload', wjl_upload.single('wjl_file'), wjl_kbController.wjl_uploadDoc);
wjl_router.get('/kb/documents', wjl_kbController.wjl_getDocs);
wjl_router.delete('/kb/documents/:id', wjl_kbController.wjl_deleteDoc);
wjl_router.get('/kb/documents/:id/chunks', wjl_kbController.wjl_getDocChunks);
wjl_router.post('/kb/ask', wjl_kbController.wjl_ask);

// 图像识别（硅基流动视觉模型）
wjl_router.post('/vision', wjl_imageUpload.single('wjl_file'), wjl_visionController.wjl_recognizeImage);

// 语音识别（七牛云 ASR）
wjl_router.post('/asr', wjl_audioUpload.single('wjl_file'), wjl_asrController.wjl_transcribeAudio);

module.exports = wjl_router;
