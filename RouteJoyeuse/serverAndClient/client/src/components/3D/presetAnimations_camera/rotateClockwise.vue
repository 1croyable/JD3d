
<template>
    <v-card id="rotateClockwise" class="bg-blue-accent-3" width="120" height="120" title="顺时针旋转" variant="plain">
        <v-card-text>顺时针旋转</v-card-text>
        <template #append>
            <input v-model="props.proprietes.time" type="number" />
        </template>
    </v-card>
</template>

<script setup>
const props = defineProps({
    proprietes: Object,
})
</script>

<style lang="less" scoped>
#rotateClockwise {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>
