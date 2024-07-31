const { parseSync } = require('subtitle');
const ExcelJS = require('exceljs');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function handleSrt(fileInfo) {
    const { originalName, buffer } = fileInfo;
    // 解析SRT字幕
    const subtitles = parseSync(buffer.toString('utf8'));
    const wordMap = new Map();  // 用于存储词频

    // 整合到二维数组
    const wordsArray = [];
    subtitles.forEach(async sub => {
        const words = sub.data.text.toLowerCase().match(/\b([a-zA-Z.'àâäèéêëîïôœùûüÿç]+)\b/g);
        if (words) {
            let array = [];
            words.forEach( word => {
                if (/'/.test(word)) {
                    if (word === "d'accord" || word === "d'ailleurs") {
                        array.push(word);
                    } else {
                        array.push(word.split("'")[1]);
                    }
                } else {
                    array.push(word);
                }
            })
            wordsArray.push(array);
        }
    });

    // 累计每个词的出现次数
    const newWordsArray = await axios.post('http://localhost:3002/process_srt', { wordsArray: wordsArray })
    newWordsArray.data.forEach(words => {
        words.forEach(word => {
            wordMap.set(word, (wordMap.get(word) || 0) + 1);
        })
    });

    // 创建Excel文件
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Words');
    worksheet.columns = [
        { header: '单词', key: 'word', width: 30 },
        { header: '出现频次', key: 'freq', width: 10 },
        { header: '中文解释', key: 'translation', width: 30 }
    ];

    // 对每个单词进行翻译并添加到Excel中
    for (const [word, freq] of wordMap.entries()) {
        const translation = '翻译结果';
        worksheet.addRow({ word, freq, translation });
    }

    // 保存Excel文件
    let fileName = originalName.substring(0, originalName.lastIndexOf('.'));
    const outputPath = `outputs/${fileName}.xlsx`;

    try {
        await workbook.xlsx.writeFile(outputPath);
        return `http://localhost:3000/${outputPath}`;
    } catch (error) {
        console.error('写入文件失败: ', error);
        throw new Error('Failed to process file');
    }
}

module.exports = handleSrt;
