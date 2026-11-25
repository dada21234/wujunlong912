# wjl_database.md

> 数据库变更记录（仅追加，不覆盖）。按执行顺序记录建表、改表与测试数据 INSERT 语句，
> 仅凭本文件即可在新机器上完整重建数据库。

---
## 2026-11-19 14:20 建库建表与测试数据（科技新闻模块）

```sql
-- 科技新闻模块：建库、建表、测试数据
CREATE DATABASE IF NOT EXISTS wjl_project DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE wjl_project;

CREATE TABLE IF NOT EXISTS wjl_tech_news (
  wjl_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻主键',
  wjl_title VARCHAR(200) NOT NULL COMMENT '新闻标题',
  wjl_summary VARCHAR(500) NOT NULL COMMENT '新闻摘要',
  wjl_category VARCHAR(50) NOT NULL COMMENT '新闻分类',
  wjl_source VARCHAR(100) NOT NULL COMMENT '来源媒体',
  wjl_publish_time DATETIME NOT NULL COMMENT '发布时间',
  wjl_views INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
  PRIMARY KEY (wjl_id),
  KEY wjl_idx_publish_time (wjl_publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科技新闻表';

INSERT INTO wjl_tech_news (wjl_title, wjl_summary, wjl_category, wjl_source, wjl_publish_time, wjl_views) VALUES
('国产开源大模型发布轻量推理框架，端侧部署成本下降四成', '该框架针对手机与边缘设备做了算子裁剪，在保持精度的前提下将显存占用压缩到原来的六成，已在多个国产芯片平台完成适配。', '人工智能', '科技前线', '2026-11-18 09:30:00', 12860),
('新一代车规级芯片量产，算力提升至 500 TOPS', '芯片采用 5nm 工艺与自研 NPU 架构，支持多传感器融合，首批订单来自三家新能源车企，预计明年一季度交付。', '芯片半导体', '芯闻社', '2026-11-17 14:05:00', 9432),
('折叠屏手机出货量连续三个季度增长，铰链成本明显下降', '供应链数据显示，水滴铰链方案良率提升至九成以上，带动整机成本下降，中端价位段折叠屏机型数量翻倍。', '消费电子', '数码观察', '2026-11-16 10:20:00', 7521),
('云厂商上线容器化 GPU 共享调度，推理任务排队时间缩短一半', '新调度策略支持按显存切片分配资源，中小团队可按需租用算力，实测高并发场景下任务平均等待时间下降 48%。', '云计算', '云栈周刊', '2026-11-15 16:40:00', 5380),
('开源社区修补高危远程执行漏洞，涉及主流 JSON 解析库', '漏洞源于递归深度校验缺失，攻击者可构造恶意报文触发栈溢出。官方已发布修复版本，建议开发者尽快升级。', '网络安全', '安全客', '2026-11-14 08:50:00', 18640),
('城市 NOA 开放测试范围扩大，覆盖三十座城市主干道', '多家车企同步推送新版本辅助驾驶系统，新增无保护左转与施工路段绕行能力，仍要求驾驶员全程接管。', '自动驾驶', '智能出行', '2026-11-13 11:15:00', 6930),
('国产数据库开源项目发布 8.0 版本，支持分布式事务两地三中心', '新版本引入并行查询执行器与向量化引擎，TPC-C 测试性能提升明显，社区版与企业版同步更新。', '开源生态', '开源观察', '2026-11-12 15:30:00', 4210),
('光模块厂商发布 1.6T 硅光产品，数据中心互联带宽再翻倍', '产品基于硅光集成方案，功耗较传统方案降低约三成，主要面向超大规模数据中心的东西向流量场景。', '芯片半导体', '光通信资讯', '2026-11-11 09:10:00', 3760),
('浏览器厂商联合推进隐私沙盒标准，第三方 Cookie 逐步退出', '新的行业草案明确了设备端数据处理的边界，广告归因将依赖聚合上报，多家浏览器厂商计划在明年完成切换。', '网络安全', '互联网观察', '2026-11-10 13:25:00', 8150),
('工业质检引入视觉大模型，缺陷识别准确率提升至 99.2%', '某制造企业将视觉大模型部署到产线边缘服务器，替换原有规则算法后误检率下降，人工复检工作量减少六成。', '人工智能', '智能制造日报', '2026-11-09 09:45:00', 5890);
```

