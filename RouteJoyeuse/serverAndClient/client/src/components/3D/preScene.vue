<template>
    <div ref="sceneContainer" style="width: 58vw; height: 58vh; position: absolute; top:0; right:0;"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, toRaw } from 'vue';
import * as THREE from 'three';
import { useScene } from '../../../public/stores/3D/scene';
import { useAnimation } from '../../../public/stores/3D/animation';
import * as TWEEN from '@tweenjs/tween.js';

const sceneStore = useScene();
const animationStore = useAnimation();

// 引用容器元素
const sceneContainer = ref(null);

onMounted(() => {
    watch(() => sceneStore.renderAction, () => {
        if (sceneStore.renderAction === 1) {
            init();
            animate();
        }
    })
});

onBeforeUnmount(() => {
    toRaw(sceneStore.renderers[sceneStore.choisiRenderer + 1]).dispose();
});

function init() {
    const canvas = toRaw(sceneStore.renderers[sceneStore.choisiRenderer + 1]).domElement

    animationStore.canvasRecorder = new MediaRecorder(canvas.captureStream(), { mimeType: 'video/webm' })
    animationStore.canvasRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            animationStore.recordedBlobs.push(event.data);
        }
    }
    animationStore.canvasRecorder.onstop = (event) => {
        console.log('Recorded Blobs: ', animationStore.recordedBlobs);
    };

    sceneContainer.value.appendChild(canvas);

    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);

    toRaw(sceneStore.renderers[sceneStore.choisiRenderer + 1]).render(toRaw(sceneStore.scenes[sceneStore.choisiScene]), toRaw(sceneStore.cameras[sceneStore.choisiCamera + 1]));

    if (sceneStore.ifRenderPreControls === true) {
        toRaw(sceneStore.preControl).update();
    }
    if (animationStore.timeline !== null && animationStore.playingStatus === 'play') {
        animationStore.timeline.update();
    }
}

function onWindowResize() {
    toRaw(sceneStore.scenes[sceneStore.choisiScene]).aspect = window.innerWidth / window.innerHeight;
    toRaw(sceneStore.cameras[sceneStore.choisiCamera + 1]).updateProjectionMatrix();
    toRaw(sceneStore.renderers[sceneStore.choisiRenderer + 1]).setSize(window.innerWidth * 60 / 100, window.innerHeight * 60 / 100);
}
</script>

<style lang="less" scoped></style>