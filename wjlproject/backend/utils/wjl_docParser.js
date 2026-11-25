/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 说明：知识库文档解析工具，支持 doc/docx/pptx/pdf/txt 文本提取与切片。
 */
const fs = require('fs');
const AdmZip = require('adm-zip');

function wjl_decodeXml(wjl_text) {
  return wjl_text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

async function wjl_parseWord(wjl_filePath) {
  const WordExtractor = require('word-extractor');
  const wjl_extractor = new WordExtractor();
  const wjl_doc = await wjl_extractor.extract(wjl_filePath);
  return wjl_doc.getBody();
}

function wjl_parsePptx(wjl_filePath) {
  const wjl_zip = new AdmZip(wjl_filePath);
  const wjl_slides = wjl_zip
    .getEntries()
    .filter(function (wjl_entry) {
      return /^ppt\/slides\/slide\d+\.xml$/.test(wjl_entry.entryName);
    })
    .sort(function (wjl_a, wjl_b) {
      const wjl_na = parseInt(wjl_a.entryName.match(/slide(\d+)\.xml/)[1], 10);
      const wjl_nb = parseInt(wjl_b.entryName.match(/slide(\d+)\.xml/)[1], 10);
      return wjl_na - wjl_nb;
    });

  return wjl_slides
    .map(function (wjl_entry) {
      const wjl_xml = wjl_entry.getData().toString('utf8');
      const wjl_matches = wjl_xml.match(/<a:t>[\s\S]*?<\/a:t>/g) || [];
      return wjl_matches
        .map(function (wjl_match) {
          return wjl_decodeXml(wjl_match.replace(/<\/?a:t>/g, ''));
        })
        .join('\n');
    })
    .join('\n');
}

async function wjl_parsePdf(wjl_filePath) {
  const wjl_pdfParse = require('pdf-parse/lib/pdf-parse.js');
  const wjl_data = await wjl_pdfParse(fs.readFileSync(wjl_filePath));
  return wjl_data.text;
}

async function wjl_parseFile(wjl_filePath, wjl_ext) {
  if (wjl_ext === '.txt' || wjl_ext === '.md') {
    return fs.readFileSync(wjl_filePath, 'utf8');
  }
  if (wjl_ext === '.doc' || wjl_ext === '.docx') {
    return wjl_parseWord(wjl_filePath);
  }
  if (wjl_ext === '.pptx') {
    return wjl_parsePptx(wjl_filePath);
  }
  if (wjl_ext === '.ppt') {
    throw new Error('暂不支持旧版 .ppt 格式，请另存为 .pptx 后上传');
  }
  if (wjl_ext === '.pdf') {
    return wjl_parsePdf(wjl_filePath);
  }
  throw new Error('不支持的文件类型：' + wjl_ext);
}

function wjl_splitChunks(wjl_text, wjl_size, wjl_overlap) {
  const wjl_clean = String(wjl_text || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();

  if (!wjl_clean) {
    return [];
  }

  const wjl_paragraphs = wjl_clean
    .split('\n')
    .map(function (wjl_line) {
      return wjl_line.trim();
    })
    .filter(Boolean);

  const wjl_chunks = [];
  let wjl_buffer = '';

  function wjl_push(wjl_content) {
    if (wjl_content.trim()) {
      wjl_chunks.push(wjl_content.trim());
    }
  }

  wjl_paragraphs.forEach(function (wjl_paragraph) {
    let wjl_parts = [wjl_paragraph];

    if (wjl_paragraph.length > wjl_size) {
      wjl_parts = wjl_paragraph
        .split(/(?<=[。！？；])/)
        .reduce(function (wjl_acc, wjl_sentence) {
          const wjl_last = wjl_acc[wjl_acc.length - 1];
          if (wjl_last && (wjl_last + wjl_sentence).length <= wjl_size) {
            wjl_acc[wjl_acc.length - 1] = wjl_last + wjl_sentence;
          } else {
            wjl_acc.push(wjl_sentence);
          }
          return wjl_acc;
        }, []);
    }

    wjl_parts.forEach(function (wjl_part) {
      if ((wjl_buffer + '\n' + wjl_part).trim().length > wjl_size && wjl_buffer) {
        wjl_push(wjl_buffer);
        wjl_buffer = wjl_overlap > 0 ? wjl_buffer.slice(-wjl_overlap) : '';
      }
      wjl_buffer = (wjl_buffer ? wjl_buffer + '\n' : '') + wjl_part;
    });
  });

  wjl_push(wjl_buffer);
  return wjl_chunks;
}

module.exports = {
  wjl_parseFile: wjl_parseFile,
  wjl_splitChunks: wjl_splitChunks
};