## 2026-11-19 14:26 新建 wjl_news 表并插入测试数据（科技新闻列表改版）

```sql
-- 科技新闻模块（wjl_news）：建表与测试数据
USE wjl_project;

CREATE TABLE IF NOT EXISTS wjl_news (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻主键',
  title VARCHAR(200) NOT NULL COMMENT '新闻标题',
  summary VARCHAR(500) NOT NULL COMMENT '新闻摘要',
  content TEXT NOT NULL COMMENT '新闻正文',
  source VARCHAR(100) NOT NULL COMMENT '来源媒体',
  publish_time DATETIME NOT NULL COMMENT '发布时间',
  cover_img VARCHAR(500) NOT NULL DEFAULT '' COMMENT '封面图地址',
  PRIMARY KEY (id),
  KEY wjl_idx_publish_time (publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科技新闻表';

INSERT INTO wjl_news (title, summary, content, source, publish_time, cover_img) VALUES
('国产开源大模型发布轻量推理框架，端侧部署成本下降四成', '该框架针对手机与边缘设备做了算子裁剪，在保持精度的前提下将显存占用压缩到原来的六成，已在多个国产芯片平台完成适配。', '该框架由国内开源社区联合多家芯片厂商共同维护，重点优化了注意力算子与量化推理路径。实测在主流移动端芯片上，7B 参数模型的推理时延下降约 35%，显存占用压缩至原来的六成。项目采用 Apache 2.0 协议开源，已提供 Android 与 Linux 两套部署示例。', '科技前线', '2026-11-18 09:30:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ai%20chip%20data%20center&image_size=landscape_4_3'),
('新一代车规级芯片量产，算力提升至 500 TOPS', '芯片采用 5nm 工艺与自研 NPU 架构，支持多传感器融合，首批订单来自三家新能源车企，预计明年一季度交付。', '该芯片面向高阶辅助驾驶场景，内置多核 NPU 与安全岛设计，支持摄像头、毫米波雷达与激光雷达的同步接入。厂商表示芯片已通过 AEC-Q100 车规认证，配套工具链支持主流深度学习框架模型转换。', '芯闻社', '2026-11-17 14:05:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=car%20chip%20semiconductor&image_size=landscape_4_3'),
('折叠屏手机出货量连续三个季度增长，铰链成本明显下降', '供应链数据显示，水滴铰链方案良率提升至九成以上，带动整机成本下降，中端价位段折叠屏机型数量翻倍。', '供应链调研报告显示，折叠屏手机关键零部件国产化率持续提升，铰链模组单价较去年同期下降约两成。多家厂商计划在明年推出 4000 元价位段的折叠屏产品，进一步拉动换机需求。', '数码观察', '2026-11-16 10:20:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=foldable%20smartphone%20screen&image_size=landscape_4_3'),
('云厂商上线容器化 GPU 共享调度，推理任务排队时间缩短一半', '新调度策略支持按显存切片分配资源，中小团队可按需租用算力，实测高并发场景下任务平均等待时间下降 48%。', '该调度方案基于容器运行时扩展实现，可将单张 GPU 按显存与算力比例切分为多个实例，并支持抢占式回收。云厂商公布的测试数据显示，在千卡集群中，小模型推理任务的资源利用率提升约三成。', '云栈周刊', '2026-11-15 16:40:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cloud%20computing%20server%20room&image_size=landscape_4_3'),
('开源社区修补高危远程执行漏洞，涉及主流 JSON 解析库', '漏洞源于递归深度校验缺失，攻击者可构造恶意报文触发栈溢出。官方已发布修复版本，建议开发者尽快升级。', '安全研究人员在审计中发现，该库解析深层嵌套 JSON 时未限制递归深度，特制报文可导致进程崩溃甚至远程代码执行。维护者已在最新版本中加入深度上限与内存配额，并补充了相应测试用例。建议使用方同步检查间接依赖。', '安全客', '2026-11-14 08:50:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cybersecurity%20code%20lock&image_size=landscape_4_3'),
('城市 NOA 开放测试范围扩大，覆盖三十座城市主干道', '多家车企同步推送新版本辅助驾驶系统，新增无保护左转与施工路段绕行能力，仍要求驾驶员全程接管。', '新版本辅助驾驶系统在城市道路场景中增加了对锥桶、临时围挡的识别能力，并优化了无保护左转的博弈策略。车企强调该功能仍属于辅助驾驶范畴，驾驶员需保持注意力并随时接管，测试范围将逐步扩大。', '智能出行', '2026-11-13 11:15:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=autonomous%20driving%20city%20street&image_size=landscape_4_3'),
('国产数据库开源项目发布 8.0 版本，支持分布式事务两地三中心', '新版本引入并行查询执行器与向量化引擎，TPC-C 测试性能提升明显，社区版与企业版同步更新。', '8.0 版本重构了存储引擎的执行层，新增并行查询与向量化算子，并完善了跨机房一致性协议。官方公布的 TPC-C 测试结果显示，单机事务处理能力较上一版本提升约 70%，迁移工具支持主流商业数据库语法兼容。', '开源观察', '2026-11-12 15:30:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=open%20source%20database%20servers&image_size=landscape_4_3'),
('光模块厂商发布 1.6T 硅光产品，数据中心互联带宽再翻倍', '产品基于硅光集成方案，功耗较传统方案降低约三成，主要面向超大规模数据中心的东西向流量场景。', '该产品采用硅光集成与共封装光学方案，单模块传输速率达到 1.6Tbps，支持 2 公里单模光纤传输。厂商表示产品已进入样品验证阶段，预计明年上半年开始批量交付，主要客户为超大规模数据中心运营商。', '光通信资讯', '2026-11-11 09:10:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=optical%20fiber%20network%20module&image_size=landscape_4_3'),
('浏览器厂商联合推进隐私沙盒标准，第三方 Cookie 逐步退出', '新的行业草案明确了设备端数据处理的边界，广告归因将依赖聚合上报，多家浏览器厂商计划在明年完成切换。', '草案提出以设备端聚合与差分隐私为基础的数据使用框架，限制跨站点标识符的读取。广告技术厂商需改用聚合上报接口进行转化归因，标准工作组计划在明年年中发布正式版本，并给出分阶段迁移时间表。', '互联网观察', '2026-11-10 13:25:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=browser%20privacy%20security&image_size=landscape_4_3'),
('工业质检引入视觉大模型，缺陷识别准确率提升至 99.2%', '某制造企业将视觉大模型部署到产线边缘服务器，替换原有规则算法后误检率下降，人工复检工作量减少六成。', '该企业将视觉大模型蒸馏为轻量版本部署在产线边缘服务器，结合小样本微调适配不同型号产品。上线三个月的数据显示，缺陷识别准确率提升至 99.2%，误检率下降明显，人工复检岗位工作量减少约六成。', '智能制造日报', '2026-11-09 09:45:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20robot%20vision%20inspection&image_size=landscape_4_3');
```

