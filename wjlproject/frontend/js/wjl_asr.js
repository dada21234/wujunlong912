/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 说明：语音识别页面脚本，浏览器录音或上传文件，调用 /api/asr 转写为文字。
 */
(function () {
  const wjl_recordBtn = document.getElementById('wjl_asr_record_btn');
  const wjl_recordHint = document.getElementById('wjl_asr_record_hint');
  const wjl_timer = document.getElementById('wjl_asr_timer');
  const wjl_player = document.getElementById('wjl_asr_player');
  const wjl_fileInput = document.getElementById('wjl_asr_file');
  const wjl_fileName = document.getElementById('wjl_asr_file_name');
  const wjl_tip = document.getElementById('wjl_asr_tip');
  const wjl_result = document.getElementById('wjl_asr_result');
  const wjl_meta = document.getElementById('wjl_asr_meta');
  const wjl_copyBtn = document.getElementById('wjl_asr_copy_btn');
  const wjl_status = document.getElementById('wjl_asr_status');
  const wjl_apiFull = document.getElementById('wjl_asr_api_full');

  if (!wjl_recordBtn || !wjl_result) {
    return;
  }

  let wjl_stream = null;
  let wjl_recorder = null;
  let wjl_chunks = [];
  let wjl_startAt = 0;
  let wjl_timerId = null;
  let wjl_playerUrl = '';

  wjl_apiFull.textContent = window.location.origin + '/api/asr';

  function wjl_setTip(wjl_text, wjl_type) {
    wjl_tip.textContent = wjl_text || '';
    wjl_tip.className = 'wjl_asr_tip' + (wjl_type ? ' wjl_asr_tip_' + wjl_type : '');
  }

  function wjl_formatTime(wjl_seconds) {
    const wjl_m = Math.floor(wjl_seconds / 60);
    const wjl_s = Math.floor(wjl_seconds % 60);
    return (wjl_m < 10 ? '0' : '') + wjl_m + ':' + (wjl_s < 10 ? '0' : '') + wjl_s;
  }

  function wjl_startTimer() {
    wjl_startAt = Date.now();
    wjl_timerId = setInterval(function () {
      wjl_timer.textContent = wjl_formatTime((Date.now() - wjl_startAt) / 1000);
    }, 200);
  }

  function wjl_stopTimer() {
    if (wjl_timerId) {
      clearInterval(wjl_timerId);
      wjl_timerId = null;
    }
  }

  async function wjl_startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      wjl_setTip('当前浏览器不支持录音，请改用上传音频文件', 'error');
      return;
    }

    try {
      wjl_stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (wjl_error) {
      console.error('[wjl_asr] 麦克风权限失败：', wjl_error);
      wjl_setTip('无法获取麦克风权限，请在浏览器设置中允许后重试', 'error');
      return;
    }

    wjl_chunks = [];
    let wjl_options = {};
    const wjl_types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
    for (let wjl_i = 0; wjl_i < wjl_types.length; wjl_i++) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(wjl_types[wjl_i])) {
        wjl_options = { mimeType: wjl_types[wjl_i] };
        break;
      }
    }

    try {
      wjl_recorder = new MediaRecorder(wjl_stream, wjl_options);
    } catch (wjl_error) {
      console.error('[wjl_asr] 录音器初始化失败：', wjl_error);
      wjl_setTip('录音初始化失败，请改用上传音频文件', 'error');
      wjl_stream.getTracks().forEach(function (wjl_track) {
        wjl_track.stop();
      });
      return;
    }

    wjl_recorder.ondataavailable = function (wjl_event) {
      if (wjl_event.data.size > 0) {
        wjl_chunks.push(wjl_event.data);
      }
    };

    wjl_recorder.onstop = function () {
      const wjl_mime = wjl_recorder.mimeType || 'audio/webm';
      const wjl_blob = new Blob(wjl_chunks, { type: wjl_mime });
      wjl_chunks = [];

      if (wjl_playerUrl) {
        URL.revokeObjectURL(wjl_playerUrl);
      }
      wjl_playerUrl = URL.createObjectURL(wjl_blob);
      wjl_player.src = wjl_playerUrl;
      wjl_player.hidden = false;

      const wjl_ext = wjl_mime.indexOf('mp4') !== -1 ? 'm4a' : 'webm';
      wjl_transcribe(wjl_blob, 'wjl_recording.' + wjl_ext, wjl_mime);
    };

    wjl_recorder.start();
    wjl_startTimer();
    wjl_recordBtn.classList.add('wjl_asr_recording');
    wjl_recordHint.textContent = '点击停止录音并识别';
    wjl_fileInput.disabled = true;
  }

  function wjl_stopRecording() {
    if (wjl_recorder && wjl_recorder.state !== 'inactive') {
      wjl_recorder.stop();
    }
    if (wjl_stream) {
      wjl_stream.getTracks().forEach(function (wjl_track) {
        wjl_track.stop();
      });
      wjl_stream = null;
    }
    wjl_stopTimer();
    wjl_recordBtn.classList.remove('wjl_asr_recording');
    wjl_recordHint.textContent = '点击开始录音';
    wjl_fileInput.disabled = false;
  }

  async function wjl_transcribe(wjl_blob, wjl_name, wjl_mime) {
    if (!wjl_blob) {
      return;
    }

    const wjl_form = new FormData();
    wjl_form.append('wjl_file', wjl_blob, wjl_name);

    wjl_result.value = '';
    wjl_meta.textContent = '';
    wjl_copyBtn.hidden = true;
    wjl_status.textContent = '识别中';
    wjl_setTip('正在识别音频…', null);

    console.log('[wjl_asr] 发送给大模型的数据：', {
      wjl_model: 'qiniu/Qwen-Audio-3.0-ASR-Flash',
      wjl_audio: { wjl_name: wjl_name, wjl_size: wjl_blob.size, wjl_type: wjl_mime || wjl_blob.type }
    });

    try {
      const wjl_res = await fetch('/api/asr', { method: 'POST', body: wjl_form });
      const wjl_resultJson = await wjl_res.json();
      console.log('[wjl_asr] 接收到大模型的数据：', wjl_resultJson);

      if (wjl_resultJson.code !== 0) {
        throw new Error(wjl_resultJson.msg || '识别失败');
      }

      wjl_result.value = wjl_resultJson.data.wjl_text || '（未识别到语音内容）';
      wjl_copyBtn.hidden = !wjl_resultJson.data.wjl_text;
      wjl_meta.textContent =
        '模型：' + wjl_resultJson.data.wjl_model +
        (wjl_resultJson.data.wjl_audio
          ? ' · 音频：' + wjl_resultJson.data.wjl_audio.wjl_name +
            '（' + (wjl_resultJson.data.wjl_audio.wjl_size / 1024).toFixed(1) + ' KB）'
          : '');
      wjl_setTip('识别完成', 'ok');
    } catch (wjl_error) {
      console.error('[wjl_asr] 识别失败：', wjl_error);
      wjl_result.value = '识别失败：' + wjl_error.message;
      wjl_meta.textContent = '';
      wjl_setTip('识别失败，请查看提示或稍后重试', 'error');
    } finally {
      wjl_status.textContent = '就绪';
    }
  }

  wjl_recordBtn.addEventListener('click', function () {
    if (wjl_recorder && wjl_recorder.state === 'recording') {
      wjl_stopRecording();
    } else {
      wjl_startRecording();
    }
  });

  wjl_fileInput.addEventListener('change', function () {
    const wjl_file = wjl_fileInput.files[0];
    if (!wjl_file) {
      return;
    }
    wjl_fileName.textContent = '已选择：' + wjl_file.name + '（' + (wjl_file.size / 1024).toFixed(1) + ' KB）';
    wjl_transcribe(wjl_file, wjl_file.name, wjl_file.type);
  });

  wjl_copyBtn.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(wjl_result.value);
      wjl_setTip('已复制到剪贴板', 'ok');
    } catch (wjl_error) {
      wjl_setTip('复制失败，请手动选择文本', 'error');
    }
  });
})();
