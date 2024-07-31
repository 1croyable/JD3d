<template>
    <div id="container">
        <v-avatar :style="'color: ' + notesStore.color + ';'">
            <v-icon size="36px" @click="showPicker">mdi-palette</v-icon>
        </v-avatar>
        <input class="hidden-input" id="input" type="color" v-model="notesStore.color">
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useNotesStore } from '../../../public/stores/canvas.js'

const notesStore = useNotesStore()

function showPicker() {
    document.getElementById('input').click();
}

</script>

<style lang="less" scoped>
.hidden-input {
    visibility: hidden;
    position: absolute;
    top: 50px;
    width: 0;
    height: 0;
}
</style>