> 说明：旧表 `wjl_tech_news` 保留未删除；`GET /api/news` 已切换为查询 `wjl_news`。

## 2026-11-19 14:32 新建 wjl_gallery 表并插入测试数据（图文列表模块）

```sql
-- 图文列表模块（wjl_gallery）：建表与测试数据
USE wjl_project;

CREATE TABLE IF NOT EXISTS wjl_gallery (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  title VARCHAR(200) NOT NULL COMMENT '标题',
  description VARCHAR(500) NOT NULL COMMENT '描述',
  img_url VARCHAR(500) NOT NULL COMMENT '图片地址',
  category VARCHAR(50) NOT NULL COMMENT '分类',
  create_time DATETIME NOT NULL COMMENT '创建时间',
  PRIMARY KEY (id),
  KEY wjl_idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图文列表';

INSERT INTO wjl_gallery (title, description, img_url, category, create_time) VALUES
('数据中心液冷机房', '冷板式液冷方案在高密度机柜中的实际部署场景，单机柜功率密度可达 40kW。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=liquid%20cooling%20data%20center%20server%20room&image_size=landscape_4_3', '数据中心', '2026-11-18 10:00:00'),
('智能座舱交互界面', '新一代智能座舱采用多屏联动设计，语音与手势操作成为主要交互方式。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20car%20cockpit%20display&image_size=landscape_4_3', '智能汽车', '2026-11-17 15:20:00'),
('边缘计算节点部署', '部署在工业园区内的边缘计算节点，可在本地完成数据清洗与实时推理。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=edge%20computing%20server%20node&image_size=landscape_4_3', '云计算', '2026-11-16 09:40:00'),
('晶圆制造洁净车间', '晶圆制造需要在极高洁净度环境下完成光刻与刻蚀工序。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=semiconductor%20wafer%20cleanroom&image_size=landscape_4_3', '芯片半导体', '2026-11-15 14:10:00'),
('网络安全监控中心', '安全运营中心通过大屏实时监控全网流量与告警事件。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cybersecurity%20operations%20center&image_size=landscape_4_3', '网络安全', '2026-11-14 11:30:00'),
('工业机器人视觉质检', '机械臂配合工业相机完成零部件表面缺陷的自动检测。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=industrial%20robot%20arm%20vision%20inspection&image_size=landscape_4_3', '智能制造', '2026-11-13 16:00:00'),
('光纤配线机柜', '数据中心骨干网络采用高密度光纤配线方案，支持 400G 链路升级。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=optical%20fiber%20patch%20panel%20rack&image_size=landscape_4_3', '网络通信', '2026-11-12 08:50:00'),
('开发者开源硬件套件', '面向教学与创客的开源硬件套件，配套完整的文档与示例代码。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=open%20source%20hardware%20developer%20kit&image_size=landscape_4_3', '开源生态', '2026-11-11 13:15:00'),
('城市无人机配送航线', '无人机配送在试点城区完成常态化运行，单程配送时间缩短至 15 分钟。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=drone%20delivery%20over%20city&image_size=landscape_4_3', '低空经济', '2026-11-10 09:25:00'),
('便携式卫星通信终端', '应急场景下的便携卫星通信终端，可在无地面网络覆盖区域建立链路。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portable%20satellite%20communication%20terminal&image_size=landscape_4_3', '网络通信', '2026-11-09 17:05:00');
```


