const config = require('../config/config.js');
const cos = config.cos;

async function newFolder(connection, id, folderName, parent_id) {
    return new Promise((resolve, reject) => {
        connection.query(
            'INSERT INTO Folders (name, user_id, create_time, parent_id) VALUES (?, ?, NOW(), ?)',
            [folderName, id, parent_id],
            (error, folderResults) => {
                if (error) {
                    return reject({ status: 500, message: '创建文件夹失败', error: error });
                }
                const newFolderId = folderResults.insertId;

                connection.query(
                    'INSERT INTO User_Folders (user_id, folder_id) VALUES (?, ?)',
                    [id, newFolderId],
                    (error) => {
                        if (error) {
                            return reject({ status: 500, message: '用户与文件夹创建关联失败', error: error });
                        }

                        connection.query(
                            'INSERT INTO Folder_Structure (parent_id, child_id) VALUES (?, ?)',
                            [parent_id, newFolderId],
                            (error) => {
                                if (error) {
                                    return reject({ status: 500, message: '文件夹层级结构创建失败', error: error });
                                }
                                resolve(newFolderId); // Resolve with the new folder's ID
                            }
                        );
                    }
                );
            }
        );
    });
}

async function addFileInReader(connection, userId, filename, filetype, filesize, createTime, cosKey, folderId) {
    return new Promise((resolve, reject) => {
        // 插入到Files表
        const insertFileQuery = `
            INSERT INTO Files (user_id, name, type, size, create_time, cos_key) 
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        connection.query(insertFileQuery, [userId, filename, filetype, filesize, createTime, cosKey], (error, fileResults) => {
            if (error) {
                return reject({ status: 500, message: '添加文件元数据失败', error: error });
            }

            const fileId = fileResults.insertId;
            if (folderId === null) {
                console.log('folderId is null，说明前端并没有传入指定的文件夹id，那么我们就要放到主文件夹')
                // 查找用户的主文件夹ID
                const getMainFolderQuery = 'SELECT folder_id FROM Folders WHERE user_id = ? AND name = "主文件夹"';
                connection.query(getMainFolderQuery, [userId], (error, folderResults) => {
                    if (error) {
                        return reject({ status: 500, message: '查询主文件夹失败', error: error });
                    }

                    if (folderResults.length === 0) {
                        return reject({ status: 404, message: '主文件夹不存在' });
                    }

                    const mainFolderId = folderResults[0].folder_id;
                    console.log('找到了，主文件夹id是：',mainFolderId)

                    // 插入到File_Folder_Relations表
                    const insertRelationQuery = `
                        INSERT INTO File_Folder_Relations (file_id, folder_id) 
                        VALUES (?, ?);
                    `;
                    connection.query(insertRelationQuery, [fileId, mainFolderId], (error) => {
                        if (error) {
                            return reject({ status: 500, message: '文件与文件夹关联失败', error: error });
                        }
                        resolve({ message: '文件元数据添加成功', fileId: fileId, mainFolderId: mainFolderId });
                    });
                });
            }
            else {
                // 插入到File_Folder_Relations表
                const insertRelationQuery = `
                INSERT INTO File_Folder_Relations (file_id, folder_id) 
                VALUES (?, ?);
            `;
                connection.query(insertRelationQuery, [fileId, folderId], (error) => {
                    if (error) {
                        return reject({ status: 500, message: '文件与文件夹关联失败', error: error });
                    }
                    resolve({ message: '文件元数据添加成功', fileId: fileId, mainFolderId: folderId });
                });
            }
        });
    });
}

//  为了让查询语句的结果被单独拿出来，而且依次执行，我们把查询语句包装成一个promise
function queryAsync(connection, sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

// 递归函数，用于构建每个文件夹的子文件夹结构
async function buildFolderStructure(connection, folderId) {
    let subfolders = [];
    try {
        // 查询当前文件夹的子文件夹
        const rows = await queryAsync(connection, 'SELECT * FROM `Folders` WHERE `parent_id` = ?', [folderId]);
        for (const row of rows) {
            // 对于每个子文件夹，递归地构建其结构
            const children = await buildFolderStructure(connection, row.folder_id);
            subfolders.push({
                folder_id: row.folder_id,
                name: row.name,
                parent_id: row.parent_id,
                create_time: row.create_time,
                children: children,
            });
        }
    } catch (err) {
        console.log(err)
        throw new Error('获取子文件夹出错');
    }
    return subfolders;
}

async function getFolders(connection, userId) {
    // 获取顶层文件夹（即没有父文件夹的文件夹）
    let topLevelFolders = [];
    try {
        const topLevelRows = await queryAsync(connection, 'SELECT * FROM `Folders` WHERE `user_id` = ? AND `parent_id` IS NULL', [userId]);
        for (const row of topLevelRows) {
            const children = await buildFolderStructure(connection, row.folder_id);
            topLevelFolders.push({
                folder_id: row.folder_id,
                name: row.name,
                parent_id: row.parent_id,
                create_time: row.create_time,
                children: children,
            });
        }
        return topLevelFolders; // 返回顶层文件夹及其所有子文件夹的结构
    } catch (err) {
        console.log(err)
        throw new Error('获取主文件夹出错');
    }
}

//获取文件夹中的文件
function collectFolderIds(folders, folderIds = []) {
    const foldersArray = (Array.isArray(folders) === false) ? JSON.parse(folders) : folders;
    foldersArray.forEach(folder => {
        folderIds.push(folder.folder_id);
        if (folder.children && folder.children.length) {
            collectFolderIds(folder.children, folderIds);
        }
    });
    return folderIds;
}

async function getfiles(connection, userId, folders) {
    return new Promise((resolve, reject) => {
        try {
            const folderIds = collectFolderIds(folders);
            if (folderIds.length === 0) {
                resolve([]);
            } else {
                const placeholders = folderIds.map(() => '?').join(',');
                const query = `
                    SELECT Files.file_id, Files.name AS file_name, Files.cos_key, Folders.folder_id, Folders.name AS folder_name
                    FROM Files
                    INNER JOIN File_Folder_Relations ON Files.file_id = File_Folder_Relations.file_id
                    INNER JOIN Folders ON File_Folder_Relations.folder_id = Folders.folder_id
                    WHERE Folders.user_id = ? AND Folders.folder_id IN (${placeholders})
                `;
                const params = [userId, ...folderIds];

                connection.query(query, params, (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        const relations = results.map(result => ({
                            fileId: result.file_id,
                            fileName: result.file_name,
                            cosKey: result.cos_key,
                            folderId: result.folder_id,
                            folderName: result.folder_name
                        }));
                        resolve(relations);
                    }
                });
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function getFileContent(cosKey) {
    return new Promise((resolve, reject) => {
        cos.getObject({
            Bucket: 'rj-web-1318704176',
            Region: 'ap-shanghai',
            Key: cosKey,
        }, function (error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data.Body.toString('utf-8'));
            }
        });
    });
}

//复制文件操作
function copyFile(sourceUrl, cosKey) {
    return new Promise((resolve, reject) => {
        cos.putObjectCopy({
            Bucket: 'rj-web-1318704176',
            Region: 'ap-shanghai',
            Key: cosKey,
            CopySource: sourceUrl,
        }, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

async function deleteFile(cosKey) {
    return new Promise((resolve, reject) => {
        cos.deleteObject({
            Bucket: 'rj-web-1318704176',
            Region: 'ap-shanghai',
            Key: cosKey
        }, function (err, data) {
            if (err) {
                console.log(err);
                reject('删除文件失败');
                return;
            }
            resolve('文件删除成功');
        });
    });
}

async function renameFile(oldCosKey, newCosKey) {
    return new Promise((resolve, reject) => {
        cos.putObjectCopy({
            Bucket: 'rj-web-1318704176',
            Region: 'ap-shanghai',
            Key: newCosKey,
            CopySource: 'rj-web-1318704176.cos.ap-shanghai.myqcloud.com/' + oldCosKey
        }, function (err, data) {
            if (err) {
                console.log(err);
                reject('复制文件失败');
                return;
            }
            cos.deleteObject({
                Bucket: 'rj-web-1318704176',
                Region: 'ap-shanghai',
                Key: oldCosKey
            }, function (err, data) {
                if (err) {
                    console.log(err);
                    reject('删除原文件失败');
                    return;
                }
                resolve('文件重命名成功');
            });
        });
    });
}

async function downLoadFile(cosKey) {
    return new Promise((resolve, reject) => {
        cos.getObjectUrl({
            Bucket: 'rj-web-1318704176',
            Region: 'ap-shanghai',
            Key: cosKey,
            Expires: 60,
            Sign: true,
        }, function (err, data) {
            if (err) {
                reject(err);
                return;
            }
            resolve(data.Url);
        });
    });
}

module.exports = {
    newFolder, addFileInReader, getFolders, getfiles, getFileContent, copyFile, deleteFile, renameFile, downLoadFile
}