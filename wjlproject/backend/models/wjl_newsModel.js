/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：新闻数据模型，封装 wjl_news 表的查询。
 */
const wjl_pool = require('../config/wjl_db');

const wjl_getNewsList = async () => {
  const [wjl_rows] = await wjl_pool.query(
    'SELECT id, title, summary, content, source, publish_time, cover_img ' +
      'FROM wjl_news ORDER BY publish_time DESC, id DESC'
  );
  return wjl_rows;
};

module.exports = { wjl_getNewsList };