---

## 2026-11-23 知识库（RAG）表结构与测试数据

说明：`wjl_kb_doc` 记录上传的知识库文件，`wjl_kb_chunk` 保存解析后的文本切片（每片约 220 字、重叠 40 字）。
以下两个文件通过 `POST /api/kb/upload` 上传入库：docx 共 4 个切片，pptx 共 5 个切片。

```sql
-- 知识库（RAG）：文档表与切片表
USE wjl_project;

CREATE TABLE IF NOT EXISTS wjl_kb_doc (
  wjl_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文档主键',
  wjl_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  wjl_type VARCHAR(20) NOT NULL COMMENT '文件类型',
  wjl_size INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小（字节）',
  wjl_chunk_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '切片数量',
  wjl_status VARCHAR(20) NOT NULL DEFAULT 'ready' COMMENT '状态',
  wjl_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  PRIMARY KEY (wjl_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文档表';

CREATE TABLE IF NOT EXISTS wjl_kb_chunk (
  wjl_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '切片主键',
  wjl_doc_id INT UNSIGNED NOT NULL COMMENT '所属文档',
  wjl_index INT UNSIGNED NOT NULL COMMENT '切片序号',
  wjl_content TEXT NOT NULL COMMENT '切片内容',
  wjl_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (wjl_id),
  KEY wjl_idx_doc (wjl_doc_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库切片表';

INSERT INTO wjl_kb_doc (wjl_id, wjl_name, wjl_type, wjl_size, wjl_chunk_count, wjl_status) VALUES (3, 'wjl_知识库_商城产品与售后手册.docx', 'docx', 10603, 4, 'ready');
INSERT INTO wjl_kb_doc (wjl_id, wjl_name, wjl_type, wjl_size, wjl_chunk_count, wjl_status) VALUES (4, 'wjl_知识库_客服培训手册.pptx', 'pptx', 89964, 5, 'ready');

INSERT INTO wjl_kb_chunk (wjl_doc_id, wjl_index, wjl_content) VALUES (3, 0, 'WJL 商城产品与售后手册
一、公司简介
WJL 商城成立于 2021 年，主营智能消费电子产品，提供 7 天无理由退货与全国联保服务。
客服热线 400-800-1234，服务时间为每天 9:00 至 21:00。
二、主要商品与价格
无线降噪耳机 WJL-A1：售价 899 元，支持主动降噪与 30 小时续航。
智能手表 WJL-W2：售价 1299 元，支持血氧监测与 5ATM 防水。');
INSERT INTO wjl_kb_chunk (wjl_doc_id, wjl_index, wjl_content) VALUES (3, 1, '。
智能手表 WJL-W2：售价 1299 元，支持血氧监测与 5ATM 防水。
便携充电宝 WJL-P3：售价 199 元，容量 20000mAh，支持 65W 快充。
三、配送政策
订单满 99 元包邮，默认使用顺丰快递，付款后 48 小时内发货。
偏远地区（新疆、西藏、内蒙古部分区域）配送时间为 3 至 5 天。
如需修改收货地址，请在订单发货前联系在线客服。
四、退换货政策');
INSERT INTO wjl_kb_chunk (wjl_doc_id, wjl_index, wjl_content) VALUES (3, 2, '3 至 5 天。
如需修改收货地址，请在订单发货前联系在线客服。
四、退换货政策
签收后 7 天内支持无理由退货，商品需保持包装完整、配件齐全。
签收后 15 天内出现质量问题可申请换新，运费由商城承担。
所有商品享受 1 年保修，保修期内非人为损坏免费维修。
五、退款时效
退货审核通过后 1 至 2 个工作日内发起退款，款项原路退回，到账时间 3 至 7 天。
六、优惠券规则');
INSERT INTO wjl_kb_chunk (wjl_doc_id, wjl_index, wjl_content) VALUES (3, 3, '2 个工作日内发起退款，款项原路退回，到账时间 3 至 7 天。
六、优惠券规则
满 300 元减 50 元优惠券每人限领 2 张，有效期为领取后 30 天。
优惠券不可叠加使用，不与限时折扣活动同时生效。
七、发票说明
支持开具电子普通发票，订单完成后 24 小时内可在订单详情页下载。
八、会员权益
会员每消费 1 元累计 1 积分，100 积分可抵扣 1 元，积分有效期为 12 个月。');
INSERT INTO wjl_kb_chunk (wjl_doc_id, wjl_index, wjl_content) VALUES (4, 0, 'WJL 商城客服培训手册
适用对象：在线客服与新入职员工
版本：2026 年 11 月
一、服务标准
1. 首次响应时间不超过 30 秒，结束语需主动询问是否还有其他问题。
2. 使用“您好、请、抱歉、感谢”等礼貌用语，不使用反问句。
3. 遇到无法确认的问题，先致歉并说明会在 2 小时内回复。
二、物流问题应答
1. 查询物流路径：订单详情页 → 物流信息，可查看实时轨迹。');
INSERT INTO wjl_kb_chunk (wjl_doc_id, wjl_index, wjl_content) VALUES (4, 1, '二、物流问题应答
1. 查询物流路径：订单详情页 → 物流信息，可查看实时轨迹。
2. 若物流超过 72 小时未更新，客服需代客户发起物流催件工单。
3. 包裹显示签收但客户未收到，先核实代收点与门卫，再申请理赔。
三、退货与退款应答
1. 退货入口：我的订单 → 申请售后 → 选择退货退款。
2. 无理由退货时限为签收后 7 天，质量问题换新时限为 15 天。');
INSERT INTO wjl_kb_chunk (wjl_doc_id, wjl_index, wjl_content) VALUES (4, 2, '退货退款。
2. 无理由退货时限为签收后 7 天，质量问题换新时限为 15 天。
3. 退款审核通过后 1 至 2 个工作日发起，原路退回 3 至 7 天到账。
四、优惠券与活动应答
1. 满 300 减 50 优惠券不可叠加，不与限时折扣同享。
2. 优惠券有效期 30 天，过期不补发，可在“我的优惠券”查看。
3. 活动价商品若发生退货，优惠券按原规则退回账户。
五、投诉与升级处理');
INSERT INTO wjl_kb_chunk (wjl_doc_id, wjl_index, wjl_content) VALUES (4, 3, '查看。
3. 活动价商品若发生退货，优惠券按原规则退回账户。
五、投诉与升级处理
1. 客户明确要求投诉时，记录订单号与诉求，升级人工主管处理。
2. 主管需在 2 小时内电话回访，并在工单中记录处理结果。
3. 涉及金额争议超过 1000 元的，需提交售后专员复核。
六、服务禁语
1. 禁止使用“不知道”“不关我事”“你自己看”等推诿表达。
2. 禁止向客户承诺未经确认的赔付或时效。
3. 禁止泄露其他客户的订单与个人信息。');
INSERT INTO wjl_kb_chunk (wjl_doc_id, wjl_index, wjl_content) VALUES (4, 4, '禁止向客户承诺未经确认的赔付或时效。
3. 禁止泄露其他客户的订单与个人信息。
七、结束语示例
“感谢您的耐心等待，请问还有其他可以帮您的吗？祝您生活愉快！”');
```
