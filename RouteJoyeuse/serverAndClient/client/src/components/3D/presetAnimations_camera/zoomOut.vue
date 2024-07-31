
<template>
    <v-card id="zoomOut" class="bg-green-accent-2" width="120" height="120" title="缩小" variant="plain">
        <v-card-text>缩小</v-card-text>
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
#zoomOut {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>
