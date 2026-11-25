/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 说明：图像识别页面脚本，负责图片选择预览与调用 /api/vision 获取描述。
 */
(function () {
  const wjl_dropBox = document.getElementById('wjl_vision_drop');
  const wjl_fileInput = document.getElementById('wjl_vision_file');
  const wjl_preview = document.getElementById('wjl_vision_preview');
  const wjl_tip = document.getElementById('wjl_vision_tip');
  const wjl_btn = document.getElementById('wjl_vision_btn');
  const wjl_result = document.getElementById('wjl_vision_result');
  const wjl_meta = document.getElementById('wjl_vision_meta');
  const wjl_status = document.getElementById('wjl_vision_status');
  const wjl_apiFull = document.getElementById('wjl_vision_api_full');

  if (!wjl_dropBox || !wjl_fileInput || !wjl_btn) {
    return;
  }

  let wjl_currentFile = null;
  let wjl_previewUrl = '';

  wjl_apiFull.textContent = window.location.origin + '/api/vision';

  function wjl_setTip(wjl_text, wjl_isError) {
    wjl_tip.textContent = wjl_text || '';
    wjl_tip.className = 'wjl_vision_tip' + (wjl_isError ? ' wjl_vision_tip_error' : '');
  }

  function wjl_selectFile(wjl_file) {
    if (!wjl_file) {
      return;
    }

    if (wjl_file.type.indexOf('image/') !== 0) {
      wjl_setTip('请选择图片文件（JPG / PNG / WEBP / GIF）', true);
      return;
    }

    if (wjl_file.size > 10 * 1024 * 1024) {
      wjl_setTip('图片超过 10MB，请压缩后再上传', true);
      return;
    }

    wjl_currentFile = wjl_file;

    if (wjl_previewUrl) {
      URL.revokeObjectURL(wjl_previewUrl);
    }
    wjl_previewUrl = URL.createObjectURL(wjl_file);
    wjl_preview.src = wjl_previewUrl;
    wjl_dropBox.classList.add('wjl_vision_has_image');
    wjl_btn.disabled = false;
    wjl_setTip('已选择：' + wjl_file.name + '（' + (wjl_file.size / 1024).toFixed(1) + ' KB）', false);
  }

  async function wjl_recognize() {
    if (!wjl_currentFile) {
      return;
    }

    const wjl_form = new FormData();
    wjl_form.append('wjl_file', wjl_currentFile);

    wjl_btn.disabled = true;
    wjl_status.textContent = '识别中';
    wjl_meta.textContent = '';
    wjl_result.innerHTML = '';
    const wjl_loading = document.createElement('p');
    wjl_loading.className = 'wjl_vision_result_placeholder';
    wjl_loading.textContent = '正在调用视觉模型识别图片…';
    wjl_result.appendChild(wjl_loading);

    console.log('[wjl_vision] 发送给大模型的数据：', {
      wjl_model: 'Qwen/Qwen3-VL-8B-Instruct',
      wjl_image: {
        wjl_name: wjl_currentFile.name,
        wjl_size: wjl_currentFile.size,
        wjl_type: wjl_currentFile.type
      },
      wjl_prompt: '请用中文详细描述这张图片的内容，包括主体、场景、颜色和画面中可见的文字，控制在 200 字以内。'
    });

    try {
      const wjl_res = await fetch('/api/vision', { method: 'POST', body: wjl_form });
      const wjl_resultJson = await wjl_res.json();
      console.log('[wjl_vision] 接收到大模型的数据：', wjl_resultJson);

      if (wjl_resultJson.code !== 0) {
        throw new Error(wjl_resultJson.msg || '识别失败');
      }

      const wjl_data = wjl_resultJson.data;
      wjl_result.innerHTML = '';
      const wjl_text = document.createElement('div');
      wjl_text.textContent = wjl_data.wjl_description;
      wjl_result.appendChild(wjl_text);

      const wjl_usage = wjl_data.wjl_usage;
      wjl_meta.textContent =
        '模型：' + wjl_data.wjl_model +
        (wjl_usage ? ' · tokens：' + wjl_usage.total_tokens : '');
      wjl_setTip('识别完成', false);
    } catch (wjl_error) {
      console.error('[wjl_vision] 识别失败：', wjl_error);
      wjl_result.innerHTML = '';
      const wjl_errorText = document.createElement('p');
      wjl_errorText.className = 'wjl_vision_result_placeholder wjl_vision_result_error';
      wjl_errorText.textContent = '识别失败：' + wjl_error.message;
      wjl_result.appendChild(wjl_errorText);
      wjl_setTip('识别失败，请稍后重试', true);
    } finally {
      wjl_btn.disabled = false;
      wjl_status.textContent = '就绪';
    }
  }

  wjl_dropBox.addEventListener('click', function () {
    wjl_fileInput.click();
  });

  wjl_fileInput.addEventListener('change', function () {
    wjl_selectFile(wjl_fileInput.files[0]);
  });

  ['dragenter', 'dragover'].forEach(function (wjl_eventName) {
    wjl_dropBox.addEventListener(wjl_eventName, function (wjl_event) {
      wjl_event.preventDefault();
      wjl_dropBox.classList.add('wjl_vision_drop_active');
    });
  });

  ['dragleave', 'drop'].forEach(function (wjl_eventName) {
    wjl_dropBox.addEventListener(wjl_eventName, function (wjl_event) {
      wjl_event.preventDefault();
      wjl_dropBox.classList.remove('wjl_vision_drop_active');
    });
  });

  wjl_dropBox.addEventListener('drop', function (wjl_event) {
    const wjl_file = wjl_event.dataTransfer && wjl_event.dataTransfer.files[0];
    wjl_selectFile(wjl_file);
  });

  wjl_btn.addEventListener('click', wjl_recognize);
})();
