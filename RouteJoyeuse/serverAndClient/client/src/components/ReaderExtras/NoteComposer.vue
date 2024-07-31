<template>
    <v-container>
        <template v-for="(note, index) in notes" key="index">
            <v-row>
                <v-col cols="1">
                    <v-radio :lable="'选择第' + (index + 1) + '个笔记'" :value="index"></v-radio>
                </v-col>
                <v-col cols="5">
                    <v-avatar size="x-large" class="elevation-16">
                        <v-img src=""></v-img>
                    </v-avatar>
                </v-col>
                <v-col cols="6">
                    <v-chip append-icon="mdi-star" class="ma-2" color="orange">
                        详细信息
                    </v-chip>
                    <v-divider color="amber-darken-2"></v-divider>
                    <p>@ {{ note.id }}</p>
                    <p>笔记标题：{{ note.title }}</p>
                    <p>创建时间：{{ note.creationDate }}</p>
                    <p>图层数：{{ note.layers.length }}</p>
                </v-col>
            </v-row>
        </template>
    </v-container>
</template>

<script setup>
import { useNotesStore } from '../../../public/stores/canvas';

const notesStore = useNotesStore();

const notes = notesStore.notes;
</script>

<style lang="less" scoped></style>