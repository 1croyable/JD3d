<!-- <v-btn @click="userInfo">我的洞府</v-btn> -->
<!-- <v-btn @click="openReader">打开阅读器</v-btn> -->
<!-- <v-btn @click="opensrt2excel">SRT->Excel</v-btn>
<v-btn>法方课</v-btn>
<v-btn>文章浏览</v-btn>
<v-btn>关于我们</v-btn> -->
<template>
    <v-app>
        <div ref="app">
            <!-- 应用栏 -->
            <v-app-bar app flat color="transparent">
                <v-toolbar-title>
                    <router-link to="/">
                        <v-img class="mx-16" src="../../public/imgs/logo_final.png" width="130"></v-img>
                    </router-link>
                </v-toolbar-title>
                <div class="d-flex justify-left" style="width: 60vw;">
                    <v-btn class="text-h4 app-bar-button" @click="open3D">设计室</v-btn>
                    <v-btn class="text-h4 app-bar-button" @click="$router.push('/About')">关于我们</v-btn>
                    <v-btn class="text-h4 app-bar-button" @click="$router.push('/Subscription')">订阅方案</v-btn>
                    <v-btn class="text-h4 app-bar-button" @click="$router.push('/Templates')">演示模板</v-btn>
                </div>
                <v-spacer></v-spacer>
                <v-btn v-if="!isAuth" @click="login" class="text-h6 app-bar-button">登录/注册</v-btn>
                <v-btn v-else @click="logout" class="text-h6 app-bar-button">登出</v-btn>
            </v-app-bar>

            <!-- 大图背景和内容 -->
            <v-main>
                <div ref="homeSection" class="elevation-24 home1">
                    <div class="text-left discribe">
                        <h1 class="headline pb-16" style="font-size: 5rem; font-family: bgtxt;">为您打造的3D动画制作平台</h1>
                        <p class="text-h4 text-grey-darken-1 mt-4" style="font-family: 'Roboto Slab', sans-serif;">
                            轻松制作3D动画；丰富多样的模板库任你选择；
                        </p>
                        <p class="text-h4 text-grey-darken-1 mt-4" style="font-family: 'Roboto Slab', sans-serif;">
                            放式的操作，“搭建”你的视频；
                        </p>
                        <p class="text-h4 text-grey-darken-1 mt-4" style="font-family: 'Roboto Slab', sans-serif;">
                            拖多种导出格式，可嵌入网页中；可分享到社交媒体；可用于其他设备；
                        </p>
                        <p class="text-h4 text-grey-darken-1 mt-4" style="font-family: 'Roboto Slab', sans-serif;">
                            AI赋能，图片
                            to 模型，智能属性修改提示......
                        </p>

                        <v-row>
                            <v-col cols="6">
                                <v-btn class="mt-4 text-h5 px-10" color="primary">免费激活您的账户</v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn class="mt-4 text-h5 px-10" color="secondary">计划</v-btn>
                            </v-col>
                        </v-row>
                    </div>
                    <div class="modeliframe">
                        <iframe v-show="isInView" style="height: 80vh; width: 100%;"
                            src="../../public/models/homeModel.html" class="model-frame" frameborder="0"
                            fullscreen></iframe>
                    </div>
                    <div class="jin_tian_ni_xiang">
                        <v-btn class="text-h4 px-10 elevation-2" @click="scrollToNextSection" height="50"
                            rounded>嘿。今天你想设计什么？</v-btn>
                    </div>
                </div>

                <div ref="section2" style="height: 100vh" class="bg-white">
                    <br>
                    <br>
                    <br>
                    <div class="carousel-container mt-10" style="height: 40vh;">
                        <v-carousel cycle interval="1200" hide-delimiters height="200">
                            <v-carousel-item v-for="(image, i) in images" :key="i">
                                <v-sheet class="d-flex align-center justify-center" height="100%" tile>
                                    <v-img :src="image.url" width="200" height="200" cover>
                                        <span class="bg-black px-6 py-2 text-h5 text-yellow">{{ image.name }} </span>
                                    </v-img>
                                </v-sheet>
                            </v-carousel-item>
                        </v-carousel>
                        <p class="text-h4 text-center mt-8" style="font-weight: bold;">选择一个模板，登录后免费开始！</p>
                    </div>
                    <div>
                        <v-container>
                            <v-row>
                                <v-col cols="3" offset="2">
                                    <v-card class="elevation-3 pa-4" outlined height="250">
                                        <v-card-title class="text-h5">
                                            <v-icon class="mr-2" color="orange" size="30">mdi-account</v-icon>
                                            简动3D
                                            <span style="font-weight: bold;"> 免费版</span>
                                        </v-card-title>
                                        <v-divider></v-divider>
                                        <v-card-text class="text-medium-emphasis"
                                            style="height:100px; font-size: 16px; line-height: 20px;">
                                            可以体验所有的基础功能，使用免费模板创建精美动画
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn color="orange" class="text-h5 mt-10" block
                                                variant="outlined">免费使用</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-col>
                                <v-col cols="2">
                                    <div style="width: 100%;
                                height: 100%;">
                                        <p class="text-h5 text-center mt-6" style="font-weight: bold;">根据您的需求完美匹配</p>
                                        <iframe v-show="starIsInView" src="../../public/models/home star.html"
                                            frameborder="0" fullscreen style="width: 100%;
                                        height: 80%;"></iframe>
                                    </div>
                                </v-col>
                                <v-col cols="3">
                                    <v-card class="elevation-3 pa-4" outlined height="250">
                                        <v-card-title class="text-h5">
                                            <v-icon class="mr-2" color="orange" size="25">mdi-diamond</v-icon>
                                            简动3D
                                            <span style="font-weight: bold;">高级版</span>
                                        </v-card-title>
                                        <v-divider></v-divider>
                                        <v-card-text class="text-medium-emphasis"
                                            style="height:100px; font-size: 16px; line-height: 20px;">
                                            在免费版的基础上添加了更多精美模板，允许使用更多AI工具。更大的存储容量。
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn color="orange" class="text-h5 mt-10" block
                                                variant="outlined">查看计划</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-container>
                    </div>
                </div>

                <div :style="ifIsScrolling ? 'opacity: 0;' : 'opacity: 1;'" style="width: 100%; background: linear-gradient(to bottom, white 0%, #AFB42B 100%);">
                    <v-container>
                        <v-row>
                            <div style="width: 100%;" class="d-flex justify-space-between align-center flex-row">
                                <div v-for="(circle, index) in circles" :key="index" class="circle-container"
                                    @mouseover="handleMouseOver(index)" @mouseleave="handleMouseLeave">
                                    <div class="circle"></div>
                                </div>
                            </div>
                            <div class="d-inline bar float-left"></div>
                        </v-row>
                        <v-row class="mt-16">
                            <v-col cols="6">
                                <div v-if="hoverIndex !== null">{{ product_texts[hoverIndex] }}</div>
                                <div v-else>默认文字</div>
                            </v-col>
                            <v-col cols="4" offset="1">
                                <v-img height="300" v-if="hoverIndex !== null"
                                    :src="product_images[hoverIndex]"></v-img>
                                <v-img height="300" v-else src="/imgs/test/5.webp"></v-img>
                            </v-col>
                        </v-row>
                    </v-container>
                </div>

                <!-- 水平滚动容器 -->
                <div class="horizontal-scroll-container"
                    :class="ifcanScrollProduct ? 'overflow-x-auto' : 'overflow-x-hidden'"
                    ref="horizontalScrollContainer">
                    <div class="scroll-item">
                        <div class="product">
                            <div style="transition: opacity 2.0s ease-out, transform 1.5s ease-out;"
                                class="d-flex flex-column justify-center align-center text-white product-content-original"
                                ref="product1">
                                <h1 style="margin-top: 35vh;" class="text-h2 font-weight-medium mb-10 text-black">
                                    简动3D-AI赋能用户友好的3D动画制作平台
                                </h1>
                                <p class="font-weight-black text-black text-h4">---跃动指尖，3D世界任你造</p>
                            </div>
                            <div>12312312312323213123</div>
                        </div>
                    </div>
                    <div class="scroll-item">
                        <div class="product">
                            <div class="d-flex flex-column fill-height text-white">
                                <h1 class="ma-8 text-h2 font-weight-medium mb-4 text-black">
                                    产品亮点
                                </h1>
                                <p class="font-weight-black text-black text-h4">---解决的问题</p>
                                
                            </div>
                        </div>
                    </div>
                    <div class="scroll-item">
                        <div class="product">
                            <div class="d-flex flex-column fill-height justify-center align-center text-white">
                                <h1 class="text-h2 font-weight-medium mb-4 text-black">
                                    同类产品对比
                                </h1>
                                <p class="font-weight-black text-black text-h4">---体现优势</p>
                            </div>
                        </div>
                    </div>
                </div>




                <!-- <v-parallax height="100vh" width="100%" src="/imgs/3051704796281_.pic.jpg">
                <div style="margin-left: 16vw"
                    class="d-flex flex-column fill-height justify-center align-left text-white">
                    <div class="text-h4 font-weight-medium mb-4">
                        <p style="font-size: 70px;" class="font-weight-black">简介</p>
                    </div>
                    <div class="subheading">
                        <br>
                        <p style="font-size:25px" class="font-weight-black">为您介绍微电网的数字化管理进程</p>
                        <p style="font-size:25px" class="font-weight-black">作为数字孪生平台，我们旨在为您提供监测、管理微电网最简单且实用的工具</p>
                        <p style="font-size:25px" class="font-weight-black">我们提升了微电网管理周期各方面的表现，链接微电网中的各个数据电并使其模块化</p>
                    </div>
                </div>
            </v-parallax> -->

                <div v-show="ifCanShowUsage"
                    style="width:99vw;border-left: 4px solid black;border-right: 4px solid black">
                    <v-stepper class="elevation-0 px-10" height="400px"
                        :items="['Connection', 'Constraction', 'Operation', 'Usage']"
                        style="font-size: 35px;margin-left:20px;margin-right:20px;">
                        <template v-slot:item.1>
                            <v-card style="font-size: 20px;" flat>
                                <v-card-title class="text-h4">连接</v-card-title>
                                <v-card-text class="text-h5">
                                    实时可用的网络建模工具可针对您的微电网设计进行最细节的表现
                                </v-card-text>
                            </v-card>
                        </template>

                        <template v-slot:item.2>
                            <v-card style="margin-left:25vw;font-size: 20px;" flat>
                                <v-card-title class="text-h4">建造</v-card-title>
                                <v-card-text class="text-h5">
                                    与利益相关者最直接的连接，通过项目统一进程进行数字化管理和预测
                                </v-card-text>
                            </v-card>
                        </template>

                        <template v-slot:item.3>
                            <v-card style="margin-left:60vw;font-size: 20px;" flat>
                                <v-card-title class="text-h4">运营</v-card-title>
                                <v-card-text class="text-h5">
                                    高效且迅速地投入使用
                                </v-card-text>
                            </v-card>
                        </template>

                        <template v-slot:item.4>
                            <v-card style="font-size: 20px;text-align: right;" flat>
                                <v-card-title class="text-h4" style="margin-right: 15px;">使用</v-card-title>
                                <v-card-text class="text-h5">
                                    开始实践您的想法！
                                </v-card-text>
                            </v-card>
                        </template>
                    </v-stepper>
                    <canvas ref="jd3D_use" width="800" height="200"></canvas>
                    <br>
                    <div class="mb-1" style="width: 100vw;height: 0.1vh; background-color: black;"></div>

                    <div class="mb-1" style="width: 100vw;height: 0.2vh; background-color: black;"></div>

                    <div class="mb-1" style="width: 100vw;height: 0.4vh; background-color: black;"></div>

                    <div class="mb-1" style="width: 100vw;height: 0.6vh; background-color: black;"></div>

                    <div class="mb-1" style="width: 100vw;height: 0.8vh; background-color: black;"></div>

                    <div class="mb-1" style="width: 100vw;height: 1vh; background-color: black;"></div>
                </div>
            </v-main>
        </div>

    </v-app>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import vertify from '../../methods/vertify';

