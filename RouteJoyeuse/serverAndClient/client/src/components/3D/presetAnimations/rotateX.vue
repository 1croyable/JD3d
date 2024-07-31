
<template>
    <v-card id="rotateX" class="bg-purple-accent-2" width="120" height="120" title="旋转X轴" variant="plain">
        <template #prepend>
            <v-icon size="15">mdi-rotate-left</v-icon>
        </template>
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
#rotateX {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>
