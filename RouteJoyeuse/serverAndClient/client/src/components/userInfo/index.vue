<template>
    <v-theme-provider :theme="currentTheme" :with-background="true">
        <v-app>
            <!-- 进度条 -->
            <div v-show="progressState.ifshowProgress"
                style="z-index: 10000; width: 100vw ;position: absolute; top:0; left:0;">
                <v-card width="100vw">
                    <progressComponent></progressComponent>
                </v-card>
            </div>

            <!-- 警告 -->
            <div style="z-index: 10000; position: absolute; top:0; left:0; width: 100vw;">
                <transition name="fade">
                    <v-alert v-show="showErr" border="start" border-color="deep-purple accent-4" elevation="2">
                        <h2 style="display:inline;"> <v-icon>mdi-alert-circle</v-icon> 出错啦 | </h2>
                        <span>{{ errmsg }}</span>
                    </v-alert>
                </transition>
            </div>

            <div class="threejs-container">
                <component v-if="currentComponent === bibliotheque" :is="currentComponent" :theme="currentTheme"
                    :auMxFlag="auMx_flag" @showBooks="showBooks = true"></component>
                <component v-if="currentComponent === mx" :is="currentComponent" :theme="currentTheme"></component>
            </div>

            <v-container class="floating-container bg-transparent">
                <v-row :dense="true">
                    <v-col cols="1">
                        <v-row>
                            <v-col cols="12" :style="colBorder">
                                <div style="cursor: pointer;" @click="router.push('/')">
                                    <h1 :class="rj_class">Route</h1>
                                    <h2 :class="rj_class">Joyeuse</h2>
                                </div>
                                <v-btn @click="toggleTheme" :class="theme_btn_class" color="medium-emphasis" rounded
                                    variant="outlined" :elevation="elevation" @mouseover="mouseover = true"
                                    @mouseleave="mouseover = false" :block="true">
                                    <template v-slot="append">
                                        <v-icon :size="25"
                                            :icon="currentTheme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"></v-icon>
                                    </template>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col align-self="center" cols="12">
                                <v-btn :elevation="3" :block="true" class="my-10 pa-0"
                                    :ripple="{ class: 'text-amber-lighten-2' }" @click="router.push('/readerIndex')">

                                    <template v-slot="append">
                                        <span class="text-h5 mx-1 my-2">阅读</span>
                                        <v-icon size="20px">mdi-book-edit</v-icon>
                                    </template>
                                </v-btn>
                                <v-btn :elevation="3" :block="true" :class="bibBtnClass"
                                    :ripple="{ class: 'text-amber-lighten-2' }"
                                    @click="(currentComponent === mx) ? aLaBibliotheque() : auMx()" :active="dansBib"
                                    :disabled="disable_wdsjBtn">

                                    <template v-slot="append">
                                        <span class="text-h5 mx-1 my-2">我的书架</span>
                                    </template>
                                </v-btn>
                                <v-btn :elevation="3" :block="true" class="my-10 pa-0"
                                    :ripple="{ class: 'text-amber-lighten-2' }">

                                    <template v-slot="append">
                                        <span class="text-h5 mx-1 my-2">收藏</span>
                                        <v-icon size="20px">mdi-star</v-icon>
                                    </template>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="5">
                        <Transition name="fade">
                            <div class="books overflow-y-auto pa-6" v-if="showBooks">
                                <books :folders="folders" :relations="relations" :loading="loading"></books>
                            </div>
                        </Transition>
                    </v-col>
                    <v-col cols="1">
                        <v-btn id="overLay_settings_button" stacked variant="plain" :class="theme_btn_class">
                            Paramètres

                            <template v-slot:prepend>
                                <v-icon icon="mdi-cogs" size="30px"></v-icon>
                            </template>
                            <v-tooltip activator="parent" location="bottom">开关设置</v-tooltip>
                        </v-btn>
                    </v-col>
                    <v-col cols="5">
                        <userinfoBasic></userinfoBasic>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="3" offset="8">
                        <v-card :loading="loading">
                            <v-card-title class="text-h4 text-center my-2">控件区</v-card-title>
                            <v-divider></v-divider>
                            <UIbtns :username="username" :choix="choix" :loading="loading" @choisirEmit="choisir"
                                @moveEmit="moveEmit" @deleteEmit="deleteEmit" @deleteOK="deleteOK" @copyOK="copyOK"
                                @moveOK="moveOK" @renameEmit="renameEmit" @renameOK="renameOK"
                                @viewPropsEmit="viewPropsEmit" @viewPropsOK="viewPropsOK" @downloadEmit="downloadEmit"
                                @downloadOK="downloadOK" @createFolderEmit="createFolderEmit"
                                @createFolderOK="createFolderOK" @uploadFileEmit="uploadFileEmit"
                                @upload-error="uploadError" @upload-complete="uploadComplete"
                                @renameFolderEmit="renameFolderEmit" @renameFolderOK="renameFolderOK"
                                @removeFolderEmit="removeFolderEmit" @removeFolderOK="removeFolderOK"></UIbtns>
                            <!-- 提醒用户，选择哪个文件夹 -->
                            <v-dialog max-width="500" :persistent="true" v-model="choisirFolder">
                                <v-card>
                                    <v-card-title class="text-h5">选择文件夹</v-card-title>
                                    <v-card-text v-if="choisirType === 'file'">
                                        <v-container>
                                            <v-row>

                                                <template v-for="folder in folders" :key="folder.folder_id">
                                                    <v-col cols="1">
                                                        <v-btn
                                                            :disabled="(FFStore.currentFolder === folder.folder_id) && (UIBStore.actionType === 'moveFile')"
                                                            @click="choix = folder;">{{ folder.name }}</v-btn>
                                                    </v-col>

                                                    <template v-for="childFolder in folder.children"
                                                        :key="childFolder.folder_id">
                                                        <v-col cols="1">
                                                            <v-btn
                                                                :disabled="(FFStore.currentFolder === folder.folder_id) && (UIBStore.actionType === 'moveFile')"
                                                                @click="choix = childFolder;">{{ childFolder.name
                                                                }}</v-btn>
                                                        </v-col>
                                                    </template>
                                                </template>
                                            </v-row>
                                        </v-container>
                                    </v-card-text>
                                    <v-spacer></v-spacer>
                                    <v-btn text="取消" @click="choisirFolder = false; choix = null;"></v-btn>
                                    <v-btn :disabled="choix === null" text="确定" @click="choisirCallBack()"></v-btn>
                                </v-card>
                            </v-dialog>
                            <!-- 提醒用户，改成什么名字 -->
                            <v-dialog v-model="showRename" :persistent="true" max-width="600">
                                <v-card>
                                    <v-card-title>新名字</v-card-title>
                                    <v-text-field label="不超过10个字符哦" :counter="10" v-model="newName"
                                        clearable></v-text-field>
                                    <v-btn text="取消" @click="showRename = false; newName = ''"></v-btn>
                                    <v-btn text="确定" @click="renameDaccord()" :disabled="newName === ''"></v-btn>
                                    <div style="width: 500px; margin: 20px auto; height: 300px;">
                                        <renameCanvas :newName="newName" :oldName="fileNameWithoutExtension">
                                        </renameCanvas>
                                    </div>
                                </v-card>
                            </v-dialog>
                            <!-- 对话框：查看属性 -->
                            <v-dialog v-model="showProperty" :persistent="true" max-width="600">
                                <v-card>
                                    <v-card-title class="text-h3 mx-7 mt-5 mb-2">属性</v-card-title>
                                    <v-divider class="my-3"></v-divider>
                                    <v-card-text>
                                        <v-container>
                                            <v-row v-show="data">
                                                <v-col cols="2">
                                                    <v-chip :elevation="24" size="large" text="文件名" variant="outlined"
                                                        color="amber-lighten-3" class="mb-0"></v-chip>
                                                </v-col>
                                                <v-col cols="1">
                                                    <div
                                                        style="display:inline-block; border-left: 2px solid black; height:45px;">
                                                    </div>
                                                </v-col>
                                                <v-col cols="8" offset="1">
                                                    <div style="display:inline-block; border-bottom: 1px solid gray; width:80%; text-align: center;"
                                                        class="text-h4 pb-3 mt-3">{{ data.file_name }}</div>
                                                </v-col>
                                            </v-row>

                                            <v-row v-show="data">
                                                <v-col cols="2">
                                                    <v-chip :elevation="24" size="large" text="文件类型" variant="outlined"
                                                        color="amber-lighten-1" class="mb-0"></v-chip>
                                                </v-col>
                                                <v-col cols="1">
                                                    <div
                                                        style="display:inline-block; border-left: 2px solid black; height:45px;">
                                                    </div>
                                                </v-col>
                                                <v-col cols="8" offset="1">
                                                    <div style="display:inline-block; border-bottom: 1px solid gray; width:80%; text-align: center;"
                                                        class="text-h4 pb-3 mt-3">{{ data.type }}</div>
                                                </v-col>
                                            </v-row>

                                            <v-row v-show="data">
                                                <v-col cols="2">
                                                    <v-chip :elevation="24" size="large" text="文件大小" variant="outlined"
                                                        color="amber-darken-1" class="mb-0"></v-chip>
                                                </v-col>
                                                <v-col cols="1">
                                                    <div
                                                        style="display:inline-block; border-left: 2px solid black; height:45px;">
                                                    </div>
                                                </v-col>
                                                <v-col cols="8" offset="1">
                                                    <div style="display:inline-block; border-bottom: 1px solid gray; width:80%; text-align: center;"
                                                        class="text-h4 pb-3 mt-3">{{ formattedSize }}</div>
                                                </v-col>
                                            </v-row>

                                            <v-row v-show="data">
                                                <v-col cols="2">
                                                    <v-chip :elevation="24" size="large" text="创建时间" variant="outlined"
                                                        color="amber-darken-2" class="mb-0"></v-chip>
                                                </v-col>
                                                <v-col cols="1">
                                                    <div
                                                        style="display:inline-block; border-left: 2px solid black; height:45px;">
                                                    </div>
                                                </v-col>
                                                <v-col cols="8" offset="1">
                                                    <div style="display:inline-block; border-bottom: 1px solid gray; width:80%; text-align: center;"
                                                        class="text-h4 pb-3 mt-3">{{ formattedDate }}</div>
                                                </v-col>
                                            </v-row>

                                            <v-row v-show="data">
                                                <v-col cols="2">
                                                    <v-chip :elevation="24" size="large" text="所属文件夹" variant="outlined"
                                                        color="amber-darken-3" class="mb-0"></v-chip>
                                                </v-col>
                                                <v-col cols="1">
                                                    <div
                                                        style="display:inline-block; border-left: 2px solid black; height:45px;">
                                                    </div>
                                                </v-col>
                                                <v-col cols="8" offset="1">
                                                    <div style="display:inline-block; border-bottom: 1px solid gray; width:80%; text-align: center;"
                                                        class="text-h4 pb-3 mt-3">{{ data.belonging_folder_name }}</div>
                                                </v-col>
                                            </v-row>

                                            <v-row class="mt-16">
                                                <v-btn text="确定" @click="propsDaccord()" :block="true"></v-btn>
                                            </v-row>
                                        </v-container>
                                    </v-card-text>
                                </v-card>
                            </v-dialog>
                            <!-- 创建文件夹的对话框 -->
                            <v-dialog v-model="dialogCreateFolder" max-width="500" :persistent="true">
                                <v-card>
                                    <v-card-title class="text-h5">创建文件夹</v-card-title>
                                    <v-card-text>
                                        <v-container>
                                            <v-row>
                                                <v-col cols="12">
                                                    <span class="h5">1、选择创建于哪个文件夹下</span>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col cols="12">
                                                    <v-radio-group v-model="choix">

                                                        <template v-for="folder in folders" :key="folder.folder_id">
                                                            <v-radio :label="folder.name" :value="folder">{{ folder.name
                                                                }}</v-radio>

                                                            <template v-if="folder.children.length > 0"
                                                                v-for="childFolder in folder.children"
                                                                :key="childFolder.folder_id">
                                                                <ChildFolder_Index :childFolder="childFolder">
                                                                </ChildFolder_Index>
                                                            </template>
                                                        </template>
                                                    </v-radio-group>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-text-field v-model="newFolderName" prepend-icon="mdi-wrench"
                                                    variant="underlined" label="输入名字"></v-text-field>
                                            </v-row>
                                            <v-divider class="my-3" color="cyan-lighten-3"></v-divider>
                                            <v-row>
                                                <v-col cols="12">
                                                    <v-btn :block="true"
                                                        @click="dialogCreateFolder = !dialogCreateFolder; choix = null; newFolderName = ''"
                                                        text="取消"></v-btn>
                                                    <v-btn :disabled="newFolderName.length === 0 || choix === null"
                                                        :block="true"
                                                        @click="createFolderDaccord(newFolderName)">创建</v-btn>
                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </v-card-text>
                                </v-card>
                            </v-dialog>
                            <!-- 上传文件的对话框 -->
                            <v-dialog v-model="dialogUpload" max-width="500" :persistent="true">
                                <v-card>
                                    <v-card-title class="text-h5">上传文件</v-card-title>
                                    <v-card-text>
                                        <v-container>
                                            <v-row>
                                                <v-col cols="12">
                                                    <span class="h5">1、选择上传到哪个文件夹下</span>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col cols="12">
                                                    <v-radio-group v-model="choix">

                                                        <template v-for="folder in folders" :key="folder.folder_id">
                                                            <v-radio :label="folder.name" :value="folder">{{ folder.name
                                                                }}</v-radio>

                                                            <template v-if="folder.children.length > 0"
                                                                v-for="childFolder in folder.children"
                                                                :key="childFolder.folder_id">
                                                                <ChildFolder_Index :childFolder="childFolder">
                                                                </ChildFolder_Index>
                                                            </template>
                                                        </template>
                                                    </v-radio-group>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <div class="upload-drop-zone" @dragover.prevent="handleDragOver"
                                                    @drop.prevent="handleDrop">
                                                    <v-file-input class="ma-0 pa-0" label="上传文件或拖拽文件到这里" accept=".md"
                                                        placeholder="选择或拖拽文件" variant="outlined" counter
                                                        color="deep-purple-accent-4" v-model="filesUpload"
                                                        :show-size="true"></v-file-input>
                                                </div>
                                            </v-row>
                                            <v-divider class="my-3" color="cyan-lighten-3"></v-divider>
                                            <v-row>
                                                <v-col cols="12">
                                                    <v-btn :block="true"
                                                        @click="dialogUpload = !dialogUpload; choix = null; filesUpload = []"
                                                        text="取消"></v-btn>
                                                    <v-btn :disabled="filesUpload.length === 0 || choix === null"
                                                        :block="true"
                                                        @click="filesUploadDaccord(filesUpload, choix)">上传</v-btn>
                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </v-card-text>
                                </v-card>
                            </v-dialog>
                            <!-- 提示用户给文件夹改名 -->
                            <v-dialog v-model="showRenameFolder" :persistent="true" max-width="600">
                                <v-card>
                                    <v-card-title>新名字</v-card-title>
                                    <v-text-field label="不超过10个字符哦" :counter="10" v-model="folderNameModifie"
                                        clearable></v-text-field>
                                    <v-btn text="取消" @click="showRenameFolder = false; folderNameModifie = ''"></v-btn>
                                    <v-btn text="确定" @click="renameFolderDaccord()"
                                        :disabled="!folderNameModifie"></v-btn>
                                    <div style="width: 500px; margin: 20px auto; height: 300px;">
                                        <renameCanvas :newName="folderNameModifie" :oldName="UIBStore.folder.name">
                                        </renameCanvas>
                                    </div>
                                </v-card>
                            </v-dialog>
                            <!-- 提示用户，文件夹中有其他文件，是否删除 -->
                            <v-dialog v-model="openDialogueRemoveFolder" :persistent="true" max-width="600">
                                <v-card>
                                    <v-card-title>检测到该文件夹内有别的文件和文件夹</v-card-title>
                                    <v-card-text>
                                        <template v-for="(fileName, index) in fileRest" :key="index">
                                            <v-chip class="ma-2" color="green-darken-4">{{ fileName }}</v-chip>
                                        </template>
                                        <v-divider class="ma-2"></v-divider>
                                        <template v-for="(folderName, index) in folderRest" :key="index">
                                            <v-chip class="ma-2" color="green-darken-2">{{ folderName }}</v-chip>
                                        </template>
                                        <p class="my-5 text-h4">是否删除文件夹？</p>
                                        <v-checkbox v-model="deleteFolder" label="我已知晓（删除后不能复原）"></v-checkbox>
                                        <v-btn class="mb-3" block color="yellow-darken-1"
                                            @click="openDialogueRemoveFolder = false; fileRest = []; folderRest = []; deleteFolder = false">取消</v-btn>
                                        <v-btn @click="removeFolderDaccord(folderRestId, fileRestId)"
                                            :disabled="!deleteFolder" block color="red-darken-1">删除</v-btn>
                                    </v-card-text>
                                </v-card>
                            </v-dialog>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-app>
    </v-theme-provider>