const isAuth = ref(null);
const section2 = ref(null);
const homeSection = ref(null); // 添加ref
const jd3D_use = ref(null);
const product1 = ref(null);
const isInView = ref(false); // 定义变量
const starIsInView = ref(true);

let observer, observer2, animationObserver1;

const images = [
    {
        url: '/imgs/视频模板/白幕.png',
        name: '白幕',
    },
    {
        url: '/imgs/视频模板/黑幕.png',
        name: '黑幕',
    },
    {
        url: '/imgs/视频模板/官网宣传片.png',
        name: '官网宣传片',
    }
];

function scrollToNextSection() {
    section2.value.scrollIntoView({ behavior: 'smooth' });
}

const horizontalScrollContainer = ref(null);
const app = ref(null);
const bottom = ref(0);

onMounted(async () => {
    vertify().then((res) => {
        isAuth.value = res;
    });

    nextTick().then(() => {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    isInView.value = true;
                } else {
                    isInView.value = false;
                }
            });
        }, {
            threshold: 0.1 // 10%可见时触发
        });

        observer2 = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    starIsInView.value = true;
                } else {
                    starIsInView.value = false;
                }
            });
        }, {
            threshold: 0.1 // 10%可见时触发
        });

        animationObserver1 = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('product-content-original')
                    entry.target.classList.add('product1-animate');
                }
            });
        }, {
            threshold: 0.9
        });

        observer.observe(homeSection.value);
        observer2.observe(section2.value);
        animationObserver1.observe(product1.value);

        bottom.value = app.value.offsetHeight;
        // 负责开关滑动
        window.addEventListener('scroll', handleWindowScroll);
        // 负责处理横向滚动
        window.addEventListener('wheel', handleWindowWheel, { passive: false });
    });

    const font = new FontFace('hkh', 'url(/fonts/huangkaihuaLawyerfont-2.ttf)');

    await font.load();
    document.fonts.add(font);

    const canvas = jd3D_use.value;
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 200;

    ctx.font = '50px hkh';

    ctx.fillText('简动3D的用法', 100, 70);

    ctx.beginPath();
    ctx.moveTo(100, 90);
    for (let i = 100; i <= 400; i += 20) {
        ctx.quadraticCurveTo(i + 10 + Math.random() * 10, 110 + Math.random() * 10, i + 20 + Math.random() * 10, 90);
    }
    ctx.stroke();
});

