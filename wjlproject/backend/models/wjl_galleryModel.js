/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：图文列表数据模型，封装 wjl_gallery 表的查询。
 */
const wjl_pool = require('../config/wjl_db');

const wjl_getGalleryList = async () => {
  const [wjl_rows] = await wjl_pool.query(
    'SELECT id, title, description, img_url, category, create_time ' +
      'FROM wjl_gallery ORDER BY create_time DESC, id DESC'
  );
  return wjl_rows;
};

module.exports = { wjl_getGalleryList };
