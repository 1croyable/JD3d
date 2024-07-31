<template>
    <v-card id="container" class="pa-0">
        <!-- 主要元素 -->
        <div ref="divRef" class="scroll markdown-content my-12 mx-4" style="position: relative;">
            <canvas ref="canvas"
                :style="'position: absolute; top: 0; left: 0;' + (isDrawingModeEnabled ? 'z-index: 2;' : 'z-index: 0;') + 'pointer-events:' + (isDrawingModeEnabled ? 'auto;' : 'none;')"></canvas>
            <div v-show="props.renderedMarkdown" class="markdown-body pa-5" v-html="props.renderedMarkdown"
                style="z-index: 1"></div>
            <component :is="PdfViewer" v-show="pdfStore.show"></component>
            <div id="loadingPdf" v-show="pdfStore.loading" class="text-center">
                <div style="margin: 80px auto; height: 360px; width: 360px;" v-if="pdfStore.numPages === 0">
                    <v-skeleton-loader type="card" height="360" width="360"></v-skeleton-loader>
                </div>
                <v-progress-circular v-else class="mt-16" :model-value="pdfStore.progress / pdfStore.numPages * 100"
                    :size="256" :width="15" color="teal" style="font-size: 28px;">{{ pdfStore.progress }}/{{
                    pdfStore.numPages }}</v-progress-circular>
            </div>
        </div>
        <!-- 右下角提示 -->
        <div style="position: absolute; bottom: 0; right: 5%;">
            <!-- 画板状态 -->
            <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                    <v-chip style="z-index: 3;" v-bind="props" class="ma-2" color="black" variant="outlined"
                        @click="isDrawingModeEnabled = !isDrawingModeEnabled">
                        <span class="ma-6"></span>
                    </v-chip>
                </template>
                <span>{{ isDrawingModeEnabled ? '画板状态： 开' : '画板状态： 关' }}</span>
            </v-tooltip>
            <div :class="isDrawingModeEnabled ? 'openOrClose-Open' : 'openOrClose-Close'"
                style="transition: background-color 0.3s ease;"></div>
            <div class="openOrCloseMdi" :style="{ left: isDrawingModeEnabled ? '54%' : '22%' }">
                <v-avatar color="success" size="22">
                    <v-avatar color="black" size="18">
                        <v-icon :icon="isDrawingModeEnabled ? 'mdi-ideogram-cjk' : 'mdi-pen-off'"></v-icon>
                    </v-avatar>
                </v-avatar>
            </div>
            <!-- 页码和页数 -->
            <div v-show="noteStore.notes" style="position: absolute; bottom: 70px; left: -70px; width: 10vw;">
                <v-btn v-show="noteStore.file" @click="noteStore.lastPage(); renderNote();"
                    :disabled="noteStore.pageIndex <= 0">
                    <v-icon icon="mdi-page-first" size="25px"></v-icon>
                </v-btn>
                <v-btn v-show="noteStore.file" @click="noteStore.nextPage(); renderNote();"
                    :disabled="noteStore.pageIndex >= noteStore.notes[noteStore.selectedNoteIndex]?.layers.filter((layer, index) => (layer.id - 1) === noteStore.canEditIndex)[0]?.pages.length - 1">
                    <v-icon icon="mdi-page-last" size="25px"></v-icon>
                </v-btn>
                <span class="pl-2" v-show="noteStore.file">第{{ noteStore.pageIndex + 1 }}页/共{{
                    noteStore.notes[noteStore.selectedNoteIndex]?.layers.filter((layer, index) => (layer.id - 1) ===
                        noteStore.canEditIndex)[0]?.pages.length }}页</span>
                <v-divider></v-divider>
            </div>
        </div>
        <!-- 创建新笔记 -->
        <v-dialog :activator="newNoteBtn" width="600px">
            <v-card>
                <v-card-title class="ma-3 text-h4">创建新笔记</v-card-title>
                <v-card-text>
                    <v-text-field v-model="newNoteName" label="笔记名称" variant="outlined"></v-text-field>
                    <v-btn @click="newNote()" color="success" :disabled="!newNoteName">创建</v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- 打开现有笔记 -->
        <v-dialog :activator="chooseNoteBtn" width="600px" max-height="800px" class="overflow-y-auto">
            <v-card>
                <v-card-title class="ma-3 text-h4">这个文件你已经创建的笔记如下</v-card-title>
                <v-radio-group v-model="noteChoose">
                    <NoteComposer></NoteComposer>
                </v-radio-group>
                <v-card-text>
                    <v-btn @click="chooseNote()" color="success" :disabled="noteChoose === -1">打开</v-btn>
                    <v-btn @click="deleteNote()" color="success" :disabled="noteChoose === -1">删除</v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-card>
    <!-- 控件 -->
    <div class="float" style="width: 200px">
        <v-container>
            <v-row>
                <v-col cols="12">
                    <v-btn ref="saveNoteBtn" @click="saveNote()" v-show="noteStore.file !== null" :loading="saveLoading"
                        block>保存笔记</v-btn>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-btn ref="newNoteBtn" v-show="noteStore.file !== null">创建新笔记</v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn ref="chooseNoteBtn" v-show="noteStore.file !== null">打开现有笔记</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>


