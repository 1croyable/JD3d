import axios from 'axios';

export default async function renameFolder(username, folder, newName) {
    return new Promise((resolve, reject) => {
        axios.post('/api/userInfoFileControl/renameFolder', {
            username: username,
            folder: folder,
            newName: newName,
        }).then(res => {
            resolve(res.data);
        }).catch(err => {
            if (err.response && err.response.status === 500) {
                reject('重命名文件夹失败: ' + err.response.data.message);
            } else if (err.response && err.response.status === 404) {
                reject('文件夹未找到: ' + err.response.data.message);
            } else {
                reject('请求失败: ' + err.message);
            }
        });
    });
}
