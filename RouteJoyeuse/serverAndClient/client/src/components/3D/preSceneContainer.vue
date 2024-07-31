<template>
    <div class="container">
        <v-card width="40%" max-height="60%" class=" overflow-y-auto custom-scrollbar styled-card">
            <v-tabs v-model="tab" bg-color="blue-grey-darken-4" class="styled-tabs">
                <v-tab value="one">动画库</v-tab>
                <v-tab value="two">模型动画库</v-tab>
                <v-tab value="three">镜头运动库</v-tab>
                <v-tab value="four">自定义动画</v-tab>
            </v-tabs>

            <v-card-text>
                <v-window v-model="tab">
                    <v-window-item value="one">
                        <animations :showPre="props.showPre"></animations>
                    </v-window-item>

                    <v-window-item value="two">
                        <modelAnimations :showPre="props.showPre"></modelAnimations>
                    </v-window-item>

                    <v-window-item value="three">
                        <cameraAnimation :showPre="props.showPre"></cameraAnimation>
                    </v-window-item>

                    <v-window-item value="four">
                        <animations_customed :showPre="props.showPre"></animations_customed>
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>
        <div class="mx-2">
            <preScene></preScene>
        </div>
        <timeline :showPre="props.showPre"></timeline>
    </div>
</template>

<script setup>
import preScene from './preScene.vue';
import animations from './animations.vue';
import animations_customed from './animations_customed.vue';
import modelAnimations from './modelAnimations.vue';
import timeline from './timeline.vue';
import cameraAnimation from './cameraAnimation.vue';
import { ref } from 'vue';

const tab = ref(undefined)

const props = defineProps({
    showPre: Boolean
})

</script>

<style lang="less" scoped>
.container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
    background: linear-gradient(20deg, black 40%, darkorange, yellow);
}

.styled-card {
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #444444;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.styled-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.styled-tabs {
    margin-bottom: 20px;
    border-bottom: 1px solid #444;
}

.styled-tabs .v-tab {
    font-weight: bold;
    color: #fff;
}

.styled-tabs .v-tab--active {
    background-color: #3e3e3e;
    border-radius: 4px 4px 0 0;
}

.custom-scrollbar {
    &::-webkit-scrollbar {
        display: none;
    }

    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}

.styled-section {
    margin-top: 20px;
    width: 80%;
    background-color: #2c2c2c;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.styled-section:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
</style>