<script setup>
import { ref, onMounted, watchEffect, watch, computed, nextTick, onUnmounted, toRaw } from 'vue';
import axios from 'axios';
import NoteComposer from './NoteComposer.vue';
import styles from '../../css/markdown5.less?inline';
import 'github-markdown-css'
import { useNotesStore } from '../../../public/stores/canvas'
import note from '../../class/Note';
import { useUserInfo } from '../../../public/stores/userInfo';
import getUserName from '../../../methods/getUserName';
import { useErrAlert } from '../../../public/stores/errAlert'
import PdfViewer from './PdfViewer.vue';
import { usePdfStore } from '../../../public/stores/pdfStore';
import { getPdfPages } from '../../../methods/pdf/getPdfPages'

const pdfStore = usePdfStore();

const errAlert = useErrAlert();
const UserInfo = useUserInfo();

const Note = note.Note;
const Drawing = note.Drawing
const Layer = note.Layer;

const noteStore = useNotesStore();

const divRef = ref(null);

const emit = defineEmits(['error', 'play', 'clearflag']);

const props = defineProps({
    renderedMarkdown: String,
    play: Boolean,
    clearflag: Boolean,
    vitesse: Number
})


// 播放法语相关
const selectedText = ref('');
watch(() => props.clearflag,
    (newValue) => {
        if (newValue === true) {
            selectedText.value = '';
            emit('clearflag', false);
        }
    }
)
function containsChinese(text) {
    return /[\u3400-\u9FBF]/.test(text);
}
const getUserSelection = () => {
    selectedText.value = window.getSelection();
};
const key = '9bc29b2ede4f4016976a141ddf6bedd7';
const language = 'fr-fr';
const type = 'MP3';
const f = '44khz_16bit_stereo'
const vitesse = computed(() => props.vitesse)
watchEffect(() => {
    if (props.play === true) {
        getUserSelection();
        if (selectedText.value.toString().trim() === '') {
            emit('error', '还没选择文字');
            return;
        }
        else {
            if (divRef.value && selectedText.value.rangeCount > 0) {
                const range = selectedText.value.getRangeAt(0);
                if (divRef.value.contains(range.commonAncestorContainer)) {
                    selectedText.value = selectedText.value.toString();

                    if (containsChinese(selectedText.value)) {
                        emit('error', '请不要包含中文文字');
                        return;
                    }
                    else {
                        axios.get('http://api.voicerss.org/', {
                            responseType: 'blob',
                            params: {
                                key: key,
                                hl: language,
                                src: selectedText.value,
                                f: f,
                                c: type,
                                v: vitesse.value
                            }
                        })
                            .then(response => {
                                emit('play', response.data);
                            })
                            .catch(error => {
                                emit('error', error);
                            });
                    }
                }
                else {
                    emit('error', '请选择文本中的内容');
                    return;
                }
            }
        }
    }
});

// canvas相关
const ctx = ref(null);
const isDrawing = ref(false);// 是否正在绘制的判断结果
const lastPosition = { x: 0, y: 0 };
const isDrawingModeEnabled = ref(false); // 控制绘图模式的状态，这个是大前提
let longPressTimer = null;
const longPressThreshold = 200;
const canvas = ref(null);
const container = ref(null);
let pointerType = '';
let newDraw = new Drawing(); // 用来保存1个笔画

const newNoteBtn = ref(null);
const chooseNoteBtn = ref(null);

