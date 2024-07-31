<template>
    <div>
        <div id="carousel-wrapper">
            <div id="carousel" class="px-2" ref="carousel">
                <div v-for="(item, index) in list" :key="index" class="cardDiv"
                    @mouseenter="ifHover = true; hoverIndex = index" @mouseleave="ifHover = false; hoverIndex = -1"
                    @click="scrollToCard(item.index)">
                    <v-card class="mx-1" :class="elevation(index)" style="height: 100px;">
                        <v-img height="100%" width="100px" class="align-end" :src="item.url"
                            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" cover>
                            <v-card-title v-text="item.name" class="text-teal"></v-card-title>
                        </v-img>
                    </v-card>
                </div>
            </div>
        </div>
        <!-- 更新按钮 -->
        <div style="margin:0 auto;">
            <v-btn icon="mdi-refresh" class="mt-4" @click="sceneStore.captureImages()"></v-btn>
        </div>
        <div v-if="choose !== null && choose !== -1">
            <v-divider color="yellow" class="my-2"></v-divider>
            <!-- 更改操作 -->
            <div v-if="choose !== null">
                <!-- 旋转 -->
                <span class="text-h4">
                    X旋转角度:
                </span>
                <p v-if="getSO().object3D.type === 'Group'">这是整个组属性的修改</p>
                <v-slider append-icon="mdi-rotate-3d" elevation="12" persistent-hint thumb-label="always"
                    step="1" min="0" max="360" v-model="degreeRotationX"></v-slider>

                <span class="text-h4">
                    Y旋转角度:
                </span>
                <p v-if="getSO().object3D.type === 'Group'">这是整个组属性的修改</p>
                <v-slider append-icon="mdi-rotate-3d"  elevation="12" persistent-hint thumb-label="always"
                    step="1" min="0" max="360" v-model="degreeRotationY"></v-slider>

                <span class="text-h4">
                    Z旋转角度:
                </span>
                <p v-if="getSO().object3D.type === 'Group'">这是整个组属性的修改</p>
                <v-slider append-icon="mdi-rotate-3d" elevation="12" persistent-hint thumb-label="always"
                    step="1" min="0" max="360" v-model="degreeRotationZ"></v-slider>

                <v-divider color="yellow" class="my-2"></v-divider>

                <!-- 位置 -->
                <span class="text-h4">
                    位置调整
                </span>
                <p v-if="getSO().object3D.type === 'Group'">这是整个组属性的修改</p>
                <v-container>
                    <v-row>
                        <v-col cols="4" v-for="axis in ['x', 'y', 'z']" :key="axis">
                            <v-text-field :label="`${axis.toUpperCase()} 坐标`" type="number"
                                v-model.number="getSO().modifier.position[axis]"
                                class="bright-input"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row justify="center">
                        <v-btn icon fab @mousedown="startAdjust('y', 0.1)" @mouseup="stopAdjust"
                            @mouseleave="stopAdjust">
                            <v-icon>mdi-arrow-up</v-icon>
                        </v-btn>
                    </v-row>
                    <v-row justify="center">
                        <v-btn class="ml-16" icon fab  @mousedown="startAdjust('x', -0.1)"
                            @mouseup="stopAdjust" @mouseleave="stopAdjust">
                            <v-icon>mdi-arrow-left</v-icon>
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn class="mr-16" icon fab @mousedown="startAdjust('x', 0.1)"
                            @mouseup="stopAdjust" @mouseleave="stopAdjust">
                            <v-icon>mdi-arrow-right</v-icon>
                        </v-btn>
                    </v-row>
                    <v-row justify="center">
                        <v-btn icon fab @mousedown="startAdjust('y', -0.1)" @mouseup="stopAdjust"
                            @mouseleave="stopAdjust">
                            <v-icon>mdi-arrow-down</v-icon>
                        </v-btn>
                    </v-row>
                    <v-row justify="center">
                        <v-btn class="mx-8" icon fab @mousedown="startAdjust('z', 0.1)"
                            @mouseup="stopAdjust" @mouseleave="stopAdjust">
                            <span class="text-h5">前</span>
                        </v-btn>
                        <v-btn class="mx-8" icon fab @mousedown="startAdjust('z', -0.1)"
                            @mouseup="stopAdjust" @mouseleave="stopAdjust">
                            <span class="text-h5">后</span>
                        </v-btn>
                    </v-row>
                </v-container>

                <v-divider color="yellow" class="my-2"></v-divider>

                <!-- 缩放 -->
                <span class="text-h4">
                    缩放
                </span>
                <p v-if="getSO().object3D.type === 'Group'">这是整个组属性的修改</p>
                <v-container>
                    <!-- 整体缩放控制开关 -->
                    <v-row>
                        <v-col cols="12">
                            <v-checkbox v-model="ifScaleEnsemble" color="amber-darken-1">
                                <VFieldLabel class="text-h6">等比例</VFieldLabel>
                            </v-checkbox>
                        </v-col>
                    </v-row>

                    <!-- 单独的x, y, z轴缩放控制 -->
                    <v-row v-for="axis in ['x', 'y', 'z']" :key="axis">
                        <v-col cols="1">
                            <span class="text-h3">× {{ scale[axis] }}</span>
                        </v-col>
                        <v-col cols="10" offset="1">
                            <v-slider :model-value="scale[axis]" @update:modelValue="handleScaling($event, axis)"
                                :min="0.1" :max="10" :step="0.1" thumb-label="always" persistent-hint>
                            </v-slider>
                        </v-col>
                    </v-row>
                </v-container>

                <v-divider color="yellow" class="my-2"></v-divider>

                <!-- 颜色和透明度 -->
                <v-container>
                    <v-row>
                        <v-col cols="8">
                            <div v-if="getSO().modifier.color">
                                <span>
                                    更改颜色和透明度:
                                </span>
                                <v-color-picker v-model="hexColor" mode="hex"></v-color-picker>
                            </div>
                        </v-col>
                        <v-col cols="3" offset="1">
                            <div v-if="getSO().modifier.opacity">
                                <v-slider v-model="getSO().object3D.material.opacity" :min="0" :max="1" track-size="5"
                                    :step="0.01" thumb-label="always" persistent-hint label="更改透明度"
                                    direction="vertical">
                                </v-slider>
                            </div>
                        </v-col>
                    </v-row>
                    <!-- 可见不可见 -->
                    <v-row justify="center" v-if="!getSO().modifier.clearcoat">
                        <v-switch v-model="getSO().object3D.visible" color="warning"
                            :label="getSO().object3D.visible ? '点击后不可见' : '点击后恢复'" hide-details></v-switch>
                    </v-row>
                    <!-- 贴图 -->
                    <v-row v-if="getSO().modifier.texture">
                        <v-col cols="6">
                            <v-file-input :disabled="getSO().modifier.clearcoat" v-if="choose !== null"
                                v-model="sceneStore.textures[choose]" label="上传贴图" accept="image/*"
                                class="bg-grey-darken-2 px-5 pt-2" style="border-radius: 7%;"
                                @change="onFileChange"></v-file-input>
                        </v-col>
                        <!-- 反光 -->
                        <v-col cols="6">
                            <v-switch v-model="getSO().modifier.clearcoat"
                                @update:model-value="handleClearcoat" color="warning"
                                :label="getSO().modifier.clearcoat ? '使用反光材料' : '取消反光材料'" hide-details></v-switch>
                        </v-col>
                    </v-row>
                </v-container>

                <!-- 圆角矩形的圆角 -->
                <v-container v-if="getSO().type === 'roundedRect'">
                    <v-row>
                        <v-col cols="12">
                            <v-slider v-model="roundedRectRadius" :min="0" :max="1" track-size="5" :step="0.01"
                                thumb-label="always" persistent-hint label="更改圆角"
                                direction="vertical">
                            </v-slider>
                        </v-col>
                    </v-row>
                </v-container>

                <div v-if="getSO().type === 'text'">
                    <p class="text-h4">修改字体属性</p>
                    <p>这是整个组属性的修改</p>

                    <v-switch class="px-10" v-model="textParams.bevelEnabled" label="启用斜角"></v-switch>
                    <v-text-field v-model="textParams.depth" label="深度" type="number" step="0.1"></v-text-field>
                    <v-text-field v-model="textParams.size" label="大小" type="number" step="0.1"></v-text-field>
                    <v-text-field v-model="textParams.hover" label="悬浮" type="number" step="0.1"></v-text-field>
                    <v-text-field v-model="textParams.curveSegments" label="曲线段数" type="number"></v-text-field>
                    <v-text-field v-model="textParams.bevelThickness" label="斜角厚度" type="number"
                        step="0.1"></v-text-field>
                    <v-text-field v-model="textParams.bevelSize" label="斜角大小" type="number" step="0.1"></v-text-field>
                    <v-color-picker v-model="textColor" label="颜色"></v-color-picker>
                </div>

            </div>
        </div>
        <div v-else>
            <div>
                <br>
                <span class="text-h4">
                    场景背景设置
                </span>
                <v-container>
                    <v-card elevation="3">
                        <v-tabs v-model="tab" color="orange-darken-4">
                            <v-tab class="text-h6" value="one">调整背景颜色</v-tab>
                            <v-tab class="text-h6" value="two">设置背景图片</v-tab>
                            <v-tab class="text-h6" value="three">设置环境图片</v-tab>
                        </v-tabs>

                        <v-card-text>
                            <v-window v-model="tab">
                                <v-window-item value="one">
                                    <v-row>
                                        <v-col cols="12">
                                            <v-color-picker v-model="backgroundColor" mode="hex" width="100%"></v-color-picker>
                                        </v-col>
                                    </v-row>
                                </v-window-item>

                                <v-window-item value="two">
                                    <v-row>
                                        <v-col cols="12">
                                            <v-file-input v-model="backgroundTexture" label="上传背景纹理" accept="image/*"
                                                class="bg-grey-darken-2 px-5 pt-2"
                                                @change="onBackgroundTextureChange"></v-file-input>
                                        </v-col>
                                    </v-row>
                                </v-window-item>

                                <v-window-item value="three">
                                    <v-row>
                                        <v-col cols="6">
                                            <v-file-input v-model="environmentTexture[0]" label="前" accept="image/*"
                                                class="bg-grey-darken-2 px-5 pt-2"
                                                @change="onEnvironmentTextureChange($event, 0)"></v-file-input>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-file-input v-model="environmentTexture[1]" label="后" accept="image/*"
                                                class="bg-grey-darken-2 px-5 pt-2"
                                                @change="onEnvironmentTextureChange($event, 1)"></v-file-input>
                                        </v-col>
                                    </v-row>

                                    <v-row>
                                        <v-col cols="6">
                                            <v-file-input v-model="environmentTexture[2]" label="左" accept="image/*"
                                                class="bg-grey-darken-2 px-5 pt-2"
                                                @change="onEnvironmentTextureChange($event, 2)"></v-file-input>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-file-input v-model="environmentTexture[3]" label="右" accept="image/*"
                                                class="bg-grey-darken-2 px-5 pt-2"
                                                @change="onEnvironmentTextureChange($event, 3)"></v-file-input>
                                        </v-col>
                                    </v-row>

                                    <v-row>
                                        <v-col cols="6">
                                            <v-file-input v-model="environmentTexture[4]" label="上" accept="image/*"
                                                class="bg-grey-darken-2 px-5 pt-2"
                                                @change="onEnvironmentTextureChange($event, 4)"></v-file-input>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-file-input v-model="environmentTexture[5]" label="下" accept="image/*"
                                                class="bg-grey-darken-2 px-5 pt-2"
                                                @change="onEnvironmentTextureChange($event, 5)"></v-file-input>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12">
                                            <span class="mt-4 px-2 text-h6">背景模糊程度:</span>
                                            <v-slider class="mt-4 px-2"
                                                v-model="sceneStore.scenes[sceneStore.choisiScene].backgroundBlurriness"
                                                :min="0" :max="1" step="0.01" thumb-label="always"
                                                persistent-hint></v-slider>
                                        </v-col>
                                    </v-row>
                                </v-window-item>
                            </v-window>
                        </v-card-text>
                    </v-card>

                    <br>
                    <v-row>
                        <v-col cols="12">
                            <span class="text-h4">雾效果:</span>
                            <v-slider class="mt-8" v-model="fogDensity" :min="0" :max="0.1" step="0.001" thumb-label="always"
                                persistent-hint></v-slider>
                        </v-col>
                    </v-row>
                </v-container>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, reactive, toRaw } from 'vue';
