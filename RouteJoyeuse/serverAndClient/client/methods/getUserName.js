import axios from 'axios';

function getUserName() {
    return new Promise((resolve, reject) => {
        const session = JSON.parse(sessionStorage.getItem('auth')) || {};
        if (Object.keys(session).length === 0) {
            const authData = JSON.parse(localStorage.getItem('auth')) || {};
            if (Object.keys(authData).length === 0) {
                alert('未登录，请先登录');
                router.push('/login');
                reject(new Error('未登录，请先登录'));
            } else {
                const token = authData.token;
                axios.get('/api/vertify/vertify-token-return-name', {
                    headers: {
                        'Authorization': token
                    }
                }).then((response) => {
                    resolve(response.data.userId);
                }).catch((error) => {
                    if (error.response) {
                        switch (error.response.status) {
                            case 401:
                                localStorage.removeItem('auth');
                                console.log('登录已过期，请重新登录');
                                router.push('/login');
                                break;
                            case 403:
                                console.log(error.response.data.message);
                                break;
                            default:
                                console.log('未知错误');
                                break;
                        }
                    } else {
                        console.log('请求失败');
                    }
                    reject(error);
                });
            }
        } else {
            resolve(session.userID);
        }
    });
}


export default getUserName;