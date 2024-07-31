
<template>
    <v-card id="zoomIn" class="bg-indigo-accent-3" width="120" height="120" title="放大" variant="plain">
        <template #prepend>
            <v-icon size="15">mdi-magnify-plus</v-icon>
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
#zoomIn {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>