import * as THREE from 'three';
import { useScene } from '../../../public/stores/3D/scene';

const sceneStore = useScene();

const choose = ref(-1);

const ifHover = ref(false);
const hoverIndex = ref(-1);

const carousel = ref(null);

const elevation = (index) => {
    if (index === hoverIndex.value) {
        return ifHover.value ? 'elevation-12' : 'elevation-4';
    }
    else {
        return 'elevation-4';
    }
};

function scrollToCard(index) {
    const carouselElement = carousel.value;
    const card = carouselElement.children[index + 1];
    const cardWidth = card.clientWidth;
    const scrollX = card.offsetLeft - (carouselElement.offsetWidth / 2) + (cardWidth / 2);

    carouselElement.scrollTo({
        left: scrollX,
        behavior: 'smooth'
    });

    choose.value = index;
    console.log('现在的choose', choose.value)
}

function processObject3D(item, indexCounter, sourceSO = '') {
    const result = [];
    const object = item.object3D ? item.object3D : item;
    const SO = item.object3D ? item : '';
    if (object.type === 'Group') {
        object.children.forEach((child) => {
            result.push(...processObject3D(child, indexCounter, sourceSO));
        });
    } else {
        result.push({
            name: `object_${indexCounter.value + 1}`,
            index: indexCounter.value,
            url: sceneStore.graphiques[indexCounter.value + 1] ? sceneStore.graphiques[indexCounter.value + 1] : '',
            SO: SO,
            sourceSO: sourceSO,
            object: object
        });
        indexCounter.value++;
    }

    return result;
}

