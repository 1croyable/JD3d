<template>
    <v-list-group :value="childFolder.folder_id + ''">
        <template v-slot:activator="{ props }">
            <v-list-item v-bind="props">
                <v-list-item-title>{{ name }}</v-list-item-title>
            </v-list-item>
        </template>

        <v-list-item v-for="file in childFolder.files" :key="file.fileId" @click.stop="emit('child-file-clicked', file)">
            <v-list-item-title>{{ file.fileName }}</v-list-item-title>
        </v-list-item>

        <template v-if="childFolder.children.length > 0" v-for="childFolder in childFolder.children"
            :key="childFolder.folder_id">
            <ChildFolderBookNav :childFolder="childFolder" @child-file-clicked="childFileClicked"></ChildFolderBookNav>
        </template>
    </v-list-group>
</template>

<script setup>
import { computed } from 'vue';
import ChildFolderBookNav from './ChildFolderBookNav.vue';

const props = defineProps({
    childFolder: Object
})

const name = computed(() => {
    return props.childFolder.name;
})

const childFolder = computed(() => {
    return props.childFolder;
})

const childFileClicked = (file) => {
    emit('child-file-clicked', file)
}

const emit = defineEmits(['child-file-clicked'])

</script>

<style lang="less" scoped></style>