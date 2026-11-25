/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：科技新闻列表脚本，请求 /api/news 并把数据渲染为新闻卡片。
 */
(function () {
  const wjl_listBox = document.getElementById('wjl_news_list');
  const wjl_totalBox = document.getElementById('wjl_news_total');
  const wjl_apiFullBox = document.getElementById('wjl_news_api_full');

  if (!wjl_listBox) {
    return;
  }

  wjl_apiFullBox.textContent = window.location.origin + '/api/news';

  function wjl_formatTime(wjl_value) {
    const wjl_date = new Date(wjl_value);
    if (Number.isNaN(wjl_date.getTime())) {
      return String(wjl_value);
    }

    function wjl_pad(wjl_number) {
      return wjl_number < 10 ? '0' + wjl_number : String(wjl_number);
    }

    return (
      wjl_date.getFullYear() + '-' +
      wjl_pad(wjl_date.getMonth() + 1) + '-' +
      wjl_pad(wjl_date.getDate()) + ' ' +
      wjl_pad(wjl_date.getHours()) + ':' +
      wjl_pad(wjl_date.getMinutes())
    );
  }

  function wjl_showState(wjl_text, wjl_isError) {
    wjl_listBox.innerHTML = '';
    const wjl_state = document.createElement('p');
    wjl_state.className = 'wjl_news_state' + (wjl_isError ? ' wjl_news_state_error' : '');
    wjl_state.textContent = wjl_text;
    wjl_listBox.appendChild(wjl_state);
  }

  function wjl_createItem(wjl_news, wjl_index) {
    const wjl_item = document.createElement('article');
    wjl_item.className = 'wjl_news_item';

    const wjl_indexBox = document.createElement('div');
    wjl_indexBox.className = 'wjl_news_index';
    wjl_indexBox.textContent = String(wjl_index + 1).padStart(2, '0');

    const wjl_body = document.createElement('div');
    wjl_body.className = 'wjl_news_body';

    const wjl_top = document.createElement('div');
    wjl_top.className = 'wjl_news_top';

    const wjl_source = document.createElement('span');
    wjl_source.className = 'wjl_news_source';
    wjl_source.textContent = wjl_news.source;

    wjl_top.appendChild(wjl_source);

    const wjl_title = document.createElement('h2');
    wjl_title.className = 'wjl_news_item_title';
    wjl_title.textContent = wjl_news.title;

    const wjl_summary = document.createElement('p');
    wjl_summary.className = 'wjl_news_summary';
    wjl_summary.textContent = wjl_news.summary;

    const wjl_meta = document.createElement('div');
    wjl_meta.className = 'wjl_news_meta';

    const wjl_time = document.createElement('span');
    wjl_time.textContent = wjl_formatTime(wjl_news.publish_time);

    wjl_meta.appendChild(wjl_time);

    wjl_body.appendChild(wjl_top);
    wjl_body.appendChild(wjl_title);
    wjl_body.appendChild(wjl_summary);
    wjl_body.appendChild(wjl_meta);

    wjl_item.appendChild(wjl_indexBox);
    wjl_item.appendChild(wjl_body);

    return wjl_item;
  }

  async function wjl_loadNews() {
    wjl_showState('正在加载新闻数据...', false);

    try {
      const wjl_response = await fetch('/api/news');
      const wjl_result = await wjl_response.json();
      console.log('[wjl_news] 接口返回：', wjl_result);

      if (wjl_result.code !== 0) {
        throw new Error(wjl_result.msg || '新闻数据获取失败');
      }

      const wjl_data = wjl_result.data || {};
      const wjl_list = wjl_data.wjl_list || [];

      wjl_totalBox.textContent = '共 ' + (wjl_data.wjl_total || 0) + ' 条新闻';

      if (wjl_list.length === 0) {
        wjl_showState('暂无新闻数据，请先向 wjl_news 表插入数据。', false);
        return;
      }

      wjl_listBox.innerHTML = '';
      wjl_list.forEach(function (wjl_news, wjl_index) {
        wjl_listBox.appendChild(wjl_createItem(wjl_news, wjl_index));
      });
    } catch (wjl_error) {
      console.error('[wjl_news] 加载新闻失败：', wjl_error);
      wjl_totalBox.textContent = '加载失败';
      wjl_showState('新闻加载失败：' + wjl_error.message, true);
    }
  }

  wjl_loadNews();
})();