onMounted(async () => {
    await nextTick();
    // 获取用户名，便于与后端联系
    UserInfo.username = await getUserName();

    initCanvas();
    bindEvents();
    document.addEventListener('keydown', toggleDrawingModeByKey);
});
onUnmounted(async () => {
    document.removeEventListener('keydown', toggleDrawingModeByKey);
    noteStore.file = null;
});

function toggleDrawingModeByKey(e) {
    if (e.key === 'd' || e.key === 'D') {
        isDrawingModeEnabled.value = !isDrawingModeEnabled.value;
    }
}

function initCanvas() {
    container.value = divRef.value;
    if (canvas.value && container.value) {
        canvas.value.width = 0;
        canvas.value.height = 0;
        ctx.value = canvas.value.getContext('2d');
    }
}
function bindEvents() {
    if (container.value && canvas.value) {
        container.value.addEventListener('scroll', handleScroll);
        canvas.value.addEventListener('pointerdown', startDrawing);
        canvas.value.addEventListener('pointermove', draw);
        canvas.value.addEventListener('pointerup', stopDrawing);
        canvas.value.addEventListener('pointerleave', stopDrawing);
    }
}
function startDrawing(e) {
    if (!isDrawingModeEnabled.value) return;
    pointerType = e.pointerType
    isDrawing.value = false; // 初始不启用绘图，等待进一步确认
    newDraw = new Drawing(); // 每次按下都要创建一个新的笔画，不管用户画不画

    if (pointerType === 'pen') {
        longPressTimer = setTimeout(() => {
            longPressTimer = null;
        }, longPressThreshold);
    }

    if (pointerType = 'mouse') {
        isDrawing.value = true;
    }

    lastPosition.x = e.offsetX;
    lastPosition.y = e.offsetY;
}
function draw(e) {
    console.log('isDrawing:', isDrawing.value)
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
        isDrawing.value = true;
    }
    if (!isDrawingModeEnabled.value || !isDrawing.value || !ctx.value || noteStore.selectedNoteIndex === -1 || noteStore.canEditIndex === -1) return; // 确保是在绘图模式下并且有画笔、有画板
    console.log('画')
    console.log(e.offsetX, e.offsetY)
    ctx.value.save();
    ctx.value.strokeStyle = noteStore.color;
    ctx.value.lineWidth = noteStore.lineWidth;
    ctx.value.beginPath();
    ctx.value.moveTo(lastPosition.x, lastPosition.y);
    ctx.value.lineTo(e.offsetX, e.offsetY);
    ctx.value.stroke();
    ctx.value.restore();

    const relativeX1 = (lastPosition.x / canvas.value.width) * 100;
    const relativeY1 = (lastPosition.y / canvas.value.height) * 100;
    const relativeX2 = (e.offsetX / canvas.value.width) * 100;
    const relativeY2 = (e.offsetY / canvas.value.height) * 100;

    newDraw.addDraw(relativeX1, relativeY1, relativeX2, relativeY2, noteStore.color, noteStore.lineWidth);

    lastPosition.x = e.offsetX;
    lastPosition.y = e.offsetY;
}

const DrawingCounter = ref(0)
async function stopDrawing() {
    if (!isDrawingModeEnabled.value || !isDrawing.value || !ctx.value || noteStore.selectedNoteIndex === -1 || noteStore.canEditIndex === -1) return;
    pointerType = '';
    isDrawing.value = false;

    noteStore.notes[noteStore.selectedNoteIndex].layers.filter((layer, index) => (layer.id - 1) === noteStore.canEditIndex)[0].layerAddDraw(newDraw, noteStore.pageIndex);

    noteStore.saveState();

    DrawingCounter.value++;
    if (DrawingCounter.value % 50 === 0) {
        await noteStore.saveNote();
    }
}
function handleScroll() {
    if (canvas.value.height !== container.value.scrollHeight) {
        canvas.value.height = container.value.scrollHeight;
        renderNote();
    }
    renderNote();
}

