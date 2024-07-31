var express = require('express');
const mysql = require('mysql');
var router = express.Router();

const bucket = require('../methods/bucket.js');
const checkFileExists = bucket.checkFileExists;
const uploadFileToCOS = bucket.uploadFileToCOS;
const getSignedURL = bucket.getSignedURL;
const getBuffer = bucket.getBuffer;

const ff = require('../methods/ff.js');
const addFileInReader = ff.addFileInReader;

const config = require('../config/config.js');
const dbConfig1 = config.dbConfig1;

const connection1 = mysql.createConnection(dbConfig1);
connection1.connect(error => {
    if (error) throw error;
});

async function query(query, params) {
    return new Promise((resolve, reject) => {
        connection1.query(query, params, (error, results, fields) => {
            if (error) reject(error);
            resolve(results);
        });
    })
}

router.put('/save', async (req, res) => {
    const { notes, fileId } = req.body;
    //先判断对应的文件有没有他的notes
    const queryIfExist = 'SELECT * FROM notes WHERE file_id = ?';
    const ifExist = await query(queryIfExist, [fileId]);

    try {
        if (ifExist.length === 0) {
            const queryInsertNotes = 'INSERT INTO notes (file_id, content, create_time, last_modified_time) VALUES (?, ?, ?, ?)';
            await query(queryInsertNotes, [fileId, notes, new Date(), new Date()]);
            res.status(200).send(true);
        }
        else {
            const querySaveNotes = 'UPDATE notes SET content = ?, last_modified_time = ? WHERE file_id = ?';
            await query(querySaveNotes, [notes, new Date(), fileId]);
            res.status(200).send(true);
        }
    } catch (err) { res.status(500).send(err); }
});

router.get('/get', async (req, res) => {
    const { fileId } = req.query;
    const queryGetNotes = 'SELECT * FROM notes WHERE file_id = ?';

    try {
        const notes = await query(queryGetNotes, [fileId]);
        if (notes.length === 0) {
            res.status(200).send('');
        }
        else {
            res.status(200).send(notes[0].content);
        }
    } catch (err) { res.status(500).send(err); }
});



const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer(
    {
        storage
    }
);
router.post('/getPdfBlob', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    res.contentType('application/pdf').send(req.file.buffer);
});

router.post('/savePdf', upload.single('file'), async (req, res) => {
    const buffer = req.file.buffer;
    const name = req.file.originalname;
    const type = name.split('.').pop() + '文件';
    const size = req.file.size;
    const createTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '.').replace(/,/, '');

    const bucket = 'rj-web-1318704176'
    const region = 'ap-shanghai'
    const key = req.headers['username'] + '/' + name;

    try {
        const exists = await checkFileExists(bucket, region, key);
        if (exists) {
            return res.status(400).send('文件已存在');
        }
        try {
            await uploadFileToCOS(bucket, region, key, buffer);

            const getUserIDQuery = 'SELECT id FROM user WHERE username = ?;';
            const userResults = await query(getUserIDQuery, req.headers['username']);
            const userId = userResults[0].id;

            let folderId = null;
            if (req.headers['folderid']) {
                folderId = req.headers['folderid'];
            }

            await addFileInReader(connection1, userId, name, type, size, createTime, key, folderId);

            const url = await getSignedURL(bucket, region, key);
            res.status(200).send({ url, key });
        } catch (error) {
            res.status(501).send('文件上传失败');
        }
    } catch (error) {
        return res.status(500).send('检查文件失败');
    }
});

router.get('/getpdfUrl', async (req, res) => {
    const { key } = req.query;
    const bucket = 'rj-web-1318704176'
    const region = 'ap-shanghai'
    try {
        const url = await getSignedURL(bucket, region, key);
        res.status(200).send({ url });
    } catch (err) {
        res.status(500).send('获取pdf链接失败');
    }
})

router.get('/pdfBuffer', async (req, res) => {
    const { key } = req.query;
    const bucket = 'rj-web-1318704176'
    const region = 'ap-shanghai'
    try {
        const buffer = await getBuffer(bucket, region, key);
        res.status(200).send(buffer);
    } catch (err) {
        res.status(500).send('获取pdf链接失败');
    }
});


module.exports = router;
