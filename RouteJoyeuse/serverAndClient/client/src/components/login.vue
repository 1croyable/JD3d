<template>
    <v-app width="100%" height="100%" class="bg-lime-darken-1">
        <v-container>
            <v-row class="ma-0 pa-0 vRow" justify="space-around">
                <v-col cols="5">
                    <v-card style="overflow-y: auto;" @mouseenter="stopAnimation" @mouseleave="startAnimation"
                        :width="vCardWidth" :height="vCardHeight" :class="vCardClass">
                        <div v-if="!ifReg">
                            <div class="font-weight-bold text-h5 ma-2 pl-16">
                                Se connecter pour découvrir "Route Joyeuse"
                                <v-icon class="pl-5">mdi-lightbulb-on</v-icon>
                            </div>

                            <v-img style="border: 3px solid black;" height="30vh"
                                src="../../public/imgs/bg/login_img1.png" cover class="mb-5"></v-img>
                        </div>
                        <div v-else>
                            <div class="font-weight-bold text-h5 ma-2 pl-16">
                                Inscrivez-vous pour commencer votre voyage
                                <v-icon class="pl-5">mdi-star</v-icon>
                            </div>
                            <v-img style="border: 3px solid black;" height="30vh"
                                src="../../public/imgs/bg/login_2.webp" cover class="mb-5"></v-img>
                        </div>

                        <!-- 登录 -->
                        <v-card-text v-show="!ifReg" key="login-form">
                            <v-form ref="loginForm" v-model="loginFormValid">
                                <v-text-field v-model="login_info.username" label="Nom"
                                    :rules="[v => !!v || 'Nom requis']">
                                </v-text-field>

                                <v-text-field
                                    v-model="login_info.password" :type="showPassword_login ? 'text' : 'password'"
                                    :append-icon="showPassword_login ? 'mdi-eye' : 'mdi-eye-off'"
                                    @click:append="showPassword_login = !showPassword_login" label="Mot de passe"
                                    :rules="[v => !!v || 'Mot de passe requis']">
                                </v-text-field>

                                <br>

                                <v-row>
                                    <v-col cols="12" offset="1">
                                        <canvas width="162" height="40" ref="seConnecterCanvas"></canvas>
                                        <v-btn @click="login" :disabled="!loginFormValid" icon="mdi-login"></v-btn>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col align-self="stretch" cols="6" offset="3">
                                        <v-checkbox class="text-teal-darken-2 text-h4" width="100%" v-model="rememberMe"
                                            style="display: inline-block;"
                                            label="Se souvenir de moi (pour trois jours)"></v-checkbox>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" align-self="center">
                                        <v-btn icon="mdi-cursor-default-click-outline"
                                            class="ml-5 mr-7 text-h4 bg-black rounded-xl rounded-be-0"
                                            @click="ifReg = true"></v-btn>
                                        <span style="font-family: cursive;"
                                            class="text-h5 text-teal-darken-2 px-5">Obtenez
                                            votre compte gratuitement</span>
                                    </v-col>
                                </v-row>
                            </v-form>

                            <v-alert v-if="is_error === true" color="#C51162" theme="dark" class="text-h5 mt-4"
                                height="30" border>
                                <v-icon>mdi-alert-box</v-icon>
                                {{ msg_login }}
                            </v-alert>
                        </v-card-text>

                        <!-- 登录成功对话框 -->
                        <v-dialog v-model="showLoginSuccessDialog" persistent max-width="300px">
                            <v-card color="lime-darken-3">
                                <v-card-title class="text-center justify-center py-6 text-h4">登录成功</v-card-title>
                                <h3 class="text-center justify-center py-6">即将跳转到主页。</h3>
                            </v-card>
                        </v-dialog>

                        <!-- 注册 -->
                        <v-card-text v-show="ifReg" key="register-form">
                            <v-form ref="regForm" v-model="regFormValid">
                                <v-text-field v-model="reg_info.username" label="Nom" :rules="[v => !!v || 'Nom requis',
                                v => !v.includes(' ') || 'Nom ne peut pas contenir d\'espace']">
                                </v-text-field>

                                <v-text-field v-model="reg_info.password" :type="showPassword ? 'text' : 'password'"
                                    label="Mot de passe" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                    @click:append="showPassword = !showPassword" :rules="[
                                        v => !!v || 'Mot de passe requis',
                                        v => v && v.length >= 8 || 'Le mot de passe doit contenir au moins 8 caractères',
                                    ]">
                                </v-text-field>

                                <v-text-field v-model="reg_info.password_confirmation"
                                    :type="showPassword ? 'text' : 'password'"
                                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                    @click:append="showPassword = !showPassword" label="Confirmer le mot de passe"
                                    :rules="[
                                        v => !!v || 'Confirmation du mot de passe requise',
                                        v => v === reg_info.password || 'Les mots de passe ne correspondent pas'
                                    ]">
                                </v-text-field>

                                <v-btn style="display: block;" @click="reg" :disabled="!regFormValid"
                                    class="text-h4 bg-black rounded-xl rounded">
                                    Enregistrer
                                </v-btn>
                                <v-btn v-show="ifReg === true" class="text-h5 bg-black rounded-xl rounded my-5"
                                    @click="ifReg = false">
                                    <v-icon class="px-4">mdi-check</v-icon>
                                    Vous avez déjà un compte ? Connectez-vous en cliquant ici.
                                </v-btn>
                            </v-form>
                            <v-alert v-if="is_error === true" color="#C51162" theme="dark" class="text-h5 mt-4"
                                height="30" border>
                                <v-icon>mdi-alert-box</v-icon>
                                {{ msg_reg }}
                            </v-alert>
                        </v-card-text>

                        <!-- 注册成功对话框 -->
                        <v-dialog v-model="showRegSuccessDialog" persistent max-width="300px">
                            <v-card color="lime-darken-3">
                                <v-card-title class="text-center justify-center py-6 text-h4">注册成功</v-card-title>
                                <h3 class="text-center justify-center py-6">返回登录界面</h3>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn text @click="gotoLogin">确定</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                        <v-progress-linear indeterminate v-show="is_loading"></v-progress-linear>
                    </v-card>
                </v-col>
                <v-col cols="7">
                    <div height="100vh" width="100%">
                        <login_three></login_three>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </v-app>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import login_three from './login_three.vue';
