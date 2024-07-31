<template>
    <div>
        <!-- 动画信息展示 -->
        <v-dialog v-model="dialog" persistent max-width="600px">
            <v-card v-if="selectedElement.animationType === 1 || selectedElement.animationType === 2">
                <v-card-title class="text-h5">动画：{{ selectedElement.title }}</v-card-title>
                <v-card-text>
                    <v-chip>ID（独立标识）: {{ selectedElement.id }}</v-chip>
                    <v-divider class="mb-3 mt-1"></v-divider>
                    <p>持续时间: {{ selectedElement.props.time }} s</p>
                    <p>开始时间: {{ selectedElement.positionTime }} s</p>
                    <p>时间: {{ selectedElement.positionTime }} s ~ {{ selectedElement.props.time +
                        selectedElement.positionTime }} s</p>

                    <v-divider class="mb-3 mt-1"></v-divider>
                    <!-- 动态渲染参数输入字段 -->
                    <template v-for="(value, key) in selectedElement.props.params" :key="key">
                        <v-text-field v-model="selectedElement.props.params[key]"
                            :label="`${selectedElement.props.paramsDescription[key]} (可更改)`" outlined dense>
                        </v-text-field>
                    </template>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>

            <v-card v-if="selectedElement.animationType === 4">
                <v-card-title class="text-h5">{{ selectedElement.title }}</v-card-title>
                <v-card-text>
                    <v-chip>ID（独立标识）: {{ selectedElement.id }}</v-chip>
                    <v-divider class="mb-3 mt-1"></v-divider>
                    <p>持续时间: {{ selectedElement.props.time }} s</p>
                    <p>开始时间: {{ selectedElement.positionTime }} s</p>
                    <p>时间: {{ selectedElement.positionTime }} s ~ {{ selectedElement.props.time +
                        selectedElement.positionTime }} s</p>

                    <v-divider class="mb-3 mt-1"></v-divider>
                    <!-- 根据色块放在了哪个轨道，检测可以修改的属性并且提供修改的方法 -->
                    <v-container fluid>
                        <v-row>
                            <v-col cols="6">
                                <p>要修改的属性: {{ selectedElement.props.params.property }}</p>
                                <v-radio-group v-model="selectedElement.props.params.property">
                                    <div v-for="(keyName, index) in filterKeyName(Object.keys(chooseSO.modifier))"
                                        :key="index">
                                        <v-radio :label="keyName" :value="keyName"></v-radio>
                                    </div>
                                </v-radio-group>
                            </v-col>
                            <v-col cols="6">
                                <property_action :chooseProperty="selectedElement.props.params.property"
                                    :selectedElement="selectedElement" :chooseSO="chooseSO"></property_action>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 小标签 -->
        <div v-if="animationStore.isWithinTimeline === true"
            :style="{ top: animationStore.mouseY - 35 + 'px', left: animationStore.mouseX + 15 + 'px' }"
            class="tooltip">
            <v-icon v-if="animationStore.ifshowCurrentTime === true" size="x-small">mdi-cursor-default</v-icon>
            <v-icon v-else size="x-small">mdi-cursor-default-click</v-icon>
            {{ currentTime_show }} {{ toTime_show }}
        </div>

        <div class="timeLine-container" v-if="sceneStore.objects.length > 0">
            <v-container v-show="props.showPre">
                <v-row :dense="true">
                    <v-col cols="2">
                        <v-row>
                            <div id="play-stop">
                                <!-- 播放/暂停 -->
                                <v-btn density="compact" v-if="timeline.loading === false"
                                    :icon="(animationStore.playingStatus === 'play') ? 'mdi-pause' : 'mdi-play'"
                                    @click="playorpause" class="play-btn" min-width="52" elevation="10"></v-btn>

                                <v-progress-circular v-else color="blue-lighten-3" indeterminate></v-progress-circular>

                                <!-- 停止 -->
                                <v-btn density="compact" icon="mdi-stop" @click="stopAnimation"
                                    :disabled="animationStore.playingStatus === 'stop' || timeline.loading === true"
                                    class="stop-btn"></v-btn>
                            </div>
                        </v-row>
                        <v-row justify="center">
                            <v-card width="40%" class="mt-10 bg-grey-darken-3">
                                <v-img style="position: absolute;" width="100%"
                                    :src="(ifToDelete === false) ? '/imgs/poubelle fermée.png' : '/imgs/poubelle ouverte.png'"></v-img>
                                <draggable :list="deleteList" :group="{
                                    name: 'delete', pull: false, put: ifToDelete ? ['tracks', 'cameraTracks'] : false
                                }" class="delete-area" itemKey="id" @change="deleteItem">
                                    <template #item="{ element }">
                                        <p style="display: none;">{{ element.id }}</p>
                                    </template>
                                </draggable>
                            </v-card>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-btn :disabled="!animationStore.url" @click="animationStore.downloadVideo"
                                    class="bg-cyan-darken-3 elevation-16 pr-0">下载视频(mp4)
                                    <template #append>
                                        <v-btn class="ml-3 rounded-e-lg bg-cyan-darken-2" variant="flat"
                                            @click.stop="exportList = !exportList">
                                            <v-icon size="30"
                                                :icon="exportList ? 'mdi-menu-right-outline' : 'mdi-menu-right'"></v-icon>
                                            <Transition name="fade">
                                                <div v-show="exportList && animationStore.url" id="export-list">
                                                    <v-list max-width="250" max-height="200">
                                                        <v-list-subheader class="text-h5">更多导出项</v-list-subheader>
                                                        <div style="pointer-events: all;" @click.stop="">
                                                            <v-switch v-model="if_circle" label="循环(HTML)"></v-switch>
                                                            <v-switch :disabled="timeline.timelineObjects.length > 1" v-model="showcase_mode" label="展示模式"></v-switch>
                                                        </div>
                                                        <div class="d-flex flex-wrap justify-center">
                                                            <div v-for="(item, i) in exportItems" :key="i"
                                                                style="pointer-events: all;" color="primary"
                                                                class="mx-1 my-1 pa-0">
                                                                <v-btn :disabled="!animationStore.url"
                                                                    @click.stop="item.function();"
                                                                    :text="item.text"></v-btn>
                                                            </div>
                                                        </div>
                                                    </v-list>
                                                </div>
                                            </Transition>
                                        </v-btn>
                                    </template>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="8" offset="2">
                                <!-- 刷新缩略图 -->
                                <v-btn @click="updateminiature" append-icon="mdi-refresh" block>刷新缩略图</v-btn>
                            </v-col>
                        </v-row>
                    </v-col>

                    <v-col cols="10">
                        <div ref="timeLineMain">
                            <v-row>
                                <v-col cols="11" offset="1">
                                    <!-- 时间刻度 -->
                                    <v-row class="time-ruler mx-1">
                                        <div v-for="sec in 60" :key="sec" class="time-mark text-white">{{ sec }}</div>
                                    </v-row>
                                    <br>
                                    <!-- 相机运动 -->
                                    <v-card v-if="timeline.camera">
                                        <v-card-title>镜头</v-card-title>
                                        <v-card-actions>
                                            <v-btn @click="timeline.addCameraTrack()" size="x-small" icon>
                                                <v-icon size="x-large">mdi-plus</v-icon>
                                            </v-btn>
                                        </v-card-actions>
                                        <v-card-text class="px-0">
                                            <template v-for="(track, trackIndex) in timeline.camera.tracks"
                                                :key="trackIndex">
                                                <div class="draggable-container">
                                                    <draggable :list="track.animations" @end="dragEnd(track)"
                                                        :group="{ name: 'cameraTracks', put: ['cameraTracks'] }"
                                                        itemKey="id" style="display: flex; overflow-x: auto;">
                                                        <template #item="{ element }">
                                                            <div :class="trackElementClass(element)"
                                                                :style="(ifToDelete === true && element.id === dragElement.id) ? '' : trackElementStyle(element)"
                                                                @drag="drag_fn($event, element, track)"
                                                                @click="handleDoubleClick(element)">
                                                                <v-card :class="element.bg"
                                                                    :width="getWidth(element.props.time)" height="30"
                                                                    :title="element.title + ' ' + element.props.time"
                                                                    variant="text">
                                                                    <template #prepend>
                                                                        <v-icon size="15">{{ element.icon
                                                                            }}</v-icon>
                                                                    </template>
                                                                </v-card>
                                                            </div>
                                                        </template>
                                                    </draggable>
                                                </div>
                                            </template>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>

                            <template v-for="(object, index) in sceneStore.objects" :key="index">
                                <v-row>
                                    <v-col cols="1">
                                        <div class="miniature">
                                            <miniature :obj="object"></miniature>
                                        </div>
                                    </v-col>
                                    <v-col cols="11">
                                        <div ref="timeLineMain_object" class="timeLineMain"
                                            :style="{ '--line-width': lineWidth + '%' }">
                                            <v-card>
                                                <v-card-title>
                                                    Object {{ index + 1 }}
                                                </v-card-title>
                                                <v-spacer></v-spacer>
                                                <v-btn size="x-small" icon @click="addTrack(object.id)">
                                                    <v-icon size="x-large">mdi-plus</v-icon>
                                                </v-btn>
                                                <v-card-text class="px-0">
                                                    <div v-for="(track, trackIndex) in timeline.timelineObjects[index].tracks"
                                                        :key="trackIndex">
                                                        <div class="draggable-container">
                                                            <draggable @end="dragEnd(track)" :list="track.animations"
                                                                :group="{ name: 'tracks', put: ['tracks'] }"
                                                                itemKey="id" style="display: flex; overflow-x: auto;">
                                                                <template #item="{ element }">
                                                                    <div v-if="element.animationType === 1 || element.animationType === 4"
                                                                        :class="trackElementClass(element)"
                                                                        :style="(ifToDelete === true && element.id === dragElement.id) ? '' : trackElementStyle(element)"
                                                                        @drag="drag_fn($event, element, track)"
                                                                        @click="handleDoubleClick(element)">
                                                                        <v-card :class="element.bg"
                                                                            :width="getWidth(element.props.time)"
                                                                            height="30"
                                                                            :title="element.title + ' ' + element.props.time"
                                                                            variant="text">
                                                                            <template #prepend>
                                                                                <v-icon size="15">{{ element.icon
                                                                                    }}</v-icon>
                                                                            </template>
                                                                        </v-card>
                                                                    </div>
                                                                    <div v-else-if="element.animationType === 2"
                                                                        @drag="drag_fn($event, element, track)"
                                                                        @end="dragEnd(track)"
                                                                        :class="trackElementClass(element)"
                                                                        :style="(ifToDelete === true && element.id === dragElement.id) ? '' : trackElementStyle(element)">
                                                                        <v-card :class="element.bg"
                                                                            :width="getWidth(element.props.time)"
                                                                            height="30"
                                                                            :title="element.animation.name + ' ' + element.props.time + 's'"
                                                                            variant="text">
                                                                        </v-card>
                                                                    </div>
                                                                    <div v-else @drag="drag_fn($event, element, track)"
                                                                        @end="dragEnd(track)"
                                                                        :class="trackElementClass(element)"
                                                                        :style="(ifToDelete === true && element.id === dragElement.id) ? '' : trackElementStyle(element)">
                                                                        <v-tooltip location="top"
                                                                            :text="element.animation.name + ' ' + element.props.time.toFixed(2) + 's'">
                                                                            <template v-slot:activator="{ props }">
                                                                                <v-card v-bind="props"
                                                                                    :class="element.bg"
                                                                                    :width="getWidth(element.props.time)"
                                                                                    height="30"
                                                                                    :title="element.animation.name + ' ' + element.props.time.toFixed(2) + 's'"
                                                                                    variant="text">
                                                                                </v-card>
                                                                            </template>
                                                                        </v-tooltip>
                                                                    </div>
                                                                </template>
                                                            </draggable>
                                                        </div>
                                                        <br>
                                                    </div>
                                                </v-card-text>
                                            </v-card>
                                        </div>
                                    </v-col>
                                </v-row>
                            </template>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
        </div>
    </div>

