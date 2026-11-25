# wjl_interface.md

> 后端接口变更记录（仅追加，不覆盖）。
> 记录格式：接口路径 | HTTP 方法 | 请求参数（含示例）| 响应格式（含 JSON 示例）| 修改时间

---

## GET /api/health

- 接口路径：`/api/health`
- HTTP 方法：`GET`
- 请求参数：无

  示例：`GET http://localhost:8912/api/health`

- 响应格式：统一 JSON `{ "code": 0, "msg": "...", "data": {...} }`

  ```json
  {
    "code": 0,
    "msg": "服务运行正常",
    "data": {
      "wjl_service": "wjl-backend",
      "wjl_status": "ok",
      "wjl_time": "2026-11-19T05:50:00.000Z"
    }
  }
  ```

- 修改时间：2026-11-19 13:47

---

## POST /api/database/test

- 接口路径：`/api/database/test`
- HTTP 方法：`POST`
- 请求参数：`Content-Type: application/json`

  ```json
  {
    "wjl_user": "root",
    "wjl_password": "wu24560832"
  }
  ```

  说明：数据库主机与目标库名由后端 `backend/.env`（DB_HOST、DB_NAME）决定，前端无需传递。

- 响应格式：统一 JSON `{ "code": 0, "msg": "...", "data": {...} }`

  成功示例：

  ```json
  {
    "code": 0,
    "msg": "数据库连接成功",
    "data": {
      "wjl_host": "localhost",
      "wjl_user": "root",
      "wjl_server_version": "8.0.30",
      "wjl_db_name": "wjl_project",
      "wjl_database_exists": false
    }
  }
  ```

  失败示例（密码错误，HTTP 状态仍为 200，code 非 0）：

  ```json
  {
    "code": 1,
    "msg": "连接失败：Access denied for user 'root'@'localhost' (using password: YES)",
    "data": null
  }
  ```

- 修改时间：2026-11-19 14:06

---

## GET /api/news

- 接口路径：`/api/news`
- HTTP 方法：`GET`
- 请求参数：无

  示例：`GET http://localhost:8912/api/news`

- 响应格式：统一 JSON `{ "code": 0, "msg": "...", "data": {...} }`

  ```json
  {
    "code": 0,
    "msg": "新闻列表获取成功",
    "data": {
      "wjl_total": 10,
      "wjl_list": [
        {
          "wjl_id": 1,
          "wjl_title": "国产开源大模型发布轻量推理框架，端侧部署成本下降四成",
          "wjl_summary": "该框架针对手机与边缘设备做了算子裁剪……",
          "wjl_category": "人工智能",
          "wjl_source": "科技前线",
          "wjl_publish_time": "2026-11-18T01:30:00.000Z",
          "wjl_views": 12860
        }
      ]
    }
  }
  ```

  说明：按 `wjl_publish_time` 倒序返回；查询异常时返回 `code: 1` 与错误信息。

- 修改时间：2026-11-19 14:24

---

## GET /api/news（改版：数据源切换为 wjl_news）

- 接口路径：`/api/news`
- HTTP 方法：`GET`
- 请求参数：无

  示例：`GET http://localhost:8912/api/news`

- 响应格式：统一 JSON `{ "code": 0, "msg": "...", "data": {...} }`

  ```json
  {
    "code": 0,
    "msg": "新闻列表获取成功",
    "data": {
      "wjl_total": 10,
      "wjl_list": [
        {
          "id": 1,
          "title": "国产开源大模型发布轻量推理框架，端侧部署成本下降四成",
          "summary": "该框架针对手机与边缘设备做了算子裁剪……",
          "content": "该框架由国内开源社区联合多家芯片厂商共同维护……",
          "source": "科技前线",
          "publish_time": "2026-11-18T01:30:00.000Z",
          "cover_img": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ai%20chip%20data%20center&image_size=landscape_4_3"
        }
      ]
    }
  }
  ```

  说明：数据来自 `wjl_news` 表，按 `publish_time` 倒序返回；查询异常时返回 `code: 1` 与错误信息。

- 修改时间：2026-11-19 14:29

---

## GET /api/gallery

- 接口路径：`/api/gallery`
- HTTP 方法：`GET`
- 请求参数：无

  示例：`GET http://localhost:8912/api/gallery`

