<template>
    <div class="layers" style="position: relative;" v-if="notesStore.notes[notesStore.selectedNoteIndex]">
        <div style="display: inline-block; max-width: 70vw;"
            class="overflow-x-auto layers-container bg-grey-darken-3 pb-1 mt-1">
            <v-item-group multiple v-model="notesStore.activeLayers">
                <v-container>
                    <v-row class="px-4">
                        <draggable :list="list" :animation="100" item-key="id" :forceFallback="true"
                            class="draggable-list" @end="dragEnd">
                            <template #item="{ element }">
                                <div class="ma-1 pa-1" style="min-width: 120px;">
                                    <v-item :value="element.id">
                                        <v-card
                                            :color="(notesStore.canEditIndex + 1 === element.id) ? 'yellow-darken-1' : (notesStore.activeLayers.includes(element.id) ? 'primary' : '')"
                                            class="d-flex align-center " height="20" dark
                                            @click="activeControl(element)" @dblclick="setEditableLayer(element.id)">
                                            <v-card-item>
                                                <v-icon size="large" class="ml-auto"
                                                    @click.stop="deleteLayer(element.id)">
                                                    mdi-delete
                                                </v-icon>
                                                <span
                                                    style="border-right: 1px solid black; margin-left: 2px; height: 100%; display: inline;"></span>
                                                <span class="text-h5 ml-2" style="user-select: none;">图层#{{ element.id
                                                    }}</span>
                                                <v-icon size="large" class="pb-1" end
                                                    @click.stop="openView(element.id)">mdi-arrow-up</v-icon>
                                            </v-card-item>
                                        </v-card>
                                    </v-item>
                                </div>
                            </template>
                        </draggable>
                    </v-row>
                </v-container>
            </v-item-group>

            <!-- 预览 -->
            <v-overlay v-model="showView" class="align-center justify-center">
                <h1 style="text-align: center; color: black">预览</h1>
                <div style="border: 3px dashed black; max-height: 93vh;" ref="viewContainer"
                    class="overflow-y-auto bg-grey-lighten-4">
                    <canvas ref="viewCanvas"></canvas>*

                    <div v-show="notesStore.notes" style="position: absolute; bottom: 70px; left: 45vw; width: 10vw;">
                        <v-btn v-show="notesStore.file" @click="notesStore.lastPage(); renderNote();"
                            :disabled="notesStore.pageIndex <= 0">
                            <v-icon icon="mdi-page-first" size="25px"></v-icon>
                        </v-btn>
                        <v-btn v-show="notesStore.file" @click="notesStore.nextPage(); renderNote();"
                            :disabled="notesStore.pageIndex >= notesStore.notes[notesStore.selectedNoteIndex]?.layers.filter((layer, index) => (layer.id - 1) === notesStore.canEditIndex)[0]?.pages.length - 1">
                            <v-icon icon="mdi-page-last" size="25px"></v-icon>
                        </v-btn>
                        <span class="pl-2" v-show="notesStore.file">第{{ notesStore.pageIndex + 1
                            }}页/共{{ notesStore.notes[notesStore.selectedNoteIndex]?.layers.filter((layer, index) =>
        (layer.id
            - 1) === notesStore.canEditIndex)[0]?.pages.length }}页</span>
                        <v-divider></v-divider>
                    </div>
                </div>
            </v-overlay>

            <!-- 确认删除 -->
            <v-dialog v-model="showDeleteDialog" width="auto">
                <v-card>
                    <v-card-title class="text-h4 ml-4 mt-4">确定不要了吗</v-card-title>
                    <v-card-text class="text-grey-darken-1 pl-6 pt-2">删除后不可恢复</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" variant="text" @click="showDeleteDialog = false" width="150"
                            class="text-h5">取消</v-btn>
                        <v-btn color="error" variant="text" @click="confirmDeleteLayer()" width="150"
                            class="text-h5">确定</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>

        <div style="position: absolute; right: -18px; top: -2px;">
            <v-btn :block="false" fab dark size="x-small" color="primary" class="elevation-5" @click="addNewLayer">
                <v-icon size="20px">mdi-plus</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch, nextTick, computed } from 'vue';
import { useNotesStore } from '../../../public/stores/canvas.js'
import draggable from 'vuedraggable';
import { useErrAlert } from '../../../public/stores/errAlert.js'

const errAlert = useErrAlert();

const notesStore = useNotesStore();
//更新canvas
function render() {
    ++notesStore.render;
}

// 图层预览 - 显示每个图层的缩略图预览。
const showView = ref(false);
const viewContainer = ref(null);

const viewCanvas = ref(null);
const viewCtx = ref(null);

