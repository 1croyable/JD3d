<template>
    <v-overlay attach="addEContainer" class="bg-white" v-model="props.showAddEContainer" :persistent="true"
        scrim="white">
        <div class="borderBeautiful">
        </div>

        <!-- 给新物体命名 -->
        <div id="new-name">
            <v-dialog max-width="500" :model-value="openNewNameDialogForNewGeometry" persistent="">
                <v-card title="给它取个名字吧">
                    <v-card-text>
                        <v-text-field v-model="newName" label="请输入新物体的名字" variant="outlined"></v-text-field>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn :text="newName ? '确定' : '跳过取名，直接创建'" class="text-h6" @click="
                            openNewNameDialogForNewGeometry = false;
                        newName = null;
                        gControl.creatingObject.name = newName ? newName : gControl.creatingObject.id;
                        sceneStore.addObjectToCurrentScene(gControl.creatingObject);
                        "></v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>

        <div id="newSO-container">
            <br>
            <br>
            <div id="addElements">
                <v-tabs v-model="tabActive" direction="vertical" class="mt-16">
                    <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value" variant="outlined" height="60"
                        class="text-h6" :class="{ 'selected-tab': tabActive === tab.value }">
                        <v-icon size="20" v-if="tabActive === tab.value" left
                            class="customIconStar mr-1 mb-1">mdi-star</v-icon>
                        <span class="text-h6" :style="{ 'font-family': 'hkh' }">{{ tab.label }}</span>
                    </v-tab>
                </v-tabs>
            </div>
            <br>
            <div style="transform: rotateZ(5deg); z-index: -999; width: 70%;" class="ml-8">

                <v-card width="100%" elevation="0">
                    <v-card-text>
                        <v-window v-model="tabActive">
                            <v-window-item value="one">
                                <div id="chooseModel" class="pa-3">
                                    <v-file-input v-model="modelChoosed" width="200" label="选择模型文件( 支持 gltf, glb 格式)"
                                        variant="solo" show-size rounded @change="uploadChoosedModel"
                                        @click:clear="clear" prepend-icon="">
                                        <template #prepend-inner>
                                            <v-icon class="mr-5" size="35">mdi-file</v-icon>
                                        </template>
                                    </v-file-input>
                                    <v-btn @click="addModelChoosed()" class="text-h6" rounded block text="确定添加">
                                        <template #append>
                                            <v-icon size="20">mdi-check-decagram</v-icon>
                                        </template>
                                    </v-btn>
                                    <h1 class="text-center my-5">图示说明</h1>
                                    <v-divider class="bg-black mb-5"></v-divider>

                                    <!-- 第一张图和讲解 -->
                                    <v-row class="mt-4 align-center">
                                        <v-col cols="12" md="8">
                                            <v-img src="/imgs/示例/导入模型/1.png" alt="Image 1" contain></v-img>
                                        </v-col>
                                        <v-col cols="12" md="4" class="text-center">
                                            <div class="explanation">
                                                <p>点击导入模型文件</p>
                                            </div>
                                        </v-col>
                                    </v-row>

                                    <!-- 第二张图和讲解 -->
                                    <v-row class="mt-4 align-center">
                                        <v-col cols="12" md="6" class="text-center">
                                            <div class="explanation">
                                                <p>选择您的模型文件</p>
                                            </div>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-img src="/imgs/示例/导入模型/2.png" alt="Image 2" contain></v-img>
                                        </v-col>
                                    </v-row>

                                    <!-- 第三张图和讲解 -->
                                    <v-row class="mt-4 align-center">
                                        <v-col cols="12" md="9">
                                            <v-img src="/imgs/示例/导入模型/3.png" alt="Image 3" contain></v-img>
                                        </v-col>
                                        <v-col cols="12" md="3" class="text-center">
                                            <div class="explanation">
                                                <p>确认开始导入</p>
                                            </div>
                                        </v-col>
                                    </v-row>
                                </div>
                            </v-window-item>

                            <v-window-item value="two">
                                <div id="image2model">
                                    <!-- 上传图片添加模型 -->
                                    <v-dialog width="auto" scrollable persistent>
                                        <template v-slot:activator="{ props }">
                                            <v-btn v-bind="props" width="50%" flat block rounded
                                                class="custom-btn text-h4 ml-5 my-5">
                                                点击开始：图片转模型
                                            </v-btn>
                                            <h1 class="text-center my-5">图示说明</h1>
                                            <v-divider class="bg-black mb-5"></v-divider>

                                            <v-row class="mt-4" dense>
                                                <v-col cols="12" md="3" class="text-center">
                                                    <div class="explanation">
                                                        <p>点击添加图片文件（很适合无背景的图片如logo）</p>
                                                    </div>
                                                </v-col>
                                                <v-col cols="12" md="6">
                                                    <v-img src="/imgs/示例/图片转模型/2.png" alt="Image 1" height="50px"
                                                        contain></v-img>
                                                </v-col>
                                            </v-row>

                                            <v-row class="mt-4" dense>
                                                <v-col cols="12" md="6">
                                                    <v-img src="/imgs/示例/图片转模型/3.png" alt="Image 2" height="150px"
                                                        contain></v-img>
                                                </v-col>
                                                <v-col cols="12" md="3" class="text-center">
                                                    <div class="explanation">
                                                        <p class="mt-16">选择图片</p>
                                                    </div>
                                                </v-col>
                                            </v-row>

                                            <v-row class="mt-4" dense>
                                                <v-col cols="12" md="3" class="text-center">
                                                    <div class="explanation">
                                                        <p>等待片刻，得到模型并预览</p>
                                                    </div>
                                                </v-col>
                                                <v-col cols="12" md="6">
                                                    <v-img src="/imgs/示例/图片转模型/4.png" alt="Image 3" height="80px"
                                                        contain></v-img>
                                                </v-col>
                                            </v-row>

                                            <v-row class="mt-4" dense>
                                                <v-col cols="12" md="6">
                                                    <v-img class="pa-0 ma-0" src="/imgs/示例/图片转模型/5.png" alt="Image 4"
                                                        height="150px" contain></v-img>
                                                </v-col>
                                                <v-col cols="12" md="3" class="text-center mt-16">
                                                    <div class="explanation">
                                                        <p>预览没问题后添加</p>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                        </template>
                                        <template v-slot:default="{ isActive }">
                                            <v-card :loading="image2model_loading" :disabled="image2model_loading"
                                                width="500">
                                                <v-card-title>上传图片</v-card-title>
                                                <v-card-text>
                                                    <v-file-input v-model="image2model_choosedimage" label="选择图片"
                                                        prepend-icon="mdi-camera" accept="image/*"
                                                        @update:modelValue="image2model_clearFile"
                                                        :disabled="image2model_previewReady || image2model_loading"></v-file-input>
                                                </v-card-text>
                                                <v-card-actions>
                                                    <v-container>
                                                        <v-row>
                                                            <v-btn block @click="startImage2Model"
                                                                :disabled="!image2model_choosedimage"
                                                                class="custom-btn">开始</v-btn>
                                                        </v-row>
                                                        <v-row>
                                                            <div style="width: 100%;" ref="closeImage2ModelBtn">
                                                                <v-btn block
                                                                    @click="() => { isActive.value = false; closeDialog() }"
                                                                    :disabled="generateModelLoading"
                                                                    class="custom-btn">关闭</v-btn>
                                                            </div>
                                                        </v-row>
                                                    </v-container>
                                                </v-card-actions>
                                                <template v-if="image2model_previewReady">
                                                    <Image2ModelPre :model="image2model_model"></Image2ModelPre>
                                                    <v-card-actions>
                                                        <v-container>
                                                            <v-row>
                                                                <v-btn block class="text-h5"
                                                                    @click="image2model_addToScene">添加到场景</v-btn>
                                                            </v-row>
                                                            <v-row>
                                                                <v-btn class="text-h5" block
                                                                    @click="cancelPreview">取消</v-btn>
                                                            </v-row>
                                                        </v-container>
                                                    </v-card-actions>
                                                </template>
                                            </v-card>
                                        </template>
                                    </v-dialog>
                                </div>
                            </v-window-item>

                            <v-window-item value="three">
                                <v-container>
                                    <v-row>
                                        <v-col v-for="(geometry, index) in paginatedGeometries" :key="index" cols="6">
                                            <v-card @click="geometry.onClick(); openNewNameDialogForNewGeometry = true;" class="hoverable align-end text-blue"
                                                width="100%" height="20vh" cover :image="geometry.image">
                                                <v-card-title>{{ geometry.name }}</v-card-title>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                    <v-row class="justify-center mt-5">
                                        <v-btn icon @click="prevPage" :disabled="currentPage === 1">
                                            <v-icon>mdi-chevron-left</v-icon>
                                        </v-btn>
                                        <span class="px-4 text-h5">{{ currentPage }} / {{ totalPages }} 页</span>
                                        <v-btn icon @click="nextPage" :disabled="currentPage === totalPages">
                                            <v-icon>mdi-chevron-right</v-icon>
                                        </v-btn>
                                    </v-row>
                                </v-container>
                            </v-window-item>

                            <v-window-item value="four">
                                <v-container>
                                    <v-row dense>
                                        <v-col cols="12">
                                            <v-radio-group v-model="modelURLChoosed">
                                                <v-row>
                                                    <v-col v-for="(model, index) in paginatedModels" :key="index"
                                                        cols="12" md="6">
                                                        <v-card class="hoverable align-end text-blue-lighten-3"
                                                            height="100" :image="model.image">
                                                        </v-card>
                                                        <v-radio :label="model.name" :value="model.value"></v-radio>
                                                    </v-col>
                                                </v-row>
                                            </v-radio-group>
                                        </v-col>
                                    </v-row>
                                    <v-row class="justify-center mt-5" dense>
                                        <v-btn icon @click="prevPage_model" :disabled="currentPage_model === 1">
                                            <v-icon>mdi-chevron-left</v-icon>
                                        </v-btn>
                                        <span class="px-4">{{ currentPage_model }} / {{ totalPages_model }} 页</span>
                                        <v-btn icon @click="nextPage_model"
                                            :disabled="currentPage_model === totalPages_model">
                                            <v-icon>mdi-chevron-right</v-icon>
                                        </v-btn>
                                    </v-row>
                                    <v-row class="justify-center mt-5">
                                        <v-btn block color="surface-variant" @click="addModel">确定</v-btn>
                                    </v-row>
                                </v-container>
                            </v-window-item>

                            <v-window-item value="five">
                                <v-dialog width="auto" scrollable persistent>
                                    <template v-slot:activator="{ props: activatorProps }">
                                        <v-btn v-bind="activatorProps" width="50%" flat block rounded
                                            class="custom-btn text-h4 ml-5 my-5">
                                            添加文字
                                        </v-btn>
                                        <h1 class="text-center my-5">图示说明</h1>
                                        <v-divider class="bg-black mb-5"></v-divider>
                                        <v-row class="ml-10 mt-4" dense>
                                            <v-col cols="12" md="3" class="text-center">
                                                <div class="explanation">
                                                    <p>向文本框中输入文字</p>
                                                </div>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-img src="/imgs/示例/文字模型/1.png" alt="Image 1" height="50px"
                                                    contain></v-img>
                                            </v-col>
                                        </v-row>

                                        <v-row class="ml-10 mt-4" dense>
                                            <v-col cols="12" md="6">
                                                <v-img src="/imgs/示例/文字模型/2.png" alt="Image 2" height="150px"
                                                    contain></v-img>
                                            </v-col>
                                            <v-col cols="12" md="3" class="text-center">
                                                <div class="explanation">
                                                    <p class="mt-16">点击预览，可以更改文字模型的各种属性</p>
                                                </div>
                                            </v-col>
                                        </v-row>

                                        <v-row class="ml-10 mt-4" dense>
                                            <v-col cols="12" md="3" class="text-center">
                                                <div class="explanation">
                                                    <p>点击确定，等待片刻方可生成到场景</p>
                                                </div>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-img src="/imgs/示例/文字模型/3.png" alt="Image 3" height="80px"
                                                    contain></v-img>
                                            </v-col>
                                        </v-row>
                                    </template>
                                    <template v-slot:default="{ isActive }">
                                        <v-row>
                                            <v-col cols="7">
                                                <v-card prepend-icon="mdi-earth" title="添加字体模型" width="500">
                                                    <v-row align="center" class="my-0">
                                                        <v-col cols="5">
                                                            <v-text-field class="ml-2 mr-0 px-0"
                                                                :disabled="if_can_preview_textModel || generateModelLoading"
                                                                v-model="textModel" hide-details="auto" label="输入文字"
                                                                clearable :loading="generateModelLoading">
                                                            </v-text-field>
                                                        </v-col>
                                                        <v-col cols="2">
                                                            <v-btn class="mx-0 px-0" text="预览"
                                                                @click="generateTextModel"
                                                                :disabled="!textModel || if_can_preview_textModel || generateModelLoading"></v-btn>
                                                        </v-col>
                                                        <v-col cols="2">
                                                            <v-btn class="mx-0 px-0" text="确定" @click="addTextModel"
                                                                :disabled="!if_can_preview_textModel || !textModel || generateModelLoading"></v-btn>
                                                        </v-col>
                                                        <v-col cols="2">
                                                            <div ref="closeAddTextBtn">
                                                                <v-btn class="mx-0 px-0" text="关闭"
                                                                    @click="() => { isActive.value = false; closeAddText() }"
                                                                    :disabled="generateModelLoading"></v-btn>
                                                            </div>
                                                        </v-col>
                                                    </v-row>

                                                    <div v-if="if_can_preview_textModel">
                                                        <previewText :previewTextModel="previewTextModel"></previewText>
                                                        <v-btn block @click="closeAddText">清空</v-btn>
                                                        <v-divider class="my-2"></v-divider>
                                                    </div>
                                                </v-card>
                                            </v-col>
                                            <v-col cols="2">
                                                <div class="bg-black" id="modifier_textModel_container"
                                                    v-if="if_can_preview_textModel">
                                                    <v-switch class="px-10" v-model="textParams.bevelEnabled"
                                                        label="启用斜角"></v-switch>
                                                    <v-text-field v-model="textParams.depth" label="深度" type="number"
                                                        step="0.1"></v-text-field>
                                                    <v-text-field v-model="textParams.size" label="大小" type="number"
                                                        step="0.1"></v-text-field>
                                                    <v-text-field v-model="textParams.hover" label="悬浮" type="number"
                                                        step="0.1"></v-text-field>
                                                    <v-text-field v-model="textParams.curveSegments" label="曲线段数"
                                                        type="number"></v-text-field>
                                                    <v-text-field v-model="textParams.bevelThickness" label="斜角厚度"
                                                        step="0.1" type="number"></v-text-field>
                                                    <v-text-field v-model="textParams.bevelSize" label="斜角大小"
                                                        type="number" step="0.1"></v-text-field>
                                                </div>
                                            </v-col>
                                            <v-col cols="3">
                                                <v-color-picker v-if="if_can_preview_textModel" v-model="textColor"
                                                    label="颜色"></v-color-picker>
                                            </v-col>
                                        </v-row>
                                    </template>
                                </v-dialog>
                            </v-window-item>
                        </v-window>
                    </v-card-text>
                </v-card>
            </div>
        </div>
    </v-overlay>
