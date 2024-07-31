<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" md="8">
                <h1 style="text-align: center; font-family: 'Noto Serif SC', serif;">SRT文件处理</h1>
                <v-progress-linear v-if="loading" indeterminate color="deep-purple accent-4"></v-progress-linear>
                <v-file-input label="上传法语的SRT文件，我会给你excel表格" prepend-icon="mdi-paperclip" v-model="file"
                    :disabled="loading || downloadUrl !== ''" outlined dense show-size accept=".srt"></v-file-input>
                <div v-if="!downloadUrl">
                    <v-btn :disabled="!file || loading" color="blue darken-2" class="text-white" @click="uploadFile"
                        block>
                        处理
                    </v-btn>
                </div>
                <div v-else>
                    <v-row align="center" justify="space-between">
                        <v-col cols="10">
                            <v-btn color="green" class="text-white" :href="downloadUrl" block download>
                                下载
                            </v-btn>
                        </v-col>
                        <v-col cols="2">
                            <v-tooltip text="重做">
                                <template v-slot:activator="{ props }">
                                    <v-btn v-bind="props" icon @click="reset">
                                        <v-icon>mdi-undo-variant</v-icon>
                                    </v-btn>
                                </template>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>


<script setup>
import { ref, toRaw } from 'vue';
import axios from 'axios';

const file = ref(null);
const loading = ref(false);
const downloadUrl = ref('');

async function uploadFile() {
    if (!file.value) return;
    const formData = new FormData();
    formData.append('file', toRaw(file.value)[0]);
    try {
        loading.value = true;
        const response = await axios.post('/api/srt/do', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        downloadUrl.value = response.data.downloadUrl;
    } catch (error) {
        console.error('上传失败:', error);
        file.value = null;
        downloadUrl.value = '';
    } finally {
        loading.value = false;
    }
}

function reset() {
    file.value = null;
    downloadUrl.value = '';
}
</script>

<style></style>