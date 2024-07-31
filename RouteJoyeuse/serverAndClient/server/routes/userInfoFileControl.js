var express = require('express');
const mysql = require('mysql');
var router = express.Router();

const ff = require('../methods/ff.js');
const copyFile = ff.copyFile;
const deleteFile = ff.deleteFile;
const renameFile = ff.renameFile;
const downLoadFile = ff.downLoadFile;

const config = require('../config/config.js');
const dbConfig1 = config.dbConfig1;

const connection1 = mysql.createConnection(dbConfig1);
connection1.connect(error => {
    if (error) throw error;
});

router.post('/01_copy', async (req, res) => {
    const username = req.body.username;
    const file = req.body.file;
    const to = req.body.to;

    let name = '';
    let extension = '';
    let index = file.fileName.lastIndexOf('.');
    if (index !== -1) {
        name = file.fileName.substring(0, index);
        extension = file.fileName.substring(index + 1);
    }

    const sourceURL = 'rj-web-1318704176.cos.ap-shanghai.myqcloud.com/' + username + '/' + file.fileName;
    const key = username + '/' + name + '_copy' + '.' + extension;

    try {
        const copyResult = await copyFile(sourceURL, key);

        if (copyResult) {
            const queryFileMetadata = 'SELECT * FROM Files WHERE file_id = ?';
            connection1.query(queryFileMetadata, [file.fileId], (err, results) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }

                if (results.length === 0) {
                    res.status(404).send('没有找到文件');
                    return;
                }

                const originalFileMetadata = results[0];

                const insertCopyMetadata = 'INSERT INTO Files (user_id, name, type, size, create_time, cos_key) VALUES (?, ?, ?, ?, NOW(), ?)';
                connection1.query(insertCopyMetadata, [originalFileMetadata.user_id, name + '_copy' + '.' + extension, originalFileMetadata.type, originalFileMetadata.size, key], (err, results) => {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }

                    const newFileId = results.insertId;
                    const insertRelation = 'INSERT INTO File_Folder_Relations (file_id, folder_id) VALUES (?, ?)';
                    connection1.query(insertRelation, [newFileId, to.folder_id], (err, results) => {
                        if (err) {
                            res.status(500).send(err);
                            return;
                        }

                        res.status(200).send({ code: 200, message: '复制文件成功', newFileId: newFileId });
                    });
                });
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/01_move', async (req, res) => {
    const username = req.body.username;
    const file = req.body.file; // 假设这里包含了fileId
    const to = req.body.to; // { folder_id, name, parent_id, create_time, children }

    try {
        const queryFolderExists = 'SELECT 1 FROM Folders WHERE folder_id = ?';
        connection1.query(queryFolderExists, [to.folder_id], (err, results) => {
            if (err) {
                res.status(500).send('数据库查询错误: ' + err.message);
                return;
            }
            if (results.length === 0) {
                res.status(404).send('目标文件夹不存在');
                return;
            }

            const updateFileFolderRelation = 'UPDATE File_Folder_Relations SET folder_id = ? WHERE file_id = ?';
            connection1.query(updateFileFolderRelation, [to.folder_id, file.fileId], (err, result) => {
                if (err) {
                    res.status(500).send('更新文件夹失败: ' + err.message);
                    return;
                }
                if (result.affectedRows === 0) {
                    res.status(404).send('文件未找到');
                    return;
                }

                res.status(200).send({ code: 200, message: '文件移动成功' });
            });
        });
    } catch (err) {
        res.status(500).send('操作失败: ' + err.message);
    }
});


router.post('/01_delete', async (req, res) => {
    const { username, file } = req.body;

    try {
        console.log(file.cosKey)
        await deleteFile(file.cosKey);

        const deleteFileQuery = 'DELETE FROM Files WHERE file_id = ?';
        connection1.query(deleteFileQuery, [file.fileId], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('数据库删除文件失败');
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).send('');
                return;
            }

            const deleteRelationQuery = 'DELETE FROM File_Folder_Relations WHERE file_id = ?';
            connection1.query(deleteRelationQuery, [file.fileId], (err, result) => {
                if (err) {
                    console.error('删除文件夹关系失败: ', err);
                    res.status(500).send('');
                    return;
                }

                res.send({ code: 200, message: '文件删除成功' });
            });
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})

router.post('/01_rename', async (req, res) => {
    const { username, file, newName } = req.body;

    let name = '';
    let extension = '';
    let index = file.fileName.lastIndexOf('.');
    if (index !== -1) {
        name = file.fileName.substring(0, index);
        extension = file.fileName.substring(index + 1);
    }

    const oldKey = file.cosKey;
    const newKey = `${username}/${newName}.${extension}`

    try {
        const result = await renameFile(oldKey, newKey);

        const renameFileQuery = 'UPDATE Files SET name = ?, cos_key = ? WHERE file_id = ?';
        connection1.query(renameFileQuery, [newName + '.' + extension, newKey, file.fileId], (err, result) => {
            if (err) {
                console.error('数据库重命名文件失败: ', err);
                res.status(500).send('数据库重命名文件失败');
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).send('文件未找到');
                return;
            }

            res.send({ code: 200, message: '文件重命名成功' });
        });
    } catch (error) {
        console.error('重命名文件过程中发生错误: ', error);
        res.status(500).send({ message: error.message });
    }
});

