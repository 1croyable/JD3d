<template>
    <v-list-group :value="childFolder.folder_id + ''">
        <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" @click.stop="emit('folderClick', { folder: childFolder })">
                <v-list-item-title>{{ name }}</v-list-item-title>
            </v-list-item>
        </template>

        <v-list-item v-for="file in childFolder.files" :key="file.fileId"
            @click.stop="emit('fileClick', { file: file })">
            <v-list-item-title>{{ file.fileName }}</v-list-item-title>
        </v-list-item>

        <template v-if="childFolder.children.length > 0" v-for="childFolder in childFolder.children"
            :key="childFolder.folder_id">
            <ChildFolder :childFolder="childFolder" @folderClick="emit('folderClick', { folder: childFolder })"
                @fileClick="emit('fileClick', { file: file })"></ChildFolder>
        </template>
    </v-list-group>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    childFolder: Object
})

const name = computed(() => {
    return props.childFolder.name;
})

const childFolder = computed(() => {
    return props.childFolder;
})

const emit = defineEmits(['folderClick', 'fileClick'])
</script>

<style lang="scss" scoped></style>