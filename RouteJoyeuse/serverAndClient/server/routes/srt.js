const express = require('express');
const multer = require('multer');
const router = express.Router();
const handleSrt = require('../methods/handleSrt');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/do', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: '没有上传文件' });
        }

        const fileInfo = {
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            buffer: req.file.buffer
        };

        const downloadUrl = await handleSrt(fileInfo);
        console.log(downloadUrl)
        res.status(200).send({ downloadUrl });
    } catch (error) {
        res.status(500).send({ error: '文件处理失败' });
    }
});

module.exports = router;