onBeforeUnmount(() => {
    if (observer) {
        observer.disconnect();
    }
    if (observer2) {
        observer2.disconnect();
    }
    if (animationObserver1) {
        animationObserver1.disconnect();
    }
    window.removeEventListener('scroll', handleWindowScroll);
    window.removeEventListener('wheel', handleWindowWheel);
});

const router = useRouter();

const openReader = () => {
    window.location.href = '/readerIndex';
};
const open3D = () => {
    window.location.href = '/3D';
};
const opensrt2excel = () => {
    window.location.href = 'srt2excel';
};

const login = () => {
    router.push('/login');
};

const userInfo = () => {
    router.push('/userInfo');
};

const logout = () => {
    localStorage.removeItem('auth');
    sessionStorage.removeItem('auth');
    isAuth.value = false;
    router.push('/');
};



//  滑动处理的状态
const ifcanScrollProduct = ref(false);
const ifIsScrolling = ref(false);
const ifCanShowUsage = ref(false);
let ifBottom = false;

// 滑动处理函数
const handleWindowScroll = () => {
    if ((window.innerHeight + window.scrollY) >= bottom.value) {
        ifcanScrollProduct.value = true;
        ifIsScrolling.value = true;
    } else {
        ifcanScrollProduct.value = false;
    }
};