import { computed } from 'vue';
import { onUnmounted } from 'vue';

// 快捷键enter
onMounted(() => {
    const handleKeyUp = (event) => {
        if (event.key === 'Enter' && login_info.password !== '' && login_info.username !== '') {
            login()
        }
    }
    window.addEventListener('keyup', handleKeyUp)

    onUnmounted(() => {
        window.removeEventListener('keyup', handleKeyUp)
    })
})

//表单ref
const loginForm = ref(null);
const regForm = ref(null);
const loginFormValid = ref(false);
const regFormValid = ref(false);

//切换登录,注册
const ifReg = ref(false);

//错误输出
const msg_login = ref('');
const msg_reg = ref('');

//状态变量
const is_error = ref(false);
const is_loading = ref(false);
const showPassword = ref(false);
const showPassword_login = ref(false);

//对话框控制变量
const showRegSuccessDialog = ref(false);
const showLoginSuccessDialog = ref(false);
const router = useRouter();

//记住我
const rememberMe = ref(false);

watch(is_error, (newValue, oldValue) => {
    if (newValue === true) {
        setTimeout(() => {
            is_error.value = false;
        }, 3000);
    }
});

const reg_info = ref({
    username: '',
    password: '',
    password_confirmation: ''
})

const login_info = ref({
    username: '',
    password: ''
})

