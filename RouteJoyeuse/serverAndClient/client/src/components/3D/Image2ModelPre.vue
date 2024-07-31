<template>
    <div ref="canvasContainer" class="canvas-container"></div>
</template>


<script setup>
import { onMounted, onUnmounted, ref, watch, toRaw } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const props = defineProps({
    model: Object,
});

const canvasContainer = ref(null);
let renderer, scene, camera, controls;
let requestID;

function adjustCameraAndControlPosition(camera, controls) {
    // 计算包围盒
    const bbox = new THREE.Box3().setFromObject(toRaw(props.model.object3D));
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());

    console.log('center:', center, 'size:', size)

    // 计算相机位置
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));

    // 在确保视锥体内放下几何体的基础上再稍微拉远一点
    cameraZ *= 1.5;

    // 调整相机Y位置，使得相机稍微抬高一些，以获得更好的观察角度
    const cameraY = center.y + (size.y * 0.5);

    camera.position.set(center.x, cameraY, cameraZ);
    camera.lookAt(center);

    // 设置OrbitControls的中心点
    controls.target.set(center.x, center.y, center.z);
    controls.update();
}

onMounted(() => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvasContainer.value.clientWidth / canvasContainer.value.clientHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight);
    renderer.setClearColor(0xffffff); // 设置背景颜色为白色
    canvasContainer.value.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040); // 环境光
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 定向光
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // 添加模型到场景中
    if (props.model) {
        const model = toRaw(props.model.object3D);
        scene.add(model);

        // 添加OrbitControls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // 阻尼（惯性）
        controls.dampingFactor = 0.25;
        controls.enableZoom = true; // 启用缩放
        controls.enablePan = false; // 禁用右键拖动

        adjustCameraAndControlPosition(camera, controls);
    }

    // 更新画布的函数
    function renderScene() {
        controls.update();
        renderer.render(scene, camera);
        requestID = requestAnimationFrame(renderScene);
    }

    // 初始渲染和开始动画循环
    renderScene();

    // 监听props.model变化
    watch(() => props.model, () => {
        if (props.model) {
            adjustCameraAndControlPosition(camera, controls);
        }
    }, { deep: true });

    // 处理窗口大小变化
    window.addEventListener('resize', onWindowResize);
});

function onWindowResize() {
    camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight);
}

onUnmounted(() => {
    // 取消动画帧循环
    cancelAnimationFrame(requestID);

    // 移除事件监听器
    window.removeEventListener('resize', onWindowResize);

    // 清理OrbitControls
    controls.dispose();

    // 清理Three.js场景和渲染器
    scene.traverse((object) => {
        if (object.geometry) {
            object.geometry.dispose();
        }
    });

    renderer.dispose();
});
</script>



<style lang="less" scoped>
.canvas-container {
    width: 100%;
    height: 300px;
}
</style>
