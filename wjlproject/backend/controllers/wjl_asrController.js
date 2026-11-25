/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 说明：语音识别控制器，将上传的音频转发到七牛云音频转写接口，返回识别文本。
 */
const wjl_transcribeAudio = async (wjl_req, wjl_res) => {
  if (!wjl_req.file) {
    return wjl_res.json({ code: 1, msg: '请选择或录制要识别的音频', data: null });
  }

  const wjl_mime = wjl_req.file.mimetype || '';

  if (wjl_mime.indexOf('audio/') !== 0 && wjl_mime.indexOf('video/') !== 0) {
    return wjl_res.json({ code: 1, msg: '仅支持音频文件（如 webm / wav / mp3 / m4a）', data: null });
  }

  const wjl_apiKey = process.env.QINIU_API_KEY;
  const wjl_baseUrl = process.env.QINIU_BASE_URL || 'https://api.qnaigc.com/v1';
  const wjl_model = process.env.QINIU_ASR_MODEL || 'qiniu/Qwen-Audio-3.0-ASR-Flash';

  if (!wjl_apiKey) {
    return wjl_res.json({ code: 1, msg: '服务端未配置 QINIU_API_KEY', data: null });
  }

  const wjl_ext = (function () {
    const wjl_match = wjl_mime.match(/\/(webm|wav|mp3|mpeg|m4a|mp4|ogg|x-wav|x-m4a)/);
    if (!wjl_match) {
      return 'webm';
    }
    const wjl_map = { mpeg: 'mp3', 'x-wav': 'wav', 'x-m4a': 'm4a' };
    return wjl_map[wjl_match[1]] || wjl_match[1];
  })();

  const wjl_form = new FormData();
  wjl_form.append(
    'file',
    new Blob([wjl_req.file.buffer], { type: wjl_mime }),
    'wjl_audio.' + wjl_ext
  );
  wjl_form.append('model', wjl_model);

  console.log('[wjl_asr] 发送给大模型的数据：', {
    model: wjl_model,
    endpoint: wjl_baseUrl + '/audio/transcriptions',
    file: {
      name: wjl_req.file.originalname,
      size: wjl_req.file.size,
      type: wjl_mime
    }
  });

  const wjl_controller = new AbortController();
  const wjl_timer = setTimeout(function () {
    wjl_controller.abort();
  }, 60000);

  try {
    const wjl_response = await fetch(wjl_baseUrl + '/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + wjl_apiKey },
      body: wjl_form,
      signal: wjl_controller.signal
    });

    const wjl_text = await wjl_response.text();
    let wjl_result = null;
    try {
      wjl_result = JSON.parse(wjl_text);
    } catch (wjl_error) {
      wjl_result = { raw: wjl_text };
    }

    console.log('[wjl_asr] 接收到大模型的数据：', wjl_text.slice(0, 2000));

    if (!wjl_response.ok) {
      let wjl_reason =
        (wjl_result && wjl_result.error && wjl_result.error.message) ||
        (wjl_result && wjl_result.message) ||
        '上游接口返回 HTTP ' + wjl_response.status;

      if (wjl_reason.indexOf('real-name authentication') !== -1 || wjl_reason.indexOf('unverified') !== -1) {
        wjl_reason =
          '七牛云服务需要实名认证，请前往 https://portal.qiniu.com/developer/user/identity 完成认证后重试';
      } else if (wjl_reason.indexOf('Too many requests') !== -1) {
        wjl_reason = '请求过于频繁，请稍后再试';
      }

      console.error('[wjl_asr] 转写失败：', wjl_response.status, wjl_reason);
      return wjl_res.json({ code: 1, msg: '语音识别失败：' + wjl_reason, data: null });
    }

    const wjl_transcript =
      (wjl_result && wjl_result.text) ||
      (wjl_result && wjl_result.result) ||
      '';

    if (!wjl_transcript) {
      return wjl_res.json({
        code: 0,
        msg: '未识别到语音内容',
        data: { wjl_text: '', wjl_model: wjl_model, wjl_raw: wjl_result }
      });
    }

    wjl_res.json({
      code: 0,
      msg: '识别成功',
      data: {
        wjl_text: wjl_transcript,
        wjl_model: wjl_model,
        wjl_audio: {
          wjl_name: wjl_req.file.originalname,
          wjl_size: wjl_req.file.size,
          wjl_type: wjl_mime
        }
      }
    });
  } catch (wjl_error) {
    const wjl_reason =
      wjl_error.name === 'AbortError' ? '请求超时，请稍后重试' : wjl_error.message;
    console.error('[wjl_asr] 识别失败：', wjl_reason);
    wjl_res.json({ code: 1, msg: '语音识别失败：' + wjl_reason, data: null });
  } finally {
    clearTimeout(wjl_timer);
  }
};

module.exports = { wjl_transcribeAudio: wjl_transcribeAudio };