const list = computed(() => {
    const indexCounter = { value: 0 };  // 使用对象来传递和更新 indexTotal
    const background = [{
        name: 'background',
        index: -1,
        url: sceneStore.graphiques[0] ? sceneStore.graphiques[0] : ''
    }];

    const objects = sceneStore.objects.flatMap((item) => {
        if (item.type === 'model') {
            const result = [{
                name: `object_${item.id}`,
                index: indexCounter.value,
                url: sceneStore.graphiques[indexCounter.value + 1] ? sceneStore.graphiques[indexCounter.value + 1] : '',
                SO: item,
                sourceSO: '',
                object: item.object3D
            }];
            indexCounter.value++;
            return result;
        } else {
            // 因为要获取SO，如果是group，也要获取源SO，所以要先来1次手动迭代
            if (item.object3D.type === 'Group') {
                // 如果是image2model过来的，就看做一个整体
                if (item.source && item.source === 'image2model') {
                    const result = [{
                        name: `object_${item.id}`,
                        index: indexCounter.value,
                        url: sceneStore.graphiques[indexCounter.value + 1] ? sceneStore.graphiques[indexCounter.value + 1] : '',
                        SO: item,
                        sourceSO: '',
                        object: item.object3D
                    }];
                    indexCounter.value++;
                    return result;
                } else {
                    const result = [];
                    const sourceSO = item;
                    sourceSO.object3D.children.forEach((child) => {
                        result.push(...processObject3D(child, indexCounter, sourceSO));
                    });
                    return result;
                }
            }
            else {
                return processObject3D(item, indexCounter);
            }
        }
    });
    return background.concat(objects);
});