- 响应格式：统一 JSON `{ "code": 0, "msg": "...", "data": {...} }`

  ```json
  {
    "code": 0,
    "msg": "图文列表获取成功",
    "data": {
      "wjl_total": 10,
      "wjl_list": [
        {
          "id": 1,
          "title": "数据中心液冷机房",
          "description": "冷板式液冷方案在高密度机柜中的实际部署场景，单机柜功率密度可达 40kW。",
          "img_url": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=liquid%20cooling%20data%20center%20server%20room&image_size=landscape_4_3",
          "category": "数据中心",
          "create_time": "2026-11-18T02:00:00.000Z"
        }
      ]
    }
  }
  ```

  说明：数据来自 `wjl_gallery` 表，按 `create_time` 倒序返回；查询异常时返回 `code: 1` 与错误信息。

- 修改时间：2026-11-19 14:34

---

## POST /api/chat

- 接口路径：`/api/chat`
- HTTP 方法：`POST`
- 请求参数（`application/json`）：`messages` 数组，元素为 `{ role, content }`，role 仅支持 `user` / `assistant`

  ```json
  {
    "messages": [
      { "role": "user", "content": "用一句话解释什么是 RESTful API" }
    ]
  }
  ```

  说明：前端维护完整对话历史，每次请求携带全部历史消息（后端不再截断），单条内容最长 4000 字符；API Key 从 `backend/.env` 的 `SILICONFLOW_API_KEY` 读取，模型由 `SILICONFLOW_MODEL` 指定（默认 `Qwen/Qwen2.5-7B-Instruct`），接口地址由 `SILICONFLOW_BASE_URL` 指定。

- 响应格式：统一 JSON `{ "code": 0, "msg": "...", "data": {...} }`

  ```json
  {
    "code": 0,
    "msg": "AI 回复成功",
    "data": {
      "wjl_reply": "RESTful API 是一种基于 HTTP 协议、以资源为中心的设计风格。",
      "wjl_model": "Qwen/Qwen2.5-7B-Instruct",
      "wjl_usage": { "prompt_tokens": 45, "completion_tokens": 30, "total_tokens": 75 }
    }
  }
  ```

  失败示例：

  ```json
  { "code": 1, "msg": "AI 服务调用失败：请求超时，请稍后重试", "data": null }
  ```

  说明：上游超时时间为 60 秒；密钥缺失、上游报错、返回内容为空均返回 `code: 1`。

- 修改时间：2026-11-23 14:06

---

## POST /api/service

- 接口路径：`/api/service`
- HTTP 方法：`POST`
- 请求参数（`application/json`）：`messages` 数组，元素为 `{ role, content }`，role 仅支持 `user` / `assistant`

  ```json
  {
    "messages": [
      { "role": "user", "content": "我的订单发货了吗？" }
    ]
  }
  ```

  说明：调用七牛云 AI 推理接口（OpenAI 兼容），配置读取自 `backend/.env`：`QINIU_API_KEY`、`QINIU_BASE_URL`（默认 `https://api.qnaigc.com/v1`）、`QINIU_MODEL`（默认 `qiniu/conatus-free`）；系统提示词设定为商城客服「小七」，自动携带完整对话历史。

- 响应格式：统一 JSON `{ "code": 0, "msg": "...", "data": {...} }`

  ```json
  {
    "code": 0,
    "msg": "客服回复成功",
    "data": {
      "wjl_reply": "您好，您的订单已在今天上午发出，预计明天送达。",
      "wjl_model": "qiniu/conatus-free",
      "wjl_usage": { "prompt_tokens": 68, "completion_tokens": 24, "total_tokens": 92 }
    }
  }
  ```

  失败示例（免费模型未实名认证）：

  ```json
  {
    "code": 1,
    "msg": "客服服务暂时不可用：七牛云免费模型需要先完成实名认证，请前往 https://portal.qiniu.com/developer/user/identity 完成认证后重试",
    "data": null
  }
  ```

  说明：上游 60 秒超时；`identity verification` 与 `Too many requests` 会转换成中文提示。

- 修改时间：2026-11-23 15:10

---

## POST /api/kb/upload

- 接口路径：`/api/kb/upload`
- HTTP 方法：`POST`（`multipart/form-data`）
- 请求参数：表单字段 `wjl_file`，支持 `.doc` / `.docx` / `.pptx` / `.pdf` / `.txt`，单个文件 ≤ 20MB

  ```
  curl -F "wjl_file=@知识库.docx" http://localhost:8912/api/kb/upload
  ```

