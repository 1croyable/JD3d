<template>
    <div>
        <!-- 用户选中文件夹时显示的按钮 -->
        <template v-if="UIBStore.status === 0b01">
            <v-btn
                @click="UIBStore.setActionType('createFolder'), emits('createFolderEmit', { cb: createFolder_f, type: 'folder', actionType: 'createFolder' })"
                :disabled="props.loading">创建文件夹</v-btn>
            <v-btn
                @click="UIBStore.setActionType('uploadFile'), emits('uploadFileEmit', { cb: uploadFile_f, type: 'folder', actionType: 'uploadFile' })"
                :disabled="props.loading">上传文件</v-btn>
            <v-divider class="my-2"></v-divider>
            <v-btn @click="UIBStore.setActionType('renameFolder'), emits('renameFolderEmit', { cb: renameFolder_f, type: 'folder', actionType: 'renameFolder' })" :disabled="props.loading">重命名</v-btn>
            <v-btn @click="UIBStore.setActionType('removeFolder'), emits('removeFolderEmit', { cb: removeFolder_f, type: 'folder', actionType: 'removeFolder' })" :disabled="props.loading">删除文件夹</v-btn>
        </template>

        <!-- 用户选中文件时显示的按钮 -->

        <template v-else-if="UIBStore.status === 0b10">
            <v-btn
                @click="UIBStore.setActionType('createFolder'), emits('createFolderEmit', { cb: createFolder_f, type: 'folder', actionType: 'createFolder' })"
                :disabled="props.loading">创建文件夹</v-btn>
            <v-btn
                @click="UIBStore.setActionType('uploadFile'), emits('uploadFileEmit', { cb: uploadFile_f, type: 'folder', actionType: 'uploadFile' })"
                :disabled="props.loading">上传文件</v-btn>
            <v-divider class="my-2"></v-divider>
            <v-btn
                @click="UIBStore.setActionType('copyFile'), emits('choisirEmit', { cb: copy01_f, type: 'file', actionType: 'copyFile' })"
                :disabled="props.loading">复制</v-btn>
            <v-btn
                @click="UIBStore.setActionType('moveFile'), emits('moveEmit', { cb: move01_f, type: 'file', actionType: 'moveFile' })"
                :disabled="props.loading">移动</v-btn>
            <v-btn
                @click="UIBStore.setActionType('deleteFile'), emits('deleteEmit', { cb: delete01_f, type: 'file', actionType: 'deleteFile' })"
                :disabled="props.loading">删除</v-btn>
            <v-btn
                @click="UIBStore.setActionType('renameFile'), emits('renameEmit', { cb: rename01_f, type: 'file', actionType: 'renameFile' })"
                :disabled="props.loading">重命名</v-btn>
            <v-btn
                @click="UIBStore.setActionType('viewPropsFile'), emits('viewPropsEmit', { cb: viewProps01_f, type: 'file', actionType: 'viewPropsFile' })"
                :disabled="props.loading">查看属性</v-btn>
            <v-btn
                @click="UIBStore.setActionType('downloadFile'), emits('downloadEmit', { cb: download01_f, type: 'file', actionType: 'downloadFile' })"
                :disabled="props.loading">下载</v-btn>
        </template>


        <!-- 用户处于books界面时显示的按钮 -->

        <template v-else-if="UIBStore.status === 0b11">
            <v-btn
                @click="UIBStore.setActionType('createFolder'), emits('createFolderEmit', { cb: createFolder_f, type: 'folder', actionType: 'createFolder' })"
                :disabled="props.loading">创建文件夹</v-btn>
            <v-btn
                @click="UIBStore.setActionType('uploadFile'), emits('uploadFileEmit', { cb: uploadFile_f, type: 'folder', actionType: 'uploadFile' })"
                :disabled="props.loading">上传文件</v-btn>
        </template>
    </div>
</template>

