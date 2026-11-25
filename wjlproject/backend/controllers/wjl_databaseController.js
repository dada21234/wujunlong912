/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：数据库连接测试控制器，使用页面提交的账号密码尝试连接 MySQL。
 */
const wjl_mysql = require('mysql2/promise');

const wjl_testConnection = async (wjl_req, wjl_res) => {
  const wjl_user = (wjl_req.body.wjl_user || '').trim();
  const wjl_password = wjl_req.body.wjl_password || '';
  const wjl_host = process.env.DB_HOST || 'localhost';
  const wjl_dbName = process.env.DB_NAME;

  if (!wjl_user) {
    wjl_res.json({ code: 1, msg: '用户名不能为空', data: null });
    return;
  }

  let wjl_connection = null;

  try {
    wjl_connection = await wjl_mysql.createConnection({
      host: wjl_host,
      user: wjl_user,
      password: wjl_password,
      connectTimeout: 5000
    });

    const [wjl_versionRows] = await wjl_connection.query('SELECT VERSION() AS wjl_version');
    const [wjl_dbRows] = await wjl_connection.query('SHOW DATABASES LIKE ?', [wjl_dbName]);

    wjl_res.json({
      code: 0,
      msg: '数据库连接成功',
      data: {
        wjl_host: wjl_host,
        wjl_user: wjl_user,
        wjl_server_version: wjl_versionRows[0].wjl_version,
        wjl_db_name: wjl_dbName,
        wjl_database_exists: wjl_dbRows.length > 0
      }
    });
  } catch (wjl_err) {
    console.error('[wjl_database] 连接失败：', wjl_err.message);
    wjl_res.json({ code: 1, msg: '连接失败：' + wjl_err.message, data: null });
  } finally {
    if (wjl_connection) {
      wjl_connection.end().catch(function () {});
    }
  }
};

module.exports = { wjl_testConnection };
