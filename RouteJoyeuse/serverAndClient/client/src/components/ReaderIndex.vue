<template>
    <v-app :theme="currentTheme">
        <!-- 警告 -->
        <transition name="fade">
            <div style="position: absolute; top:0; z-index: 9999; width: 100vw;">
                <v-alert v-if="errAlert.show" border="start" border-color="deep-purple accent-4" elevation="2">
                    <h2 style="display:inline;"> <v-icon>mdi-alert-circle</v-icon> 出错啦 | </h2>
                    <span>{{ errAlert.msg }}</span>
                </v-alert>
            </div>
        </transition>

        <!-- 导航栏 -->
        <v-app-bar app fixed height="50" class="elevation-10 ">
            <v-icon size="30" @click="toinfo" class="ml-7">mdi-door-open</v-icon>

            <div style="margin: 20px;">
                <v-icon icon="mdi-menu" @click="drawer = !drawer"></v-icon>|
                <v-icon icon="mdi-book-open-page-variant" @click="ifupload = !ifupload"></v-icon>
            </div>

            <v-btn @click="toggleTheme" class="text-none" color="medium-emphasis" rounded variant="outlined"
                :elevation="elevation" @mouseover="mouseover = true" @mouseleave="mouseover = false">
                <template v-slot="append">
                    <v-icon :size="25"
                        :icon="currentTheme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"></v-icon>
                </template>
            </v-btn>

            <v-toolbar-title>Route Joyeuse --- 阅读器</v-toolbar-title>

            <v-icon size="25px" :class="(noteStore.undo.length <= 1) ? 'bg-grey' : 'bg-black'" class="mx-3"
                @click="noteStore.undo_f()">mdi-undo</v-icon>
            <v-icon size="25px" :class="(noteStore.redo.length === 0) ? 'bg-grey' : 'bg-black'" class="mx-3"
                @click="noteStore.redo_f()">mdi-redo</v-icon>

            <widthControl></widthControl>

            <couleur></couleur>丨

            <div>
                <v-progress-circular v-show="playState === false && waitingRadio === true" indeterminate
                    :width="8"></v-progress-circular>
                <div v-show="playState === false && waitingRadio === false" style="margin: 20px;">
                    <v-icon size="50" icon="mdi-play-box" @click="play"></v-icon>
                </div>
                <div v-show="playState === true && waitingRadio === false" style="margin: 20px;">
                    <v-icon size="50" icon="mdi-stop" @click="stop"></v-icon>
                </div>
            </div>|
            <v-icon size="50" @click="showTune = !showTune">mdi-tune</v-icon>
        </v-app-bar>

        <!-- 播放控制 -->
        <tune @update:vitesse="changeVitesse" :showTune="showTune"></tune>

        <!-- 文件 -->
        <BookNav @file-clicked="handleFileClicked" :drawer="drawer"></BookNav>

        <!-- 阅读器 -->
        <reader @clearflag="fclearflag" @play="radio" @error="reader_error" :vitesse="vitesse" :play="waitingRadio"
            :clearflag="clearflag" :renderedMarkdown="markdownContent"></reader>

        <!-- 图层管理 -->
        <layers></layers>

        <!-- 文件上传 -->
        <v-dialog width="600px" v-model="ifupload">
            <upload @upload-complete="uploadComplete" @nePasEnregistrer="nePasEnregistrer"></upload>
        </v-dialog>

        <audio ref="audioPlayer" class="audio-player" controls></audio>
    </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watchEffect, toRaw, watch } from 'vue';
import reader from './ReaderExtras/reader.vue';
import axios from 'axios';
import tune from './ReaderExtras/tune.vue';
import layers from './ReaderExtras/layers.vue';
import upload from './ReaderExtras/Upload.vue';
import couleur from './ReaderExtras/couleur.vue';
import BookNav from './ReaderExtras/BookNav.vue';
import widthControl from './ReaderExtras/widthControl.vue';
import getFileContent from '../../methods/getFileContent';
import markdownIt from 'markdown-it';
import { useFFStore } from '../../public/stores/FileFolder';
import { useErrAlert } from '../../public/stores/errAlert';
import { useNotesStore } from '../../public/stores/canvas';
import { useRouter } from 'vue-router';
import { usePdfStore } from '../../public/stores/pdfStore';

const errAlert = useErrAlert();
const FFStore = useFFStore();
const noteStore = useNotesStore();
const pdfStore = usePdfStore();

let showErr = ref(false);
let vitesse = ref(0);
let showTune = ref(false);
const workarea = ref(null);
const isResizing = ref(false);
const startY = ref(0);
const startX = ref(0);
const startHeight = ref(0);
const startWidth = ref(0);
const drawer = ref(false);
const ifupload = ref(false);

const reader_error = (data) => {
    errAlert.showErr(data)
    playState.value = false;
    waitingRadio.value = false;
}

function fclearflag(data) {
    clearflag.value = data;
}

let waitingRadio = ref(false);
let playState = ref(false);
let audioUrl = '';
let clearflag = ref(false);
const audioPlayer = ref(null);

const play = () => {
    waitingRadio.value = true;
}

const radio = (data) => {
    waitingRadio.value = false;
    audioUrl = URL.createObjectURL(data);
    audioPlayer.value.src = audioUrl;
    audioPlayer.value.onended = () => {
        stop();
    }
    audioPlayer.value.play();
    playState.value = true;
}

const stop = () => {
    audioPlayer.value.pause();
    audioPlayer.value.currentTime = 0;
    playState.value = false;
    clearflag.value = true;
}

let changeVitesse = (v) => {
    vitesse.value = v;
}

const markdownContent = ref('');
const md = new markdownIt({
    html: true,
    breaks: true,
});

function handleFileClicked(file) {
    pdfStore.pdfUrl = '';
    pdfStore.pdfData = null;
    pdfStore.file = null;
    pdfStore.numPages = 0;
    pdfStore.progress = 0;
    pdfStore.show = false;
    noteStore.file = null;

    const key = file.cosKey;
    //如果文件名后缀是pdf
    if(file.fileName.endsWith('.pdf')){
        pdfStore.loading = true;
        console.log(key);
        axios.get(`/api/note/getpdfUrl?key=${key}`).then(res=>{
            pdfStore.file = file;
            pdfStore.pdfUrl = res.data.url.Url;
        })
    } else {
        getFileContent(key).then((content) => {
            markdownContent.value = md.render(content);
            noteStore.file = file;
        }).catch
        (error => {
            alert('获取文件内容失败: ' + error)
        })
    }
}

function uploadComplete(object) {
    getFileContent(object.key).then((content) => {
        if(object.type === 'md'){
            markdownContent.value = md.render(content);
        }
        
        ifupload.value = false;
        FFStore.setStatus();
    }).catch
        (error => {
            alert('获取文件内容失败: ' + error)
        })
}

function nePasEnregistrer(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const fileContent = event.target.result;
        markdownContent.value = md.render(fileContent);
    }

    reader.readAsText(file);
    ifupload.value = false;
}


// 夜间模式
const currentTheme = ref('light');
function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
}
const mouseover = ref(false);
const elevation = ref(0);
watch(mouseover, (newVal, oldVal) => {
    elevation.value = newVal ? 12 : 0;
})

// 回到个人信息
const router = useRouter();
function toinfo (){
    router.push({ path: '/userInfo' });
}

</script>

<style lang="less" scoped>
.audio-player {
    display: none;
}
</style>