</template>

<script setup>
import { mdiBookEdit } from '@mdi/js';
import { ref, computed, nextTick, watch, onMounted, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import { shallowRef } from 'vue';

import mx from './mx.vue'
import bibliotheque from './bibliotheque.vue'

import getUserName from '../../../methods/getUserName';
import books from './books.vue';
import UIbtns from './UIbtns.vue';
import copy01 from '../../../methods/UIbtns/01_copy';
import progressComponent from '../progressComponent.vue';
import renameCanvas from './renameCanvas.vue';
import ChildFolder_Index from './ChildFolder_Index.vue';
import userinfoBasic from './userinfoBasic.vue';

import { useUIBStore } from '../../../public/stores/userInfo_btns';
import { useFFStore } from '../../../public/stores/FileFolder';
import { useProgress } from '../../../public/stores/progressState';
import { useUserInfo } from '../../../public/stores/userInfo';

const UserInfo = useUserInfo();
const UIBStore = useUIBStore();
const FFStore = useFFStore();
const progressState = useProgress();


onMounted(() => {
    getUserName().then(res => {
        username.value = res;
    });

    FFStore.setStatus().then(() => {
        folders.value = FFStore.getFolders;
        relations.value = FFStore.getRelations;
    }).catch((err) => {
        alert(err)
    });
})

// 错误警告
let showErr = ref(false)
let errmsg = ref('');

// 文件操作的一些回调
function copyOK() {
    choisirFolder.value = false;
    UIBStore.clearActionType();
    FFStore.setStatus().then(() => {
        folders.value = FFStore.getFolders;
        relations.value = FFStore.getRelations;
    }).catch((err) => { alert(err) })
}

function moveOK() {
    choisirFolder.value = false;
    UIBStore.clearActionType();
    FFStore.setStatus().then(() => {
        folders.value = FFStore.getFolders;
        relations.value = FFStore.getRelations;
    }).catch((err) => { alert(err) })
}

function deleteOK() {
    UIBStore.clearActionType();
    FFStore.setStatus().then(() => {
        folders.value = FFStore.getFolders;
        relations.value = FFStore.getRelations;
        loading.value = false;
    }).catch((err) => { alert(err) })
}

function renameOK() {
    showRename.value = false;
    newName.value = '';
    UIBStore.clearActionType();
    FFStore.setStatus().then(() => {
        folders.value = FFStore.getFolders;
        relations.value = FFStore.getRelations;
    }).catch((err) => { alert(err); newName.value = '' })
}

function downloadOK(object) {
    UIBStore.clearActionType();
    loading.value = false;
    const url = object.url;
    const a = document.createElement('a');
    a.href = url;
    a.style.display = "none";
    a.download = fileNameWithoutExtension;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function createFolderOK() {
    dialogCreateFolder.value = false;
    UIBStore.clearActionType();
    FFStore.setStatus().then(() => {
        folders.value = FFStore.getFolders;
        relations.value = FFStore.getRelations;
    }).catch((err) => { alert(err) })
}

function renameFolderOK() {
    UIBStore.clearActionType();
    FFStore.setStatus().then(() => {
        folders.value = FFStore.getFolders;
        relations.value = FFStore.getRelations;
    }).catch((err) => { alert(err) })
}

async function createFolderDaccord(name) {
    // 如果文件夹的名字已经存在，报错
    if (name === choix.value.name) {
        errmsg.value = `名字"${name}"和父文件夹的名字重复了`;
        showErr.value = true;
        setTimeout(() => {
            showErr.value = false;
            errmsg.value = '';
        }, 3500);
        newFolderName.value = '';
        choix.value = null;
        UIBStore.clearActionType();
        return;
    }

    if (choix.value.children.length > 0) {
        for (const childFolder of choix.value.children) {
            if (childFolder.name === name) {
                errmsg.value = "文件夹名已存在";
                showErr.value = true;
                setTimeout(() => {
                    showErr.value = false;
                    errmsg.value = '';
                }, 3500);
                newFolderName.value = '';
                choix.value = null;
                UIBStore.clearActionType();
                return;
            }
        }
    }
    createFolder.value(name);
    newFolderName.value = '';
    choix.value = null;
}

const data = ref({});
function viewPropsOK(object) {
    data.value = object.data;
    showProperty.value = true;
}
function propsDaccord() {
    showProperty.value = false;
    setTimeout(() => {
        data.value = {};
    }, 300);
}
const formattedDate = computed(() => {
    if (!data.value.create_time) {
        return '';
    }
    const date = new Date(data.value.create_time);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
});
const formattedSize = computed(() => {
    if (!data.value.size) {
        return '0 B';
    }
    const bytes = data.value.size;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
});

// 文件夹重命名
function renameFolderDaccord() {
    if (UIBStore.folder.name === '主文件夹') {
        errmsg.value = "无法给主文件夹重命名";
        showErr.value = true;
        setTimeout(() => {
            showErr.value = false;
            errmsg.value = '';
            folderNameModifie.value = '';
        }, 3500);
        return;
    }
    else {
        for (const folder of FFStore.folders) {
            if (folder.parent_id === UIBStore.folder.parent_id) {
                if (folder.name === folderNameModifie.value) {
                    errmsg.value = `以"${folderNameModifie.value}"为名字的文件夹已存在与同一层级内，不能重复创建哦`;
                    showErr.value = true;
                    setTimeout(() => {
                        showErr.value = false;
                        errmsg.value = '';
                        folderNameModifie.value = '';
                    }, 3500);
                    return;
                }
            }
        }
    }
    modifierFolderName.value(folderNameModifie.value);
    folderNameModifie.value = '';
    showRenameFolder.value = false;
}

// 删除文件夹
function removeFolderOK() {
    UIBStore.clearActionType();
    FFStore.setStatus().then(() => {
        loading.value = false;
        folders.value = FFStore.getFolders;
        relations.value = FFStore.getRelations;
        openDialogueRemoveFolder.value = false;
        fileRest.value = []
        folderRest.value = []
        deleteFolder.value = false
        folderRestId.value = []
        fileRestId.value = []
    }).catch((err) => { alert(err) })
}



// 动态组件相关
const currentComponent = shallowRef(mx);
const dansBib = ref(false);
const showBooks = ref(false);
const auMx_flag = ref(false);
const disable_wdsjBtn = ref(false);

function aLaBibliotheque() {
    disable_wdsjBtn.value = true;
    currentComponent.value = bibliotheque;
    rj_class.value = 'text-center pa-0 ma-0 text-white';
    theme_btn_class.value = 'text-none bg-brown-darken-1';
    bibBtnClass.value = 'text-none text-amber-lighten-1';
    dansBib.value = true;
    UIBStore.setStatus_books();
    setTimeout(() => {
        disable_wdsjBtn.value = false;
    }, 1500);
}
function auMx() {
    disable_wdsjBtn.value = true;
    auMx_flag.value = true;
    setTimeout(() => {
        currentComponent.value = mx;
        rj_class.value = 'text-center pa-0 ma-0';
        theme_btn_class.value = 'text-none';
        bibBtnClass.value = 'my-10 pa-0';
        dansBib.value = true;
        showBooks.value = false;
        auMx_flag.value = false;
        disable_wdsjBtn.value = false;
        UIBStore.setStatus_null();
    }, 1500);
}

// 主题和类设置相关
const currentTheme = ref('light');

const rj_class = ref('text-center pa-0 ma-0');
const theme_btn_class = ref('text-none');
const bibBtnClass = ref('my-10 pa-0');

function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
}

// 鼠标控制主题按键的海拔
const mouseover = ref(false);
const elevation = ref(0);
watch(mouseover, (newVal, oldVal) => {
    elevation.value = newVal ? 12 : 0;
})

const colBorder = computed(() => {
    return (currentTheme.value === 'light') ? ('border-right: 1px solid #5D4037;') : ('border-right: 1px solid yellow;');
})

// 获取用户名
const username = ref('');

// 路由
const router = useRouter();

// 提醒用户选择哪个文件夹 和 文件/文件夹操作相关
const choisirFolder = ref(false);
const choisirCallBack = ref(null);
const choisirType = ref('');
function choisir(object) {
    choix.value = null;
    choisirFolder.value = true;
    choisirCallBack.value = object.cb;
    choisirType.value = object.type;
}
const folders = ref([]);
const relations = ref([]);
const choix = ref(null);

function moveEmit(object) {
    choix.value = null;
    choisirFolder.value = true;
    choisirCallBack.value = object.cb;
    choisirType.value = object.type;
}

// 文件重命名
let showRename = ref(false);
let newName = ref('');
let rename_function = null;
const name = ref(' ');

const fileNameWithoutExtension = computed(() => {
    if (Object.keys(toRaw(UIBStore.file)).length !== 0) {
        const lastIndex = UIBStore.file.fileName.lastIndexOf('.');
        if (lastIndex !== -1) {
            return UIBStore.file.fileName.substring(0, lastIndex);
        } else {
            console.log('文件没有后缀名');
        }
    }
    else {
        return '';
    }
})

watch(newName, (newValue) => {
    if (newValue.length > 10) {
        newName.value = newValue.slice(0, 10);
    }
})

function renameEmit(object) {
    showRename.value = true;
    rename_function = object.cb;
}
function renameDaccord() {
    if (newName.value.length === 0) {
        showErr.value = true;
        errmsg.value = "文件名不能为空";
        setTimeout(() => {
            showErr.value = false;
            errmsg.value = '';
        }, 3500);
    }
    else if (newName.value === fileNameWithoutExtension.value) {
        showErr.value = true;
        errmsg.value = "新旧文件名要不同";
        newName.value = '';
        setTimeout(() => {
            showErr.value = false;
            errmsg.value = '';
        }, 3500);
    }
    else {
        for (const file of FFStore.relations) {
            let name = '';
            let index = file.fileName.lastIndexOf('.');
            if (index !== -1) {
                name = file.fileName.substring(0, index);
            }
            if (name === newName.value) {
                showErr.value = true;
                errmsg.value = "文件名已存在";
                setTimeout(() => {
                    showErr.value = false;
                    errmsg.value = '';
                }, 3500);
                return;
            }
        }
        rename_function(newName.value);
    }
}

const loading = ref(false);
function deleteEmit(object) {
    loading.value = true;
    object.cb();
}

// 查看文件属性
const showProperty = ref(false)
function viewPropsEmit(object) {
    object.cb();
}

// 下载文件
function downloadEmit(object) {
    loading.value = true;
    object.cb();
}

// 创建文件夹
const newFolderName = ref('');
const createFolder = ref(null);
const dialogCreateFolder = ref(false);
watch(newFolderName, (newValue, oldValue) => {
    if (newValue.length > 20) {
        newFolderName.value.slice(0, 20);
    }
})
function createFolderEmit(object) {
    createFolder.value = object.cb;
    dialogCreateFolder.value = true;
}

// 上传文件
const dialogUpload = ref(false);
const filesUpload = ref([]);
const filesUploadDaccord = ref(null);
function uploadFileEmit(object) {
    dialogUpload.value = true;
    filesUploadDaccord.value = object.cb;
}
const handleDragOver = (event) => {
    event.preventDefault(); // 防止浏览器默认处理拖拽的数据
};
const handleDrop = (event) => {
    filesUpload.value = event.dataTransfer.files;
};

function uploadError(object) {
    dialogUpload.value = false;
    filesUpload.value = [];
    choix.value = null;
    errmsg.value = object.msg;
    showErr.value = true;
    progressState.hideProgress();
    progressState.setProgress(0);
    UIBStore.clearActionType();
    setTimeout(() => {
        showErr.value = false;
        errmsg.value = '';
    }, 3500);
}

function uploadComplete() {
    progressState.showCheckmarkTemporarily(2000);

    dialogUpload.value = false;
    filesUpload.value = [];
    choix.value = null;

    UIBStore.clearActionType();

    FFStore.setStatus().then(() => {
        folders.value = FFStore.getFolders;
        relations.value = FFStore.getRelations;
        console.log(dialogCreateFolder.value, folders.value)
    }).catch((err) => { alert(err) })
}

// 重命名文件夹
const showRenameFolder = ref(false);
const folderNameModifie = ref('');
const modifierFolderName = ref(null);
function renameFolderEmit(object) {
    showRenameFolder.value = true;
    modifierFolderName.value = object.cb;
}
watch(folderNameModifie, (newValue) => {
    if (folderNameModifie.length > 10) {
        folderNameModifie.value = newValue.slice(0, 10);
    }
})

//删除文件夹
const removeFolderDaccord = ref(null);
const openDialogueRemoveFolder = ref(false);
const fileRest = ref([]);
const folderRest = ref([]);
const deleteFolder = ref(false);
const folderRestId = ref([]);
const fileRestId = ref([]);
function removeFolderEmit(object) {
    // 辅助文件夹检查函数
    function checkFolder(folder, chooseFolderId) {
        if (folder.parent_id === chooseFolderId) {
            folderRest.value.push(folder.name);
            folderRestId.value.push(folder.folder_id);
        }
        if (folder.children.length > 0) {
            folder.children.forEach(childFolder => {
                checkFolder(childFolder, chooseFolderId);
            });
        }
    }

    fileRest.value = [];
    folderRest.value = [];
    removeFolderDaccord.value = object.cb;
    //主文件夹不能删
    if (UIBStore.folder.name === '主文件夹') {
        showErr.value = true;
        errmsg.value = "主文件夹不能删哦";
        setTimeout(() => {
            showErr.value = false;
            errmsg.value = '';
        }, 3000);
        return;
    }
    // 检查是否有文件
    const chooseFolderId = UIBStore.folder.folder_id;
    for (const file of FFStore.relations) {
        if (toRaw(file).folderId === chooseFolderId) {
            fileRest.value.push(file.fileName);
            fileRestId.value.push(file.fileId);
        }
    }
    // 检查是否有文件夹
    for (const folder of FFStore.folders) {
        if (folder.parent_id === chooseFolderId) {
            folderRest.value.push(folder.name);
            folderRestId.value.push(folder.folder_id);
        }
        if (folder.children.length > 0) {
            checkFolder(folder, chooseFolderId);
        }
    }

    if (fileRest.value.length > 0 || folderRest.value.length > 0) {
        openDialogueRemoveFolder.value = true;
        return;
    }
    else {
        loading.value = true;
        removeFolderDaccord.value(folderRestId, fileRestId)
    }
}

</script>

<style lang="less" scoped>
.threejs-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.floating-container {
    position: absolute;
    z-index: 1;
    left: 50%;
    transform: translateX(-50%);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.books {
    width: 80%;
    height: 100%;
    background-color: rgba(255, 0, 0, 0.5);
    animation: float 1s;
    animation-fill-mode: forwards;

    margin: 0 auto;
}

@keyframes float {
    0% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-20px);
    }

    100% {
        transform: translateY(0);
    }
}

.upload-drop-zone {
    border: 3px dashed #cecece;
    margin: 20px;
    padding: 20px;
    text-align: center;
    width: 100%;
    height: 100%;
}
</style>