</template>

<script setup>
import { nextTick, onMounted, ref, toRaw, reactive, watch, computed } from 'vue';
import { useScene } from '../../../public/stores/3D/scene';
import previewText from './previewText.vue';
import Image2ModelPre from './Image2ModelPre.vue';
import axios from 'axios';
import * as THREE from 'three';
import * as SO from '../../class/SO'
import geometriesControl from '../../assets/geometries'

const props = defineProps({
    showAddEContainer: Boolean
})

const sceneStore = useScene();

const tabActive = ref('one');
const tabs = [
    { label: '几何体选择', value: 'three' },
    { label: '添加模型', value: 'four' },
    { label: '文字模型', value: 'five' },
    { label: '图片转模型', value: 'two' },
    { label: '管道模型', value: 'six' },
    { label: '添加光源', value: 'seven' },
    { label: '导入模型', value: 'one' },
    { label: '杂项', value: 'eight' },
];

// ===================================添加几何体 翻页操作==================================
const gControl = new geometriesControl();

const openNewNameDialogForNewGeometry = ref(false);

const itemsPerPage = 6; // 每页显示的项目数
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(gControl.geometries.length / itemsPerPage));

const paginatedGeometries = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return gControl.geometries.slice(start, end);
});

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

// ===========================================================
const models = ref([
    { name: '骷髅人', value: '/models/humanity_reconstructed_mir4/scene.gltf', image: '/imgs/前六个模型图片/骷髅人.png' },
    { name: '动漫草地蓝天白云', value: '/models/动漫草地和蓝天白云.glb', image: '/imgs/前六个模型图片/动漫草地蓝天白云.png' },
    { name: '凤凰', value: '/models/phoenix_bird.glb', image: '/imgs/前六个模型图片/凤凰.png' },
    { name: '河蟹', value: '/models/hexie.glb', image: '/imgs/前六个模型图片/河蟹.png' },
    { name: '皮卡丘', value: '/models/pikachu.glb', image: '/imgs/前六个模型图片/皮卡丘.png' },
    { name: '旺财', value: '/models/wangcai.glb', image: '/imgs/前六个模型图片/旺财.png' },
    { name: '白手', value: '/models/the_hand/scene.gltf', image: '/imgs/前六个模型图片/白手.png' },
]);