</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onBeforeUnmount, nextTick, toRaw, onUnmounted } from 'vue';
import draggable from 'vuedraggable';
import miniature from './miniature.vue';
import { useScene } from '../../../public/stores/3D/scene';
import { useAnimation } from '../../../public/stores/3D/animation';
import property_action from './property_action.vue'
import axios from 'axios';
import * as THREE from 'three';

const timeLineMain_object = ref(null);

const newList = ref([]);

const animationStore = useAnimation();

const props = defineProps({
    showPre: Boolean
})

watch(props, () => {
    if (props.showPre === true) {
        updateminiature();
    }
})

const sceneStore = useScene();
// 同步timeline到pinia，以便场景可以调用，还有后端的交互
const timeline = animationStore.timeline;

watch(sceneStore.objects, (newValue, oldValue) => {
    if (sceneStore.objects.length !== timeline.timelineObjects.length) {
        timeline.addObject(newValue.length - 1, toRaw(sceneStore.objects[newValue.length - 1]).object3D, toRaw(sceneStore.objects[newValue.length - 1]));
    }
});

function addTrack(objectId) {
    timeline.addTrack(objectId);
}

function removeTrack(objectId, trackId) {
    timeline.removeTrack(objectId, trackId);
}

const getWidth = (timeInSeconds) => {
    const totalWidth = computed(() => document.querySelector('.draggable-container').offsetWidth);
    return Math.floor((timeInSeconds / 60) * totalWidth.value);
};

