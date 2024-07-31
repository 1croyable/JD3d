
<template>
    <v-card id="rotateCounterClockwise" class="bg-blue-accent-4" width="120" height="120" title="逆时针旋转" variant="plain">
        <v-card-text>逆时针旋转</v-card-text>
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
#rotateCounterClockwise {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>