const itemsPerPage_model = 4; // 每页显示的项目数
const currentPage_model = ref(1);
const modelURLChoosed = ref(null);

const totalPages_model = computed(() => Math.ceil(models.value.length / itemsPerPage_model));

const paginatedModels = computed(() => {
    const start = (currentPage_model.value - 1) * itemsPerPage_model;
    const end = start + itemsPerPage_model;
    return models.value.slice(start, end);
});

const nextPage_model = () => {
    if (currentPage_model.value < totalPages_model.value) {
        currentPage_model.value++;
    }
};

const prevPage_model = () => {
    if (currentPage_model.value > 1) {
        currentPage_model.value--;
    }
};

async function addModel() {
    const { gltf } = await sceneStore.newSO('model', { modelURLChoosed: modelURLChoosed.value });
    sceneStore.scenes[sceneStore.choisiScene].add(gltf.scene);
    modelURLChoosed.value = '';
}

// ===========================================================
const newName = ref(null);

const modelChoosed = ref([]);
async function addModelChoosed() {
    if (!modelURLChoosed.value) return;
    const { gltf } = await sceneStore.newSO('model', { modelURLChoosed: modelURLChoosed.value });
    sceneStore.scenes[sceneStore.choisiScene].add(gltf.scene);
    modelURLChoosed.value = '';
    modelChoosed.value = [];
}