// 小标签显示
const timeLineMain = ref(null);

const toTime_show = computed(() => {
    if (animationStore.ifShowToTime === true) {
        return animationStore.toTime + ' s';
    } else {
        return '';
    }
})

const currentTime_show = computed(() => {
    if (animationStore.ifshowCurrentTime === true) {
        return animationStore.currentTime + ' s';
    } else {
        return '';
    }
})

onMounted(async () => {
    await nextTick();
    document.addEventListener('mousemove', onMouseMove);
    animationStore.timeLineMainLeft = timeLineMain_object.value[0].getBoundingClientRect().left;
    animationStore.timeLineMainTop = timeLineMain.value.getBoundingClientRect().top;
    animationStore.timeLineMainWidth = timeLineMain_object.value[0].offsetWidth;
    animationStore.timeLineMainHeight = timeLineMain.value.offsetHeight;
});

const onMouseMove = (event) => {
    if (props.showPre) {
        const mouseXInTimeLine = event.clientX - timeLineMain_object.value[0].getBoundingClientRect().left;
        const mouseYInTimeLine = event.clientY - timeLineMain.value.getBoundingClientRect().top;
        if (mouseXInTimeLine < 0 || mouseXInTimeLine > timeLineMain_object.value[0].offsetWidth ||
            mouseYInTimeLine < 0) {
            // 关闭显示
            animationStore.isWithinTimeline = false;
            animationStore.mouseX = 0;
            animationStore.mouseY = 0;
            return
        } else {
            // 打开显示
            animationStore.isWithinTimeline = true;
            animationStore.mouseX = event.clientX;
            animationStore.mouseY = event.clientY;
            // 计算时间
            const ratio = mouseXInTimeLine / timeLineMain_object.value[0].offsetWidth;
            animationStore.currentTime = Math.floor(ratio * 60);
        }
    }
};

onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onMouseMove);
})

function dragEnd(track) {
    animationStore.ifShowToTime = false;
    animationStore.ifshowCurrentTime = true;
    ifToDelete.value = false;

    // 调整位置，防止重叠，首先找到除了被移动元素的所有的时间段
    const timepositions_ = track.animations.filter(animation =>
        animation !== dragElement.value  // 假设 dragElement.value 是直接的引用; 如果不是，可能需要其他比较
    ).map(animation => {
        return {
            startTime: animation.positionTime,
            endTime: animation.positionTime + animation.props.time
        }
    });

    // 如果有重叠的时间段，那么就做修改，直接往后放
    if (timepositions_.some((time, index) => {
        return ((dragElement.value.positionTime < time.endTime &&
            (dragElement.value.positionTime + dragElement.value.props.time) > time.startTime) ||
            (dragElement.value.positionTime == time.startTime &&
                dragElement.value.positionTime + dragElement.value.props.time == time.endTime));
    })) {
        // 找到重叠的索引
        const overlappingIndex = timepositions_.findIndex((time, index) => {
            return ((dragElement.value.positionTime < time.endTime &&
                (dragElement.value.positionTime + dragElement.value.props.time) > time.startTime) ||
                (dragElement.value.positionTime == time.startTime &&
                    dragElement.value.positionTime + dragElement.value.props.time == time.endTime));
        })
        dragElement.value.positionTime = timepositions_[overlappingIndex].endTime;

        timeline.adjustAnimations();
        dragElement.value = null;
    }
}