// 获取源SO或者自身是SO就返回自己
function getSO() {
    if (list.value[choose.value + 1].SO) {
        return list.value[choose.value + 1].SO;
    } else {
        return list.value[choose.value + 1].sourceSO;
    }
}

onMounted(() => {
    carousel.value.addEventListener('wheel', function (event) {
        event.preventDefault();
        this.scrollLeft += event.deltaY / 6;
    }, { passive: false });
})

const degreeRotationX = computed({
    get: () => {
        let object = getSO();
        return object.modifier.rotation.x * (180 / Math.PI);
    },
    set: (value) => {
        getSO().modifier.rotation.x = value * (Math.PI / 180);
    },
});

const degreeRotationY = computed({
    get: () => {
        let object = getSO();
        return object.modifier.rotation.y * (180 / Math.PI);
    },
    set: (value) => {
        getSO().modifier.rotation.y = value * (Math.PI / 180);
    },
});

const degreeRotationZ = computed({
    get: () => {
        let object = getSO();
        return object.modifier.rotation.z * (180 / Math.PI);
    },
    set: (value) => {
        getSO().modifier.rotation.z = value * (Math.PI / 180);
    },
});

// 位置调整相关
let interval = null;

const startAdjust = (axis, delta) => {
    adjustPosition(axis, delta);
    interval = setInterval(() => {
        adjustPosition(axis, delta);
    }, 50);
};