function uploadChoosedModel() {
    if (!modelChoosed.value) {
        modelURLChoosed.value = '';
        return;
    }
    if (modelChoosed.value[0].name.endsWith('.gltf') || modelChoosed.value[0].name.endsWith('.glb')) {
        const file = modelChoosed.value[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            modelURLChoosed.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    else {
        modelChoosed.value = [];
    }
}

function clear() {
    modelChoosed.value = [];
    modelURLChoosed.value = '';
}

// 输入文字生成文字模型

const closeAddTextBtn = ref(null);

const textModel = ref('');
const generateModelLoading = ref(false);
const if_can_preview_textModel = ref(false);
const previewTextModel = ref(null);
async function generateTextModel() {
    if_can_preview_textModel.value = false;
    generateModelLoading.value = true;
    const { text } = await sceneStore.newSO('text', { text: textModel.value });
    generateModelLoading.value = false
    previewTextModel.value = text;
    if_can_preview_textModel.value = true;
}
async function addTextModel() {
    toRaw(sceneStore.scenes[sceneStore.choisiScene]).add(toRaw(previewTextModel.value.object3D));
    sceneStore.objects.push(previewTextModel.value)
    sceneStore.updateCameraControls();
    if_can_preview_textModel.value = false;
    textModel.value = '';
    previewTextModel.value = null;
    // 关闭弹窗
    nextTick(() => {
        if (closeAddTextBtn.value) {
            const button = closeAddTextBtn.value.querySelector('button');
            if (button) {
                button.click();
            }
        }
    });
}
function closeAddText() {
    textModel.value = '';
    generateModelLoading.value = false;
    if_can_preview_textModel.value = false;
    previewTextModel.value = null;
}
const textParams = reactive({
    bevelEnabled: true,
    depth: 0.4,
    size: 14,
    hover: 6,
    curveSegments: 0.8,
    bevelThickness: 0.4,
    bevelSize: 0.3
});

watch(() => textParams, () => {
    if (previewTextModel.value) {
        Object.assign(previewTextModel.value, textParams);
        previewTextModel.value.updateText();
    }
}, { deep: true });

const textColor = ref('#ffffff');
watch(textColor, (newVal) => {
    if (previewTextModel.value) {
        previewTextModel.value.color = newVal;
        previewTextModel.value.object3D.children.forEach(child => {
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => {
                        material.color.set(newVal);
                    });
                } else {
                    child.material.color.set(newVal);
                }
            }
        });
    }
});

