<template>
    <div id="container"></div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { onUnmounted } from 'vue';

let interactiveText;
let scene, camera, renderer, stars, stars2, starGeo;
let mouseX = 0, mouseY = 0;

onMounted(async () => {
    await nextTick();
    const container = document.getElementById('container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    init();
    initTrail();
    createText();
    rend();
})

onUnmounted(() => {
    cancelAnimationFrame(animationFrameId); // 停止动画循环
    window.removeEventListener('mousemove', onMouseMove); // 移除事件监听器
    clearScene(); // 清理场景
    renderer.dispose(); // 清理渲染器
    document.getElementById('container').removeChild(renderer.domElement); // 移除渲染器DOM
});

function clearScene() {
    while(scene.children.length > 0){ 
        let obj = scene.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            // 处理材质数组的情况
            if (Array.isArray(obj.material)) {
                obj.material.forEach(material => material.dispose());
            } else {
                obj.material.dispose();
            }
        }
        scene.remove(obj); 
    }
}

function onMouseMove(event) {
    const container = document.getElementById('container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    const bounds = container.getBoundingClientRect();

    mouseX = ((event.clientX - bounds.left) / width) * 2 - 1;
    mouseY = -((event.clientY - bounds.top) / height) * 2 + 1;
}

// 监听鼠标移动事件
window.addEventListener('mousemove', onMouseMove, false);

// 鼠标拖尾
let trailParticles, trailMaterial, trailGeometry;
const initTrail = () => {
    trailGeometry = new THREE.BufferGeometry();
    let positions = new Float32Array(20 * 3); // 100个粒子，每个粒子3个值(x, y, z)
    let opacity = new Float32Array(20); // 每个粒子的不透明度
    for (let i = 0; i < 20; i++) {
        positions[i * 3] = 0; // x
        positions[i * 3 + 1] = 0; // y
        positions[i * 3 + 2] = 0; // z
        opacity[i] = 0; // 初始不透明度为0
    }
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    trailGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacity, 1));

    trailMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.01,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    trailParticles = new THREE.Points(trailGeometry, trailMaterial);
    scene.add(trailParticles);
    
};
const updateTrail = () => {
    let positions = trailGeometry.attributes.position.array;
    let opacity = trailGeometry.attributes.opacity.array;

    for (let i = positions.length / 3 - 1; i > 0; i--) {
        positions[i * 3] = positions[(i - 1) * 3];
        positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
        positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
        opacity[i] = opacity[i - 1] * 0.9;
    }

    positions[0] = mouseX;
    positions[1] = mouseY;
    positions[2] = -1; 
    opacity[0] = 1;

    trailGeometry.attributes.position.needsUpdate = true;
    trailGeometry.attributes.opacity.needsUpdate = true;
};

const init = () => {
    // 创建场景
    scene = new THREE.Scene();

    // 创建相机
    const container = document.getElementById('container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 1;
    // 创建渲染器
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.getElementById('container').appendChild(renderer.domElement);

    // 创建星星
    starGeo = new THREE.BufferGeometry();
    let starVertices = [];
    for (let i = 0; i < 1000; i++) {
        let x = (Math.random() - 0.5) * 2000;
        let y = (Math.random() - 0.5) * 2000;
        let z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    //创建不变位置的星星
    let starGeo2 = new THREE.BufferGeometry();
    let starVertices2 = [];
    for (let i = 0; i < 2000; i++) {
        let x = (Math.random() - 0.5) * 2000;
        let y = (Math.random() - 0.5) * 2000;
        let z = (Math.random() - 0.5) * 2000;
        starVertices2.push(x, y, z);
    }
    starGeo2.setAttribute('position', new THREE.Float32BufferAttribute(starVertices2, 3));
    starGeo2.rotateX(Math.PI / 2);

    // 创建材质
    let starMaterial = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.7 });

    // 创建粒子系统
    stars = new THREE.Points(starGeo, starMaterial);
    stars2 = new THREE.Points(starGeo2, starMaterial);

    // 将星星添加到场景中
    scene.add(stars);
    scene.add(stars2);

    // 调整窗口大小时更新相机和渲染器
    window.addEventListener('resize', () => {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    }, false);

    //添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
}

const createText = () => {
    const fontLoader = new FontLoader();

    fontLoader.load('../../src/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new TextGeometry('BonJour!', {
            font: font,
            size: 80,
            height: 5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 7,
            bevelSize: 2,
            bevelSegments: 12
        });

        // 使用MeshStandardMaterial以获得金属和反光效果
        const textMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700, // 金色
            metalness: 0.9, // 金属感
            roughness: 0.2, // 光滑度
            envMapIntensity: 0.9 // 环境映射强度，需要环境贴图
        });
        interactiveText = new THREE.Mesh(textGeometry, textMaterial);

        // 将文本位置设置在画面中间，稍微朝相机倾斜
        interactiveText.position.set(-200, 200, -700);
        interactiveText.rotation.y = Math.PI;
        scene.add(interactiveText);
    });

    // 添加一个光源以增强金属感和反光效果
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 1); // 从相机视角照射
    scene.add(light);
};

const rend = () => {
    if (interactiveText) {
        interactiveText.rotation.y = -mouseX * 0.8;
        interactiveText.rotation.x = mouseY * 0.2;
        interactiveText.position.x = mouseX * 300 - 200;
        interactiveText.position.y = mouseY * 200 + 100;
    }
    starGeo.attributes.position.array.forEach((value, index) => {
        if (index % 3 === 2) { // z轴位置
            if (value > 0) starGeo.attributes.position.array[index] = -1000;
            starGeo.attributes.position.array[index] += 2;
        }
    });
    starGeo.attributes.position.needsUpdate = true;

    //拖尾
    updateTrail();
    // 渲染场景
    renderer.render(scene, camera);
    requestAnimationFrame(rend);
}

</script>

<style lang="less" scoped>
#container {
    width: 100%;
    height: 100vh;
    background-color: #000;
}
</style>
