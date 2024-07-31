import axios from 'axios';

export default async function createFolder(username, choix, name) {
    return new Promise((resolve, reject) => {
        axios.post('/api/userInfoFileControl/createFolder', {
            username: username,
            fatherFolder: choix,
            name: name
        }).then(res => {
            resolve(res.data);
        }).catch(err => {
            if (err.response && err.response.status === 500) {
                reject('文件夹创建失败: ' + err.response.data.message);
            } else if (err.response && err.response.status === 404) {
                reject('未找到: ' + err.response.data.message);
            } else {
                reject('请求失败: ' + err.message);
            }
        });
    });
}
