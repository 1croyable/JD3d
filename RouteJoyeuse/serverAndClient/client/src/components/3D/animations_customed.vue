<template>
    <div v-if="props.showPre">
        <template v-for="(item, index) in sceneStore.objects" :key="index">
            <v-sheet class="bg-blue-grey-lighten-1 d-flex flex-wrap text-center mx-auto px-4" elevation="4" rounded>
                <div>
                    <h2 class="text-h5 font-weight-black text-brown-lighten-5">objet: {{ item.id }}</h2>
                </div>
                <draggable :group="{ name: 'tracks', pull: 'clone', put: false }" :list="itemList(index)" itemKey="id"
                    @end="dragEnd" :clone="clone">
                    <template #item="{ element }">
                        <div style="display: inline;"
                            class="text-h6 font-weight-black text-brown-lighten-5 container">
                            <v-card class="bg-teal-accent-2" width="400" height="30" :title="element.animation.name"
                                variant="plain">
                                <template #prepend>
                                    <v-icon size="15">mdi-star</v-icon>
                                </template>
                                <template #append>
                                    <span style="width: 25px;" class="text-h6">{{ element.props.time }}s</span>
                                </template>
                            </v-card>
                        </div>
                    </template>
                </draggable>
            </v-sheet>
        </template>
    </div>
</template>

<script setup>
import { useAnimation } from '../../../public/stores/3D/animation';
import { useScene } from '../../../public/stores/3D/scene';
import draggable from 'vuedraggable';
import { ref, computed, toRaw } from 'vue';
import { cloneDeep } from 'lodash';


const animationStore = useAnimation();
const sceneStore = useScene();

const props = defineProps({
    showPre: Boolean
})

// reserver tous les animations
const animations = computed(() => {
    let objsNonModule = sceneStore.objects.filter(obj => obj.type !== 'model');

    return objsNonModule.map((obj) => {
        return {
            id: obj.id,
            animations: [...toRaw(obj.animations)]
        }
    })
})

function itemList(index) {
    const array = animations.value.filter((obj) => obj.id === index);
    let result = [];
    let id = 0;

    array[0].animations.forEach((animation) => {
        result.push({
            animationType: 2,
            bg: 'bg-teal-accent-2',
            id: id++,
            animation: animation,
            props: {
                time: getTime(animation),
            },
            positionTime: 0
        })
    })

    return result;
}

function getTime(animation) {
    let duration = 0;
    for (let i = 0; i < animation.tracks.length; i++) {
        let track = toRaw(animation.tracks[i]);
        duration = Math.max(duration, track.keyframes[track.keyframes.length - 1].time);
    }
    return duration / 1000;
}

function dragEnd() {
    animationStore.ifShowToTime = false;
    animationStore.ifshowCurrentTime = true;

    // 整理时间线
    animationStore.timeline.adjustAnimations();
}

function clone(element) {
    const newElement = cloneDeep(element);
    for (let i = 0; i < animationStore.timeline.timelineObjects.length; i++) {
        for (let j = 0; j < animationStore.timeline.timelineObjects[i].tracks.length; j++) {
            ++animationStore.colorBlockIdcount;
        }
    }
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