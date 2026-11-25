/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：数据库连接页面脚本，提交账号密码到 /api/database/test 并展示成功或错误提示。
 */
(function () {
  const wjl_form = document.getElementById('wjl_db_form');
  const wjl_userInput = document.getElementById('wjl_db_user');
  const wjl_passwordInput = document.getElementById('wjl_db_password');
  const wjl_submitBtn = document.getElementById('wjl_db_submit');
  const wjl_resultBox = document.getElementById('wjl_db_result');
  const wjl_resultTitle = document.getElementById('wjl_db_result_title');
  const wjl_resultText = document.getElementById('wjl_db_result_text');

  if (!wjl_form) {
    return;
  }

  function wjl_renderResult(wjl_state, wjl_title, wjl_text) {
    wjl_resultBox.className = 'wjl_result wjl_result_' + wjl_state;
    wjl_resultTitle.textContent = wjl_title;
    wjl_resultText.textContent = wjl_text;
  }

  function wjl_setLoading(wjl_loading) {
    wjl_submitBtn.disabled = wjl_loading;
    wjl_submitBtn.textContent = wjl_loading ? '连接中...' : '连接数据库';
  }

  wjl_form.addEventListener('submit', async function (wjl_event) {
    wjl_event.preventDefault();

    const wjl_user = wjl_userInput.value.trim();
    const wjl_password = wjl_passwordInput.value;

    if (!wjl_user) {
      wjl_renderResult('error', '连接失败', '用户名不能为空，请输入数据库用户名。');
      console.error('[wjl_database] 用户名不能为空');
      return;
    }

    wjl_setLoading(true);
    wjl_renderResult('loading', '正在连接', '正在连接 MySQL 数据库，请稍候...');

    try {
      const wjl_response = await fetch('/api/database/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wjl_user: wjl_user, wjl_password: wjl_password })
      });

      const wjl_result = await wjl_response.json();
      console.log('[wjl_database] 接口返回：', wjl_result);

      if (wjl_result.code === 0) {
        const wjl_data = wjl_result.data || {};
        const wjl_dbTip = wjl_data.wjl_database_exists
          ? '目标数据库 ' + wjl_data.wjl_db_name + ' 已存在。'
          : '目标数据库 ' + wjl_data.wjl_db_name + ' 尚未创建。';

        wjl_renderResult(
          'success',
          '连接成功',
          '主机：' + wjl_data.wjl_host + '\n' +
            'MySQL 版本：' + wjl_data.wjl_server_version + '\n' +
            wjl_dbTip
        );
      } else {
        console.error('[wjl_database] 连接失败：', wjl_result.msg);
        wjl_renderResult('error', '连接失败', wjl_result.msg || '未知错误，请检查账号密码。');
      }
    } catch (wjl_error) {
      console.error('[wjl_database] 请求异常：', wjl_error);
      wjl_renderResult('error', '请求异常', '无法访问后端接口，请确认服务已启动（端口 8912）。');
    } finally {
      wjl_setLoading(false);
    }
  });
})();
