<template>
    <v-overlay :value="saveLoading" :z-index="9999">
        <div class="overlay-content">
            <v-progress-circular v-if="!isComplete" :indeterminate="true" color="primary"
                size="64"></v-progress-circular>
            <div v-else>
                <div v-if="!ifSaveError" class="checkmark"></div>
                <div v-else class="crossmark">
                    <span class="error-text">保存出错啦</span>
                </div>
            </div>
        </div>
    </v-overlay>
</template>

<script setup>
const props = defineProps({
    saveLoading: Boolean,
    ifSaveError: Boolean
});

import { watch, ref } from 'vue';

const isComplete = ref(false);

watch(props.saveLoading, (newVal) => {
    if (!newVal) {
        setTimeout(() => {
            isComplete.value = true;
            setTimeout(() => {
                isComplete.value = false;
            }, 2000); // 延时2秒关闭遮罩层
        }, 1000); // 延时1秒显示打钩或打叉动画
    } else {
        isComplete.value = false;
    }
});
</script>

<style lang="less" scoped>
.overlay-content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    position: relative;
}

.checkmark {
    width: 80px;
    height: 80px;
    display: inline-block;
    position: relative;
}

.checkmark::after {
    content: '';
    display: block;
    width: 15px;
    height: 30px;
    border: solid green;
    border-width: 0 6px 6px 0;
    transform: rotate(45deg);
    position: absolute;
    top: 25px;
    left: 35px;
}

.crossmark {
    width: 80px;
    height: 80px;
    display: inline-block;
    position: relative;
}

.crossmark::before,
.crossmark::after {
    content: '';
    display: block;
    width: 60px;
    height: 6px;
    background-color: red;
    position: absolute;
    top: 37px;
    left: 10px;
}

.crossmark::before {
    transform: rotate(45deg);
}

.crossmark::after {
    transform: rotate(-45deg);
}

.error-text {
    color: red;
    font-size: 18px;
    text-align: center;
    margin-top: 10px;
}
</style>