const stopAdjust = () => {
    clearInterval(interval);
    interval = null;
};

const adjustPosition = (axis, delta) => {
    if (axis === 'x') {
        getSO().modifier.position.x += delta;
    } else if (axis === 'y') {
        getSO().modifier.position.y += delta;
    } else if (axis === 'z') {
        getSO().modifier.position.z += delta;
    }
};

onUnmounted(() => {
    if (interval) {
        clearInterval(interval);
    }
});

// 缩放
const ifScaleEnsemble = ref(true);
const scale = ref(undefined);
watch(choose, (newVal) => {
    if (newVal !== null && newVal !== -1) {
        scale.value = getSO().modifier.scale;
    }
});

watch(scale, (newScale) => {
    Object.assign(getSO().modifier.scale, newScale);
}, { deep: true });

function handleScaling(newVal, axis) {
    const minScale = 0.1;
    const maxScale = 10;

    if (newVal < minScale || newVal > maxScale) {
        return;
    }

    if (ifScaleEnsemble.value) {
        const canScale = ['x', 'y', 'z'].every(a => {
            const projectedScale = newVal;
            return projectedScale >= minScale && projectedScale <= maxScale;
        });

        if (!canScale) {
            return;
        }

        for (const a of ['x', 'y', 'z']) {
            scale.value[a] = newVal;
        }
    } else {
        scale.value[axis] = newVal;
    }
}

// 颜色
const hexColor = ref(undefined);
watch(hexColor, (newVal) => {
    if (newVal) {
        getSO().modifier.color.set(newVal);
    }
})

