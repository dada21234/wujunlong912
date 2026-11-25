/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：科技新闻控制器，返回新闻列表数据。
 */
const wjl_newsModel = require('../models/wjl_newsModel');

const wjl_getNewsList = async (wjl_req, wjl_res) => {
  try {
    const wjl_list = await wjl_newsModel.wjl_getNewsList();

    wjl_res.json({
      code: 0,
      msg: '新闻列表获取成功',
      data: {
        wjl_total: wjl_list.length,
        wjl_list: wjl_list
      }
    });
  } catch (wjl_err) {
    console.error('[wjl_news] 查询新闻列表失败：', wjl_err.message);
    wjl_res.json({
      code: 1,
      msg: '新闻列表查询失败：' + wjl_err.message,
      data: null
    });
  }
};

module.exports = { wjl_getNewsList };
