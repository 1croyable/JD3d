<template>
    <div id="threejs-container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, defineProps, watch } from 'vue';

const props = defineProps({
    theme: String
})

let container, clock;

let camera, scene, renderer;

let line;

const segments = 10000;
const r = 800;
let t = 0;

watch(() => props.theme, (newTheme) => {
    if (scene) scene.background = newTheme === 'dark' ? new THREE.Color(0x000000) : new THREE.Color(0xffffff);
})

onMounted(() => {
    init();
    animate();
})

function init() {

    container = document.getElementById('threejs-container');

    camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.z = 2750;
    camera.position.x = 300;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    clock = new THREE.Clock();

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ vertexColors: true });

    const positions = [];
    const colors = [];

    for (let i = 0; i < segments; i++) {
        //-400到400
        const x = Math.random() * r - r / 2;
        const y = Math.random() * r - r / 2;
        const z = Math.random() * r - r / 2;

        positions.push(x, y, z);

        colors.push((x / r) + 0.5);
        colors.push((y / r) + 0.5);
        colors.push((z / r) + 0.5);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    generateMorphTargets(geometry);

    geometry.computeBoundingSphere();

    line = new THREE.Line(geometry, material);
    scene.add(line);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    requestAnimationFrame(animate);

    render();
}

function render() {

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    line.rotation.x = time * 0.25;
    line.rotation.y = time * 0.5;

    t += delta * 0.5;
    line.morphTargetInfluences[0] = Math.abs(Math.sin(t));

    renderer.render(scene, camera);
}

function generateMorphTargets(geometry) {
    const data = [];
    for (let i = 0; i < segments; i++) {
        const x = Math.random() * r - r / 2;
        const y = Math.random() * r - r / 2;
        const z = Math.random() * r - r / 2;
        data.push(x, y, z);
    }

    const morphTarget = new THREE.Float32BufferAttribute(data, 3);
    morphTarget.name = 'target1';

    geometry.morphAttributes.position = [morphTarget];
}
</script>
