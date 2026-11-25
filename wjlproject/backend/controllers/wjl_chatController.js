/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 说明：AI 聊天控制器，代理调用大模型接口；支持硅基流动 / 七牛云多平台热切换。
 */
const wjl_getChatReply = async (wjl_req, wjl_res) => {
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
    return wjl_res.json({ code: 1, msg: '消息内容不能为空', data: null });
  }

  // 多平台配置：Key / baseURL / model 全部来自 backend/.env，切换平台只改这几个值
  const wjl_providerConfig = {
    siliconflow: {
      baseUrl: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
      model: process.env.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
      apiKey: process.env.SILICONFLOW_API_KEY,
      label: '硅基流动'
    },
    qiniu: {
      baseUrl: process.env.QINIU_BASE_URL || 'https://api.qnaigc.com/v1',
      model: process.env.QINIU_MODEL || 'qiniu/conatus-free',
      apiKey: process.env.QINIU_API_KEY,
      label: '七牛云'
    }
  };

  const wjl_provider = wjl_providerConfig[wjl_req.body.wjl_provider]
    ? wjl_req.body.wjl_provider
    : 'siliconflow';
  const wjl_cfg = wjl_providerConfig[wjl_provider];

  if (!wjl_cfg.apiKey) {
    return wjl_res.json({
      code: 1,
      msg: '服务端未配置 ' + wjl_cfg.label + ' 的 Key，请检查 backend/.env',
      data: null
    });
  }

  // 任务二：中华美食街在线客服人设 —— 只回答营业时间 / 招牌菜 / 配送范围，其余礼貌引导留言
  // 同时允许用户追问“我刚才问了什么”之类的上下文复述，以体现多轮对话使用了完整 messages
  const wjl_systemPrompt = [
    '你是「中华美食街」的在线客服，名字叫「小食」。你只能回答以下三类问题：',
    '1. 营业时间：中华美食街每天 10:00 - 22:00 营业（节假日正常营业，除夕除外）。',
    '2. 招牌菜：推荐招牌红烧肉、蟹粉小笼包、糖醋小排、桂花糖藕、酱牛肉。',
    '3. 配送范围：门店周边 3 公里内免费配送，3-5 公里收取 5 元配送费，超出 5 公里暂不配送。',
    '对于这三类问题，请用简洁、准确、友好的中文回答，不要编造菜单、价格或营业时间之外的信息。',
    '如果用户询问刚才聊过的内容（例如“我刚才问了什么”“我上一句说的是什么”），请如实复述用户上一条问题，这属于正常的对话服务范围。',
    '对于上述范围以外的任何问题（例如天气、编程、闲聊、推荐其他商家等），不要回答，而是礼貌地引导用户留言：「抱歉，我只能为您解答营业时间、招牌菜和配送范围相关的问题。您可以留下联系方式和具体需求，我们会有专人尽快与您联系。」'
  ].join('\n');

  const wjl_controller = new AbortController();
  const wjl_timer = setTimeout(function () {
    wjl_controller.abort();
  }, 120000);

  try {
    const wjl_response = await fetch(wjl_cfg.baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + wjl_cfg.apiKey
      },
      body: JSON.stringify({
        model: wjl_cfg.model,
        messages: [{ role: 'system', content: wjl_systemPrompt }].concat(wjl_history),
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      }),
      signal: wjl_controller.signal
    });

    const wjl_result = await wjl_response.json().catch(function () {
      return null;
    });

    if (!wjl_response.ok) {
      const wjl_raw =
        (wjl_result &&
          (wjl_result.error && (wjl_result.error.message || wjl_result.error.code)) ||
          wjl_result.message ||
          wjl_result.msg) ||
        '';
      console.error('[wjl_chat] 上游接口异常：', wjl_cfg.label, wjl_response.status, wjl_raw);

      let wjl_msg = 'AI 服务调用失败：' + (wjl_raw || ('HTTP ' + wjl_response.status));
      const wjl_lower = String(wjl_raw).toLowerCase();
      if (wjl_response.status === 401 || /invalid api key|api[_-]?key|unauthorized|authentication/.test(wjl_lower)) {
        wjl_msg = 'Key 无效，请检查 backend/.env 中「' + wjl_cfg.label + '」的 Key 配置是否正确';
      } else if (/trial_period_expired|identity_verification|实名/.test(wjl_lower)) {
        wjl_msg = '该平台需要完成实名认证后才能调用，请前往对应控制台完成实名';
      } else if (wjl_response.status === 429 || /rate.?limit|too many requests/.test(wjl_lower)) {
        wjl_msg = '请求过于频繁（平台限流），请稍后重试';
      } else if (/model_not_found|no available channels|model.*not/.test(wjl_lower)) {
        wjl_msg = '当前模型不可用，请检查 backend/.env 中「' + wjl_cfg.label + '」的 model 配置';
      }
      return wjl_res.json({ code: 1, msg: wjl_msg, data: null });
    }

    const wjl_reply =
      wjl_result && wjl_result.choices && wjl_result.choices[0] &&
      wjl_result.choices[0].message && wjl_result.choices[0].message.content;

    if (!wjl_reply) {
      return wjl_res.json({ code: 1, msg: 'AI 服务未返回有效内容', data: null });
    }

    wjl_res.json({
      code: 0,
      msg: 'AI 回复成功',
      data: {
        wjl_reply: wjl_reply,
        wjl_model: wjl_cfg.model,
        wjl_provider: wjl_provider,
        wjl_providerLabel: wjl_cfg.label,
        wjl_usage: (wjl_result && wjl_result.usage) || null
      }
    });
  } catch (wjl_err) {
    const wjl_reason =
      wjl_err.name === 'AbortError' ? '请求超时，请稍后重试' : wjl_err.message;
    console.error('[wjl_chat] 请求失败：', wjl_reason);
    wjl_res.json({ code: 1, msg: 'AI 服务调用失败：' + wjl_reason, data: null });
  } finally {
    clearTimeout(wjl_timer);
  }
};

module.exports = { wjl_getChatReply };
