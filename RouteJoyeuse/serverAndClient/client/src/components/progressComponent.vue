<template>
    <v-progress-linear :model-value="progressState.progress" striped color="deep-orange" height="30">
        <template v-slot:default="{ value }">
            <div v-if="progressState.ifshowCheckmark" style="width: 20px; height: 20px;">
                <div class="check"></div>
            </div>
            <strong v-else>{{ Math.ceil(value) }}%</strong>
        </template>
    </v-progress-linear>
</template>

<script setup>
import { useProgress } from '../../public/stores/progressState';

const progressState = useProgress();

</script>

<style lang="less" scoped>
@keyframes checkmark {
    0% {
        width: 0;
        height: 0;
        opacity: 0;
    }

    40% {
        width: 2px;
        height: 4px;
        opacity: 1;
    }

    100% {
        width: 8px;
        height: 15px;
        opacity: 1;
    }
}

.check {
    margin-bottom: 2px;
    display: inline-block;
    border: 1px solid #2e4200;
    border-width: 3px 0 0 3px;
    transform: rotate(230deg);
    -ms-transform: rotate(230deg);
    -moz-transform: rotate(230deg);
    -webkit-transform: rotate(230deg);
    -o-transform: rotate(-20deg);
    animation: checkmark 0.5s ease-in-out forwards;
}
</style>