const reg = async () => {
    try {
        is_loading.value = true;
        msg_reg.value = '';
        is_error.value = false;

        const response = await axios.post('/api/register', reg_info.value);
        afterReg();
    } catch (error) {
        if (error.response) {
            msg_reg.value = error.response.data.message + '，请重试';
            is_error.value = true;
            is_loading.value = false;
        } else if (error.request) {
            msg_reg.value = error.request + '，请重试';
            is_error.value = true;
            is_loading.value = false;
        } else {
            msg_reg.value = '未知错误，请重试';
            is_error.value = true;
            is_loading.value = false;
        }
    }
}


const login = async () => {
    try {
        is_loading.value = true;
        msg_login.value = '';
        is_error.value = false;

        const login_route = {
            username: login_info.value.username,
            password: login_info.value.password,
            remember: rememberMe.value
        }

        const response = await axios.post('/api/login', login_route);

        afterLogin(response);
    } catch (error) {
        if (error.response) {
            msg_login.value = error.response.data.message + '，请重试';
            is_error.value = true;
            is_loading.value = false;
        } else if (error.request) {
            msg_login.value = error.request + '，请重试';
            is_error.value = true;
            is_loading.value = false;
        } else {
            msg_login.value = '未知错误，请重试';
            is_error.value = true;
            is_loading.value = false;
        }
    }
}

const afterLogin = (response) => {
    is_loading.value = false;
    showLoginSuccessDialog.value = true;

    if (rememberMe.value) {
        localStorage.setItem('auth', JSON.stringify({ token: response.data.token }));
    } else {
        sessionStorage.setItem('auth', JSON.stringify({ "userID": login_info.value.username }));
    }

    setTimeout(() => router.push('/'), 2000);
};


const afterReg = () => {
    is_loading.value = false;
    showRegSuccessDialog.value = true
}

const gotoLogin = () => {
    showRegSuccessDialog.value = false;
    ifReg.value = false;
}

//画布
const seConnecterCanvas = ref(null);

onMounted(() => {
    draw();
})

const draw = () => {
    let canvas = seConnecterCanvas.value;
    let ctx = canvas.getContext("2d");
    //画一条不规则的波浪线0
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(0, 30, 20, 30);
    ctx.quadraticCurveTo(20, 30, 30, 34);
    ctx.quadraticCurveTo(35, 35, 38, 33);
    ctx.quadraticCurveTo(70, 30, 85, 25);
    ctx.quadraticCurveTo(130, 15, 160, 25);
    ctx.lineTo(150, 15);
    ctx.lineTo(160, 25);
    ctx.lineTo(148, 30);
    //写字 se connectrer
    ctx.font = "15px Arial";
    ctx.fillStyle = "gray";
    ctx.rotate(-0.12);
    ctx.fillText("se connecter", 15, 25);
    ctx.stroke();
}

let num = ref(0);
let plus = true;
const vCardClass = computed(() => ("px-5 ma-2  animate__animated animate__bounceInLeft elevation-" + num.value));
let t = null;
t = setInterval(() => {
    if (plus) {
        num.value += 1;
        if (num.value === 24)
            plus = false;
    }
    else {
        num.value -= 1;
        if (num.value === 0)
            plus = true;
    }
}, 50);
const vCardWidth = computed(() => (98 + (num.value / 24) * 2 + "%"));
const vCardHeight = computed(() => (97 + (num.value / 24) * 1 + "vh"));
const stopAnimation = () => {
    clearInterval(t);
};

const startAnimation = () => {
    t = setInterval(() => {
        if (plus) {
            num.value += 1;
            if (num.value === 24) plus = false;
        } else {
            num.value -= 1;
            if (num.value === 0) plus = true;
        }
    }, 50);
};

onUnmounted(() => {
    clearInterval(t);
})
</script>

<style lang="less" scoped>
.v-locale--is-ltr {
    margin: 0;
    padding: 0;
    width: 100vw;
}

.v-col {
    padding: 0;
}

.vRow {
    width: 100vw;
}

.v-input--horizontal {
    width: 95%;
}
</style>