// 图片转模型

const image2model_choosedimage = ref(null);
const image2model_loading = ref(false);
const image2model_previewReady = ref(false);
const image2model_model = ref(null);
const closeImage2ModelBtn = ref(null);
// 开始
async function startImage2Model() {
    image2model_loading.value = true;
    const formData = new FormData();
    formData.append('file', toRaw(image2model_choosedimage.value[0]));

    try {
        const { data } = await axios.post('/fast/process_image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // 解析并处理数据
        const blocks = data.blocks;

        console.log('processedblocks', blocks);

        const shapesMap = new Map();

        // 先处理所有的实心块，创建对应的Shape对象
        blocks.forEach(block => {
            const points = block.vertices.map(v => new THREE.Vector2(v[0], v[1]));
            const relativePositionKey = JSON.stringify(block.relative_position);

            if (!block.is_hole) {
                const shape = new THREE.Shape(points);
                shapesMap.set(relativePositionKey, { shape, color: `rgb(${block.color[0]}, ${block.color[1]}, ${block.color[2]})`, holes: [] });
            } else {
                const holePath = new THREE.Path(points);
                if (shapesMap.has(relativePositionKey)) {
                    shapesMap.get(relativePositionKey).holes.push(holePath);
                } else {
                    shapesMap.set(relativePositionKey, { shape: null, color: null, holes: [holePath] });
                }
            }
        });

        // 将孔洞添加到相应的Shape对象中
        shapesMap.forEach((value, key) => {
            if (value.shape) {
                value.holes.forEach(hole => value.shape.holes.push(hole));
            } else {
                console.error(`Hole without a parent shape found at: ${key}`);
            }
        });

        // 最后，创建3D对象
        const finalBlocks = [];
        shapesMap.forEach((value, key) => {
            if (value.shape) {
                const extrudeSettings = {
                    steps: 2,
                    depth: 10,
                    bevelEnabled: false
                };
                const geometry = new THREE.ExtrudeGeometry(value.shape, extrudeSettings);
                const material = new THREE.MeshBasicMaterial({ color: value.color });
                const mesh = new THREE.Mesh(geometry, material);

                finalBlocks.push({
                    mesh: mesh,
                    relativePosition: JSON.parse(key)
                });
            }
        });

        // 将生成的3D对象保存到变量中，便于后续处理
        const { group } = await sceneStore.newSO('group', {
            blocks: toRaw(finalBlocks),
            source: 'image2model'
        });

        // 调试信息
        console.log(`Generated Group:`, group);

        image2model_loading.value = false;
        image2model_previewReady.value = true;
        image2model_model.value = group;

    } catch (error) {
        console.error('Error uploading image:', error);
        // 处理错误
    } finally {
        image2model_loading.value = false;
    }
}




function image2model_addToScene() {
    console.log('添加：', image2model_model.value.object3D)
    toRaw(sceneStore.scenes[sceneStore.choisiScene]).add(toRaw(image2model_model.value.object3D));
    sceneStore.objects.push(image2model_model.value)
    sceneStore.updateCameraControls();
    // 关闭弹窗
    nextTick(() => {
        if (closeImage2ModelBtn.value) {
            const button = closeImage2ModelBtn.value.querySelector('button');
            if (button) {
                button.click();
            }
        }
    });
    sceneStore
    // 添加完成后：
    closeDialog();
}

function cancelPreview() {
    closeDialog();
}

function closeDialog() {
    // 重置对话框状态
    image2model_loading.value = false;
    image2model_previewReady.value = false;
    image2model_choosedimage.value = null;
    image2model_model.value = null;
}

function image2model_clearFile() {
    if (image2model_choosedimage.value.length === 0) {
        image2model_choosedimage.value = null;
    }
}



</script>

<style lang="less" scoped>
@font-face {
    font-family: 'hkh';
    src: url('../../../public/fonts/huangkaihuaLawyerfont-2.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
}

.explanation {
    font-family: 'hkh';
    font-size: 1.5rem;
}

#newSO-container {
    position: absolute;
    top: 45vh;
    width: 33vw;
}

.borderBeautiful {
    width: 5px;
    height: 200vh;
    background: linear-gradient(to bottom, #ff7e5f, #feb47b);
    border-radius: 2.5px;
    position: absolute;
    right: 0;
}

#addElements {
    position: absolute;
    left: 80%;
    border-radius: 5%;
    transform: rotateZ(5deg);
    margin: 0 auto;
    z-index: 50;
}

#modifier_textModel_container {
    border-radius: 5%;
    border: 1px solid #ccc;
}

