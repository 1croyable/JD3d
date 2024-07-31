<template>
    <div>
        <KeepAlive>
            <div v-if="chooseProperty === '圆角半径'" class="property-editor">
                <label for="from-value" class="input-label text-h5">起始值</label>
                <input id="from-value" v-model="selectedElement.props.params.from" type="text" class="input-box" placeholder="起始值" />
                <canvas ref="arrowCanvas" class="arrow-canvas"></canvas>
                <label for="to-value" class="input-label text-h5">终止值</label>
                <input id="to-value" v-model="selectedElement.props.params.to" type="text" class="input-box" placeholder="结束值" />
            </div>
        </KeepAlive>
    </div>
</template>




<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
    chooseProperty: String,
    selectedElement: Object,
    chooseSO: Object
});

// 获取from值
watch(() => props.chooseProperty, (newVal) => {
    if (newVal === '圆角半径') {
        props.selectedElement.props.params.from = props.chooseSO.corner_radius;
        props.selectedElement.props.params.to = 0;
    }
})

const arrowCanvas = ref(null);

onMounted(async () => {
    await nextTick();
    const canvas = arrowCanvas.value;
    const ctx = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 150;

    // 画箭头：朝下的箭头并带有曲线和波浪线
    ctx.beginPath();
    ctx.moveTo(50, 10);
    ctx.quadraticCurveTo(75, 50, 50, 90);  // 曲线


    // 画波浪线
    ctx.moveTo(50, 90);
    ctx.bezierCurveTo(40, 100, 60, 120, 50, 130);
    ctx.bezierCurveTo(40, 140, 60, 160, 50, 170);

    // 画箭头尖角
    ctx.moveTo(50, 170);
    ctx.lineTo(45, 160);
    ctx.moveTo(50, 170);
    ctx.lineTo(55, 160);

    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 3;
    ctx.stroke();
});
</script>


<style lang="less" scoped>
.property-editor {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-top: 0px;
}

.input-box {
    width: 300px;
    padding: 15px;
    border: 2px solid #ccc;
    border-radius: 10px;
    font-size: 18px;
    transition: border-color 0.3s;
}

.input-box:focus {
    border-color: #007BFF;
    outline: none;
}

.arrow-canvas {
    width: 100px;
    height: 150px;
}
</style>