let openView_id = null;
async function openView(id) {
    openView_id = id;
    showView.value = true;
    await nextTick();
    if (viewCanvas.value && viewContainer.value) {
        viewCtx.value = viewCanvas.value.getContext('2d');
        viewCanvas.value.width = notesStore.fileWidth;
        viewCanvas.value.height = notesStore.fileHeight;
        console.log(notesStore.fileWidth, notesStore.fileHeight)
        renderCanvas(id);
        viewContainer.value.addEventListener('scroll', createRenderCanvasWithId(id))
    }
}
watch(showView, () => {
    if (showView.value === false) {
        page.value = null;
        openView_id = null;
    }
})
function createRenderCanvasWithId(id) {
    return function (e) {
        renderCanvas(id);
    };
}
function renderCanvas(id) {
    if (notesStore.selectedNoteIndex > -1) {
        const top = viewContainer.value.scrollTop;

        viewCtx.value.clearRect(0, 0, viewCanvas.value.width, viewCanvas.value.height);
        // 拿到正在使用的note
        const note = notesStore.notes[notesStore.selectedNoteIndex];
        if (note) {
            for (const layer of note.layers) {
                if (layer.id === id) {
                    let nowPage = layer.pages[page.value];
                    nowPage.forEach(draw => {
                        draw.drawingArray.forEach(drawing => {
                            const absoluteX1 = drawing.x1 / 100 * viewCanvas.value.width;
                            const absoluteY1 = drawing.y1 / 100 * viewCanvas.value.height;
                            const absoluteX2 = drawing.x2 / 100 * viewCanvas.value.width;
                            const absoluteY2 = drawing.y2 / 100 * viewCanvas.value.height;

                            if ((absoluteY1 >= top && absoluteY1 <= top + viewContainer.value.clientHeight) ||
                                (absoluteY2 >= top && absoluteY2 <= top + viewContainer.value.clientHeight)) {
                                viewCtx.value.save()
                                viewCtx.value.beginPath();
                                viewCtx.value.moveTo(absoluteX1, absoluteY1);
                                viewCtx.value.lineTo(absoluteX2, absoluteY2);
                                viewCtx.value.strokeStyle = drawing.color;
                                viewCtx.value.lineWidth = drawing.width;
                                viewCtx.value.stroke();
                                viewCtx.value.restore();
                            }
                        })
                    });
                }
            }
        }
    } else return;
}

//新建图层
function addNewLayer() {
    notesStore.addLayerToSelectedNote();
}

//删除图层
const showDeleteDialog = ref(false);
let selectedId = -1;
function deleteLayer(layerId) {
    if (notesStore.notes[notesStore.selectedNoteIndex].layers.length === 1) {
        errAlert.showErr('已经是最后一个图层了')
        return;
    }
    showDeleteDialog.value = true;
    selectedId = layerId;
}
function confirmDeleteLayer() {
    notesStore.deleteLayerFromSelectedNote(selectedId);
    selectedId = -1;
    showDeleteDialog.value = false;
    // 还要做一个修改，就是如果被删除的图层目前是可见的，那么要重新渲染一遍canvas
}

//图层可编辑
function setEditableLayer(layerId) {
    if (t) {
        clearTimeout(t);
        notesStore.setEditableLayer(layerId - 1);
        notesStore.saveState();

        if (!notesStore.activeLayers.includes(layerId)) {
            notesStore.activeLayers = [...notesStore.activeLayers, layerId];
        }
        t = null; // 重置计时器
    }
}


let t = null;
function activeControl(layer) {
    if (notesStore.canEditIndex === layer.id - 1) {
        return;
    }

    if (t) clearTimeout(t);

    t = setTimeout(() => {
        notesStore.activeLayers = notesStore.activeLayers.includes(layer.id) ?
            notesStore.activeLayers.filter(id => id !== layer.id) :
            [...notesStore.activeLayers, layer.id];

        notesStore.notes[notesStore.selectedNoteIndex].layers.forEach(layer => {
            layer.isActive = notesStore.activeLayers.includes(layer.id);
        })
        notesStore.saveState();
        render();
        t = null;
    }, 150);
}

// 图层拖拽
const list = computed(() => {
    return notesStore.notes[notesStore.selectedNoteIndex]?.layers || [];
});

function dragEnd() {
    notesStore.saveState();
    render();
}

// 预览时翻页
const page = ref(0);
function lastPage() {
    if (page.value > 0) {
        --page.value;
        renderCanvas(openView_id);
    }
}
function nextPage() {
    if (page.value < notesStore.notes[notesStore.selectedNoteIndex].layers.filter((layer, index) => (layer.id - 1) === notesStore.canEditIndex)[0].pages.length - 1) {
        ++page.value;
        renderCanvas(openView_id);
    }
}


</script>


<style lang="less" scoped>
.layers {
    margin: 0 auto;
}

.layers-container {
    height: 70px;
}

.draggable-list {
    display: flex;
    flex-direction: row;
    padding: 0;
}
</style>