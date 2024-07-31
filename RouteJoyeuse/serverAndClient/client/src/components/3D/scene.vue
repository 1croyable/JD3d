<template>
    <div ref="sceneContainer" style="width: 100vw; height: 100vh;"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, toRaw } from 'vue';
import * as THREE from 'three';
import { useScene } from '../../../public/stores/3D/scene';
import { useAnimation } from '../../../public/stores/3D/animation';
import * as TWEEN from '@tweenjs/tween.js';

const sceneStore = useScene();
const animationStore = useAnimation();

let emit = defineEmits(['finish'])

let clock, delta;

// 引用容器元素
const sceneContainer = ref(null);

onMounted(() => {
    watch(() => sceneStore.renderAction, () => {
        if (sceneStore.renderAction === 1) {
            clock = new THREE.Clock();
            clock.start();
            init();
            animate();
        }
    })
});

onBeforeUnmount(() => {
    toRaw(sceneStore.renderers[sceneStore.choisiRenderer]).dispose();
});

function init() {
    sceneContainer.value.appendChild(toRaw(sceneStore.renderers[sceneStore.choisiRenderer]).domElement);

    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);

    delta = clock.getDelta();

    TWEEN.update();
    toRaw(sceneStore.renderers[sceneStore.choisiRenderer]).render(toRaw(sceneStore.scenes[sceneStore.choisiScene]), toRaw(sceneStore.cameras[sceneStore.choisiCamera]));

    if (sceneStore.ifRenderControls) {
        toRaw(sceneStore.controls).update();
    }
    if (sceneStore.ifRenderTempControl) {
        toRaw(sceneStore.tempColtrol).update();
    }

    if (animationStore.mixer) {
        ++animationStore.count;

        if (animationStore.count === 1) {
            animationStore.mixer.time = 0;
        }

        toRaw(animationStore.mixer).update(delta);

        if (!animationStore.mixer || animationStore.mixer.time >= animationStore.longestTrackTime / 1000) {
            if (sceneStore.drawLine) {
                toRaw(sceneStore.scenes[sceneStore.choisiScene]).add(toRaw(sceneStore.drawLine));
            }
            emit('finish');
        }
    }

    // 更新反射
    updateReflections();

    // 渲染器
    if (sceneStore.ifRenderControls) {
        toRaw(sceneStore.controls).update();
    }
    if (sceneStore.ifRenderTempControl) {
        toRaw(sceneStore.tempColtrol).update();
    }
}

function onWindowResize() {
    toRaw(sceneStore.scenes[sceneStore.choisiScene]).aspect = window.innerWidth / window.innerHeight;
    toRaw(sceneStore.cameras[sceneStore.choisiCamera]).updateProjectionMatrix();
    toRaw(sceneStore.renderers[sceneStore.choisiRenderer]).setSize(window.innerWidth, window.innerHeight);
}

// 物体的反光
function updateReflections() {
    const renderer = toRaw(sceneStore.renderers[sceneStore.choisiRenderer]);
    const scene = toRaw(sceneStore.scenes[sceneStore.choisiScene]);

    for (let i = 0; i < sceneStore.objects.length; i++) {
        const object = toRaw(sceneStore.objects[i]);
        if (object.modifier && object.modifier.clearcoat && object.cubeCamera) {
            // 更新相机位置
            object.cubeCamera.position.copy(object.object3D.position);
            // 隐藏物体以避免自反射
            object.object3D.visible = false;
            // 更新反射贴图
            object.cubeCamera.update(renderer, scene);
            // 恢复物体的可见性
            object.object3D.visible = true;
            // 确保反射材质使用最新的反射贴图
            object.object3D.material.envMap = object.cubeRenderTarget.texture;
            object.object3D.material.needsUpdate = true;
        }
    }
}
</script>

<style lang="less" scoped></style>