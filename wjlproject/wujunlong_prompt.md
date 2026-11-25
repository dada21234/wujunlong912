# wujunlong_prompt.md

> 开发指令记录（仅追加，不覆盖）。格式：时间 | 提示词全文 | 大模型名称。

---

## 2026-11-19 13:45 | DeepSeek-V4.1-Flash

提示词全文：

请初始化本项目：
1、git init + .gitignore（排除 node_modules、.env）+ 首次提交
2、按 AGENTS.md 规则创建前后端目录骨架、安装依赖、
3、创建前端首页 index.html，包括姓名wujunlong、学号24001010912、项目名称、项目类别（自选、模仿），所有完成的 html 页面的超链接。有 canvas 背景动画。主体是页面链接导航。页面美观。
4、创建 readme.md，在根目录下，包括学号、姓

---

## 2026-11-19 13:56 | DeepSeek-V4.1-Flash

提示词全文：

创建运行后台的bat文件，在根目录下。

---

## 2026-11-19 14:00 | DeepSeek-V4.1-Flash

提示词全文：

创建 database.html 页面，输入用户名，密码，链接数据库，数据库使用 mysql，成功和错误都有提示，默认用户名 root，密码 wu24560832。

---

## 2026-11-19 14:10 | DeepSeek-V4.1-Flash

提示词全文：

完成科技新闻列表页面，新闻的数据存在数据库表里。网页显示后端接口链接和数据内容。

---

## 2026-11-19 14:25 | DeepSeek-V4.1-Flash

提示词全文：

完成科技新闻列表页面：
1、在 MySQL 中建表 wjl_news，字段包含：id、title、summary、content、source、publish_time、cover_img；
2、插入至少 8 条真实的科技新闻测试数据；
3、后端提供 GET /api/news 接口，返回全部新闻（按发布时间倒序），统一 JSON 格式 { code, msg, data }；
4、新建 frontend/news.html，页面顶部显示当前调用的接口地址，下方以列表展示新闻标题、摘要、来源、时间；
5、数据用 fetch 获取，控制台输出返回数据；
6、把建表与插入数据的 SQL 追加写入 backend/wjl_database.md，接口信息追加写入 backend/wjl_interface.md，本次提示词追加写入 wujunlong_prompt.md；
7、在 frontend/index.html 增加入口链接。

---

## 2026-11-19 14:30 | DeepSeek-V4.1-Flash

提示词全文：

完成图文列表，图片可以使用网络图片或创建图片，创建一个新的表，网页显示后端接口链接和数据内容。完成图文列表页面：
1、在 MySQL 中新建表 wjl_gallery，字段：id、title、description、img_url、category、create_time，插入至少 8 条测试数据；
2、后端提供 GET /api/gallery 接口，返回全部图文数据；
3、新建 frontend/gallery.html，页面顶部显示接口地址，下方用网格布局展示"上图下文"卡片：图片、标题、描述；
4、图片加载失败时显示占位色块，不要出现破图图标；
5、页面适配手机宽度；
6、记录写入 backend/wjl_database.md、backend/wjl_interface.md 和 wujunlong_prompt.md，并在首页加入口。

---

## 2026-11-23 13:50 | DeepSeek-V4.1-Flash

提示词全文：

使用硅基流动API key创建基本AI应用:AI聊天
Api-key：sk-***已打码（真实值仅存于 backend/.env，勿提交）***

---

## 2026-11-23 14:04 | DeepSeek-V4.1-Flash

提示词全文（用户发送截图，内容为 AI 聊天的实现要求）：

1、让 Trae 写后端接口 /api/chat：接口做三件事：收前端发来的 messages 数组 → 带上 Key 转发给硅基流动 → 把模型的回答原样返回给前端。
2、写聊天页面：一个输入框 + 一个发送按钮 + 一块消息区。发送后把“用户的话”先显示出来，再等接口返回追加“AI 的回答”，等待期间显示“正在思考…”。
3、多轮对话怎么实现：模型本身不记事。所谓“记得上文”，是因为每次请求都把之前的全部对话一起发过去。所以要维护一个 messages 数组，每轮把用户消息和 AI 回复都 push 进去。

---

## 2026-11-23 14:50 | DeepSeek-V4.1-Flash

提示词全文：

先在页面上问"你好"，再问"我刚才问了什么"——能答上来，说明多轮对话通了。 把这次用的提示词和遇到的问题记进 wujunlong_prompt.md

页面实测结果：