// setInterval(() => {
//     console.log('window.innerHeight + window.scrollY', window.innerHeight + window.scrollY);
//     console.log('bottom.value', bottom.value)
// }, 1000);

const handleWindowWheel = (event) => {
    if (ifIsScrolling.value === true || ifBottom === true) {
        const container = horizontalScrollContainer.value;
        const { scrollLeft, scrollWidth, clientWidth } = container;

        if (scrollLeft === 0 && event.deltaY < 0) {
            ifIsScrolling.value = false;
            ifBottom = false;
            // 在左边向上滑
            return;
        } else if (scrollLeft === 0 && event.deltaY > 0) {
            // 在左边向下滑
            event.preventDefault();
            container.scrollLeft += event.deltaY;
        } else if (scrollLeft > 0 && scrollLeft < scrollWidth - clientWidth && event.deltaY > 0) {
            // 在中间向下滑
            event.preventDefault();
            container.scrollLeft += event.deltaY;
        } else if (scrollLeft !== 0 && scrollLeft < scrollWidth - clientWidth && event.deltaY < 0) {
            // 在中间向上滑
            event.preventDefault();
            container.scrollLeft += event.deltaY;
        } else if (scrollLeft === scrollWidth - clientWidth && event.deltaY > 0) {
            // 在右边向下滑
            ifCanShowUsage.value = true;
            ifBottom = true;
            return;
        } else if (scrollLeft === scrollWidth - clientWidth && event.deltaY < 0) {
            if (window.innerHeight + window.scrollY <= bottom.value && window.innerHeight + window.scrollY > bottom.value - 1) {
                event.preventDefault();

                container.scrollLeft += event.deltaY;
            } else if (window.innerHeight + window.scrollY < bottom.value + 100) {
                event.preventDefault();
                container.scrollIntoView({ block: 'end' });
                ifCanShowUsage.value = false;
            }
        }

        if (window.innerHeight + window.scrollY < bottom.value + 200 && ifBottom === true) {
            container.scrollIntoView({ block: 'end' });
            ifCanShowUsage.value = false;
        }
    }
};

