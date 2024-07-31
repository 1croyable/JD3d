<template>
    <div>
        <!-- 背景 -->
        <iframe frameborder="0" fullscreen src="../../public/models/About.html" width="100%" height="100%"
            style="z-index: -2; position: absolute; top: 0; left: 0; border: none; overflow: hidden;"></iframe>
        <iframe frameborder="0" fullscreen src="../../public/models/hands.html" width="110%" height="110%"
            style="z-index: -1; position: absolute; bottom: -18vh; right: -30vw; border: none; overflow: hidden;"></iframe>
        <iframe class="fadeIn" ref="iframe" frameborder="0" fullscreen src="../../public/models/logoCube.html"
            width="140%" height="140%"
            style="z-index: -1; position: absolute; bottom: -12vh; right: -22vw; border: none; overflow: hidden; opacity: 0;"></iframe>
        <!-- 导航栏 -->
        <div class="ml-16 mt-6 d-flex justify-start align-center flex-nowrap" id="nav">
            <div style="width: 75px; height: 75px;">
                <v-card image="../../public/imgs/logo_final.png" class="logo"></v-card>
            </div>
            <div class="d-flex bg-grey-darken-3 ga-1 align-center pl-2 pr-1" style="height: 42px; border-radius: 10px;">
                <v-btn class="bg-grey-darken-3 text-h4 btn-border">我们的初衷</v-btn>
                <v-btn class="bg-grey-darken-3 text-h4 btn-border">我们的团队</v-btn>
                <v-btn class="bg-grey-darken-3 text-h4 btn-border">解决方案</v-btn>
                <v-btn class="bg-grey-darken-3 text-h4 btn-border">Q&A</v-btn>
            </div>
            <div class="d-flex justify-end pr-16" style="width: 100%;">
                <canvas width="200" height="80" ref="canvas"></canvas>
            </div>
        </div>
    </div>
    <!-- 左下角 -->
    <div class="bottom-left " ref="textLeftBottom">
        <p class="text-white ">AI赋能用户友好的3D动画制作平台</p>
        <p class="text-white " style="font-size: 38px; margin-left: 15vw;">——跃动指尖，3D世界任你造！</p>
    </div>
    <!-- 内容主体 -->
    <div ref="animatedBlock" class="animated-block animate__animated animate__bounceInLeft">
        <p class="my-16">你好！这是一个3D动画制作平台</p>
        <p>你是否<span class="text-yellow">想做3D动画</span>？</p>
        <p><span class="text-h3">但</span><span class="text-yellow">苦于没时间？资金有限</span></p>
        <p>我们来帮您<span class="text-yellow">用极其用户友好的方式</span>实现你的构想</p>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import 'animate.css';

const textLeftBottom = ref(null);

const canvas = ref(null);

const iframe = ref(null);

const animatedBlock = ref(null);

onMounted(async () => {
    await nextTick();

    setTimeout(() => {
        iframe.value.style.opacity = 1;
    }, 3000);

    setTimeout(() => {
        textLeftBottom.value.style.opacity = 1;
    }, 2000);

    // 触发色块的飞入效果
    animatedBlock.value.classList.add('animate__bounceInLeft');

    const ctx = canvas.value.getContext('2d');
    const font = new FontFace('hkh', 'url(/fonts/huangkaihuaLawyerfont-2.ttf)');

    await font.load();
    document.fonts.add(font);

    ctx.font = '20px hkh';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let time = 0;

    const drawWave = () => {
        ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

        // Set background color
        ctx.fillStyle = '#000000'; // background color
        ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);

        // Draw text
        ctx.fillStyle = 'white';
        ctx.fillText('联系我们', canvas.value.width / 2, canvas.value.height / 2);

        // Draw first wave border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const amplitude1 = 2;
        const frequency1 = 0.1;
        const offset = 10;

        for (let x = offset; x <= canvas.value.width - offset; x++) {
            const y = amplitude1 * Math.sin((x + time) * frequency1) + offset;
            if (x === offset) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        for (let y = offset; y <= canvas.value.height - offset; y++) {
            const x = amplitude1 * Math.sin((y + time) * frequency1) + canvas.value.width - offset;
            ctx.lineTo(x, y);
        }

        for (let x = canvas.value.width - offset; x >= offset; x--) {
            const y = amplitude1 * Math.sin((x + time) * frequency1) + canvas.value.height - offset;
            ctx.lineTo(x, y);
        }

        for (let y = canvas.value.height - offset; y >= offset; y--) {
            const x = amplitude1 * Math.sin((y + time) * frequency1) + offset;
            ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.stroke();

        // Draw second wave border
        ctx.beginPath();

        const amplitude2 = 6;
        const frequency2 = 0.05;

        for (let x = offset; x <= canvas.value.width - offset; x++) {
            const y = amplitude2 * Math.sin((x + time) * frequency2) + offset;
            if (x === offset) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        for (let y = offset; y <= canvas.value.height - offset; y++) {
            const x = amplitude2 * Math.sin((y + time) * frequency2) + canvas.value.width - offset;
            ctx.lineTo(x, y);
        }

        for (let x = canvas.value.width - offset; x >= offset; x--) {
            const y = amplitude2 * Math.sin((x + time) * frequency2) + canvas.value.height - offset;
            ctx.lineTo(x, y);
        }

        for (let y = canvas.value.height - offset; y >= offset; y--) {
            const x = amplitude2 * Math.sin((y + time) * frequency2) + offset;
            ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.stroke();

        time += 1;
        requestAnimationFrame(drawWave);
    };

    drawWave();
});
</script>

<style lang="less" scoped>
@font-face {
    font-family: 'yz';
    src: url('../../public/fonts/YeZiGongChangXiXiFuSiTi-2.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
}

.animated-block {
    position: absolute;
    left: 0;
    top: 25%;
    width: 50vw;
    height: 40vh;
    background-color: rgba(128, 128, 128, 0.4);
    border-radius: 10px;
    box-shadow: inset 0 0 10px #000000;
    color: white;

    font-size: 2rem;
    text-align: center;
    backdrop-filter: blur(5px);
    z-index: 5;
}

.animate__animated.animate__fadeInLeft {
    animation-name: fadeInLeft;
    animation-duration: 1s;
    animation-timing-function: ease-in-out;
}


.logo {
    border-radius: 10px;
    box-shadow: inset 0 0 10px #000000;
    width: 75px;
    height: 75px;
}

.btn-border {
    border: 2px solid rgb(148, 148, 148);
}

.bottom-left {
    font-family: yz;
    position: absolute;
    bottom: 10vh;
    left: 8vw;
    font-size: 45px;
    transition: opacity 1.5s ease-in-out;
    opacity: 0;
}

.fadeIn {
    transition: opacity 1s ease-in-out;
}
</style>