- 第一轮「你好」→「你好！很高兴为你服务。有什么问题或需要帮助的吗？」
- 第二轮「我刚才问了什么」→「你刚才问了好！现在有什么其他问题需要帮助吗？」
- 结论：AI 准确复述上文，说明前端 messages 数组 → `/api/chat` → 硅基流动 的多轮链路已打通。

遇到的问题与处理：

1. 数据库：MySQL 命令行未加入 PATH，无法直接执行 SQL 文件，改用临时 Node 脚本（mysql2 + multipleStatements）执行建表与 INSERT，执行后删除脚本。
2. PowerShell 编码：直接传中文会乱码，调用接口时改用 UTF-8 字节提交 JSON；启动脚本 .bat 使用 GBK + CRLF 编码避免 cmd 乱码。
3. 图文图片：外部文生图接口对部分不同提示词返回了相同图片（SHA256 一致），并非页面加载失败；图片请求失败时前端自动显示占位色块。
4. AI 聊天历史：后端最初只保留最近 12 条消息，与“每次把之前的全部对话一起发过去”不符，已去掉截断。
5. 等待提示：最初只有三个跳动圆点，按截图要求改为「正在思考」+ 动画，状态栏同步显示「正在思考...」。
6. 安全：API Key 仅写入 backend/.env（已被 .gitignore 排除），前端不接触密钥；提示词记录中按要求保留了 key 原文，提交前建议脱敏。
7. 浏览器自动化工具两次报 subagent isolation 错误，改用命令行接口验证 + 后续截图复验。
8. 模型名称：修改 SILICONFLOW_MODEL 后需要重启后端才生效，且模型 ID 必须与硅基流动模型广场中的名称完全一致，否则接口会返回模型不存在错误。

---

## 2026-11-23 14:56 | DeepSeek-V4.1-Flash

提示词全文：

好的，保存并重启后端

执行记录：

- 已确认 `deepseek-ai/DeepSeek-V4-Flash` 存在于硅基流动模型列表（/v1/models 共 92 个模型）。
- 已将 backend/.env 中 `SILICONFLOW_MODEL` 更新为 `deepseek-ai/DeepSeek-V4-Flash` 并重启后端。
- 接口实测：`code=0`，`wjl_model=deepseek-ai/DeepSeek-V4-Flash`，回复「我是WJL课程实践项目中的AI助手，专门为你提供简洁、友好的中文帮助！」。
- 注意：更换模型后必须重启服务才会生效；.env 已被 .gitignore 排除，不会提交密钥。

---

## 2026-11-23 15:05 | DeepSeek-V4.1-Flash

提示词全文：

使用七牛的 api key 完成在线客服页面：
Model ID：qiniu/conatus-free
Api-key：sk-***已打码（真实值仅存于 backend/.env，勿提交）***
OpenAI BaseURL：`https://api.qnaigc.com/v1`

执行记录：

- 新增 `POST /api/service`：代理七牛云 OpenAI 兼容接口，系统提示词设定为商城客服「小七」，携带完整对话历史，密钥仅存于 backend/.env。
- 新增 frontend/service.html：客服状态栏、消息区、4 个快捷问题（查询物流 / 申请退货 / 优惠券使用 / 转人工）、输入框与发送按钮，适配手机宽度。
- 遇到问题 1：直接调用返回 403 `account_identity_verification_required`，提示免费模型需先完成七牛云实名认证（https://portal.qiniu.com/developer/user/identity）。
- 遇到问题 2：再次请求返回 429 `Too many requests for this free model`，免费模型存在频率限制。
- 处理：后端将上述两类英文错误转换为中文提示，页面以红色气泡展示；完成实名认证并等待限流恢复后即可正常对话。

---

## 2026-11-23 15:36 | DeepSeek-V4.1-Flash

提示词全文：

完成知识库文件上传功能，构建2个知识库文件，完成基于知识库的问答，支持doc和docx，ppt，完成知识库管理（RAG）：基于本地文件（如 PDF/TXT）上传、解析，构建专属自动客服或问答系统，包括知识库文件上传模块。在控制台输出发送给大模型的数据和接受自大模型的数据。

执行记录：

