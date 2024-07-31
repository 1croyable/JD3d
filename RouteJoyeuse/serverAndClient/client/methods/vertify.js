import axios from 'axios';

async function vertify() {
    const session = JSON.parse(sessionStorage.getItem('auth')) || '{}';
    if (session === '{}') {
        const authData = JSON.parse(localStorage.getItem('auth')) || '{}';
        if (authData === '{}') {
            return false;
        }
        else {
            const token = authData.token;
            try {
                await axios.get('/api/vertify/verify-token', {
                    headers: {
                        'Authorization': token
                    }
                })
                return true;
            } catch (error) {
                if(error.response.status === 401){
                    console.log('会话无效或已过期')
                    localStorage.removeItem('auth');
                }
                if(error.response.status === 403){
                    console.log('未提供Token')
                }
                console.log(error)
                return false;
            }
        }
    } else {
        return true;
    }
}

export default vertify;