//工具：更新已经存在于笔记中的内容到canvas上
function renderNote() {
    if (noteStore.selectedNoteIndex > -1) {
        const top = container.value.scrollTop;
        ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
        // 拿到正在使用的note
        const note = noteStore.notes[noteStore.selectedNoteIndex];
        if (note) {
            //更新每一个已激活的图层
            for (const layer of note.layers) {
                if (layer.isActive === true) {
                    let nowPage = layer.pages[noteStore.pageIndex]
                    nowPage.forEach(draw => {
                        draw.drawingArray.forEach(drawing => {
                            const absoluteX1 = drawing.x1 / 100 * canvas.value.width;
                            const absoluteY1 = drawing.y1 / 100 * canvas.value.height;
                            const absoluteX2 = drawing.x2 / 100 * canvas.value.width;
                            const absoluteY2 = drawing.y2 / 100 * canvas.value.height;


                            if ((absoluteY1 >= top && absoluteY1 <= top + container.value.clientHeight) ||
                                (absoluteY2 >= top && absoluteY2 <= top + container.value.clientHeight)) {
                                ctx.value.save()
                                ctx.value.strokeStyle = drawing.color;
                                ctx.value.lineWidth = drawing.width;
                                ctx.value.beginPath();
                                ctx.value.moveTo(absoluteX1, absoluteY1);
                                ctx.value.lineTo(absoluteX2, absoluteY2);
                                ctx.value.stroke();
                                ctx.value.restore();
                            }
                        })
                    });
                }
            }
        }
    } else return;
}
watch(() => noteStore.render, (newVal) => {
    renderNote();
})

//笔记管理
//创建新笔记
const newNoteName = ref('');
async function newNote() {
    if (ctx.value) {
        // 如果是pdf，那么获取pdf文件的页数
        try {
            if (pdfStore.file && pdfStore.file.fileName.endsWith('.pdf')) {
                pdfStore.numPages = await getPdfPages(pdfStore.file);
            }
        } catch (error) {
            errAlert.showErr('获取pdf页数失败：' + error);
            console.log(error)
            return;
        }

        noteStore.createNote(newNoteName.value, pdfStore.numPages / 10 + 1);
        ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
        newNoteName.value = '';
        //直接选中
        noteChoose.value = noteStore.notes.length - 1;
        noteStore.chooseNote(noteChoose.value);
        noteStore.undo = [[...noteStore.notes]];
        noteStore.redo = [];
        noteStore.setEditableLayerByActive();
        noteChoose.value = 0;
        noteStore.activeLayers = noteStore.notes[noteStore.selectedNoteIndex].layers.map(layer => {
            if (layer.isActive)
                return layer.id;
        });

        canvas.value.width = container.value.offsetWidth;
        canvas.value.height = container.value.scrollHeight;
        newNoteBtn.value.$el.click();
    }
    else {
        errAlert.showErr('找不到画笔')
        newNoteName.value = '';
    }
}
//打开现有笔记
const noteChoose = ref(noteStore.selectedNoteIndex);
function chooseNote() {
    if (ctx.value) {
        noteStore.chooseNote(noteChoose.value);
        noteStore.undo = [[...noteStore.notes]];
        noteStore.redo = [];
        renderNote();
        chooseNoteBtn.value.$el.click();
    }
    else {
        errAlert.showErr('找不到画笔')
        noteChoose.value = noteStore.selectedNoteIndex;
    }
}

// 文件与canvas，文件与note的关系
watch(() => noteStore.file, async () => {
    try {
        await noteStore.getNotes();
        noteStore.redo = [];
        // 当文件更新的时候，如果存在现有笔记，canavs的宽高要更新
        if (noteStore.notes.length > 0) {
            canvas.value.width = container.value.offsetWidth;
            canvas.value.height = container.value.scrollHeight;
            //记录好文件的宽高，以便layer.vue组件使用
            noteStore.fileWidth = canvas.value.width;
            noteStore.fileHeight = canvas.value.height;
            // 选中第一个笔记
            chooseNote.value = 0;
            noteStore.selectedNoteIndex = 0;
            //设置好可以编辑的图层和可视图层
            noteChoose.value = 0;
            noteStore.activeLayers = noteStore.notes[noteStore.selectedNoteIndex].layers.map(layer => {
                if (layer.isActive)
                    return layer.id;
            });
            noteStore.setEditableLayerByActive();
            // 如果是pdf，则获取pdf页数
            if (noteStore.file.fileName.endsWith('pdf')) {
                pdfStore.numPages = await getPdfPages(pdfStore.file);
            }
        }
        renderNote();
    } catch (err) {
        errAlert.showErr(err.message);
    }
})
watch(() => noteStore.notes.length, () => {
    canvas.value.width = container.value.offsetWidth;
    canvas.value.height = container.value.scrollHeight;
    noteStore.fileWidth = canvas.value.width;
    noteStore.fileHeight = canvas.value.height;
})

