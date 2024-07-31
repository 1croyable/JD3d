<template>
    <canvas ref="canvasRef" width="400" height="100"></canvas>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useUIBStore } from '../../../public/stores/userInfo_btns';

const props = defineProps({
    newName: String,
    oldName: String,
})

const UIBStore = useUIBStore();

let canvas, ctx;

watch(() => props.newName, (newValue, oldValue) => {
    if (newValue === '') {
        name.value = ' ';
    }
    else {
        name.value = newValue;
    }
    if(ctx){
        drawArrow(ctx);
    }
})

const name = ref(' ');

const canvasRef = ref(null);

onMounted(async () => {
    await nextTick();
    canvas = canvasRef.value;

    ctx = canvas.getContext('2d');

    drawArrow(ctx);
});

function drawArrow(ctx) {
    // 清空画布
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 绘制文字
    ctx.font = '20px Kaiti';
    ctx.fillText(props.oldName, 50, 22);

    // 绘制箭头
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineTo(76, 30);
    ctx.lineTo(76, 36);
    ctx.lineTo(77, 39);
    ctx.lineTo(78, 40);
    ctx.lineTo(79, 43);
    ctx.lineTo(78, 45);
    ctx.lineTo(79, 48);
    ctx.lineTo(79, 49);
    ctx.lineTo(80, 50);
    ctx.stroke();

    ctx.moveTo(100, 50);
    ctx.beginPath();
    ctx.arc(100, 50, 20, Math.PI / 2 - Math.PI / 10, Math.PI);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.moveTo(100 + 20 * Math.cos(Math.PI / 2 - Math.PI / 10), 50 + 20 * Math.sin(Math.PI / 2 - Math.PI / 10));
    ctx.lineTo(100 + 20 * Math.cos(Math.PI / 2 - Math.PI / 10) - 5, 50 + 20 * Math.sin(Math.PI / 2 - Math.PI / 10) - 4);
    ctx.lineTo(100 + 20 * Math.cos(Math.PI / 2 - Math.PI / 10) - 12, 50 + 20 * Math.sin(Math.PI / 2 - Math.PI / 10) - 6);
    ctx.moveTo(100 + 20 * Math.cos(Math.PI / 2 - Math.PI / 10), 50 + 20 * Math.sin(Math.PI / 2 - Math.PI / 10));
    ctx.lineTo(100 + 20 * Math.cos(Math.PI / 2 - Math.PI / 10) - 6, 50 + 20 * Math.sin(Math.PI / 2 - Math.PI / 10) + 8);
    ctx.stroke();

    //绘制新的名称
    ctx.font = '20px KaiTi';
    ctx.fillText(name.value, 150, 70)
}
</script>

<style scoped>
canvas {
    width: 100%;
    height: auto;
}
</style>
