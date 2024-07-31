<template>
    <div v-if="props.showPre">
        <template v-for="(item, index) in sceneStore.modelAnimation" :key="index">
            <v-sheet class="bg-blue-grey-lighten-1 d-flex flex-wrap text-center mx-auto px-4" elevation="4" rounded>
                <div>
                    <h2 class="text-h5 font-weight-black text-brown-lighten-5">Object: {{ item.id+1 }}</h2>
                    <draggable :group="{ name: 'tracks', pull: true, put: false }" :list="itemList(index)"
                        itemKey="id" @end="dragEnd">
                        <template #item="{ element }">
                            <div style="display: inline;"
                                class="text-h6 font-weight-black text-brown-lighten-5 container">
                                <v-card :class="element.bg" width="400" height="30"
                                    :title="element.animation.name" variant="plain">
                                    <template #prepend>
                                        <v-icon size="15">mdi-star</v-icon>
                                    </template>
                                    <template #append>
                                        <span style="width: 25px;" class="text-h6">{{ element.props.time.toFixed(2)
                                            }}s</span>
                                    </template>
                                </v-card>
                            </div>
                        </template>
                    </draggable>
                </div>
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

function itemList(index) {
    const array = sceneStore.modelAnimation;
    let result = [];
    let id = 0;

    array.forEach(model => {
        model.animations.forEach((animation) => {
            result.push({
                animationType: 3,
                bg: 'bg-teal-accent-2',
                id: id++,
                animation: animation,
                props: {
                    time: getTime(animation),
                },
                positionTime: 0
            });
        });
    });
    return result;
}

function getTime(animation) {
    return animation.duration;
}


function dragEnd() {
    animationStore.ifShowToTime = false;
    animationStore.ifshowCurrentTime = true;

    // 整理时间线
    animationStore.timeline.adjustAnimations();
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