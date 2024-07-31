import axios from 'axios';

export default async function vdownloadFile(username, file) {
    return new Promise((resolve, reject) => {
        axios.post('/api/userInfoFileControl/downloadFile', {
            username: username,
            file: file,
        }).then(res => {
            resolve(res.data);
        }).catch(err => {
            if (err.response && err.response.status === 500) {
                reject('下载文件失败: ' + err.response.data.message);
            } else if (err.response && err.response.status === 404) {
                reject('未找到: ' + err.response.data.message);
            } else {
                reject('请求失败: ' + err.message);
            }
        });
    });
}