- 知识库文件：`knowledge/wjl_知识库_商城产品与售后手册.docx`（商品、配送、退换货、退款、优惠券、发票、会员权益）与 `knowledge/wjl_知识库_客服培训手册.pptx`（服务标准、物流、退换货、优惠券、投诉升级、禁语）。
- 数据表：`wjl_kb_doc`（文档）与 `wjl_kb_chunk`（切片），上传后共 2 个文档、9 个切片。
- 解析：doc/docx 用 word-extractor，pptx 用 adm-zip 读取 slide XML，pdf 用 pdf-parse，txt 直接读取；旧版 .ppt 提示另存为 .pptx。
- 检索：中文二元组 + 英文单词切分，按词频对数加权打分，取前 4 个切片拼入提示词。
- 接口：`POST /api/kb/upload`、`GET /api/kb/documents`、`DELETE /api/kb/documents/:id`、`GET /api/kb/documents/:id/chunks`、`POST /api/kb/ask`。
- 控制台输出：后端打印「发送给大模型的数据」「接收到大模型的数据」；前端 console.log 输出上传、列表、问答返回结果，并单独打印发送给大模型的提示词与接收到的答案。
- 实测：
  1. 「签收后几天内可以无理由退货？」→「签收后 7 天内支持无理由退货。」，来源为售后手册第 3 段等 4 条。
  2. 「怎么查询物流，超过多久没更新要找客服？」→「在订单详情页点击物流信息……超过 72 小时未更新，客服会代您发起催件工单。」
  3. 页面实测：已入库文件 2 个、双栏布局正常、答案与引用来源正常展示。

遇到的问题与处理：

1. 切片过大：初始按 400 字切片，每篇文档只有 2 片，检索粒度差；改为 220 字、40 字重叠后共 9 片。
2. 上传文件名乱码：multer 以 latin1 解析中文文件名，已用 Buffer 转回 UTF-8。
3. 中文无空格：MySQL 全文检索对中文支持差，改为应用层二元组切分 + 词频打分，无需额外向量库。
4. 生成 pptx 时 pptxgenjs 不接受纯字符串数组，改为 `{ text, options: { breakLine: true } }` 对象数组。
5. 旧版 .ppt 为二进制 OLE 格式，Node 端无可靠解析库，明确提示用户另存为 .pptx。
6. 库表要求每表至少 8 条测试数据：两个知识库文件解析后共 9 个切片，满足切片表要求；文档表按用户要求仅有 2 个真实文件。

---

## 2026-11-23 15:50 | DeepSeek-V4.1-Flash

提示词全文：

完成图像识别功能，上传图片，返回该图片的描述，使用已有的api-key和模型。

执行记录：

- 新增 `POST /api/vision`：multer 内存接收图片，转 base64 data URL，按 OpenAI 兼容格式调用硅基流动视觉模型。
- 新增 frontend/vision.html：拖拽/点击选择图片、前端预览、开始识别按钮、结果与 tokens 展示，适配手机宽度。
- 控制台输出：前端打印发送给大模型的模型、图片信息与提示词，以及接收到的接口数据；后端打印发送与接收的完整数据（base64 已省略）。
- 实测上传数据中心图片，返回「这是一张数据中心内部的走廊照片。两侧排列着高大的黑色服务器机柜……画面右下角有“AI生成”字样。」，tokens 1210。

遇到的问题与处理：

1. 现有文本模型不支持图片：用 `deepseek-ai/DeepSeek-V4-Flash` 发送图片返回 400 `The model is not a VLM (Vision Language Model)`。
2. 解决：仍使用已有的硅基流动 API Key，新增环境变量 `VISION_MODEL=Qwen/Qwen3-VL-8B-Instruct`（该账号模型列表中可用的视觉模型），图像识别接口单独调用该模型，不影响聊天与知识库的 DeepSeek 配置。
3. 七牛云免费模型仍受实名认证与限流限制，本次未使用。

---

## 2026-11-25 | DeepSeek-V4.1-Flash

提示词全文：

实现一个语音识别的功能，使用七牛的Qwen-Audio-3.0-ASR-Flash模型，输入语音，输出文字。

执行记录：

- 新增 `POST /api/asr`：multer 内存接收音频，转发到七牛云 `/audio/transcriptions`，模型 `QINIU_ASR_MODEL=qiniu/Qwen-Audio-3.0-ASR-Flash`，返回转写文本。
- 新增 frontend/asr.html：浏览器 MediaRecorder 录音（计时、播放器）+ 上传音频文件两种输入，结果可复制；样式 wjl_asr.css、脚本 wjl_asr.js。
- 控制台输出：前端打印发送给大模型的模型与音频信息、接收到的接口数据；后端打印发送与接收的数据。
- 验证：用 node-edge-tts 生成中文语音 mp3 后调用接口，返回 403 并被转换为中文提示。

遇到的问题与处理：

