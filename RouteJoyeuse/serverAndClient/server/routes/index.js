var express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const fs = require('fs')
var router = express.Router();
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'RouteJoyeuse';

const bucket = require('../methods/bucket.js');
const checkFileExists = bucket.checkFileExists;
const uploadFileToCOS = bucket.uploadFileToCOS;
const getSignedURL = bucket.getSignedURL;
const deleteFile = bucket.deleteFile;

const ff = require('../methods/ff.js');
const newFolder = ff.newFolder;
const addFileInReader = ff.addFileInReader;
const getFolders = ff.getFolders;
const getfiles = ff.getfiles;
const getFileContent = ff.getFileContent;

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


router.post('/register', function (req, res, next) {
    const reg_info = req.body;
    connection1.query('SELECT * FROM user WHERE username = ?', [reg_info.username], (error, results, fields) => {
        if (results.length > 0) {
            res.status(500).send({
                status: 0,
                message: '用户名已存在'
            });
        } else {
            bcrypt.hash(reg_info.password, 10, function (err, hash) {
                if (err) {
                    return res.status(500).send({ status: 0, message: '密码加密失败' });
                }
                reg_info.password = hash;
                connection1.query(
                    'INSERT INTO user (username, password) VALUES (?, ?)', [reg_info.username, reg_info.password], async (error, results, fields) => {
                        if (error) {
                            return res.status(500).send({ status: 0, message: '数据库错误' });
                        }
                        const id = results.insertId;
                        const folderName = "主文件夹";
                        const parent_id = null;
                        const Bucket = 'rj-web-1318704176';
                        const Region = 'ap-shanghai';
                        const cosKey = reg_info.username + '/avatar/';

                        //读取文件为buffer
                        const defaultAvatar = fs.readFileSync('../imgs/default.png');
                        const male = fs.readFileSync('../imgs/male.png');
                        const female = fs.readFileSync('../imgs/female.png');

                        try {
                            await uploadFileToCOS(Bucket, Region, cosKey + 'default.png', defaultAvatar);
                            await uploadFileToCOS(Bucket, Region, cosKey + 'male.png', male);
                            await uploadFileToCOS(Bucket, Region, cosKey + 'female.png', female);

                            const queryAvater = 'INSERT INTO user_avaters (user_id, cosKey) VALUES (?, ?)';
                            await query(connection1, queryAvater, [id, cosKey + 'default']);

                            await newFolder(connection1, id, folderName, parent_id);
                            res.send({ message: '注册成功，主文件夹已创建，用户与文件夹关联已建立' });
                        } catch (error) {
                            res.status(500).send({ message: error.message });
                        }
                    }
                );
            });
        }
    });
});


router.post('/login', function (req, res, next) {
    const login_info = req.body;

    connection1.query('SELECT * FROM user WHERE username = ?', [login_info.username], (error, results, fields) => {
        if (error) {
            return res.status(500).send({ status: 0, message: '数据库出错' });
        }
        if (results.length > 0) {
            bcrypt.compare(login_info.password, results[0].password, function (err, result) {
                if (err) {
                    return res.status(500).send({ status: 0, message: '密码验证过程出错' });
                }
                if (result) {
                    if (login_info.remember) {
                        const token = jwt.sign({ userId: results[0].username }, SECRET_KEY, { expiresIn: '3d' });
                        console.log('用户', results[0].username, '登录成功，并选择了记住我')
                        res.send({ status: 1, message: '登录成功', token: token });
                    }
                    else {
                        console.log('用户', results[0].username, '登录成功，临时登录')
                        res.send({ status: 1, message: '登录成功' });
                    }
                } else {
                    // 密码不匹配
                    res.status(401).send({ status: 0, message: '密码错误' });
                }
            });
        } else {
            res.status(404).send({ status: 0, message: '用户名不存在' });
        }
    });
});

//文件处理中间件
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer(
    {
        storage
    }
);

router.post('/upload', upload.single('file'), async (req, res) => {
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
            const uploadResult = await uploadFileToCOS(bucket, region, key, buffer);
            console.log('文件在cos上上传成功',uploadResult);

            const getUserIDQuery = 'SELECT id FROM user WHERE username = ?;';
            connection1.query(getUserIDQuery, req.headers['username'], async (err, userResults) => {
                if (err) {
                    return res.status(500).send('查询用户ID失败');
                }
                if (userResults.length === 0) {
                    return res.status(404).send('用户不存在');
                }
                console.log('userResults',userResults)
                const userId = userResults[0].id;

                try {
                    let folderId = null;
                    if (req.headers['folderid']) {
                        folderId = req.headers['folderid'];
                    }

                    await addFileInReader(connection1, userId, name, type, size, createTime, key, folderId);
                    res.status(200).send(key);

                } catch (addFileError) {
                    res.status(500).send(addFileError.message);
                }

            });
        } catch (error) {
            res.status(501).send('文件上传失败');
        }
    } catch (error) {
        return res.status(500).send('检查文件失败');
    }
});

