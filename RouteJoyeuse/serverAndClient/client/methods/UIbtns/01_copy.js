import axios from 'axios';

export default async function copyFile(username, file, to, onProgress) {
    return new Promise((resolve, reject) => {
        axios.post('/api/userInfoFileControl/01_copy', {
            username: username,
            file: file,
            to: to
        }, {
            onUploadProgress: onProgress
        }).then(res => {
            resolve(res.data);
        }).catch(err => {
            if (err.response && err.response.status === 500) {
                reject('复制失败: ' + err.response.data.message);
            } else if (err.response && err.response.status === 404) {
                reject('文件未找到: ' + err.response.data.message);
            } else {
                reject('请求失败: ' + err.message);
            }
        });
    });
}
