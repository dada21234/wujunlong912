/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 说明：知识库页面脚本，负责文件上传、文档管理、切片查看与基于知识库的问答。
 */
(function () {
  const wjl_dropBox = document.getElementById('wjl_kb_drop');
  const wjl_fileInput = document.getElementById('wjl_kb_file');
  const wjl_uploadTip = document.getElementById('wjl_kb_upload_tip');
  const wjl_docList = document.getElementById('wjl_kb_doc_list');
  const wjl_docTotal = document.getElementById('wjl_kb_doc_total');
  const wjl_question = document.getElementById('wjl_kb_question');
  const wjl_askBtn = document.getElementById('wjl_kb_ask_btn');
  const wjl_answerBox = document.getElementById('wjl_kb_answer');
  const wjl_status = document.getElementById('wjl_kb_status');

  if (!wjl_dropBox || !wjl_docList || !wjl_question || !wjl_askBtn) {
    return;
  }

  function wjl_formatSize(wjl_bytes) {
    if (wjl_bytes >= 1024 * 1024) {
      return (wjl_bytes / 1024 / 1024).toFixed(1) + ' MB';
    }
    if (wjl_bytes >= 1024) {
      return (wjl_bytes / 1024).toFixed(1) + ' KB';
    }
    return wjl_bytes + ' B';
  }

  function wjl_formatTime(wjl_value) {
    if (!wjl_value) {
      return '';
    }
    const wjl_date = new Date(wjl_value);
    if (Number.isNaN(wjl_date.getTime())) {
      return String(wjl_value);
    }
    const wjl_pad = function (wjl_num) {
      return wjl_num < 10 ? '0' + wjl_num : String(wjl_num);
    };
    return (
      wjl_date.getFullYear() + '-' + wjl_pad(wjl_date.getMonth() + 1) + '-' + wjl_pad(wjl_date.getDate()) +
      ' ' + wjl_pad(wjl_date.getHours()) + ':' + wjl_pad(wjl_date.getMinutes())
    );
  }

  function wjl_setTip(wjl_text, wjl_type) {
    wjl_uploadTip.textContent = wjl_text;
    wjl_uploadTip.className = 'wjl_kb_upload_tip' + (wjl_type ? ' wjl_kb_tip_' + wjl_type : '');
  }

  function wjl_renderDocs(wjl_docs) {
    wjl_docList.innerHTML = '';
    wjl_docTotal.textContent = String(wjl_docs.length);

    if (wjl_docs.length === 0) {
      const wjl_empty = document.createElement('li');
      wjl_empty.className = 'wjl_kb_empty';
      wjl_empty.textContent = '暂无知识库文件，请先上传。';
      wjl_docList.appendChild(wjl_empty);
      return;
    }

    wjl_docs.forEach(function (wjl_doc) {
      const wjl_item = document.createElement('li');
      wjl_item.className = 'wjl_kb_doc_item';

      const wjl_top = document.createElement('div');
      wjl_top.className = 'wjl_kb_doc_top';

      const wjl_badge = document.createElement('span');
      wjl_badge.className = 'wjl_kb_doc_badge';
      wjl_badge.textContent = wjl_doc.wjl_type;

      const wjl_name = document.createElement('span');
      wjl_name.className = 'wjl_kb_doc_name';
      wjl_name.textContent = wjl_doc.wjl_name;
      wjl_name.title = wjl_doc.wjl_name;

      wjl_top.appendChild(wjl_badge);
      wjl_top.appendChild(wjl_name);

      const wjl_meta = document.createElement('p');
      wjl_meta.className = 'wjl_kb_doc_meta';
      wjl_meta.textContent =
        wjl_doc.wjl_chunk_count + ' 个切片 · ' + wjl_formatSize(wjl_doc.wjl_size) +
        ' · ' + wjl_formatTime(wjl_doc.wjl_create_time);

      const wjl_actions = document.createElement('div');
      wjl_actions.className = 'wjl_kb_doc_actions';

      const wjl_btnChunks = document.createElement('button');
      wjl_btnChunks.type = 'button';
      wjl_btnChunks.className = 'wjl_kb_mini_btn';
      wjl_btnChunks.textContent = '查看切片';

      const wjl_btnDelete = document.createElement('button');
      wjl_btnDelete.type = 'button';
      wjl_btnDelete.className = 'wjl_kb_mini_btn wjl_kb_danger';
      wjl_btnDelete.textContent = '删除';

      wjl_actions.appendChild(wjl_btnChunks);
      wjl_actions.appendChild(wjl_btnDelete);

      wjl_item.appendChild(wjl_top);
      wjl_item.appendChild(wjl_meta);
      wjl_item.appendChild(wjl_actions);

      wjl_btnChunks.addEventListener('click', async function () {
        if (wjl_item.querySelector('.wjl_kb_chunks')) {
          const wjl_old = wjl_item.querySelector('.wjl_kb_chunks');
          wjl_old.remove();
          return;
        }

        wjl_btnChunks.disabled = true;
        try {
          const wjl_res = await fetch('/api/kb/documents/' + wjl_doc.wjl_id + '/chunks');
          const wjl_result = await wjl_res.json();
          console.log('[wjl_kb] 切片接口返回：', wjl_result);

          if (wjl_result.code !== 0) {
            throw new Error(wjl_result.msg || '切片查询失败');
          }

          const wjl_list = document.createElement('ul');
          wjl_list.className = 'wjl_kb_chunks';
          wjl_result.data.wjl_chunks.forEach(function (wjl_chunk) {
            const wjl_li = document.createElement('li');
            wjl_li.className = 'wjl_kb_chunk_item';
            wjl_li.textContent = '#' + (wjl_chunk.wjl_index + 1) + ' ' + wjl_chunk.wjl_content;
            wjl_list.appendChild(wjl_li);
          });
          wjl_item.appendChild(wjl_list);
        } catch (wjl_error) {
          console.error('[wjl_kb] 切片查询失败：', wjl_error);
          wjl_setTip('切片查询失败：' + wjl_error.message, 'error');
        } finally {
          wjl_btnChunks.disabled = false;
        }
      });

      wjl_btnDelete.addEventListener('click', async function () {
        if (!window.confirm('确定删除《' + wjl_doc.wjl_name + '》及其全部切片吗？')) {
          return;
        }

        wjl_btnDelete.disabled = true;
        try {
          const wjl_res = await fetch('/api/kb/documents/' + wjl_doc.wjl_id, { method: 'DELETE' });
          const wjl_result = await wjl_res.json();
          console.log('[wjl_kb] 删除接口返回：', wjl_result);

          if (wjl_result.code !== 0) {
            throw new Error(wjl_result.msg || '删除失败');
          }
          wjl_setTip('已删除《' + wjl_doc.wjl_name + '》', 'ok');
          wjl_loadDocs();
        } catch (wjl_error) {
          console.error('[wjl_kb] 删除失败：', wjl_error);
          wjl_setTip('删除失败：' + wjl_error.message, 'error');
          wjl_btnDelete.disabled = false;
        }
      });

      wjl_docList.appendChild(wjl_item);
    });
  }

  async function wjl_loadDocs() {
    try {
      const wjl_res = await fetch('/api/kb/documents');
      const wjl_result = await wjl_res.json();
      console.log('[wjl_kb] 文档列表接口返回：', wjl_result);

      if (wjl_result.code !== 0) {
        throw new Error(wjl_result.msg || '文档查询失败');
      }
      wjl_renderDocs(wjl_result.data.wjl_docs || []);
    } catch (wjl_error) {
      console.error('[wjl_kb] 文档查询失败：', wjl_error);
      wjl_docList.innerHTML = '';
      const wjl_empty = document.createElement('li');
      wjl_empty.className = 'wjl_kb_empty';
      wjl_empty.textContent = '文档加载失败：' + wjl_error.message;
      wjl_docList.appendChild(wjl_empty);
    }
  }

  async function wjl_uploadFile(wjl_file) {
    if (!wjl_file) {
      return;
    }

    const wjl_form = new FormData();
    wjl_form.append('wjl_file', wjl_file);

    wjl_setTip('正在上传并解析《' + wjl_file.name + '》…');
    wjl_status.textContent = '上传中';

    try {
      const wjl_res = await fetch('/api/kb/upload', { method: 'POST', body: wjl_form });
      const wjl_result = await wjl_res.json();
      console.log('[wjl_kb] 上传接口返回：', wjl_result);

      if (wjl_result.code !== 0) {
        throw new Error(wjl_result.msg || '上传失败');
      }

      wjl_setTip(
        '《' + wjl_result.data.wjl_doc.wjl_name + '》上传成功，共 ' +
          wjl_result.data.wjl_doc.wjl_chunk_count + ' 个切片',
        'ok'
      );
      wjl_loadDocs();
    } catch (wjl_error) {
      console.error('[wjl_kb] 上传失败：', wjl_error);
      wjl_setTip('上传失败：' + wjl_error.message, 'error');
    } finally {
      wjl_status.textContent = '就绪';
      wjl_fileInput.value = '';
    }
  }

  function wjl_renderSources(wjl_sources) {
    if (!wjl_sources || wjl_sources.length === 0) {
      return null;
    }

    const wjl_wrap = document.createElement('div');
    wjl_wrap.className = 'wjl_kb_sources';

    const wjl_title = document.createElement('p');
    wjl_title.className = 'wjl_kb_sources_title';
    wjl_title.textContent = '引用来源（按相关度排序）';
    wjl_wrap.appendChild(wjl_title);

    wjl_sources.forEach(function (wjl_source) {
      const wjl_card = document.createElement('div');
      wjl_card.className = 'wjl_kb_source';

      const wjl_head = document.createElement('div');
      wjl_head.className = 'wjl_kb_source_head';

      const wjl_from = document.createElement('span');
      wjl_from.textContent = wjl_source.wjl_name + ' · 第 ' + (wjl_source.wjl_index + 1) + ' 段';

      const wjl_score = document.createElement('span');
      wjl_score.textContent = '相关度 ' + wjl_source.wjl_score;

      wjl_head.appendChild(wjl_from);
      wjl_head.appendChild(wjl_score);
      wjl_card.appendChild(wjl_head);

      const wjl_text = document.createElement('div');
      wjl_text.textContent = wjl_source.wjl_content;
      wjl_card.appendChild(wjl_text);

      wjl_wrap.appendChild(wjl_card);
    });

    return wjl_wrap;
  }

  async function wjl_ask() {
    const wjl_text = wjl_question.value.trim();

    if (!wjl_text) {
      wjl_setTip('请先输入问题', 'error');
      wjl_question.focus();
      return;
    }

    wjl_askBtn.disabled = true;
    wjl_status.textContent = '检索中';
    wjl_answerBox.innerHTML = '';
    const wjl_loading = document.createElement('p');
    wjl_loading.className = 'wjl_kb_answer_placeholder';
    wjl_loading.textContent = '正在检索知识库并生成回答…';
    wjl_answerBox.appendChild(wjl_loading);

    try {
      const wjl_res = await fetch('/api/kb/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: wjl_text })
      });
      const wjl_result = await wjl_res.json();
      console.log('[wjl_kb] 问答接口返回：', wjl_result);

      if (wjl_result.code !== 0) {
        throw new Error(wjl_result.msg || '问答失败');
      }

      const wjl_data = wjl_result.data;
      console.log('[wjl_kb] 发送给大模型的数据：', {
        wjl_model: wjl_data.wjl_model,
        wjl_prompt: wjl_data.wjl_prompt,
        wjl_sources: wjl_data.wjl_sources
      });
      console.log('[wjl_kb] 接收到大模型的数据：', {
        wjl_answer: wjl_data.wjl_answer,
        wjl_usage: wjl_data.wjl_usage
      });

      wjl_answerBox.innerHTML = '';
      const wjl_answer = document.createElement('div');
      wjl_answer.textContent = wjl_data.wjl_answer;
      wjl_answerBox.appendChild(wjl_answer);

      const wjl_sources = wjl_renderSources(wjl_data.wjl_sources);
      if (wjl_sources) {
        wjl_answerBox.appendChild(wjl_sources);
      }
    } catch (wjl_error) {
      console.error('[wjl_kb] 问答失败：', wjl_error);
      wjl_answerBox.innerHTML = '';
      const wjl_errorText = document.createElement('p');
      wjl_errorText.className = 'wjl_kb_answer_placeholder wjl_kb_answer_error';
      wjl_errorText.textContent = '回答失败：' + wjl_error.message;
      wjl_answerBox.appendChild(wjl_errorText);
    } finally {
      wjl_askBtn.disabled = false;
      wjl_status.textContent = '就绪';
    }
  }

  wjl_dropBox.addEventListener('click', function () {
    wjl_fileInput.click();
  });

  wjl_fileInput.addEventListener('change', function () {
    wjl_uploadFile(wjl_fileInput.files[0]);
  });

  ['dragenter', 'dragover'].forEach(function (wjl_eventName) {
    wjl_dropBox.addEventListener(wjl_eventName, function (wjl_event) {
      wjl_event.preventDefault();
      wjl_dropBox.classList.add('wjl_kb_drop_active');
    });
  });

  ['dragleave', 'drop'].forEach(function (wjl_eventName) {
    wjl_dropBox.addEventListener(wjl_eventName, function (wjl_event) {
      wjl_event.preventDefault();
      wjl_dropBox.classList.remove('wjl_kb_drop_active');
    });
  });

  wjl_dropBox.addEventListener('drop', function (wjl_event) {
    const wjl_file = wjl_event.dataTransfer && wjl_event.dataTransfer.files[0];
    wjl_uploadFile(wjl_file);
  });

  wjl_askBtn.addEventListener('click', wjl_ask);

  wjl_question.addEventListener('keydown', function (wjl_event) {
    if (wjl_event.key === 'Enter' && (wjl_event.ctrlKey || wjl_event.metaKey)) {
      wjl_event.preventDefault();
      wjl_ask();
    }
  });

  wjl_loadDocs();
})();