//贴图
function onFileChange(event) {
    const file = event.target.files[0];
    sceneStore.textureFiles.push({
        target: getSO().id,
        files: [file]
    })
    toRaw(sceneStore.textures)[choose.value] = [file];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const texture = new THREE.TextureLoader().load(e.target.result, () => {
                const object = getSO();
                if (object) {
                    object.object3D.material.map = texture;
                    object.object3D.material.needsUpdate = true;
                }
            });
        };
        reader.readAsDataURL(file);
    }
}
watch(sceneStore.textures, (newVal) => {
    if (newVal[choose.value].length === 0) {
        const object = getSO();
        if (object) {
            object.object3D.material.needsUpdate = true;
            object.object3D.material.map = null;
        }
    }
});
//使用反光材料
function handleClearcoat() {
    const object = toRaw(getSO());
    const scene = toRaw(sceneStore.scenes[sceneStore.choisiScene]);
    const renderer = toRaw(sceneStore.renderers[sceneStore.choisiRenderer]);

    if (object.modifier.clearcoat === true) {
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
            format: THREE.RGBFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter,
            colorSpace: THREE.SRGBColorSpace
        });
        cubeRenderTarget.texture.type = THREE.HalfFloatType;

        const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
        scene.add(cubeCamera);

        const reflectiveMaterial = new THREE.MeshStandardMaterial({
            envMap: cubeRenderTarget.texture,
            roughness: 0.05,
            metalness: 1
        });

        // 保存原始材质、CubeCamera 和 CubeRenderTarget
        object.originalMaterial = object.object3D.material;
        object.cubeCamera = cubeCamera;
        object.cubeRenderTarget = cubeRenderTarget;

        // 应用反光材质
        object.object3D.material = reflectiveMaterial;

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
    else {
        if (object.originalMaterial) {
            object.object3D.material = object.originalMaterial;
        }

        if (object.cubeCamera) {
            scene.remove(object.cubeCamera);
            object.cubeCamera = null;
        }
        if (object.cubeRenderTarget) {
            object.cubeRenderTarget.dispose();
            object.cubeRenderTarget = null;
        }

        // 需要在材质变化后更新网格
        object.object3D.material.needsUpdate = true;
    }
}

// 背景
const backgroundTexture = ref(null);
const environmentTexture = ref([undefined, undefined, undefined, undefined, undefined, undefined]);
const backgroundColor = ref('#000000');
const fogDensity = ref(0);
const tab = ref(null)

// 监听背景颜色变化
watch(backgroundColor, (newColor) => {
    const scene = sceneStore.scenes[sceneStore.choisiScene];
    scene.background = new THREE.Color(newColor);
    if (backgroundTexture.value !== null) {
        backgroundTexture.value = null;
    }
    if (environmentTexture.value !== null) {
        environmentTexture.value = [undefined, undefined, undefined, undefined, undefined, undefined];
    }
});

// 处理背景纹理变化
const onBackgroundTextureChange = (files) => {
    if (!files || files.length === 0) return;
    const file = files.target.files[0];
    backgroundTexture.value = [file];
    sceneStore.textureFiles.push({
        target: 'background',
        files: backgroundTexture.value
    })
    const reader = new FileReader();
    reader.onload = (event) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(event.target.result, (texture) => {
            const scene = sceneStore.scenes[sceneStore.choisiScene];
            scene.background = texture;
        });
    };
    reader.readAsDataURL(file);
};
watch(backgroundTexture, (newVal) => {
    if (newVal && newVal.length === 0) {
        const scene = sceneStore.scenes[sceneStore.choisiScene];
        scene.background = new THREE.Color(backgroundColor.value);
    }
});

