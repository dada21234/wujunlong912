/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 说明：AI 聊天脚本，维护对话历史并调用 /api/chat 获取回复。
 */
(function () {
  const wjl_messagesBox = document.getElementById('wjl_chat_messages');
  const wjl_input = document.getElementById('wjl_chat_input');
  const wjl_sendBtn = document.getElementById('wjl_chat_send');
  const wjl_statusBox = document.getElementById('wjl_chat_status');
  const wjl_apiFullBox = document.getElementById('wjl_chat_api_full');
  const wjl_providerSel = document.getElementById('wjl_chat_provider');

  if (!wjl_messagesBox || !wjl_input || !wjl_sendBtn) {
    return;
  }

  const wjl_history = [];
  let wjl_isSending = false;

  wjl_apiFullBox.textContent = window.location.origin + '/api/chat';

  function wjl_scrollToBottom() {
    wjl_messagesBox.scrollTop = wjl_messagesBox.scrollHeight;
  }

  function wjl_appendMessage(wjl_role, wjl_content, wjl_isError) {
    const wjl_row = document.createElement('div');
    wjl_row.className = 'wjl_chat_row' + (wjl_role === 'user' ? ' wjl_chat_row_user' : '');

    const wjl_avatar = document.createElement('div');
    wjl_avatar.className = 'wjl_chat_avatar';
    wjl_avatar.textContent = wjl_role === 'user' ? '我' : 'AI';

    const wjl_bubble = document.createElement('div');
    wjl_bubble.className = 'wjl_chat_bubble' + (wjl_isError ? ' wjl_chat_bubble_error' : '');
    wjl_bubble.textContent = wjl_content;

    wjl_row.appendChild(wjl_avatar);
    wjl_row.appendChild(wjl_bubble);
    wjl_messagesBox.appendChild(wjl_row);
    wjl_scrollToBottom();
    return wjl_row;
  }

  function wjl_showTyping() {
    const wjl_row = document.createElement('div');
    wjl_row.className = 'wjl_chat_row';
    wjl_row.id = 'wjl_chat_typing_row';

    const wjl_avatar = document.createElement('div');
    wjl_avatar.className = 'wjl_chat_avatar';
    wjl_avatar.textContent = 'AI';

    const wjl_bubble = document.createElement('div');
    wjl_bubble.className = 'wjl_chat_bubble';

    const wjl_typing = document.createElement('span');
    wjl_typing.className = 'wjl_chat_typing';

    const wjl_typingText = document.createElement('span');
    wjl_typingText.className = 'wjl_chat_typing_text';
    wjl_typingText.textContent = '正在思考';

    wjl_typing.appendChild(wjl_typingText);
    ['', '', ''].forEach(function () {
      const wjl_dot = document.createElement('span');
      wjl_dot.className = 'wjl_chat_dot';
      wjl_typing.appendChild(wjl_dot);
    });

    wjl_bubble.appendChild(wjl_typing);
    wjl_row.appendChild(wjl_avatar);
    wjl_row.appendChild(wjl_bubble);
    wjl_messagesBox.appendChild(wjl_row);
    wjl_scrollToBottom();
  }

  function wjl_hideTyping() {
    const wjl_row = document.getElementById('wjl_chat_typing_row');
    if (wjl_row) {
      wjl_row.remove();
    }
  }

  function wjl_setSending(wjl_sending) {
    wjl_isSending = wjl_sending;
    wjl_sendBtn.disabled = wjl_sending;
    wjl_input.disabled = wjl_sending;
    wjl_statusBox.textContent = wjl_sending ? '正在思考...' : '就绪';
  }

  async function wjl_sendMessage() {
    const wjl_text = wjl_input.value.trim();

    if (wjl_text === '' || wjl_isSending) {
      return;
    }

    wjl_history.push({ role: 'user', content: wjl_text });
    wjl_appendMessage('user', wjl_text, false);
    wjl_input.value = '';
    wjl_setSending(true);
    wjl_showTyping();

    try {
      const wjl_response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wjl_provider: wjl_providerSel ? wjl_providerSel.value : 'siliconflow',
          messages: wjl_history
        })
      });
      const wjl_result = await wjl_response.json();
      console.log('[wjl_chat] 接口返回：', wjl_result);

      if (wjl_result.code !== 0) {
        throw new Error(wjl_result.msg || 'AI 回复失败');
      }

      const wjl_reply = wjl_result.data && wjl_result.data.wjl_reply;
      wjl_history.push({ role: 'assistant', content: wjl_reply });
      wjl_hideTyping();
      wjl_appendMessage('assistant', wjl_reply, false);
      if (wjl_statusBox && wjl_result.data && wjl_result.data.wjl_providerLabel) {
        wjl_statusBox.textContent = '就绪 · 来自 ' + wjl_result.data.wjl_providerLabel;
      }
    } catch (wjl_error) {
      console.error('[wjl_chat] 请求失败：', wjl_error);
      wjl_hideTyping();
      wjl_appendMessage('assistant', '请求失败：' + wjl_error.message, true);
    } finally {
      wjl_setSending(false);
      wjl_input.focus();
    }
  }

  wjl_sendBtn.addEventListener('click', wjl_sendMessage);

  wjl_input.addEventListener('keydown', function (wjl_event) {
    if (wjl_event.key === 'Enter' && !wjl_event.shiftKey) {
      wjl_event.preventDefault();
      wjl_sendMessage();
    }
  });

  wjl_appendMessage('assistant', '你好，我是中华美食街的在线客服「小食」。我可以为您解答营业时间、招牌菜和配送范围相关的问题。', false);
  wjl_input.focus();
})();