<script setup>
import { useUIBStore } from '../../../public/stores/userInfo_btns';
import copyFile from '../../../methods/UIbtns/01_copy';
import moveFile from '../../../methods/UIbtns/01_move';
import deleteFile from '../../../methods/UIbtns/01_delete';
import renameFile from '../../../methods/UIbtns/01_rename';
import viewFileProps from '../../../methods/UIbtns/01_viewProps';
import viewFile from '../../../methods/UIbtns/01_view';
import deleteFolder from '../../../methods/UIbtns/02_delete';
import renameFolder from '../../../methods/UIbtns/02_rename';
import viewFolderProps from '../../../methods/UIbtns/02_viewProps';
import downloadFile from '../../../methods/UIbtns/01_download';
import createFolder from '../../../methods/UIbtns/createFolder';
import uploadFile from '../../../methods/UIbtns/uploadFile';
import removeFolder from '../../../methods/UIbtns/removeFolder';
import { Suspense, toRaw, watch } from 'vue';
import { useProgress } from '../../../public/stores/progressState';
import { useFFStore } from '../../../public/stores/FileFolder';
import axios from 'axios';

const UIBStore = useUIBStore();
const progressState = useProgress();
const FFStore = useFFStore();

const props = defineProps({
    username: String,
    choix: Object,
    loading: Boolean
})

const emits = defineEmits(['choisirEmit', 'copyOK', 'moveEmit', 'moveOK', 'deleteEmit', 'deleteOK', 'renameEmit', 'renameOK', 'viewPropsEmit', 'viewPropsOK', 'downloadEmit', 'downloadOK', 'createFolderEmit', 'createFolderOK', 'uploadFileEmit', 'upload-complete', 'upload-error','renameFolderEmit','renameFolderOK','removeFolderEmit','removeFolderOK']);

// 复制文件操作的函数
const copy01_f = () => {
    copyFile(props.username, UIBStore.file, props.choix).then((res) => {
        emits('copyOK');
    }).catch((err) => {
        alert('复制文件时出错: ' + err.message);
    });
}

// 移动文件操作的函数
const move01_f = () => {
    moveFile(props.username, UIBStore.file, props.choix).then((res) => {
        emits('moveOK');
    }).catch((err) => {
        alert('移动文件时出错: ' + err.message);
    });
}

// 删除文件操作的函数
const delete01_f = () => {
    deleteFile(props.username, UIBStore.file).then((res) => {
        emits('deleteOK');
    }).catch((err) => {
        alert('删除文件时出错: ' + err.message);
    });
}

// 文件重命名
const rename01_f = (newName) => {
    renameFile(props.username, UIBStore.file, newName).then((res) => {
        emits('renameOK');
    }).catch((err) => {
        alert('重命名文件时出错: ' + err.message);
    });
};

// 查看文件属性
const viewProps01_f = () => {
    viewFileProps(props.username, UIBStore.file).then((res) => {
        emits('viewPropsOK', { data: res.data });
    }).catch((err) => {
        alert('查看文件属性时出错: ' + err.message);
    });
};

// 下载文件
const download01_f = () => {
    downloadFile(props.username, UIBStore.file).then((res) => {
        emits('downloadOK', { url: res.url });
    }).catch((err) => {
        alert('下载文件时出错: ' + err.message);
    });
};

// 创建文件夹
const createFolder_f = (name) => {
    createFolder(props.username, props.choix, name).then((res) => {
        emits('createFolderOK');
    }).catch((err) => {
        alert('创建文件夹时出错: ' + err.message);
    });
}

// 上传文件
const uploadFile_f = async (filesUpload, folder) => {
    const file = filesUpload[0]

    for (const relation of FFStore.relations) {
        if (file.name === relation.fileName) {
            emits('upload-error', { msg: '文件名重复' })
            return;
        }
    }

    const username = props.username;
    if (!file) {
        emits('upload-error', { msg: '上传内容为空' })
        return;
    } else {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'UserName': username,
                    'folderId': toRaw(folder).folder_id
                },
                onUploadProgress: (progressEvent) => {
                    progressState.progress =
                        parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                },
            }

            progressState.showProgress();

            const key = await axios.post('/api/upload', formData, config);

            emits('upload-complete');
        }
        catch (error) {
            emits('upload-error', { msg: error })
        }
    }
}

// 文件夹重命名
function renameFolder_f(newName){
    renameFolder(props.username, UIBStore.folder, newName).then((res) => {
        emits('renameFolderOK');
    }).catch((err) => {
        alert('重命名文件夹时出错: ' + err.message);
    });
}

// 删除文件夹
function removeFolder_f(folderRestId, fileRestId){
    removeFolder(props.username,UIBStore.folder.folder_id ,folderRestId, fileRestId).then((res) => {
        emits('removeFolderOK');
    }).catch((err) => {
        alert('删除文件夹时出错: ' + err.message);
    });
}

</script>


<style lang="less" scoped></style>