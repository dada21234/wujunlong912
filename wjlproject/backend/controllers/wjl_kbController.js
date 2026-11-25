/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 说明：知识库（RAG）控制器，负责文件上传解析、切片入库、关键词检索与基于资料的回答。
 */
const fs = require('fs');
const path = require('path');
const wjl_kbModel = require('../models/wjl_kbModel');
const wjl_docParser = require('../utils/wjl_docParser');

const wjl_fixFileName = function (wjl_name) {
  try {
    const wjl_fixed = Buffer.from(wjl_name, 'latin1').toString('utf8');
    return wjl_fixed.indexOf('\uFFFD') === -1 ? wjl_fixed : wjl_name;
  } catch (wjl_error) {
    return wjl_name;
  }
};

const wjl_uploadDoc = async (wjl_req, wjl_res) => {
  if (!wjl_req.file) {
    return wjl_res.json({ code: 1, msg: '请选择要上传的知识库文件', data: null });
  }

  const wjl_file = wjl_req.file;
  const wjl_ext = path.extname(wjl_file.originalname).toLowerCase();
  const wjl_displayName = wjl_fixFileName(wjl_file.originalname);

  try {
    const wjl_text = await wjl_docParser.wjl_parseFile(wjl_file.path, wjl_ext);
    const wjl_chunks = wjl_docParser.wjl_splitChunks(wjl_text, 220, 40);

    if (wjl_chunks.length === 0) {
      fs.unlinkSync(wjl_file.path);
      return wjl_res.json({ code: 1, msg: '未能从文件中解析出有效文本', data: null });
    }

    const wjl_docId = await wjl_kbModel.wjl_createDoc({
      wjl_name: wjl_displayName,
      wjl_type: wjl_ext.replace('.', ''),
      wjl_size: wjl_file.size,
      wjl_chunk_count: wjl_chunks.length,
      wjl_status: 'ready'
    });

    await wjl_kbModel.wjl_addChunks(wjl_docId, wjl_chunks);

    const wjl_doc = await wjl_kbModel.wjl_getDocById(wjl_docId);
    console.log('[wjl_kb] 上传解析完成：', wjl_displayName, '切片数', wjl_chunks.length);

    wjl_res.json({
      code: 0,
      msg: '知识库文件上传成功',
      data: {
        wjl_doc: wjl_doc,
        wjl_preview: wjl_chunks.slice(0, 3)
      }
    });
  } catch (wjl_error) {
    console.error('[wjl_kb] 上传解析失败：', wjl_error);
    if (fs.existsSync(wjl_file.path)) {
      fs.unlinkSync(wjl_file.path);
    }
    wjl_res.json({ code: 1, msg: '文件解析失败：' + wjl_error.message, data: null });
  }
};

const wjl_getDocs = async (wjl_req, wjl_res) => {
  try {
    const wjl_docs = await wjl_kbModel.wjl_getDocs();
    wjl_res.json({ code: 0, msg: '查询成功', data: { wjl_docs: wjl_docs } });
  } catch (wjl_error) {
    console.error('[wjl_kb] 查询文档失败：', wjl_error);
    wjl_res.json({ code: 1, msg: '查询文档失败：' + wjl_error.message, data: null });
  }
};

const wjl_deleteDoc = async (wjl_req, wjl_res) => {
  const wjl_docId = Number(wjl_req.params.id);

  if (!wjl_docId) {
    return wjl_res.json({ code: 1, msg: '文档 ID 不合法', data: null });
  }

  try {
    const wjl_affected = await wjl_kbModel.wjl_deleteDoc(wjl_docId);
    if (wjl_affected === 0) {
      return wjl_res.json({ code: 1, msg: '文档不存在', data: null });
    }
    wjl_res.json({ code: 0, msg: '删除成功', data: { wjl_id: wjl_docId } });
  } catch (wjl_error) {
    console.error('[wjl_kb] 删除文档失败：', wjl_error);
    wjl_res.json({ code: 1, msg: '删除失败：' + wjl_error.message, data: null });
  }
};

