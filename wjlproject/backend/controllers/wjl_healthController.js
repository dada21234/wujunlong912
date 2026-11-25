/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：健康检查接口控制器。
 */
const wjl_getHealth = (wjl_req, wjl_res) => {
  wjl_res.json({
    code: 0,
    msg: '服务运行正常',
    data: {
      wjl_service: 'wjl-backend',
      wjl_status: 'ok',
      wjl_time: new Date().toISOString()
    }
  });
};

module.exports = { wjl_getHealth };