const dragElement = ref(null);
const currentTrack = ref(null);
function drag_fn(event, element, track) {
    const area = document.querySelector('.delete-area').getBoundingClientRect();
    if (event.clientX >= area.left && event.clientX <= area.right && event.clientY >= area.top && event.clientY <= area.bottom) {
        ifToDelete.value = true;
    } else {
        ifToDelete.value = false;
    }

    currentTrack.value = track;

    //找到正在拖动的元素
    dragElement.value = track.animations.find(animation => animation === element);

    animationStore.ifShowToTime = true;
    animationStore.ifshowCurrentTime = false;
    if (props.showPre) {
        const mouseXInTimeLine = event.clientX - timeLineMain_object.value[0].getBoundingClientRect().left;
        const mouseYInTimeLine = event.clientY - timeLineMain.value.getBoundingClientRect().top;
        if (mouseXInTimeLine < 0 || mouseXInTimeLine > timeLineMain_object.value[0].offsetWidth ||
            mouseYInTimeLine < 0) {
            // 关闭显示
            animationStore.isWithinTimeline = false;
            animationStore.mouseX = 0;
            animationStore.mouseY = 0;
            return
        } else {
            // 打开显示
            animationStore.isWithinTimeline = true;
            animationStore.mouseX = event.clientX;
            animationStore.mouseY = event.clientY;
            // 计算时间
            const ratio = mouseXInTimeLine / timeLineMain_object.value[0].offsetWidth;
            animationStore.toTime = Math.floor(ratio * 60);
            element.positionTime = Math.floor(ratio * 60);
        }
    }
}

function trackElementStyle(element) {
    return 'left: ' + element.positionTime * timeLineMain_object.value[0].offsetWidth / 60 + 'px;'
}

function trackElementClass(element) {
    if (dragElement.value === null) {
        return 'trackElement'
    } else {
        if (ifToDelete.value === true && element.id == dragElement.value.id) {
            return 'delete'
        } else {
            return 'trackElement'
        }
    }
}

// 时间线动画处理
// 时间不能超过60s，超过60s就停止
let w = null;

function playorpause() {
    if (animationStore.playingStatus === 'stop') {
        animationStore.playingStatus = 'play';

        animationStore.url = null;
        exportList.value = false;

        // 解析并播放所有动画
        timeline.customUpdates = [];
        timeline.uploadCustomUpdates = [];
        timeline.customUpdatesClearFns = [];
        timeline.convertAnimations();    // 解析物体和相机动画
        timeline.startAllAnimations();   // 播放所有动画

        animationStore.recordedBlobs = [];
        animationStore.canvasRecorder.start(10);

        // 关闭控制器
        if (sceneStore.preControl) {
            sceneStore.preControl.enabled = false;
            sceneStore.ifRenderPreControls = false;
        }

        if (w) {
            w = null;
        }

        w = watch(timeline.clock, () => {
            if (timeline.clock.elapsedTime >= 60) {
                stopAnimation();
                w = null;
            }
        });

        animationStore.url = null;

    } else if (animationStore.playingStatus === 'play') {
        animationStore.playingStatus = 'pause';
        timeline.pauseAllAnimations();      // 暂停所有动画
        animationStore.canvasRecorder.pause();

        // 开启控制器
        if (sceneStore.preControl) {
            sceneStore.preControl.enabled = true;
            sceneStore.ifRenderPreControls = true;
        }

    } else {
        animationStore.playingStatus = 'play';
        timeline.resumeAllAnimations();     // 恢复所有动画
        animationStore.canvasRecorder.resume();

        // 关闭控制器
        if (sceneStore.preControl) {
            sceneStore.preControl.enabled = false;
            sceneStore.ifRenderPreControls = false;
        }
    }
}

