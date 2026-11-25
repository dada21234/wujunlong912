/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 说明：在线客服控制器，代理调用七牛云 AI 推理接口（OpenAI 兼容协议）。
 */
const wjl_getServiceReply = async (wjl_req, wjl_res) => {
  const wjl_messages = Array.isArray(wjl_req.body.messages) ? wjl_req.body.messages : [];

  const wjl_history = wjl_messages
    .filter(function (wjl_item) {
      return (
        wjl_item &&
        (wjl_item.role === 'user' || wjl_item.role === 'assistant') &&
        typeof wjl_item.content === 'string' &&
        wjl_item.content.trim() !== ''
      );
    })
    .map(function (wjl_item) {
      return {
        role: wjl_item.role,
        content: wjl_item.content.trim().slice(0, 4000)
      };
    });

  if (wjl_history.length === 0) {
    return wjl_res.json({ code: 1, msg: '咨询内容不能为空', data: null });
  }

  const wjl_apiKey = process.env.QINIU_API_KEY;
  const wjl_baseUrl = process.env.QINIU_BASE_URL || 'https://api.qnaigc.com/v1';
  const wjl_model = process.env.QINIU_MODEL || 'qiniu/conatus-free';

  if (!wjl_apiKey) {
    return wjl_res.json({ code: 1, msg: '服务端未配置 QINIU_API_KEY', data: null });
  }

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
      body: JSON.stringify({
        model: wjl_model,
        messages: [
          {
            role: 'system',
            content:
              '你是 WJL 商城的在线客服「小七」，负责解答订单、物流、退换货和优惠券等问题。' +
              '请用礼貌、简洁的中文回答，每次回复不超过 100 字；遇到无法确认的问题，建议用户转人工客服。'
          }
        ].concat(wjl_history),
        temperature: 0.6,
        max_tokens: 512,
        stream: false
      }),
      signal: wjl_controller.signal
    });

    const wjl_result = await wjl_response.json().catch(function () {
      return null;
    });

    if (!wjl_response.ok) {
      let wjl_reason =
        (wjl_result && wjl_result.error && wjl_result.error.message) ||
        (wjl_result && (wjl_result.message || wjl_result.msg)) ||
        '上游接口返回 HTTP ' + wjl_response.status;

      if (wjl_reason.indexOf('identity verification') !== -1) {
        wjl_reason =
          '七牛云免费模型需要先完成实名认证，请前往 https://portal.qiniu.com/developer/user/identity 完成认证后重试';
      } else if (wjl_reason.indexOf('Too many requests') !== -1) {
        wjl_reason = '免费模型请求过于频繁，请稍后再试';
      }

      console.error('[wjl_service] 七牛接口异常：', wjl_response.status, wjl_reason);
      return wjl_res.json({ code: 1, msg: '客服服务暂时不可用：' + wjl_reason, data: null });
    }

    const wjl_reply =
      wjl_result && wjl_result.choices && wjl_result.choices[0] &&
      wjl_result.choices[0].message && wjl_result.choices[0].message.content;

    if (!wjl_reply) {
      return wjl_res.json({ code: 1, msg: '客服服务未返回有效内容', data: null });
    }

    wjl_res.json({
      code: 0,
      msg: '客服回复成功',
      data: {
        wjl_reply: wjl_reply,
        wjl_model: wjl_model,
        wjl_usage: (wjl_result && wjl_result.usage) || null
      }
    });
  } catch (wjl_err) {
    const wjl_reason =
      wjl_err.name === 'AbortError' ? '请求超时，请稍后重试' : wjl_err.message;
    console.error('[wjl_service] 请求失败：', wjl_reason);
    wjl_res.json({ code: 1, msg: '客服服务暂时不可用：' + wjl_reason, data: null });
  } finally {
    clearTimeout(wjl_timer);
  }
};

module.exports = { wjl_getServiceReply };