- 响应格式：`code=0` 上传成功，返回文档信息与前 3 个切片预览

  ```json
  {
    "code": 0,
    "msg": "知识库文件上传成功",
    "data": {
      "wjl_doc": {
        "wjl_id": 3,
        "wjl_name": "wjl_知识库_商城产品与售后手册.docx",
        "wjl_type": "docx",
        "wjl_size": 10603,
        "wjl_chunk_count": 4,
        "wjl_status": "ready",
        "wjl_create_time": "2026-11-23T07:33:04.000Z"
      },
      "wjl_preview": ["WJL 商城产品与售后手册\n一、公司简介……"]
    }
  }
  ```

  说明：解析后按约 220 字切片、40 字重叠写入 `wjl_kb_chunk`；旧版 `.ppt` 会提示另存为 `.pptx`。

- 修改时间：2026-11-23 15:36

---

## GET /api/kb/documents

- 接口路径：`/api/kb/documents`
- HTTP 方法：`GET`
- 请求参数：无

- 响应格式：

  ```json
  {
    "code": 0,
    "msg": "查询成功",
    "data": {
      "wjl_docs": [
        { "wjl_id": 4, "wjl_name": "wjl_知识库_客服培训手册.pptx", "wjl_type": "pptx", "wjl_size": 89964, "wjl_chunk_count": 5, "wjl_status": "ready", "wjl_create_time": "2026-11-23T07:33:04.000Z" }
      ]
    }
  }
  ```

- 修改时间：2026-11-23 15:36

---

## DELETE /api/kb/documents/:id

- 接口路径：`/api/kb/documents/:id`
- HTTP 方法：`DELETE`
- 请求参数：路径参数 `id`（文档 ID），例如 `/api/kb/documents/3`

- 响应格式：

  ```json
  { "code": 0, "msg": "删除成功", "data": { "wjl_id": 3 } }
  ```

  说明：同时删除该文档下的全部切片；文档不存在返回 `code=1`。

- 修改时间：2026-11-23 15:36

---

## GET /api/kb/documents/:id/chunks

- 接口路径：`/api/kb/documents/:id/chunks`
- HTTP 方法：`GET`
- 请求参数：路径参数 `id`（文档 ID）

- 响应格式：

  ```json
  {
    "code": 0,
    "msg": "查询成功",
    "data": {
      "wjl_chunks": [
        { "wjl_id": 7, "wjl_doc_id": 3, "wjl_index": 0, "wjl_content": "WJL 商城产品与售后手册……" }
      ]
    }
  }
  ```

- 修改时间：2026-11-23 15:36

---

## POST /api/kb/ask

- 接口路径：`/api/kb/ask`
- HTTP 方法：`POST`
- 请求参数（`application/json`）：`question` 为提问内容

  ```json
  { "question": "签收后几天内可以无理由退货？" }
  ```

  说明：先把问题切分为中文二元组与英文单词，对全部切片计算关键词相关度，取前 4 个切片拼入提示词，再调用硅基流动大模型作答；服务端控制台会输出「发送给大模型的数据」与「接收到大模型的数据」。

- 响应格式：

  ```json
  {
    "code": 0,
    "msg": "回答成功",
    "data": {
      "wjl_answer": "签收后 7 天内支持无理由退货。",
      "wjl_model": "deepseek-ai/DeepSeek-V4-Flash",
      "wjl_usage": { "prompt_tokens": 412, "completion_tokens": 18, "total_tokens": 430 },
      "wjl_prompt": "【知识库资料】……【用户问题】签收后几天内可以无理由退货？",
      "wjl_sources": [
        { "wjl_id": 11, "wjl_doc_id": 3, "wjl_name": "wjl_知识库_商城产品与售后手册.docx", "wjl_index": 2, "wjl_score": 13.474, "wjl_content": "……签收后 7 天内支持无理由退货……" }
      ]
    }
  }
  ```

  说明：知识库为空或无匹配资料时返回 `code=0`，`wjl_sources` 为空数组并说明未找到相关内容。

- 修改时间：2026-11-23 15:36

---

## POST /api/vision

- 接口路径：`/api/vision`
- HTTP 方法：`POST`（`multipart/form-data`）
- 请求参数：表单字段 `wjl_file`，支持 JPG / PNG / WEBP / GIF，单个文件 ≤ 10MB

  ```
  curl -F "wjl_file=@photo.jpg" http://localhost:8912/api/vision
  ```

  说明：图片转 base64 后以 OpenAI 兼容格式发送给硅基流动视觉模型（`VISION_MODEL`，默认 `Qwen/Qwen3-VL-8B-Instruct`），提示词要求用中文描述主体、场景、颜色与可见文字；服务端控制台输出「发送给大模型的数据」与「接收到大模型的数据」（base64 内容省略）。

