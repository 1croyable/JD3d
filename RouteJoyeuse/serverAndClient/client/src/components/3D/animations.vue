<template>
    <div>
        <draggable @drag="drag_fn" @end="dragEnd" :list="animationComponents"
            :group="{ name: 'tracks', pull: 'clone', put: false }" itemKey="id" :clone="clone">
            <template #item="{ element }">
                <div :key="element.id" style="display: inline-block;" class="container">
                    <component :is="element.component" :proprietes="element.props"></component>
                </div>
            </template>
        </draggable>
    </div>
</template>

<script setup>
import moveZ from './presetAnimations/moveZ.vue';
import routate2pi from './presetAnimations/routate2pi.vue';
import arc_fly_in_fly_out_Z from './presetAnimations/arc_fly_in_fly_out_Z.vue';
import elliptical_fly_in from './presetAnimations/elliptical_fly_in.vue';
import elliptical_fly_out from './presetAnimations/elliptical_fly_out.vue';
import property_modifier from './presetAnimations/property_modifier.vue';
import fadeIn from './presetAnimations/fadeIn.vue';
import fadeOut from './presetAnimations/fadeOut.vue';
import slideUp from './presetAnimations/slideUp.vue';
import slideDown from './presetAnimations/slideDown.vue';
import zoomIn from './presetAnimations/zoomIn.vue';
import moveX from './presetAnimations/moveX.vue';
import rotateX from './presetAnimations/rotateX.vue';
import scaleUp from './presetAnimations/scaleUp.vue';
import scaleDown from './presetAnimations/scaleDown.vue';
import bounce from './presetAnimations/bounce.vue';
import shake from './presetAnimations/shake.vue';
import swing from './presetAnimations/swing.vue';
import flash from './presetAnimations/flash.vue';
import slideInLeft from './presetAnimations/slideInLeft.vue';
import slideInRight from './presetAnimations/slideInRight.vue';


import draggable from 'vuedraggable';

import { ref, shallowRef, computed } from 'vue';
import { useAnimation } from '../../../public/stores/3D/animation';
import { cloneDeep } from 'lodash';

const props = defineProps({
    showPre: Boolean
})

const animationStore = useAnimation();

const proprietes = ref({
    property_modifier: 5,
    z: 5,
    routate2pi: 5,
    arc_fly_in_fly_out_Z: 5,
    elliptical_fly_in: 5,
    elliptical_fly_out: 5,
    moveX: 5,
    rotateX: 5,
    scaleUp: 5,
    scaleDown: 5,
    bounce: 5,
    shake: 5,
    swing: 5,
    flash: 5,
    slideInLeft: 5,
    slideInRight: 5,
    slideUp: 5,
    slideDown: 5,
    fadeIn: 5,
    fadeOut: 5,
    zoomIn: 5,
    zoomOut: 5
});

