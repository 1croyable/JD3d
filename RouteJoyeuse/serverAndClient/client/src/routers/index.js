import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';


const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@components/Home.vue'),
        meta: {
            title: '简动3D-首页',
            requiresAuth: false
        }
    },
    {
        path: '/About',
        name: 'About',
        component: () => import('@components/About.vue'),
        meta: {
            title: '简动3D-关于我们',
            requiresAuth: false
        }
    },
    {
        path: '/readerIndex',
        name: 'ReaderIndex',
        component: () => import('@components/ReaderIndex.vue'),
        meta: {
            title: '阅读器',
            requiresAuth: true
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@components/login.vue'),
        meta: {
            title: '登录',
            requiresAuth: false
        }
    },
    {
        path: '/userInfo',
        name: 'userInfo',
        component: () => import('@components/userInfo/index.vue'),
        meta: {
            title: '我的洞府',
            requiresAuth: true
        }
    },
    {
        path: '/3D',
        name: '3D',
        component: () => import('@components/3D/index.vue'),
        meta: {
            title: '设计室',
            requiresAuth: true
        }
    },
    {
        path: '/srt2excel',
        name: 'srt2excel',
        component: () => import('@components/srt2excel.vue'),
        meta: {
            title: '离线法语字幕转换',
            requiresAuth: false
        }
    },
];

const router = createRouter({
    history: createWebHistory('/'),
    routes,
})

let userName = '';

router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    if (requiresAuth === false) {
        if (to.name !== 'Login') {
            next();
            return;
        } else {
            const session = JSON.parse(sessionStorage.getItem('auth')) || '{}';
            if (session.userID) {
                userName = session.userID;
                next({ name: 'Home' });
                return;
            }
            else {
                const authData = JSON.parse(localStorage.getItem('auth')) || '{}';
                const token = authData.token;
                if (!token) {
                    next();
                    return;
                } else {
                    try {
                        let result = await axios.get('/api/vertify/vertify-token-return-name', {
                            headers: {
                                'Authorization': token
                            }
                        });
                        userName = result.data.userId;
                        next({ name: 'Home' });
                    } catch (error) {
                        localStorage.removeItem('auth'); // 清除无效的Token
                        next();
                    }
                }
            }
        }
    } else {
        const session = JSON.parse(sessionStorage.getItem('auth')) || '{}';
        if (session.userID) {
            userName = session.userID;
            next();
            return;
        } else {
            const authData = JSON.parse(localStorage.getItem('auth')) || '{}';
            const token = authData.token;

            // 如果需要身份验证但没有Token，直接跳转到登录页
            if (requiresAuth && !token) {
                next({ name: 'Login' });
                return;
            } else {
                try {
                    let result = await axios.get('/api/vertify/vertify-token-return-name', {
                        headers: {
                            'Authorization': token
                        }
                    });
                    userName = result.data.userId;
                    next();
                    return;
                } catch (error) {
                    localStorage.removeItem('auth'); // 清除无效的Token
                    next({ name: 'Login' });
                    return;
                }
            }
        }
    }
});

//使用费路由守卫更改标题
router.afterEach((to, from) => {
    if (to.meta.title === '我的洞府') {
        if (userName) document.title = `${userName}的洞府`;
        else document.title = 'Route Joyeuse';
    } else if (to.meta.title === '设计室') {
        if (userName) document.title = '设计室';
        else document.title = 'Route Joyeuse';
    }
    else {
        document.title = to.meta.title || 'Route Joyeuse';
    }
})

export default router