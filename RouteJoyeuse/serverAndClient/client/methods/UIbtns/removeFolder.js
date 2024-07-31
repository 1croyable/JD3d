import axios from 'axios';

export default async function removeFolder(username,parentFolderId, folderRestId, fileRestId) {
    return new Promise((resolve, reject) => {
        axios.post('/api/userInfoFileControl/removeFolder', {
            username: username,
            parentFolderId: parentFolderId,
            folderRestId: folderRestId,
            fileRestId: fileRestId
        }).then(res => {
            resolve(res.data);
        }).catch(err => {
            if (err.response && err.response.status === 500) {
                reject('文件夹删除失败: ' + err.response.data.message);
            } else if (err.response && err.response.status === 404) {
                reject('未找到: ' + err.response.data.message);
            } else {
                reject('请求失败: ' + err.message);
            }
        });
    });
}