1. 本地无 TTS 语音：PowerShell System.Speech 报“系统上未安装语音”，改用临时依赖 node-edge-tts（Edge 在线 TTS，中文女声）生成测试音频，验证后卸载该依赖。
2. 七牛云 403 `trial_period_expired`：24 小时未实名体验期已结束，必须先在 https://portal.qiniu.com/developer/user/identity 完成实名认证才能调用；后端已把英文错误转换为中文提示，页面会直接展示。
3. 七牛 `/v1/models` 未返回音频模型列表（AUDIO_MODELS 为空），模型 ID 按用户指定的 `qiniu/Qwen-Audio-3.0-ASR-Flash` 写入环境变量，待实名认证通过后即可生效。
4. 浏览器录音兼容性：MediaRecorder 优先 audio/webm;codecs=opus，依次降级，不支持录音时仅保留文件上传入口。

---

## 2026-11-25 | DeepSeek-V4.1-Flash

提示词全文：

完成第 5 步（验收清单与课堂任务），并完成任务一到任务三：
- 任务一：把 Key 藏好 —— 检查 .env 是否在 .gitignore、前端代码是否残留 Key、截图打码，列出 3 处可能泄露 Key 的地方。
- 任务二：把 AI 聊天改造成「中华美食街在线客服」，只回答营业时间 / 招牌菜 / 配送范围，其余礼貌引导留言；写出 system 提示词、测试 5 个问题（3 答 2 拒）并解释为何能管住模型。
- 任务三：让页面支持在「硅基流动 / 七牛」之间热切换（后端读配置，前端加下拉框），并回答答辩三问：①为什么 Key 不能放前端 ②多轮对话为什么要把历史一起发 ③换平台改哪几个值、为什么只改这几个。
- 验收清单：Key 仅在 .env、curl 返回中文、等待有「正在思考」、追问「我刚才问了什么」能答上来、baseURL/model 换七牛后页面照用、Key 改错一位有友好提示不白屏。

执行记录：

- 任务一：确认 `.env` 在 `.gitignore` 且 `git ls-files` 未跟踪；grep 全工作区，真实 Key 仅存在于 `.env`（被 gitignore 排除）；发现 `wujunlong_prompt.md` 第 77、137 行明文抄录了硅基流动/七牛 Key，已打码为 `sk-***已打码…***`。列出 3 处可能泄露点：提示词记录文件、.env 被误提交、前端/文档硬编码。
- 任务二：在 `backend/controllers/wjl_chatController.js` 写入「中华美食街」客服 system 提示词（白名单三类 + 给固定事实 + 统一拒绝话术 + 允许复述上文）。真实接口测试：营业时间/招牌菜/配送范围 3 问均答出提示词中的事实，天气/写代码 2 问均礼貌引导留言。
- 任务三：`frontend/chat.html` 加平台下拉框，`wjl_chat.js` 发送时带 `wjl_provider`；后端按 provider 从 `.env` 读 `BASE_URL/MODEL/API_KEY` 三件套，走统一 OpenAI 兼容请求，切换只改这三个值。实测切到七牛返回了中文回复。
- 验收清单全部通过，含「Key 改错一位」实测：上游 401 `Token is invalid.` 被映射为 `Key 无效，请检查 backend/.env 中「硅基流动」的 Key 配置是否正确`，已还原 Key。
- 控制器上游超时从 60s 上调至 120s（免费模型推理较慢）；新增 Key 无效 / 限流 / 模型不存在的中文友好映射。
- 产物：`wjl_homework.md`（验收与任务交付文档）、`backend/wjl_interface.md` 追加 `/api/chat` 改版记录。

---

## 2026-11-25 09:40:00 | DeepSeek-V4.1-Flash

提示词：将wjlproject这个文件夹上传到 GitHub 仓库，并且将里面的内容与父级（e:\gaojiwangye）的 index.html 连接起来。

执行记录：
- 本地仓库原为独立 git（master，提交 a6f5109 + 本次未提交改动），已本地提交为 1d93dcd「完成前端 8 个功能页与 Express 后端接口，补充数据库与接口文档」。
- GitHub CLI 未安装、无法代建远程仓库，经用户确认改为合入父仓库：原 .git 移至 e:\gaojiwangye\.git-backups\wjlproject-20261125\.git（已被父仓库 .gitignore 排除），代码以 wjlproject/ 子目录形式提交到 dada21234/wujunlong912。
- backend/.env 与 node_modules/ 由本项目 .gitignore 排除，未进入远端；前端页面沿用 /api/ 前缀调用 8912 端口后端，静态托管时接口需自行启动。
- 父级 index.html 新增「13 / COURSE PROJECT」入口与 8 个子页面直达链接。
