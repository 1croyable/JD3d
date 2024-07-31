<template>
    <v-radio :label="name" :value="props.childFolder">{{ name }}</v-radio>

    <template v-if="props.childFolder.children.length > 0" v-for="childFolder in props.childFolder.children"
        :key="childFolder.folder_id">
        <ChildFolder_Index :childFolder="childFolder"></ChildFolder_Index>
    </template>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
    childFolder: Object
})

const name = computed(() => {
    return props.childFolder.name
})
</script>

<style lang="scss" scoped></style>