// 删除笔记
async function deleteNote() {
    if (ctx.value) {
        await noteStore.deleteNote(noteChoose.value);

        ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

        chooseNoteBtn.value.$el.click();

        // 做下标的调整
        if (noteStore.selectedNoteIndex > noteChoose.value) {
            --noteStore.selectedNoteIndex;
            chooseNote.value = noteStore.selectedNoteIndex;
        }
        if (noteChoose.value === noteStore.selectedNoteIndex) {
            ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
            chooseNote.value = -1;
            noteStore.selectedNoteIndex = -1;
            noteStore.undo = [[...noteStore.notes]];
            noteStore.redo = [];
        }
        renderNote();
    }
    else {
        errAlert.showErr('找不到画笔')
        noteChoose.value = noteStore.selectedNoteIndex;
    }
}

//主动保存笔记
const saveLoading = ref(false);
const saveNoteBtn = ref(null);
async function saveNote() {
    try {
        saveLoading.value = true
        await noteStore.saveNote();
        saveLoading.value = false
    } catch (error) {
        errAlert.showErr('保存失败，请重试' + error.message)
        saveLoading.value = false
    }
}
</script>

<style lang="less" scoped>
.float {
    position: absolute;
    bottom: 10%;
    right: 10%;
}

.markdown-content {
    height: 80vh;
    overflow-y: auto;
}

.scroll {
    &::-webkit-scrollbar {
        width: 10px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 5px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.5);
    }

    &::-webkit-scrollbar-thumb:active {
        background: rgba(0, 0, 0, 0.7);
    }

    &::-webkit-scrollbar {
        width: 0;
        background: transparent;
    }
}

#container {
    margin: 0 auto;
    width: 60vw;
    border: 1px solid #ccc;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.openOrClose-Close {
    position: absolute;
    top: 40%;
    left: 28%;
    z-index: -1;
    width: 40px;
    height: 10px;
    background-color: gray;
    border: 1px solid black;

    // 创建左端的圆形
    &::before {
        content: '';
        position: absolute;
        left: -2.5px;
        top: 50%;
        transform: translateY(-50%);
        width: 10px;
        height: 10px;
        background-color: gray;
        border-radius: 50%;
        transition: background-color 0.3s ease;
        border-left: 1px solid black;
    }

    // 创建右端的圆形
    &::after {
        content: '';
        position: absolute;
        right: -2.5px; // 根据圆的大小向右偏移
        top: 50%;
        transform: translateY(-50%);
        width: 10px; // 圆的大小
        height: 10px; // 圆的大小
        background-color: gray;
        border-radius: 50%; // 使其成为完美的圆形
        transition: background-color 0.3s ease;
        border-right: 1px solid black;
    }
}

.openOrClose-Open {
    position: absolute;
    top: 40%;
    left: 28%;
    z-index: -1;
    width: 40px;
    height: 10px;
    background-color: rgb(130, 255, 47);
    border: 1px solid black;

    // 创建左端的圆形
    &::before {
        content: '';
        position: absolute;
        left: -2.5px;
        top: 50%;
        transform: translateY(-50%);
        width: 10px;
        height: 10px;
        background-color: rgb(130, 255, 47);
        border-radius: 50%;
        transition: background-color 0.3s ease;
        border-left: 1px solid black;
    }

    // 创建右端的圆形
    &::after {
        content: '';
        position: absolute;
        right: -2.5px; // 根据圆的大小向右偏移
        top: 50%;
        transform: translateY(-50%);
        width: 10px; // 圆的大小
        height: 10px; // 圆的大小
        background-color: rgb(130, 255, 47);
        border-radius: 50%; // 使其成为完美的圆形
        transition: background-color 0.3s ease;
        border-right: 1px solid black;
    }
}


.openOrCloseMdi {
    position: absolute;
    top: 28%;
    left: 22%;
    transition: left 0.3s ease;
}
</style>
../../../public/stores/canvas../../../public/class/Note../../../public/stores/userInfo../../../methods/getUserName../../../public/stores/errAlert