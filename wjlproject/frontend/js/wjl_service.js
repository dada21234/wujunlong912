/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 说明：在线客服脚本，维护咨询历史并调用 /api/service 获取客服回复。
 */
(function () {
  const wjl_messagesBox = document.getElementById('wjl_service_messages');
  const wjl_input = document.getElementById('wjl_service_input');
  const wjl_sendBtn = document.getElementById('wjl_service_send');
  const wjl_statusBox = document.getElementById('wjl_service_status');
  const wjl_apiFullBox = document.getElementById('wjl_service_api_full');
  const wjl_quickBox = document.getElementById('wjl_service_quick');

  if (!wjl_messagesBox || !wjl_input || !wjl_sendBtn) {
    return;
  }

  const wjl_history = [];
  let wjl_isSending = false;

  wjl_apiFullBox.textContent = window.location.origin + '/api/service';

  function wjl_scrollToBottom() {
    wjl_messagesBox.scrollTop = wjl_messagesBox.scrollHeight;
  }

  function wjl_appendMessage(wjl_role, wjl_content, wjl_isError) {
    const wjl_row = document.createElement('div');
    wjl_row.className = 'wjl_chat_row' + (wjl_role === 'user' ? ' wjl_chat_row_user' : '');

    const wjl_avatar = document.createElement('div');
    wjl_avatar.className = 'wjl_chat_avatar';
    wjl_avatar.textContent = wjl_role === 'user' ? '我' : '七';

    const wjl_bubble = document.createElement('div');
    wjl_bubble.className = 'wjl_chat_bubble' + (wjl_isError ? ' wjl_chat_bubble_error' : '');
    wjl_bubble.textContent = wjl_content;

    wjl_row.appendChild(wjl_avatar);
    wjl_row.appendChild(wjl_bubble);
    wjl_messagesBox.appendChild(wjl_row);
    wjl_scrollToBottom();
  }

  function wjl_showTyping() {
    const wjl_row = document.createElement('div');
    wjl_row.className = 'wjl_chat_row';
    wjl_row.id = 'wjl_service_typing_row';

    const wjl_avatar = document.createElement('div');
    wjl_avatar.className = 'wjl_chat_avatar';
    wjl_avatar.textContent = '七';

    const wjl_bubble = document.createElement('div');
    wjl_bubble.className = 'wjl_chat_bubble';

    const wjl_typing = document.createElement('span');
    wjl_typing.className = 'wjl_chat_typing';

    const wjl_typingText = document.createElement('span');
    wjl_typingText.className = 'wjl_chat_typing_text';
    wjl_typingText.textContent = '正在输入';

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
    const wjl_row = document.getElementById('wjl_service_typing_row');
    if (wjl_row) {
      wjl_row.remove();
    }
  }

  function wjl_setSending(wjl_sending) {
    wjl_isSending = wjl_sending;
    wjl_sendBtn.disabled = wjl_sending;
    wjl_input.disabled = wjl_sending;
    wjl_statusBox.textContent = wjl_sending ? '客服输入中...' : '就绪';

    const wjl_chips = wjl_quickBox.querySelectorAll('.wjl_service_chip');
    wjl_chips.forEach(function (wjl_chip) {
      wjl_chip.disabled = wjl_sending;
    });
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
      const wjl_response = await fetch('/api/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: wjl_history })
      });
      const wjl_result = await wjl_response.json();
      console.log('[wjl_service] 接口返回：', wjl_result);

      if (wjl_result.code !== 0) {
        throw new Error(wjl_result.msg || '客服回复失败');
      }

      const wjl_reply = wjl_result.data && wjl_result.data.wjl_reply;
      wjl_history.push({ role: 'assistant', content: wjl_reply });
      wjl_hideTyping();
      wjl_appendMessage('assistant', wjl_reply, false);
    } catch (wjl_error) {
      console.error('[wjl_service] 请求失败：', wjl_error);
      wjl_hideTyping();
      wjl_appendMessage('assistant', '抱歉，客服服务暂时不可用：' + wjl_error.message, true);
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

  wjl_quickBox.addEventListener('click', function (wjl_event) {
    const wjl_chip = wjl_event.target.closest('.wjl_service_chip');
    if (!wjl_chip || wjl_isSending) {
      return;
    }
    wjl_input.value = wjl_chip.dataset.question || '';
    wjl_sendMessage();
  });

  wjl_appendMessage(
    'assistant',
    '您好，我是客服小七，很高兴为您服务。您可以咨询订单、物流、退换货或优惠券问题，也可以点击下方快捷问题。',
    false
  );
  wjl_input.focus();
})();