const animationComponents = ref([
    {
        animationType: 4,
        id: 1,
        component: shallowRef(property_modifier),
        name: 'property_modifier',
        bg: 'bg-black',
        title: '属性修改',
        icon: 'mdi-pencil',
        props: {
            time: proprietes.value.property_modifier,
            params: {
                property: '',
                from: '',
                to: ''
            },
            paramsDescription: {
                property: '属性名',
                from: '起始值',
                to: '结束值'
            }
        },
        positionTime: 0,
    },
    { animationType: 1, id: 2, component: shallowRef(moveZ), name: 'moveZ', bg: 'bg-teal-accent-2', title: '沿Z轴', icon: 'mdi-taxi', props: { time: proprietes.value.z, params: { param1: 5 }, paramsDescription: { param1: 'Z轴移动距离' } }, positionTime: 0 },
    { animationType: 1, id: 3, component: shallowRef(routate2pi), name: 'routate2pi', bg: 'bg-lime-darken-1', title: '旋转一圈', icon: 'mdi-autorenew', props: { time: proprietes.value.routate2pi, params: { param1: 0, param2: 0, param3: 1 }, paramsDescription: { param1: '旋转轴X坐标', param2: '旋转轴Y坐标', param3: '旋转轴Z坐标' } }, positionTime: 0 },
    { animationType: 1, id: 4, component: shallowRef(arc_fly_in_fly_out_Z), name: 'arc_fly_in_fly_out_Z', bg: 'bg-pink-accent-2', title: '弧形飞入飞出', icon: 'mdi-swap-horizontal', props: { time: proprietes.value.arc_fly_in_fly_out_Z, params: { param1: 20, param2: 20 }, paramsDescription: { param1: '飞入运动半径', param2: '飞出运动半径' } }, positionTime: 0 },
    {
        animationType: 1,
        id: 5,
        component: shallowRef(elliptical_fly_in),
        name: 'elliptical_fly_in',
        bg: 'bg-blue-accent-2',
        title: '椭圆形飞入',
        icon: 'mdi-arrow-right-bold',
        props: {
            time: proprietes.value.elliptical_fly_in,
            params: {
                param1: 9,
                param2: 3
            },
            paramsDescription: {
                param1: 'X轴方向半径',
                param2: 'Z轴方向半径'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 6,
        component: shallowRef(elliptical_fly_out),
        name: 'elliptical_fly_out',
        bg: 'bg-green-accent-2',
        title: '椭圆形飞出',
        icon: 'mdi-arrow-left-bold',
        props: {
            time: proprietes.value.elliptical_fly_out,
            params: {
                param1: 9,
                param2: 3
            },
            paramsDescription: {
                param1: 'X轴方向半径',
                param2: 'Z轴方向半径'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 7,
        component: shallowRef(moveX),
        name: 'moveX',
        bg: 'bg-orange-accent-2',
        title: '沿X轴',
        icon: 'mdi-arrow-right',
        props: {
            time: proprietes.value.moveX,
            params: {
                param1: 10
            },
            paramsDescription: {
                param1: 'X轴移动距离'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 8,
        component: shallowRef(rotateX),
        name: 'rotateX',
        bg: 'bg-purple-accent-2',
        title: '旋转X轴',
        icon: 'mdi-rotate-left',
        props: {
            time: proprietes.value.rotateX,
            params: {
                param1: 1
            },
            paramsDescription: {
                param1: '旋转角度'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 9,
        component: shallowRef(scaleUp),
        name: 'scaleUp',
        bg: 'bg-yellow-accent-2',
        title: '放大',
        icon: 'mdi-magnify-plus-outline',
        props: {
            time: proprietes.value.scaleUp,
            params: {
                param1: 1.5
            },
            paramsDescription: {
                param1: '放大比例'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 10,
        component: shallowRef(scaleDown),
        name: 'scaleDown',
        bg: 'bg-red-accent-2',
        title: '缩小',
        icon: 'mdi-magnify-minus-outline',
        props: {
            time: proprietes.value.scaleDown,
            params: {
                param1: 0.5
            },
            paramsDescription: {
                param1: '缩小比例'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 11,
        component: shallowRef(bounce),
        name: 'bounce',
        bg: 'bg-indigo-accent-2',
        title: '弹跳',
        icon: 'mdi-arrow-collapse-up',
        props: {
            time: proprietes.value.bounce,
            params: {
                param1: 2
            },
            paramsDescription: {
                param1: '弹跳高度'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 12,
        component: shallowRef(shake),
        name: 'shake',
        bg: 'bg-pink-accent-2',
        title: '摇晃',
        icon: 'mdi-rattle',
        props: {
            time: proprietes.value.shake,
            params: {
                param1: 5
            },
            paramsDescription: {
                param1: '摇晃次数'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 13,
        component: shallowRef(swing),
        name: 'swing',
        bg: 'bg-brown-accent-2',
        title: '摆动',
        icon: 'mdi-swing',
        props: {
            time: proprietes.value.swing,
            params: {
                param1: 30
            },
            paramsDescription: {
                param1: '摆动幅度'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 14,
        component: shallowRef(flash),
        name: 'flash',
        bg: 'bg-cyan-accent-2',
        title: '闪烁',
        icon: 'mdi-flash',
        props: {
            time: proprietes.value.flash,
            params: {
                param1: 3
            },
            paramsDescription: {
                param1: '闪烁次数'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 15,
        component: shallowRef(slideInLeft),
        name: 'slideInLeft',
        bg: 'bg-deep-orange-accent-2',
        title: '从左滑入',
        icon: 'mdi-arrow-left-bold',
        props: {
            time: proprietes.value.slideInLeft,
            params: {
                param1: 50
            },
            paramsDescription: {
                param1: '滑入距离'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 16,
        component: shallowRef(slideUp),
        name: 'slideUp',
        bg: 'bg-blue-grey-accent-2',
        title: '向上滑入',
        icon: 'mdi-arrow-up-bold',
        props: {
            time: proprietes.value.slideUp,
            params: {
                param1: 50
            },
            paramsDescription: {
                param1: '滑入距离'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 17,
        component: shallowRef(slideDown),
        name: 'slideDown',
        bg: 'bg-light-blue-accent-2',
        title: '向下滑入',
        icon: 'mdi-arrow-down-bold',
        props: {
            time: proprietes.value.slideDown,
            params: {
                param1: 50
            },
            paramsDescription: {
                param1: '滑入距离'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 18,
        component: shallowRef(fadeIn),
        name: 'fadeIn',
        bg: 'bg-purple-accent-3',
        title: '淡入',
        icon: 'mdi-alpha-f-box',
        props: {
            time: proprietes.value.fadeIn,
            params: {
                param1: 1
            },
            paramsDescription: {
                param1: '淡入时间'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 19,
        component: shallowRef(fadeOut),
        name: 'fadeOut',
        bg: 'bg-purple-accent-4',
        title: '淡出',
        icon: 'mdi-alpha-f-box-outline',
        props: {
            time: proprietes.value.fadeOut,
            params: {
                param1: 1
            },
            paramsDescription: {
                param1: '淡出时间'
            }
        },
        positionTime: 0
    },
    {
        animationType: 1,
        id: 20,
        component: shallowRef(zoomIn),
        name: 'zoomIn',
        bg: 'bg-indigo-accent-3',
        title: '放大',
        icon: 'mdi-magnify-plus',
        props: {
            time: proprietes.value.zoomIn,
            params: {
                param1: 1.5
            },
            paramsDescription: {
                param1: '放大比例'
            }
        },
        positionTime: 0
    }
]);

function dragEnd() {
    // animationStore.isDragging = false;
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