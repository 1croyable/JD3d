<template>
    <p class="text-h5">字体粗细: <span class="text-yellow-darken-3 text-h4">{{ notesStore.lineWidth }}</span> -></p>
    <v-slider class="mt-6" show-ticks="always" step="0.5" tick-size="4" :min="1" :max="5" v-model="notesStore.lineWidth"></v-slider>
</template>

<script setup>
import { useNotesStore } from '../../../public/stores/canvas.js'

const notesStore = useNotesStore()

</script>

<style lang="less" scoped></style>