router.get('/getFolders', async (req, res) => {
    const { name } = req.query;

    connection1.query(
        'SELECT * FROM user WHERE username = ?', [name],
        (error, folderResults) => {
            getFolders(connection1, folderResults[0].id).then((data) => {
                res.status(200).json(data);
            }).catch((error) => {
                res.status(500).send(error.message);
            });
        });
});

router.get('/getfiles', async (req, res) => {
    const { name, folders } = req.query;

    connection1.query('SELECT * FROM user WHERE username = ?', [name],
        (error, results) => {
            getfiles(connection1, results[0].id, folders).then((data) => {
                res.status(200).json(data);
            });
        }
    );
});

router.get('/getFileContent', (req, res) => {
    const { cosKey } = req.query;
    getFileContent(cosKey)
        .then(data => res.status(200).send(data))
        .catch(error => res.status(500).send(error.message));
});

router.get('/srcAvatar', async (req, res) => {
    const { username } = req.query;
    const queryCosKey = `SELECT cosKey FROM user_avatars WHERE user_id IN (Select id FROM user WHERE username = ?)`
    try {
        const [result] = await query(queryCosKey, [username]);
        if (result.cosKey) {
            const cosKey = result.cosKey;
            const Bucket = 'rj-web-1318704176';
            const Region = 'ap-shanghai';
            const url = await getSignedURL(Bucket, Region, cosKey);
            res.status(200).send(url);
        }
        else {
            res.status(500).send('无法获取头像')
        }
    }
    catch (err) {
        res.status(500).send(err.message);
    }
})

//文件处理中间件
const storageAvatar = multer.memoryStorage();
const uploadAvatar = multer(
    {
        storageAvatar
    }
);
router.put('/avatar', uploadAvatar.single('file'), async (req, res) => {
    const username = req.headers['username']
    const file = req.file;
    try {
        //拿到现在的key和lastkey
        const queryCosKey = `SELECT * FROM user_avatars WHERE user_id IN (Select id FROM user WHERE username = ?)`;
        const result1 = await query(queryCosKey, [username]);
        const cosKey = result1[0].cosKey;
        const lastKey = result1[0].lastKey;

        const Bucket = 'rj-web-1318704176';
        const Region = 'ap-shanghai';

        //如果有lastkey，那么删除lastkey所指向的文件
        if (lastKey && lastKey !== username + '/avatar/default.png' && lastKey !== username + '/avatar/male.png' && lastKey !== username + '/avatar/female.png') {
            await deleteFile(Bucket, Region, lastKey);
        }

        //上传新文件
        const newKey = username + '/avatar/' + file.originalname;
        await uploadFileToCOS(Bucket, Region, newKey, file.buffer);

        //更新数据库
        const updateCosKey = `UPDATE user_avatars SET cosKey = ?, lastKey = ? WHERE user_id IN (Select id FROM user WHERE username = ?)`;
        await query(updateCosKey, [newKey, cosKey, username]);
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
});

router.put('/updateUserInfo', async (req, res) => {
    const { username, newName, phone, gender } = req.body;

    try {
        const queryUpdateUserInfo = 'UPDATE user SET' + (newName ? ' username = ?,' : '') + (phone ? ' phone_number = ?,' : '') + 'gender = ? WHERE username = ?';
        const params = (newName ? (phone ? [newName, phone, gender, username] : [newName, gender, username]) : (phone ? [phone, gender, username] : [gender, username]))

        await query(queryUpdateUserInfo, params);
        res.status(200).send('用户信息修改成功');
    } catch (err) { res.status(500).send(err); }
})

router.get('/getUserInfo', async (req, res) => {
    const { username } = req.query;
    try {
        const queryUserInfo = 'SELECT * FROM user WHERE username = ?';
        const result = await query(queryUserInfo, [username]);
        const userInfo = {
            username: result[0].username,
            phone_number: result[0].phone_number,
            gender: result[0].gender,
            description: result[0].description
        }
        res.status(200).send(userInfo);
    } catch (err) { res.status(500).send(err); }
});

router.put('/updateDescription', async (req, res) => {
    const { username, description } = req.body;
    try {
        const queryUpdateDescription = 'UPDATE user SET description = ? WHERE username = ?';
        await query(queryUpdateDescription, [description, username]);
        res.status(200).send('用户描述修改成功');
    } catch(err){ res.status(500).send(err);}
})

module.exports = router;
