/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 说明：知识库数据模型，封装 wjl_kb_doc 与 wjl_kb_chunk 表的读写。
 */
const wjl_pool = require('../config/wjl_db');

const wjl_createDoc = async (wjl_doc) => {
  const [wjl_result] = await wjl_pool.query(
    'INSERT INTO wjl_kb_doc (wjl_name, wjl_type, wjl_size, wjl_chunk_count, wjl_status) VALUES (?, ?, ?, ?, ?)',
    [wjl_doc.wjl_name, wjl_doc.wjl_type, wjl_doc.wjl_size, wjl_doc.wjl_chunk_count, wjl_doc.wjl_status]
  );
  return wjl_result.insertId;
};

const wjl_addChunks = async (wjl_docId, wjl_chunks) => {
  const wjl_values = wjl_chunks.map(function (wjl_content, wjl_index) {
    return [wjl_docId, wjl_index, wjl_content];
  });
  await wjl_pool.query(
    'INSERT INTO wjl_kb_chunk (wjl_doc_id, wjl_index, wjl_content) VALUES ?',
    [wjl_values]
  );
};

const wjl_getDocs = async () => {
  const [wjl_rows] = await wjl_pool.query(
    'SELECT wjl_id, wjl_name, wjl_type, wjl_size, wjl_chunk_count, wjl_status, wjl_create_time ' +
      'FROM wjl_kb_doc ORDER BY wjl_id DESC'
  );
  return wjl_rows;
};

const wjl_getDocById = async (wjl_docId) => {
  const [wjl_rows] = await wjl_pool.query(
    'SELECT wjl_id, wjl_name, wjl_type, wjl_size, wjl_chunk_count, wjl_status, wjl_create_time ' +
      'FROM wjl_kb_doc WHERE wjl_id = ?',
    [wjl_docId]
  );
  return wjl_rows[0] || null;
};

const wjl_deleteDoc = async (wjl_docId) => {
  await wjl_pool.query('DELETE FROM wjl_kb_chunk WHERE wjl_doc_id = ?', [wjl_docId]);
  const [wjl_result] = await wjl_pool.query('DELETE FROM wjl_kb_doc WHERE wjl_id = ?', [wjl_docId]);
  return wjl_result.affectedRows;
};

const wjl_getChunksByDoc = async (wjl_docId) => {
  const [wjl_rows] = await wjl_pool.query(
    'SELECT wjl_id, wjl_doc_id, wjl_index, wjl_content FROM wjl_kb_chunk ' +
      'WHERE wjl_doc_id = ? ORDER BY wjl_index ASC',
    [wjl_docId]
  );
  return wjl_rows;
};

const wjl_getAllChunks = async () => {
  const [wjl_rows] = await wjl_pool.query(
    'SELECT c.wjl_id, c.wjl_doc_id, c.wjl_index, c.wjl_content, d.wjl_name ' +
      'FROM wjl_kb_chunk c JOIN wjl_kb_doc d ON d.wjl_id = c.wjl_doc_id ' +
      'ORDER BY c.wjl_doc_id ASC, c.wjl_index ASC'
  );
  return wjl_rows;
};

module.exports = {
  wjl_createDoc: wjl_createDoc,
  wjl_addChunks: wjl_addChunks,
  wjl_getDocs: wjl_getDocs,
  wjl_getDocById: wjl_getDocById,
  wjl_deleteDoc: wjl_deleteDoc,
  wjl_getChunksByDoc: wjl_getChunksByDoc,
  wjl_getAllChunks: wjl_getAllChunks
};
