/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：图文列表脚本，请求 /api/gallery 渲染上图下文卡片，图片失败时显示占位色块。
 */
(function () {
  const wjl_listBox = document.getElementById('wjl_gallery_list');
  const wjl_totalBox = document.getElementById('wjl_gallery_total');
  const wjl_apiFullBox = document.getElementById('wjl_gallery_api_full');

  if (!wjl_listBox) {
    return;
  }

  wjl_apiFullBox.textContent = window.location.origin + '/api/gallery';

  function wjl_showState(wjl_text, wjl_isError) {
    wjl_listBox.innerHTML = '';
    const wjl_state = document.createElement('p');
    wjl_state.className = 'wjl_gallery_state' + (wjl_isError ? ' wjl_gallery_state_error' : '');
    wjl_state.textContent = wjl_text;
    wjl_listBox.appendChild(wjl_state);
  }

  function wjl_createFallback(wjl_media, wjl_text, wjl_index) {
    wjl_media.innerHTML = '';
    wjl_media.classList.add('wjl_gallery_media_fallback', 'wjl_gallery_tone_' + (wjl_index % 4));

    const wjl_placeholder = document.createElement('span');
    wjl_placeholder.className = 'wjl_gallery_ph';
    wjl_placeholder.textContent = wjl_text || '图文';
    wjl_media.appendChild(wjl_placeholder);
  }

  function wjl_createCard(wjl_item, wjl_index) {
    const wjl_card = document.createElement('article');
    wjl_card.className = 'wjl_gallery_card';

    const wjl_media = document.createElement('div');
    wjl_media.className = 'wjl_gallery_media';

    if (wjl_item.img_url) {
      const wjl_img = document.createElement('img');
      wjl_img.className = 'wjl_gallery_img';
      wjl_img.src = wjl_item.img_url;
      wjl_img.alt = wjl_item.title;
      wjl_img.loading = 'lazy';
      wjl_img.addEventListener('error', function () {
        console.error('[wjl_gallery] 图片加载失败：', wjl_item.img_url);
        wjl_createFallback(wjl_media, wjl_item.category, wjl_index);
      });
      wjl_media.appendChild(wjl_img);
    } else {
      wjl_createFallback(wjl_media, wjl_item.category, wjl_index);
    }

    const wjl_body = document.createElement('div');
    wjl_body.className = 'wjl_gallery_body';

    const wjl_category = document.createElement('span');
    wjl_category.className = 'wjl_gallery_category';
    wjl_category.textContent = wjl_item.category;

    const wjl_title = document.createElement('h2');
    wjl_title.className = 'wjl_gallery_item_title';
    wjl_title.textContent = wjl_item.title;

    const wjl_desc = document.createElement('p');
    wjl_desc.className = 'wjl_gallery_item_desc';
    wjl_desc.textContent = wjl_item.description;

    wjl_body.appendChild(wjl_category);
    wjl_body.appendChild(wjl_title);
    wjl_body.appendChild(wjl_desc);

    wjl_card.appendChild(wjl_media);
    wjl_card.appendChild(wjl_body);

    return wjl_card;
  }

  async function wjl_loadGallery() {
    wjl_showState('正在加载图文数据...', false);

    try {
      const wjl_response = await fetch('/api/gallery');
      const wjl_result = await wjl_response.json();
      console.log('[wjl_gallery] 接口返回：', wjl_result);

      if (wjl_result.code !== 0) {
        throw new Error(wjl_result.msg || '图文数据获取失败');
      }

      const wjl_data = wjl_result.data || {};
      const wjl_list = wjl_data.wjl_list || [];

      wjl_totalBox.textContent = '共 ' + (wjl_data.wjl_total || 0) + ' 条图文';

      if (wjl_list.length === 0) {
        wjl_showState('暂无图文数据，请先向 wjl_gallery 表插入数据。', false);
        return;
      }

      wjl_listBox.innerHTML = '';
      wjl_list.forEach(function (wjl_item, wjl_index) {
        wjl_listBox.appendChild(wjl_createCard(wjl_item, wjl_index));
      });
    } catch (wjl_error) {
      console.error('[wjl_gallery] 加载图文失败：', wjl_error);
      wjl_totalBox.textContent = '加载失败';
      wjl_showState('图文加载失败：' + wjl_error.message, true);
    }
  }

  wjl_loadGallery();
})();
