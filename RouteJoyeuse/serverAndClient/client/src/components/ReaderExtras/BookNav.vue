<template>
    <v-navigation-drawer v-model="props.drawer" app fixed width="10vw">
        <v-list dense v-model:opened="open">
            <template v-for="folder in items" :key="folder.folder_id">
                <v-list-group value="主文件夹">
                    <template v-slot:activator="{ props }">
                        <v-list-item v-bind="props">
                            <v-list-item-title>{{ folder.name }}</v-list-item-title>
                        </v-list-item>
                    </template>

                    <v-list-item v-for="file in folder.files" :key="file.fileId"
                        @click.stop="emit('file-clicked', file)">
                        <v-list-item-title>{{ file.fileName }}</v-list-item-title>
                    </v-list-item>

                    <template v-if="folder.children.length > 0" v-for="childFolder in folder.children"
                        :key="childFolder.folder_id">
                        <ChildFolderBookNav :childFolder="childFolder" @child-file-clicked="childFileClicked">
                        </ChildFolderBookNav>
                    </template>
                </v-list-group>
            </template>
        </v-list>
    </v-navigation-drawer>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { nextTick } from 'vue';
import { ref } from 'vue';
import { toRaw } from 'vue';
import { defineEmits } from 'vue';
import ChildFolderBookNav from './ChildFolderBookNav.vue';
import { useFFStore } from '../../../public/stores/FileFolder';

onMounted(() => {
    FFStore.setStatus();
})

const FFStore = useFFStore();

const props = defineProps({
    drawer: Boolean,
})

const open = ref(['主文件夹'])
function transformFolders(folders, relationsArray) {
    return folders.map(folder => ({
        ...folder,
        files: relationsArray.filter(relation => relation.folderId === folder.folder_id),
        children: folder.children ? transformFolders(folder.children, relationsArray) : []
    }));
}
const items = computed(() => {
    let result = transformFolders(toRaw(FFStore.folders), toRaw(FFStore.relations));
    return result;
});

const childFileClicked = (file) => {
    emit('file-clicked', file)
}

const emit = defineEmits(['file-clicked'])
</script>

<style lang="less" scoped></style>