- 响应格式：

  ```json
  {
    "code": 0,
    "msg": "识别成功",
    "data": {
      "wjl_description": "这是一张数据中心内部的走廊照片。两侧排列着高大的黑色服务器机柜……",
      "wjl_model": "Qwen/Qwen3-VL-8B-Instruct",
      "wjl_usage": { "prompt_tokens": 1104, "completion_tokens": 106, "total_tokens": 1210 },
      "wjl_image": { "wjl_name": "photo.jpg", "wjl_size": 284625, "wjl_type": "image/jpeg" }
    }
  }
  ```

  失败示例（上传的不是图片）：`{ "code": 1, "msg": "仅支持 JPG / PNG / WEBP / GIF 图片", "data": null }`

- 修改时间：2026-11-23 15:50

---

## POST /api/asr

- 接口路径：`/api/asr`
- HTTP 方法：`POST`（`multipart/form-data`）
- 请求参数：表单字段 `wjl_file`，支持 webm / wav / mp3 / m4a / ogg 等音频，单个文件 ≤ 10MB

  ```
  curl -F "wjl_file=@voice.webm" http://localhost:8912/api/asr
  ```

  说明：后端将音频转发到七牛云音频转写接口 `POST /audio/transcriptions`，模型读取自 `backend/.env` 的 `QINIU_ASR_MODEL`（默认 `qiniu/Qwen-Audio-3.0-ASR-Flash`），使用 `QINIU_API_KEY` 鉴权；服务端控制台输出「发送给大模型的数据」与「接收到大模型的数据」。七牛云未实名认证或限流时会转换为中文提示。

- 响应格式：

  ```json
  {
    "code": 0,
    "msg": "识别成功",
    "data": {
      "wjl_text": "你好，欢迎使用语音识别功能。",
      "wjl_model": "qiniu/Qwen-Audio-3.0-ASR-Flash",
      "wjl_audio": { "wjl_name": "voice.webm", "wjl_size": 45210, "wjl_type": "audio/webm" }
    }
  }
  ```

  失败示例：`{ "code": 1, "msg": "语音识别失败：七牛云服务需要实名认证，请前往 https://portal.qiniu.com/developer/user/identity 完成认证后重试", "data": null }`

- 修改时间：2026-11-25

---

## POST /api/chat（改版：客服人设 + 多平台热切换）

- 接口路径：`/api/chat`
- HTTP 方法：`POST`
- 请求参数（`application/json`）：

  ```json
  {
    "wjl_provider": "siliconflow",
    "messages": [
      { "role": "user", "content": "你们营业时间是几点到几点？" }
    ]
  }
  ```

  说明：
  - `wjl_provider` 可选，取值 `siliconflow`（默认）或 `qiniu`，用于在「硅基流动 / 七牛云」之间热切换；前端下拉框选择后下一条消息即生效，对话历史保留。
  - 每个平台的 `baseUrl / model / apiKey` 全部从 `backend/.env` 读取：硅基流动读 `SILICONFLOW_BASE_URL` / `SILICONFLOW_MODEL` / `SILICONFLOW_API_KEY`；七牛读 `QINIU_BASE_URL` / `QINIU_MODEL` / `QINIU_API_KEY`。切换平台只改这几个值，其余代码不动。
  - `messages` 必须携带完整对话历史（多轮对话），单条内容最长 4000 字符。
  - 系统提示词固定为「中华美食街」在线客服人设：只回答营业时间、招牌菜、配送范围；范围外问题礼貌引导留言；允许用户追问“我刚才问了什么”以复述上文。
  - Key / 上游错误会转换为中文友好提示：Key 无效（401 / invalid api key）→「Key 无效，请检查 backend/.env …」；限流（429）→「请求过于频繁（平台限流），请稍后重试」；模型不存在 →「当前模型不可用…」。

- 响应格式：统一 JSON `{ "code": 0, "msg": "...", "data": {...} }`

  成功示例：

  ```json
  {
    "code": 0,
    "msg": "AI 回复成功",
    "data": {
      "wjl_reply": "您好，中华美食街每天 10:00 - 22:00 营业，节假日正常营业（除夕除外）。",
      "wjl_model": "deepseek-ai/DeepSeek-V4-Flash",
      "wjl_provider": "siliconflow",
      "wjl_providerLabel": "硅基流动",
      "wjl_usage": { "prompt_tokens": 120, "completion_tokens": 26, "total_tokens": 146 }
    }
  }
  ```

  失败示例（Key 改错一位）：

  ```json
  { "code": 1, "msg": "Key 无效，请检查 backend/.env 中「硅基流动」的 Key 配置是否正确", "data": null }
  ```

- 修改时间：2026-11-25