// 处理环境纹理变化
const onEnvironmentTextureChange = (event, index) => {
    environmentTexture.value[index] = [event.target.files[0]];

    if (!environmentTexture.value || !environmentTexture.value[0] || !environmentTexture.value[1] || !environmentTexture.value[2] || !environmentTexture.value[3] || !environmentTexture.value[4] || !environmentTexture.value[5]) return;
    const files = [];
    environmentTexture.value.forEach((fileArray, index) => {
        files.push(fileArray[0]);
    })
    const urls = [];
    const promises = Array.from(files).map((file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                urls.push(event.target.result);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    });

    Promise.all(promises).then(() => {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load(urls);
        const scene = sceneStore.scenes[sceneStore.choisiScene];
        scene.background = texture;
    });
};
watch(environmentTexture, (newVal) => {
    if (newVal[0] === undefined || newVal[1] === undefined || newVal[2] === undefined || newVal[3] === undefined || newVal[4] === undefined || newVal[5] === undefined) return;
    if (newVal[0].length === 0 || newVal[1].length === 0 || newVal[2].length === 0 || newVal[3].length === 0 || newVal[4].length === 0 || newVal[5].length === 0) {
        const scene = sceneStore.scenes[sceneStore.choisiScene];
        scene.background = new THREE.Color(backgroundColor.value);
    }
}, { deep: true });

// 监听雾效果变化
watch(fogDensity, (newFogDensity) => {
    const scene = sceneStore.scenes[sceneStore.choisiScene];
    scene.fog = new THREE.FogExp2(scene.background, newFogDensity);
});


// 字体
// 字体参数
const textParams = reactive({
    bevelEnabled: true,
    depth: 4,
    size: 14,
    hover: 6,
    curveSegments: 0.8,
    bevelThickness: 0.4,
    bevelSize: 0.3,
    color: '#ffffff'
});

const textColor = ref('#ffffff');

// 监听 choose 的变化并更新 textParams
watch(choose, (newChoose) => {
    const selectedObject = getSO();
    if (selectedObject && selectedObject.type === 'text') {
        Object.assign(textParams, {
            bevelEnabled: selectedObject.bevelEnabled,
            depth: selectedObject.depth,
            size: selectedObject.size,
            hover: selectedObject.hover,
            curveSegments: selectedObject.curveSegments,
            bevelThickness: selectedObject.bevelThickness,
            bevelSize: selectedObject.bevelSize,
        });
        textColor.value = selectedObject.color + '';
    }
    if (selectedObject && selectedObject.type === 'roundedRect') {
        roundedRectRadius.value = selectedObject.corner_radius;
    }
}, { immediate: true });

// 更新文字对象的属性
watch(() => textParams, (newValue) => {
    const selectedObject = getSO();
    if (selectedObject && selectedObject.type === 'text') {
        Object.assign(selectedObject, newValue);
        selectedObject.updateText();
    }
}, { deep: true });

// 更新文字对象的颜色
watch(textColor, (newVal) => {
    const selectedObject = getSO();
    if (selectedObject && selectedObject.type === 'text') {
        selectedObject.color = newVal;
        selectedObject.object3D.children.forEach(child => {
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => {
                        material.color.set(newVal);
                    });
                } else {
                    child.material.color.set(newVal);
                }
            }
        })
    }
});

// 圆角矩形的圆角半径
const roundedRectRadius = ref(0);
watch(roundedRectRadius, (newValue) => {
    const selectedObject = getSO();
    if (selectedObject && selectedObject.type === 'roundedRect') {
        selectedObject.corner_radius = newValue;
        selectedObject.updateGeometry();
    }
})
</script>

<style lang="less" scoped>
#carousel-wrapper {
    position: relative;
    width: 70%;
    margin: 0 auto;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    /* 向四周添加柔和的阴影 */

    #carousel {
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;

        transform: translateY(5px);

        height: 120px;

        overflow-x: auto;
        scrollbar-width: none;
    }

    &::after,
    &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 2;
        width: 25px;
    }

    &::before {
        left: 0;
        // 使用阴影代替渐变
        box-shadow: inset 12px 5px 20px -10px rgba(255, 255, 255, 0.8);
    }

    &::after {
        right: 0;
        // 使用阴影代替渐变
        box-shadow: inset -12px 5px 20px -10px rgba(255, 255, 255, 0.8);
    }
}

.cardDiv {
    transition: transform 0.3s ease-in-out;

    &:hover {
        transform: scale(1.1) translateY(-10px);
        z-index: 10;
    }
}
</style>