<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-list dense :disabled="props.loading" v-model:opened="open">
                    <template v-for="folder in items" :key="folder.folder_id">
                        <v-list-group value="主文件夹">
                            <template v-slot:activator="{ props }">
                                <v-list-item v-bind="props"
                                    @click.stop="onFolderClick(folder)">
                                    <v-list-item-title>{{ folder.name }}</v-list-item-title>
                                </v-list-item>
                            </template>

                            <v-list-item v-for="file in folder.files" :key="file.fileId"
                                @click.stop="onFileClick(file)">
                                <v-list-item-title>{{ file.fileName }}</v-list-item-title>
                            </v-list-item>

                            <template v-if="folder.children.length > 0" v-for="childFolder in folder.children" :key="childFolder.folder_id">
                                <ChildFolder :childFolder="childFolder" @fileClick="onChildFileClick" @folderClick="onChildFolderClick"></ChildFolder>
                            </template>
                        </v-list-group>
                    </template>
                </v-list>
            </v-col>
        </v-row>
    </v-container>
</template>


<script setup>
import { useUIBStore } from '../../../public/stores/userInfo_btns';
import { useFFStore } from '../../../public/stores/FileFolder';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { computed } from 'vue';
import { toRaw } from 'vue';
import ChildFolder from './ChildFolder.vue';

const props = defineProps({
    folders: Array,
    relations: Array,
    loading: Boolean
})

const UIBStore = useUIBStore();
const FFStore = useFFStore();

const userName = ref('');

const folders = computed(() => props.folders);
const relations = computed(() => props.relations);

const open = ref(['主文件夹'])

function transformFolders(folders, relationsArray) {
    return folders.map(folder => ({
        ...folder,
        files: relationsArray.filter(relation => relation.folderId === folder.folder_id),
        children: folder.children ? transformFolders(folder.children, relationsArray) : []
    }));
}

const items = computed(() => {
    let result = transformFolders(toRaw(folders.value), toRaw(relations.value));
    return result;
});

const onFileClick = ((file) => {
    UIBStore.setStatus_file();
    UIBStore.choisirFile(file);
    FFStore.currentFolder = file.folderId;
})
const onChildFileClick = (object) => {
    const file = object.file;
    UIBStore.setStatus_file();
    UIBStore.choisirFile(file);
    FFStore.currentFolder = file.folderId;
}

const onFolderClick = ((folder) => {
    UIBStore.setStatus_folder();
    UIBStore.choisirFolder(folder);
})
const onChildFolderClick = (object) => {
    const folder = object.folder;
    UIBStore.setStatus_folder();
    UIBStore.choisirFolder(folder);
}

const onCreateFolder = (folder) => {
    UIBStore.setStatus_folder();
    UIBStore.choisirFolder(folder);
}

const onCreateFile = (file) => {
    UIBStore.setStatus_file();
    UIBStore.choisirFile(file);
}

</script>

<style lang="less" scoped></style>