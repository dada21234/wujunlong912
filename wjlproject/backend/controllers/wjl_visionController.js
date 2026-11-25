/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 说明：图像识别控制器，将上传图片转为 base64 后调用硅基流动视觉语言模型生成描述。
 */
const wjl_recognizeImage = async (wjl_req, wjl_res) => {
  if (!wjl_req.file) {
    return wjl_res.json({ code: 1, msg: '请选择要识别的图片', data: null });
  }

  const wjl_mime = wjl_req.file.mimetype || '';

  if (wjl_mime.indexOf('image/') !== 0) {
    return wjl_res.json({ code: 1, msg: '仅支持 JPG / PNG / WEBP / GIF 图片', data: null });
  }

  const wjl_apiKey = process.env.SILICONFLOW_API_KEY;
  const wjl_baseUrl = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
  const wjl_model = process.env.VISION_MODEL || 'Qwen/Qwen3-VL-8B-Instruct';

  if (!wjl_apiKey) {
    return wjl_res.json({ code: 1, msg: '服务端未配置 SILICONFLOW_API_KEY', data: null });
  }

  const wjl_base64 = wjl_req.file.buffer.toString('base64');
  const wjl_prompt = '请用中文详细描述这张图片的内容，包括主体、场景、颜色和画面中可见的文字，控制在 200 字以内。';

  const wjl_payload = {
    model: wjl_model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: wjl_prompt },
          {
            type: 'image_url',
            image_url: { url: 'data:' + wjl_mime + ';base64,' + wjl_base64 }
          }
        ]
      }
    ],
    temperature: 0.4,
    max_tokens: 400,
    stream: false
  };

  // 控制台输出发送给大模型的数据（base64 内容省略，避免刷屏）
  const wjl_payloadForLog = {
    model: wjl_model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: wjl_prompt },
          {
            type: 'image_url',
            image_url: {
              url: 'data:' + wjl_mime + ';base64,[已省略 ' + wjl_base64.length + ' 个字符]'
            }
          }
        ]
      }
    ],
    temperature: 0.4,
    max_tokens: 400
  };
  console.log('[wjl_vision] 发送给大模型的数据：', JSON.stringify(wjl_payloadForLog));

  const wjl_controller = new AbortController();
  const wjl_timer = setTimeout(function () {
    wjl_controller.abort();
  }, 60000);

  try {
    const wjl_response = await fetch(wjl_baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + wjl_apiKey
      },
      body: JSON.stringify(wjl_payload),
      signal: wjl_controller.signal
    });

    const wjl_result = await wjl_response.json().catch(function () {
      return null;
    });

    console.log('[wjl_vision] 接收到大模型的数据：', JSON.stringify(wjl_result).slice(0, 2000));

    if (!wjl_response.ok) {
      const wjl_reason =
        (wjl_result && wjl_result.error && wjl_result.error.message) ||
        (wjl_result && wjl_result.message) ||
        '上游接口返回 HTTP ' + wjl_response.status;
      return wjl_res.json({ code: 1, msg: '图像识别失败：' + wjl_reason, data: null });
    }

    const wjl_description =
      wjl_result && wjl_result.choices && wjl_result.choices[0] &&
      wjl_result.choices[0].message && wjl_result.choices[0].message.content;

    if (!wjl_description) {
      return wjl_res.json({ code: 1, msg: '模型未返回有效描述', data: null });
    }

    wjl_res.json({
      code: 0,
      msg: '识别成功',
      data: {
        wjl_description: wjl_description,
        wjl_model: wjl_model,
        wjl_usage: (wjl_result && wjl_result.usage) || null,
        wjl_image: {
          wjl_name: wjl_req.file.originalname,
          wjl_size: wjl_req.file.size,
          wjl_type: wjl_mime
        }
      }
    });
  } catch (wjl_error) {
    const wjl_reason =
      wjl_error.name === 'AbortError' ? '请求超时，请稍后重试' : wjl_error.message;
    console.error('[wjl_vision] 识别失败：', wjl_reason);
    wjl_res.json({ code: 1, msg: '图像识别失败：' + wjl_reason, data: null });
  } finally {
    clearTimeout(wjl_timer);
  }
};

module.exports = { wjl_recognizeImage: wjl_recognizeImage };