const wjl_getDocChunks = async (wjl_req, wjl_res) => {
  const wjl_docId = Number(wjl_req.params.id);

  if (!wjl_docId) {
    return wjl_res.json({ code: 1, msg: '文档 ID 不合法', data: null });
  }

  try {
    const wjl_chunks = await wjl_kbModel.wjl_getChunksByDoc(wjl_docId);
    wjl_res.json({ code: 0, msg: '查询成功', data: { wjl_chunks: wjl_chunks } });
  } catch (wjl_error) {
    console.error('[wjl_kb] 查询切片失败：', wjl_error);
    wjl_res.json({ code: 1, msg: '查询切片失败：' + wjl_error.message, data: null });
  }
};

// 中文按二元组切分，英文与数字按单词切分
const wjl_tokenize = function (wjl_text) {
  const wjl_lower = String(wjl_text || '').toLowerCase();
  const wjl_tokens = new Set();

  (wjl_lower.match(/[a-z0-9]+/g) || []).forEach(function (wjl_word) {
    if (wjl_word.length > 1) {
      wjl_tokens.add(wjl_word);
    }
  });

  wjl_lower
    .replace(/[^\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .forEach(function (wjl_seg) {
      for (let wjl_i = 0; wjl_i < wjl_seg.length - 1; wjl_i++) {
        wjl_tokens.add(wjl_seg.slice(wjl_i, wjl_i + 2));
      }
    });

  return Array.from(wjl_tokens);
};

const wjl_countOccur = function (wjl_text, wjl_term) {
  let wjl_count = 0;
  let wjl_pos = wjl_text.indexOf(wjl_term);
  while (wjl_pos !== -1) {
    wjl_count++;
    wjl_pos = wjl_text.indexOf(wjl_term, wjl_pos + wjl_term.length);
  }
  return wjl_count;
};

const wjl_retrieve = function (wjl_chunks, wjl_question, wjl_topK) {
  const wjl_tokens = wjl_tokenize(wjl_question);

  const wjl_scored = wjl_chunks.map(function (wjl_chunk) {
    const wjl_content = String(wjl_chunk.wjl_content || '').toLowerCase();
    const wjl_title = String(wjl_chunk.wjl_name || '').toLowerCase();
    let wjl_score = 0;

    wjl_tokens.forEach(function (wjl_term) {
      const wjl_hit = wjl_countOccur(wjl_content, wjl_term);
      if (wjl_hit > 0) {
        wjl_score += 1 + Math.log(wjl_hit + 1);
      }
      if (wjl_term.length >= 2 && wjl_title.indexOf(wjl_term) !== -1) {
        wjl_score += 0.5;
      }
    });

    return {
      wjl_id: wjl_chunk.wjl_id,
      wjl_doc_id: wjl_chunk.wjl_doc_id,
      wjl_index: wjl_chunk.wjl_index,
      wjl_name: wjl_chunk.wjl_name,
      wjl_content: wjl_chunk.wjl_content,
      wjl_score: Number(wjl_score.toFixed(3))
    };
  });

  return wjl_scored
    .filter(function (wjl_item) {
      return wjl_item.wjl_score > 0;
    })
    .sort(function (wjl_a, wjl_b) {
      return wjl_b.wjl_score - wjl_a.wjl_score;
    })
    .slice(0, wjl_topK);
};

const wjl_ask = async (wjl_req, wjl_res) => {
  const wjl_question = String(wjl_req.body.question || '').trim();

  if (!wjl_question) {
    return wjl_res.json({ code: 1, msg: '请输入要提问的内容', data: null });
  }

  try {
    const wjl_allChunks = await wjl_kbModel.wjl_getAllChunks();

    if (wjl_allChunks.length === 0) {
      return wjl_res.json({ code: 1, msg: '知识库为空，请先上传知识库文件', data: null });
    }

    const wjl_sources = wjl_retrieve(wjl_allChunks, wjl_question, 4);

    if (wjl_sources.length === 0) {
      return wjl_res.json({
        code: 0,
        msg: '知识库中未找到相关内容',
        data: {
          wjl_answer: '知识库中未找到与该问题相关的内容，请尝试更换关键词，或补充上传相关资料。',
          wjl_sources: [],
          wjl_prompt: '',
          wjl_model: process.env.SILICONFLOW_MODEL || ''
        }
      });
    }

    const wjl_context = wjl_sources
      .map(function (wjl_item, wjl_i) {
        return (
          '【资料' + (wjl_i + 1) + '｜' + wjl_item.wjl_name + ' 第' + (wjl_item.wjl_index + 1) + '段】\n' +
          wjl_item.wjl_content
        );
      })
      .join('\n\n');

    const wjl_userContent =
      '【知识库资料】\n' + wjl_context + '\n\n【用户问题】\n' + wjl_question;

    const wjl_payload = {
      model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash',
      messages: [
        {
          role: 'system',
          content:
            '你是 WJL 商城的智能客服助手。请严格依据【知识库资料】回答用户问题：' +
            '资料中有明确依据时直接给出简洁中文答案，并尽量保留关键数字与时限；' +
            '资料不足以回答时，明确回复“知识库中未找到相关内容”，禁止编造。'
        },
        { role: 'user', content: wjl_userContent }
      ],
      temperature: 0.3,
      max_tokens: 600,
      stream: false
    };

    const wjl_apiKey = process.env.SILICONFLOW_API_KEY;
    const wjl_baseUrl = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';

    if (!wjl_apiKey) {
      return wjl_res.json({ code: 1, msg: '服务端未配置 SILICONFLOW_API_KEY', data: null });
    }

    console.log('[wjl_kb] 发送给大模型的数据：', JSON.stringify(wjl_payload));

    const wjl_controller = new AbortController();
    const wjl_timer = setTimeout(function () {
      wjl_controller.abort();
    }, 60000);

    try {
      const wjl_response = await fetch(wjl_baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + wjl_apiKey
        },
        body: JSON.stringify(wjl_payload),
        signal: wjl_controller.signal
      });

      const wjl_result = await wjl_response.json().catch(function () {
        return null;
      });

      console.log('[wjl_kb] 接收到大模型的数据：', JSON.stringify(wjl_result));

      if (!wjl_response.ok) {
        const wjl_reason =
          (wjl_result && wjl_result.error && wjl_result.error.message) ||
          '上游接口返回 HTTP ' + wjl_response.status;
        return wjl_res.json({ code: 1, msg: '大模型调用失败：' + wjl_reason, data: null });
      }

      const wjl_answer =
        wjl_result && wjl_result.choices && wjl_result.choices[0] &&
        wjl_result.choices[0].message && wjl_result.choices[0].message.content;

      if (!wjl_answer) {
        return wjl_res.json({ code: 1, msg: '大模型未返回有效内容', data: null });
      }

      wjl_res.json({
        code: 0,
        msg: '回答成功',
        data: {
          wjl_answer: wjl_answer,
          wjl_model: wjl_payload.model,
          wjl_usage: (wjl_result && wjl_result.usage) || null,
          wjl_prompt: wjl_userContent,
          wjl_sources: wjl_sources.map(function (wjl_item) {
            return {
              wjl_id: wjl_item.wjl_id,
              wjl_doc_id: wjl_item.wjl_doc_id,
              wjl_name: wjl_item.wjl_name,
              wjl_index: wjl_item.wjl_index,
              wjl_score: wjl_item.wjl_score,
              wjl_content: wjl_item.wjl_content
            };
          })
        }
      });
    } finally {
      clearTimeout(wjl_timer);
    }
  } catch (wjl_error) {
    console.error('[wjl_kb] 问答失败：', wjl_error);
    wjl_res.json({ code: 1, msg: '问答失败：' + wjl_error.message, data: null });
  }
};

module.exports = {
  wjl_uploadDoc: wjl_uploadDoc,
  wjl_getDocs: wjl_getDocs,
  wjl_deleteDoc: wjl_deleteDoc,
  wjl_getDocChunks: wjl_getDocChunks,
  wjl_ask: wjl_ask
};
