/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：MySQL 连接池配置，凭据全部从 backend/.env 读取，不写死在代码中。
 */
const wjl_mysql = require('mysql2/promise');

const wjl_pool = wjl_mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

module.exports = wjl_pool;