function stopAnimation() {
    animationStore.playingStatus = 'stop';
    lineWidth.value = 0;
    animationStore.videoDuration = timeline.clock.elapsedTime;
    timeline.stopAllAnimations();     // 停止所有动画
    animationStore.canvasRecorder.stop();
    animationStore.saveURL();

    // 开启控制器
    if (sceneStore.preControl) {
        sceneStore.preControl.enabled = true;
        sceneStore.ifRenderPreControls = true;
    }
}


// 动画信息展示控制
const dialog = ref(false);
const selectedElement = ref(null);
let clickTimeout = null;

const handleDoubleClick = (element) => {
    if (!clickTimeout) {
        clickTimeout = setTimeout(() => {
            clickTimeout = null;
        }, 300);
    } else {
        // 此时说明计时器存在，在300ms内已经点击过一次
        clearTimeout(clickTimeout);
        clickTimeout = null;
        selectedElement.value = element;
        dialog.value = true;
    }
};

onUnmounted(() => {
    if (clickTimeout) {
        clearTimeout(clickTimeout);
    }
});

// 删除
const ifToDelete = ref(false);

function deleteItem(evt) {
    ifToDelete.value = false;
}

const deleteList = ref([]);

const lineWidth = computed(() => {
    return (timeline.timelineObjects[0].mixer.time / 60) * 100;
});

// 刷新缩略图
function updateminiature() {
    animationStore.updateTrigger++;
}

// 控制导出列表
const exportList = ref(false);
const exportItems = ref([
    {
        text: 'HTML',
        function: () => {
            exportToHTML(if_circle.value, showcase_mode.value);
        }
    },
    {
        text: 'JSON',
        function: () => {
            const jsonData = exportToJSON();
            downloadJSON(jsonData);
        }
    },
    {
        text: 'mp4',
        function: () => {
            animationStore.downloadVideo('mp4')
        }
    },
    {
        text: 'mov',
        function: () => {
            animationStore.downloadVideo('mov')
        }
    },
    {
        text: 'webm',
        function: () => {
            animationStore.downloadVideo('webm');
        }
    }
]);

function exportToJSON() {
    animationStore.timeline.convertAnimations();

    // 生成动画时间线数据，移除 mixer，提取 animationClip
    const actionsInTimeLine = [];
    animationStore.timeline.timelineObjects.forEach(obj => {
        obj.mixer._actions.forEach(action => {
            actionsInTimeLine.push({
                target: obj.object3D.uuid,
                animationClip: action.getClip().toJSON()
            });
        });
    });

    if (animationStore.timeline.camera) {
        animationStore.timeline.camera.trackAnimations.forEach(action => {
            actionsInTimeLine.push({
                target: 'camera',
                animationClip: action.getClip().toJSON()
            });
        });
    }

    // 使用 toJSON 方法转换 Three.js 对象
    toRaw(sceneStore.scenes[sceneStore.choisiScene]).updateMatrixWorld(true);  // 更新所有对象的变换矩阵
    toRaw(sceneStore.cameras[sceneStore.choisiCamera + 1]).updateMatrixWorld(true);  // 确保相机的矩阵已更新

    const sceneJSON = toRaw(sceneStore.scenes[sceneStore.choisiScene]).toJSON();
    const cameraJSON = toRaw(sceneStore.cameras[sceneStore.choisiCamera + 1]).toJSON();

    // 创建最终的导出数据
    const exportData = {
        scene: sceneJSON,
        camera: cameraJSON,
        actionsInTimeLine: actionsInTimeLine,
        duration: animationStore.videoDuration, // 保存动画时长数据
        uploadCustomUpdates: [...animationStore.timeline.uploadCustomUpdates] // 保存上传自定义更新数据
    };

    try {
        // 将数据转换为 JSON 字符串
        const jsonData = JSON.stringify(exportData, null, 2);
        console.log('Export Data:', exportData);
        return jsonData;
    } catch (error) {
        console.error('Error: ', error);
    }
}