.selected-tab {
    box-shadow: 0 0 10px black;
}

.custom-btn {
    background: linear-gradient(45deg, #ff7e5f, #feb47b);
    /* 渐变背景 */
    color: white;
    /* 文字颜色 */
    border: none;
    /* 无边框 */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    /* 阴影效果 */
    text-transform: none;
    /* 保持文字原样 */
    font-family: 'hkh', sans-serif;
    /* 自定义字体 */
    font-size: 1.25rem;
    /* 文字大小 */
    padding: 10px 20px;
    /* 内边距 */
    transition: background 0.3s ease;
    /* 背景渐变效果 */
    font-size: 20px;
}

.custom-btn:hover {
    background: linear-gradient(45deg, #feb47b, #ff7e5f);
    font-size: 20px;
    /* 悬停效果 */
}

.custom-btn:disabled {
    background: gray;
    /* 禁用状态背景 */
    cursor: not-allowed;
    /* 禁用状态鼠标样式 */
}

.customIconStar {
    background: linear-gradient(45deg, #6a11cb, #2575fc);
    /* 蓝紫色渐变背景 */
    background-clip: text;
    -webkit-text-fill-color: transparent;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    /* 阴影效果 */
    font-size: 24px;
    /* 调整图标大小 */
    border-radius: 50%;
    /* 圆角 */
    padding: 5px;
    /* 内边距，确保阴影显示 */
    display: inline-block;

    padding: 0;
}

.hoverable {
    transition: transform 0.2s ease-in-out;
}

.hoverable:hover {
    transform: translateY(-5px);
}
</style>