// 切换产品介绍的图片和文字
const hoverIndex = ref(null);
const circles = ref([1, 2, 3, 4]); // 可以根据需要修改
const product_texts = ref(["文字1", "文字2", "文字3", "文字4"]);
const product_images = ref(["/imgs/test/1.webp", "/imgs/test/2.webp", "/imgs/test/3.webp", "/imgs/test/4.webp"]);

const handleMouseOver = (index) => {
    hoverIndex.value = index;
};

const handleMouseLeave = () => {
    hoverIndex.value = null;
};
</script>


<style lang="less" scoped>
@font-face {
    font-family: 'bgtxt';
    src: url('/fonts/白鸽天行体.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: 'hkh';
    src: url('/fonts/huangkaihuaLawyerfont-2.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
}

.home1 {
    height: 90vh;
    position: relative;
    border-bottom-right-radius: 5%;
    border-bottom-left-radius: 5%;
    background: url('/imgs/bg/home bg.png') no-repeat center center;
    background-size: cover;
}

.discribe {
    width: 45vw;
    height: 66vh;
    position: absolute;
    top: 10%;
    left: 10%;
    display: flex;
    justify-content: left;
    align-items: start;
    flex-direction: column;
    padding: 2%;
    box-shadow: 0 10px 8px rgba(0, 0, 0, 0.1);
    /* 毛玻璃效果 */
    border-radius: 8px;
    z-index: 20;
    /* 圆角 */
}

.modeliframe {
    position: absolute;
    width: 50vw;
    right: 80px;
    z-index: 10;
}

.v-application--is-ltr .v-application--wrap {
    padding-top: 0;
}

.v-app-bar {
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.7);
}

.content {
    position: relative;
    z-index: 1;
    padding: 50px;
    color: white;
    text-align: center;
}

.jin_tian_ni_xiang {
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
}

.model-frame {
    width: 100%;
    height: 60vh;
    border: none;
}

.carousel-container {
    padding: 20px;
    max-width: 50%;
    margin: 0 auto;
}

.horizontal-scroll-container {
    display: flex;
    flex-direction: row;
    white-space: nowrap;
    /* 禁止换行 */
    overflow-x: scroll;
    /* 允许水平滚动 */
    scrollbar-width: none;
    /* 隐藏 Firefox 中的滚动条 */
}

.horizontal-scroll-container::-webkit-scrollbar {
    display: none;
    /* 隐藏 Chrome、Safari 和 Opera 中的滚动条 */
}

.scroll-item {
    width: 100vw;
    flex-shrink: 0;
    /* 防止元素缩小 */
}

.product {
    background: linear-gradient(to bottom, #AFB42B, #9E9D24, white);
    height: 100vh;
    width: 100%;
}

.product-content-original {
    opacity: 0;
    transform: translateY(20px);
}

.product1-animate {
    opacity: 1;
    transform: translateY(0);
}

@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.bar {
    margin-left: 2%;
    width: 96%;
    height: 10px;
    background: linear-gradient(90deg, #93cd0d, #acbc2d, #ff8c00, #ff4500);
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
}

.circle-container {
    position: relative;
    display: inline-block;
    width: 70px;
    height: 70px;
    top: 50%;
}

.circle {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle, #d0ff00 0%, #5f800d 100%);
    transition: all 0.3s ease;
    position: relative;

    &::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: white;
        transform: translate(-50%, -50%);
        z-index: 20;
        transition: all 0.3s ease;
    }

    &::after {
        content: "\F06E4";
        /* mdi-eye icon unicode */
        font-family: "Material Design Icons";
        position: absolute;
        top: 50%;
        left: 50%;
        font-size: 0;
        /* 初始状态下隐藏图标 */
        color: transparent;
        transform: translate(-50%, -50%);
        z-index: 30;
        transition: all 0.3s ease;
    }

    .circle-container:hover & {
        width: 55px;
        height: 55px;
        margin: 7.5px;
    }

    .circle-container:hover &::before {
        width: 55px;
        height: 55px;
        background-color: transparent;
    }

    .circle-container:hover &::after {
        font-size: 35px;
        color: white;
    }
}

.noScrollBar::-webkit-scrollbar {
    display: none;
}
</style>
