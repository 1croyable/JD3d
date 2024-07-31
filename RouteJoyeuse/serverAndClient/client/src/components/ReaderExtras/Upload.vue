<template>
    <v-card>
        <strong class="ma-4">开始阅读</strong>
        <v-card-text>
            选择或拖拽文件
        </v-card-text>
        <div class="upload-drop-zone" @dragover.prevent="handleDragOver" @drop.prevent="handleDrop">
            <v-file-input class="ma-0 pa-0" label="上传文件或拖拽文件到这里" accept=".md,.pdf" placeholder="选择或拖拽文件"
                variant="outlined" counter color="deep-purple-accent-4" v-model="files"
                :show-size="true"></v-file-input>
            <canvas id="canvas" width="300" height="200"></canvas>
        </div>
        <v-checkbox v-model="saveToAccount" label="保存到 我的账户\书"></v-checkbox>
        <v-btn @click="submit">上传</v-btn>
        <v-progress-linear :model-value="uploadProgress" v-if="showProgress" striped color="deep-orange" height="20">
            <template v-slot:default="{ value }">
                <div v-if="showCheckmark" style="width: 20px;
                height: 20px;">
                    <div class="check"></div>
                </div>
                <strong v-else>{{ Math.ceil(value) }}%</strong>
            </template>
        </v-progress-linear>
    </v-card>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import getUserName from '../../../methods/getUserName'
import { defineEmits } from 'vue';
import { usePdfStore } from '../../../public/stores/pdfStore'
import { useNotesStore } from '../../../public/stores/canvas';

const pdfStore = usePdfStore();
const notesStore = useNotesStore();

const router = useRouter();
const username = ref(null);
const uploadProgress = ref(0);
const showProgress = ref(false);
const showCheckmark = ref(false);

const emits = defineEmits(['upload-complete', 'nePasEnregistrer'])

let canvas, ctx;

function draw(ctx) {
    ctx.save();
    ctx.font = '24px KaiTi';
    ctx.fillStyle = 'black';
    ctx.rotate(-Math.PI / 10);
    ctx.fillText('上传', 120, 120);
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(0, 70);
    ctx.bezierCurveTo(50, 0, 70, 180, 150, 130);
    ctx.bezierCurveTo(150, 130, 190, 100, 300, 130);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.font = '20px KaiTi';
    ctx.fillStyle = 'black';
    ctx.rotate(Math.PI / 14);
    ctx.fillText('现仅支持 md格式', 70, 130);
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(200, 75);
    ctx.lineTo(210, 65);
    ctx.lineTo(225, 35);
    ctx.lineTo(214, 30);
    ctx.lineTo(200, 60);
    ctx.lineTo(200, 75);
    ctx.strokeStyle = 'black';
    ctx.stroke();
}

onMounted(async () => {
    await nextTick();
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    draw(ctx);
});

const files = ref(null);
const file = ref(null);
watch(files, (newFile) => {
    if (newFile) {
        file.value = files.value[0]; // 只处理第一个文件
    }
})

const saveToAccount = ref(false);

const handleDragOver = (event) => {
    event.preventDefault(); // 防止浏览器默认处理拖拽的数据
};
const handleDrop = (event) => {
    files.value = event.dataTransfer.files;
};

const submit = async () => {
    // 重置note和pdf状态
    pdfStore.pdfUrl = '';
    pdfStore.pdfData = null;
    pdfStore.file = null;
    pdfStore.show = false;
    notesStore.file = null;

    if (!file.value) {
        return;
    } else {
        const formData = new FormData();
        formData.append('file', file.value);

        username.value = await getUserName()

        if (saveToAccount.value === true) {
            // 处理pdf的保存上传
            if (file.value.type === 'application/pdf') {
                showProgress.value = true;

                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'UserName': username.value
                    },
                    onUploadProgress: (progressEvent) => {
                        uploadProgress.value = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100));
                    },
                }
                const key = await pdfStore.uploadPdf(file.value, config, true);
                notesStore.file = file.value;
                file.value = null;
                setTimeout(() => {
                    uploadProgress.value = 0;
                    showProgress.value = false;
                    showCheckmark.value = false;
                    emits('upload-complete', { key: key, type: 'pdf' });
                }, 1300);
            } else {
                // 处理md的保存上传
                try {
                    const config = {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'UserName': username.value
                        },
                        onUploadProgress: (progressEvent) => {
                            uploadProgress.value = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100));
                        },
                    }

                    showProgress.value = true;
                    axios.post('/api/upload', formData, config).then((key) => {
                        notesStore.file = file.value;
                        file.value = null;
                        showCheckmark.value = true;
                        saveToAccount.value = false;
                        setTimeout(() => {
                            uploadProgress.value = 0;
                            showProgress.value = false;
                            showCheckmark.value = false;
                            emits('upload-complete', { key: key.data, type: 'md' });
                        }, 1300);
                    });
                } catch (error) {
                    if (error.response.status === 400) {
                        file.value = null;
                        uploadProgress.value = 0;
                        showProgress.value = false;
                        showCheckmark.value = false;
                        alert("文件已存在");
                    }
                    if (error.response.status === 500) {
                        file.value = null;
                        uploadProgress.value = 0;
                        showProgress.value = false;
                        alert("检查文件失败");
                    }
                    if (error.response.status === 501) {
                        file.value = null;
                        uploadProgress.value = 0;
                        showProgress.value = false;
                        alert("上传文件失败");
                    }
                }
            }
        } else {
            try {
                if (file.value.type === 'application/pdf') {
                    pdfStore.uploadPdf(file.value);
                } else {
                    emits('nePasEnregistrer', file.value);
                    file.value = null;
                    uploadProgress.value = 0;
                }
            } catch (err) {
                console.log(err)//这里要修改错误处理逻辑
            }
        }
    }
};
</script>

<style lang="less">
.upload-drop-zone {
    border: 3px dashed #cecece;
    padding: 20px;
    text-align: center;
}

@keyframes checkmark {
    0% {
        width: 0;
        height: 0;
        opacity: 0;
    }

    40% {
        width: 2px;
        height: 4px;
        opacity: 1;
    }

    100% {
        width: 8px;
        height: 15px;
        opacity: 1;
    }
}

.check {
    margin-bottom: 2px;
    display: inline-block;
    border: 1px solid #2e4200;
    border-width: 3px 0 0 3px;
    transform: rotate(230deg);
    -ms-transform: rotate(230deg);
    -moz-transform: rotate(230deg);
    -webkit-transform: rotate(230deg);
    -o-transform: rotate(-20deg);
    animation: checkmark 0.5s ease-in-out forwards;
}
</style>
