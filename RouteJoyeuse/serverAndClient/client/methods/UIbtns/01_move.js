import axios from 'axios';

export default async function moveFile(username, file, to) {
    return new Promise((resolve, reject) => {
        axios.post('/api/userInfoFileControl/01_move', {
            username: username,
            file: file,
            to: to
        }).then(res => {
            resolve(res.data);
        }).catch(err => {
            if (err.response && err.response.status === 500) {
                reject('移动失败: ' + err.response.data.message);
            } else if (err.response && err.response.status === 404) {
                reject('文件未找到: ' + err.response.data.message);
            } else {
                reject('请求失败: ' + err.message);
            }
        });
    });
}
