<template>
    <div>
        <draggable @drag="drag_fn" @end="dragEnd" :list="animationComponents"
            :group="{ name: 'cameraTracks', pull: 'clone', put: false }" itemKey="id" :clone="clone">
            <template #item="{ element }">
                <div :key="element.id" style="display: inline-block;" class="container">
                    <component :is="element.component" :proprietes="element.props"></component>
                </div>
            </template>
        </draggable>
    </div>
</template>

<script setup>
import back from './presetAnimations_camera/back.vue'
import forward from './presetAnimations_camera/forward.vue';
import left from './presetAnimations_camera/left.vue';
import right from './presetAnimations_camera/right.vue';
import up from './presetAnimations_camera/up.vue';
import down from './presetAnimations_camera/down.vue';
import rotateClockwise from './presetAnimations_camera/rotateClockwise.vue';
import rotateCounterClockwise from './presetAnimations_camera/rotateCounterClockwise.vue';
import zoomIn from './presetAnimations_camera/zoomIn.vue';
import zoomOut from './presetAnimations_camera/zoomOut.vue';

import draggable from 'vuedraggable';
import { ref, shallowRef, computed } from 'vue';
import { useAnimation } from '../../../public/stores/3D/animation';
import { cloneDeep } from 'lodash';

const props = defineProps({
    showPre: Boolean
})

const proprietes = ref({
    back: 5,
    forward: 5,
    left: 5,
    right: 5,
    up: 5,
    down: 5,
    rotateClockwise: 5,
    rotateCounterClockwise: 5,
    zoomIn: 5,
    zoomOut: 5,
});


const animationStore = useAnimation();

const animationComponents = ref([
    { id: 1, component: shallowRef(back), name: 'back', bg: 'bg-teal-accent-1', title: '向后', props: { time: proprietes.value.back, params: { param1: 5 }, paramsDescription: { param1: '向后移动距离' } }, positionTime: 0 },
    { id: 2, component: shallowRef(forward), name: 'forward', bg: 'bg-teal-accent-2', title: '向前', props: { time: proprietes.value.forward, params: { param1: 5 }, paramsDescription: { param1: '向前移动距离' } }, positionTime: 0 },
    { id: 3, component: shallowRef(left), name: 'left', bg: 'bg-teal-accent-3', title: '向左', props: { time: proprietes.value.left, params: { param1: 5 }, paramsDescription: { param1: '向左移动距离' } }, positionTime: 0 },
    { id: 4, component: shallowRef(right), name: 'right', bg: 'bg-teal-accent-4', title: '向右', props: { time: proprietes.value.right, params: { param1: 5 }, paramsDescription: { param1: '向右移动距离' } }, positionTime: 0 },
    { id: 5, component: shallowRef(up), name: 'up', bg: 'bg-blue-accent-1', title: '向上', props: { time: proprietes.value.up, params: { param1: 5 }, paramsDescription: { param1: '向上移动距离' } }, positionTime: 0 },
    { id: 6, component: shallowRef(down), name: 'down', bg: 'bg-blue-accent-2', title: '向下', props: { time: proprietes.value.down, params: { param1: 5 }, paramsDescription: { param1: '向下移动距离' } }, positionTime: 0 },
    { id: 7, component: shallowRef(rotateClockwise), name: 'rotateClockwise', bg: 'bg-blue-accent-3', title: '顺时针旋转', props: { time: proprietes.value.rotateClockwise, params: { param1: 90 }, paramsDescription: { param1: '旋转角度' } }, positionTime: 0 },
    { id: 8, component: shallowRef(rotateCounterClockwise), name: 'rotateCounterClockwise', bg: 'bg-blue-accent-4', title: '逆时针旋转', props: { time: proprietes.value.rotateCounterClockwise, params: { param1: 90 }, paramsDescription: { param1: '旋转角度' } }, positionTime: 0 },
    { id: 9, component: shallowRef(zoomIn), name: 'zoomIn', bg: 'bg-green-accent-1', title: '放大', props: { time: proprietes.value.zoomIn, params: { param1: 1.5 }, paramsDescription: { param1: '放大比例' } }, positionTime: 0 },
    { id: 10, component: shallowRef(zoomOut), name: 'zoomOut', bg: 'bg-green-accent-2', title: '缩小', props: { time: proprietes.value.zoomOut, params: { param1: 0.5 }, paramsDescription: { param1: '缩小比例' } }, positionTime: 0 },
]);


function dragEnd() {
    animationStore.ifShowToTime = false;
    animationStore.ifshowCurrentTime = true;

    // 整理时间线
    animationStore.timeline.adjustAnimations();
}

function drag_fn(event) {
    animationStore.ifShowToTime = true;
    animationStore.ifshowCurrentTime = false;
    if (props.showPre) {
        const mouseXInTimeLine = event.clientX - animationStore.timeLineMainLeft;
        const mouseYInTimeLine = event.clientY - animationStore.timeLineMainTop;
        if (mouseXInTimeLine < 0 || mouseXInTimeLine > animationStore.timeLineMainWidth ||
            mouseYInTimeLine < 0 || mouseYInTimeLine > animationStore.timeLineMainHeight) {
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
            const ratio = mouseXInTimeLine / animationStore.timeLineMainWidth;
            animationStore.currentTime = Math.floor(ratio * 60);
        }
    }
}

function clone(element) {
    const newElement = cloneDeep(element);
    ++animationStore.colorBlockIdcount;
    newElement.id = animationStore.colorBlockIdcount;
    return newElement
}

</script>

<style lang="less" scoped>
.container {
    height: 100%;
    display: flex;
    gap: 10px;
    overflow-y: auto;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 10px;
}
</style>