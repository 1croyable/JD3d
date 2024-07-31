<template>
    <transition name="fade">
        <div class="right" v-if="props.showTune">
            <v-card height="100%">
                <v-card-title>播放设置</v-card-title>
                <v-card-subtitle>调整速率</v-card-subtitle>
                <v-container>
                    <v-row>
                        <v-col>
                            <v-slider v-model="localVitesse" :min="-10" :max="10" :step="1" @input="updateVitesse"
                                thumb-label="always" direction="vertical"></v-slider>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col offset="3">
                            <v-text-field v-model="localVitesse" type="number" hide-details single-line variant="outlined"
                                density="compact" style="width: 70px" @input="updateVitesse"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </div>
    </transition>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    showTune: Boolean
})

const emit = defineEmits(['update']);
const localVitesse = ref(0);

const updateVitesse = () => {
    emit('update', localVitesse.value);
};
</script>

<style lang="less" scoped>
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
}

.right {
    position: absolute;
    right: 0;
    top: 100px;
    width: 200px;
    height: 100%;
}
</style>
