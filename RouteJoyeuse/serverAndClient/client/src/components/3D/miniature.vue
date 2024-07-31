<template>
    <v-card class="mx-1" style="height: 90%; width:90%">
        <v-img height="100%" width="100%" class="align-end" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" cover
            :src="graphique" v-if="graphique !== null">
        </v-img>
    </v-card>
</template>

<script setup>
import { nextTick, onMounted, ref, watch, toRaw } from 'vue';
import * as THREE from 'three';
import { useScene } from '../../../public/stores/3D/scene';
import { useAnimation } from '../../../public/stores/3D/animation';

const sceneStore = useScene();
const animationStore = useAnimation();

const props = defineProps({
    obj: Object,
});

watch(() => animationStore.updateTrigger, () => {
    miniature();
});

let graphique = ref(null);

function miniature() {
    const scene = sceneStore.scenes[sceneStore.choisiScene];
    const camera = toRaw(sceneStore.snapshotCamera);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    const object3D = props.obj.object3D;

    // 计算物体的外接边界并设置相机
    const box = new THREE.Box3().setFromObject(object3D);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);

    let distance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.7;

    const offset = new THREE.Vector3(distance, distance, distance);
    const newPosition = new THREE.Vector3().addVectors(center, offset);

    camera.position.set(newPosition.x, newPosition.y, newPosition.z);
    camera.lookAt(center);

    renderer.render(toRaw(scene), toRaw(camera));
    const imageUrl = renderer.domElement.toDataURL('image/png');
    graphique.value = imageUrl;
}

onMounted(() => {
    nextTick(() => {
        miniature();
    });
})

</script>