router.post('/01_viewFileProps', async (req, res) => {
    const { username, file } = req.body;

    // 更新查询语句，包括Folders表以获取文件所属文件夹的名字
    const query = `
        SELECT 
            Files.file_id, 
            Files.name AS file_name, 
            Files.type, 
            Files.size, 
            Files.create_time, 
            Files.cos_key,
            Folders.name AS belonging_folder_name
        FROM 
            Files
        LEFT JOIN 
            File_Folder_Relations ON Files.file_id = File_Folder_Relations.file_id
        LEFT JOIN 
            Folders ON File_Folder_Relations.folder_id = Folders.folder_id
        WHERE 
            Files.file_id = ?
    `;

    // 执行查询
    connection1.query(query, [file.fileId], (err, results) => {
        if (err) {
            console.error('查询文件属性失败: ', err);
            res.status(500).send({ message: '查询文件属性失败' });
            return;
        }

        if (results.length === 0) {
            res.status(404).send({ message: '文件未找到' });
            return;
        }

        // 由于加入了Folders表，我们现在可以获取文件所属文件夹的名字
        const fileProps = results[0];

        res.status(200).send({ message: '文件属性查询成功', data: fileProps });
    });
});

router.post('/downloadFile', async (req, res) => {
    const { username, file } = req.body;

    const cosKey = file.cosKey;

    try {
        const downloadUrl = await downLoadFile(cosKey);
        res.send({ url: downloadUrl });
    } catch (err) {
        res.status(500).send({ message: '下载文件失败' });
    }
});

router.post('/createFolder', async (req, res) => {
    const { username, fatherFolder, name } = req.body;

    const userQuery = 'SELECT id FROM `user` WHERE username = ?';
    connection1.query(userQuery, [username], (err, users) => {
        if (err) {
            return res.status(500).send('查询用户失败');
        }
        if (users.length === 0) {
            return res.status(404).send('用户未找到');
        }

        const userId = users[0].id;

        const insertFolderQuery = 'INSERT INTO Folders (user_id, parent_id, name, create_time) VALUES (?, ?, ?, NOW())';
        connection1.query(insertFolderQuery, [userId, fatherFolder.folder_id || null, name], (err, result) => {
            if (err) {
                return res.status(500).send('创建文件夹失败');
            }

            const newFolderId = result.insertId;

            if (fatherFolder.folder_id) {
                const insertStructureQuery = 'INSERT INTO Folder_Structure (parent_id, child_id) VALUES (?, ?)';
                const insertUserFoldersQuery = 'INSERT INTO User_Folders (user_id, folder_id) VALUES (?, ?)';

                connection1.query(insertStructureQuery, [fatherFolder.folder_id, newFolderId], (err, structureResult) => {
                    if (err) {
                        return res.status(500).send('更新文件夹结构失败');
                    }

                    res.send({ message: '文件夹创建成功', folderId: newFolderId });
                });

                connection1.query(insertUserFoldersQuery, [userId, newFolderId], (err, userFoldersResult) => {
                    if (err) {
                        return res.status(500).send('更新用户文件夹失败');
                    }
                });
            } else {
                res.send({ message: '文件夹创建成功', folderId: newFolderId });
            }
        });
    });
});

router.post('/renameFolder', async (req, res) => {
    const { username, folder, newName } = req.body;

    if (!newName.trim()) {
        return res.status(400).send({ message: '新文件夹名称不能为空' });
    }

    const updateFolderQuery = 'UPDATE Folders SET name = ? WHERE folder_id = ?';

    connection1.query(updateFolderQuery, [newName, folder.folder_id], (err, result) => {
        if (err) {
            return res.status(500).send({ message: '数据库更新失败' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: '未找到指定的文件夹' });
        }

        res.send({ message: '文件夹名称更新成功' });
    });
});

router.post('/removeFolder', async (req, res) => {
    const { username, parentFolderId, folderRestId, fileRestId } = req.body;

    async function query(sql, params) {
        return new Promise((resolve, reject) => {
            connection1.query(sql, params, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    async function deleteFilesInFolder(folderId) {
        const files = await query(`SELECT file_id, name FROM Files WHERE file_id IN (SELECT file_id FROM File_Folder_Relations WHERE folder_id = ?)`, [folderId]);
        if (files.length !== 0) {
            for (let file of files) {
                const cosKey = `${username}/${file.name}`;
                await deleteFile(cosKey);
                await query(`DELETE FROM Files WHERE file_id = ?`, [file.file_id]);
            }
        }
    }

    async function deleteFoldersAndFiles(folderIds) {
        for (let folderId of folderIds) {
            // 删除该文件夹内所有文件
            await deleteFilesInFolder(folderId);

            // 递归删除子文件夹
            const childFolders = await query(`SELECT folder_id FROM Folders WHERE parent_id = ?`, [folderId]);
            const childFolderIds = childFolders.map(folder => folder.folder_id);
            if (childFolderIds.length > 0) {
                await deleteFoldersAndFiles(childFolderIds);
            }

            // 删除当前文件夹
            await query(`DELETE FROM Folders WHERE folder_id = ?`, [folderId]);
        }
    }

    try {
        // 首先删除目标文件夹内的所有文件
        await deleteFilesInFolder(parentFolderId);
        // 然后递归删除所有子文件夹及其内容
        if (folderRestId.length > 0) {
            await deleteFoldersAndFiles(folderRestId);
        }
        // 最后删除目标文件夹本身
        await query(`DELETE FROM Folders WHERE folder_id = ?`, [parentFolderId]);

        res.status(200).send('删除成功');
    } catch (error) {
        console.error(error);
        res.status(500).send('删除失败');
    }
});

module.exports = router;
