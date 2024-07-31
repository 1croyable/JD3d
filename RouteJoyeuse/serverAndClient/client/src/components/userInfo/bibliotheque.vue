<template>
    <div>
        <div id="threejs-container"></div>
    </div>
</template>

<script setup>
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { onMounted, defineProps, watch } from 'vue';
import TWEEN from '@tweenjs/tween.js';
import { ref } from 'vue';
import { shallowRef } from 'vue';

const props = defineProps({
    theme: String,
    auMxFlag: Boolean,
})

watch(() => props.theme, (newTheme) => {
    if (scene) scene.background = newTheme === 'dark' ? new THREE.Color(0x000000) : new THREE.Color(0xE6EE9C);
})

watch(() => props.auMxFlag, (newValue) => {
    if (newValue === true) {
        returnCameraAnimation();
    }
})

let container, camera, scene, renderer;
const loader = new GLTFLoader();

onMounted(() => {
    init();
    animate();
})

function init() {

    container = document.getElementById('threejs-container');

    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(-1, 6, 10);
    camera.lookAt(0, 3, 0);

    // 创建场景
    scene = new THREE.Scene();

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 加载模型
    loader.load(
        'models/old_library/scene.gltf',
        function (gltf) {
            scene.background = new THREE.Color(0xE6EE9C);
            scene.add(gltf.scene);
            setTimeout(() => {
                initCameraAnimation();
                setTimeout(() => {
                    showBooks_f();
                }, 1600)
            }, 300);
        },
        function (xhr) { },
        function (error) {
            console.error('模型加载失败', error);
        }
    );

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}

function initCameraAnimation() {
    // 相机前进
    const targetPosition = camera.position.clone().add(new THREE.Vector3(-3, -1, -14));
    new TWEEN.Tween(camera.position)
        .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, 1500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    // 相机旋转
    const initialQuaternion = camera.quaternion.clone();
    const targetEuler = new THREE.Euler(0, THREE.MathUtils.degToRad(40), 0, 'YXZ');
    const targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);

    new TWEEN.Tween(initialQuaternion)
        .to(targetQuaternion, 1500)
        .onUpdate(() => {
            camera.quaternion.copy(initialQuaternion);
        })
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
}

function returnCameraAnimation() {
    new TWEEN.Tween(camera.position)
        .to({ x: -1, y: 6, z: 10 }, 1500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    // 相机旋转
    const initialQuaternion = camera.quaternion.clone();
    const targetEuler = new THREE.Euler(0, THREE.MathUtils.degToRad(-40), 0, 'YXZ');
    const targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);

    new TWEEN.Tween(initialQuaternion)
        .to(targetQuaternion, 1500)
        .onUpdate(() => {
            camera.quaternion.copy(initialQuaternion);
        })
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
}

//动态加载组件相关
const emits = defineEmits(['showBooks']);
function showBooks_f() {
    emits('showBooks');
}
</script>

<style lang="less"></style>
