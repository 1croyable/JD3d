import { createApp } from 'vue'
import { createPinia } from 'pinia';
import piniaPluginPersist from 'pinia-plugin-persist';

import App from './App.vue'
import Axios from 'axios'
import router from './routers/index.js'

import 'vuetify/iconsets/mdi'
import colors from 'vuetify/util/colors'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { mdiAccount } from '@mdi/js'


const vuetify = createVuetify({
    icons: {
        defaultSet: 'mdi',
        aliases: {
            ...aliases,
            account: mdiAccount,
        },
        sets: {
            mdi,
        },
    },
    ssr: true,
    theme: {
        defaultTheme: 'light', // 默认使用亮色主题
        themes: {
            light: {
                colors: {
                    primary: colors.blue.darken2, // 更深的蓝色
                    secondary: colors.amber.lighten3, // 淡黄色
                    accent: colors.cyan.accent4, // 鲜亮的青色
                    error: colors.red.accent3, // 错误提示使用更鲜亮的红色
                    info: colors.lightBlue.accent3, // 信息提示使用亮蓝色
                    success: colors.green.accent3, // 成功信息使用亮绿色
                    warning: colors.amber.accent3, // 警告信息使用亮黄色
                },
            },
            dark: {
                dark: true,
                colors: {
                    primary: colors.blue.lighten3, // 暗色模式下使用更亮的蓝色
                    secondary: colors.amber.darken3, // 暗色模式下使用深黄色
                    accent: colors.cyan.darken3, // 暗色模式下使用深青色
                    error: colors.deepOrange.accent4, // 暗色模式下使用深橙色表示错误
                    info: colors.lightBlue.darken2, // 暗色模式下深蓝色表示信息
                    success: colors.green.darken3, // 暗色模式下深绿色表示成功
                    warning: colors.amber.darken3, // 暗色模式下深黄色表示警告
                },
            },
        },
    }
})


const pinia = createPinia();
pinia.use(piniaPluginPersist);

let app = createApp(App);
app.use(router).use(vuetify).use(pinia);
app.config.globalProperties.Axios = Axios;
app.mount('#app');