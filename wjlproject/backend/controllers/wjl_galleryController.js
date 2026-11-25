/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：图文列表控制器，返回全部图文数据。
 */
const wjl_galleryModel = require('../models/wjl_galleryModel');

const wjl_getGalleryList = async (wjl_req, wjl_res) => {
  try {
    const wjl_list = await wjl_galleryModel.wjl_getGalleryList();

    wjl_res.json({
      code: 0,
      msg: '图文列表获取成功',
      data: {
        wjl_total: wjl_list.length,
        wjl_list: wjl_list
      }
    });
  } catch (wjl_err) {
    console.error('[wjl_gallery] 查询图文列表失败：', wjl_err.message);
    wjl_res.json({
      code: 1,
      msg: '图文列表查询失败：' + wjl_err.message,
      data: null
    });
  }
};

module.exports = { wjl_getGalleryList };