async function exportToHTML(ifCircle, showcaseMode) {
    const jsonData = exportToJSON();

    try {
        const response = await axios.post('/api/3D/exportToHTML', { jsonData, ifCircle, showcaseMode }, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'export.html');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error: ', error);
    }
}



function downloadJSON(jsonData) {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 修改属性的动画色块
const chooseSO = ref(null); // 保存要修改属性的SO
watch(selectedElement, (newValue, oldValue) => {
    //  检查被点击色块所在的track对应的物体
    const id = selectedElement.value.id;
    timeline.timelineObjects.forEach(obj => {
        obj.tracks.forEach(track => {
            track.animations.forEach(animation => {
                if (animation.id === id) {
                    chooseSO.value = obj.originalObject;
                }
            });
        })
    })
})
const chineseKeyName = ref({
    'position': '位置',
    'rotation': '旋转',
    'scale': '缩放',
    'visible': '可见性',
    'opacity': '透明度',
    'color': '颜色',
    'corner_radius': '圆角半径'
})
function filterKeyName(keys) {
    return keys
        .filter(key => Object.keys(chineseKeyName.value).includes(key))
        .map(key => chineseKeyName.value[key]);
}

const if_circle = ref(false);
const showcase_mode = ref(false);
</script>

<style scoped lang="less">
.timeLine-container {
    display: flex;
    flex-direction: column;
    width: 98vw;
    height: 35vh;
    position: absolute;
    bottom: 3%;
    left: 0;
    overflow-y: auto;
    border: 1px solid rgb(255, 255, 255);
}

.timeLine-container,
.time-ruler,
.track-drag-area {
    width: 100%;
}

.time-ruler {
    display: flex;
    border-top: 1px solid rgb(255, 255, 255);
    margin-bottom: 5px;
}

.time-mark {
    flex: 1;
    text-align: center;
}

.miniature {
    width: 5vw;
    height: 5vw;
}

.track-item {
    padding: 10px;
    border: 1px solid #ccc;
    margin: 5px 0;
    background-color: #f9f9f9;
    display: inline-block;
    cursor: pointer;
}

.draggable-container {
    width: 100%;
    height: 32px;
    border: 1px solid black;
}

.tooltip {
    position: absolute;
    background: rgb(186, 1, 1);
    border: 1px solid #5e0101;
    border-radius: 25%;
    width: 60px;
    height: 18px;
    color: white;
    text-align: center;
    line-height: 18px;
    font-size: 10px;
    pointer-events: none;
    z-index: 9999;
}

.trackElement {
    position: absolute;
}


.play-btn {
    background-image: linear-gradient(to right, #6a11cb, #2575fc);
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    box-shadow: 0 4px 6px fadeout(black, 90%);
    cursor: pointer;
    transition: background-image 0.3s ease, box-shadow 0.3s ease;

    &:hover,
    &:focus {
        background-image: linear-gradient(to right, #6a11cb, #2575fc);
        box-shadow: 0 6px 8px fadeout(black, 85%);
    }

    &:disabled {
        background: grey;
        box-shadow: none;
        cursor: not-allowed;
    }
}

.stop-btn {
    background-image: linear-gradient(-18deg, #ca5f5f, #B71C1C);
    box-shadow: 0 4px 6px fadeout(black, 90%);
    cursor: pointer;
    transition: background-image 0.3s ease, box-shadow 0.3s ease;
}

#play-stop {
    position: relative;
    top: 7%;
    left: 2%;
    width: 100%;
    margin-top: 10px;

    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.delete-area {
    height: 11vh;
    width: 100%;
    margin-top: 20px;
}

.delete {
    position: absolute;
    top: 30%;
    left: 15%;
    cursor: pointer;
}

.timeLineMain::before {
    content: "";
    position: relative;
    display: inline-block;
    top: 6px;
    left: 0;
    height: 5px;
    z-index: 1;
    width: var(--line-width, 0);
    background-color: #C62828;
}

#export-list {
    position: absolute;
    bottom: 10%;
    right: -170px;
    border-radius: 10%;
    z-index: 10;
    overflow-y: auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>