<template>
    <v-card>
        <v-overlay activator="#overLay_settings_button" contained persistent>
            <settings></settings>
        </v-overlay>
        <v-card-item>
            <v-card-title class="text-h5 mb-2">个人资料</v-card-title>
            <v-container>
                <v-row :dense="true">
                    <v-col cols="2">
                        <v-tooltip location="top center" no-click-animation>
                            <template v-slot:activator="{ props }">
                                <v-avatar @click="dialog = true" v-bind="props" class="ma-2" size="x-large" color="surface-variant">
                                    <v-img :src="UserInfo.src"></v-img>
                                </v-avatar>
                            </template>

                            <div>点击更换头像</div>
                        </v-tooltip>

                        <v-dialog v-model="dialog" persistent max-width="300px">
                            <v-card>
                                <v-list bg-color="black">
                                    <v-list-item>
                                        <v-btn class="text-yellow bg-blue-grey-darken-4" width="80%" text
                                            @click="upload">点击上传头像文件</v-btn>
                                        <v-btn class="ml-1" icon variant="text"
                                            @click="dialog = false; ifprevisualiser = false;">
                                            <v-icon>mdi-close-circle</v-icon>
                                        </v-btn>
                                        <v-divider class="my-1" color="lime-lighten-5" length="70%"
                                            thickness="2px"></v-divider>
                                        <v-icon color="lime-lighten-3" icon="mdi-check"></v-icon>
                                        支持jpg, png格式
                                    </v-list-item>
                                </v-list>
                                <v-list>
                                    <v-list-item>
                                        <h2>预览</h2>
                                        <previsualiser :previsualiser="ifprevisualiser"></previsualiser>
                                    </v-list-item>
                                </v-list>
                                <v-btn block color="primary" @click="uploadDaccord" :disabled="file === null">上传</v-btn>
                            </v-card>
                        </v-dialog>
                    </v-col>
                    <v-col cols="5">
                        <v-row :dense="true">
                            <v-chip class="text-h5 mt-4 ml-5">nom d'utilisateur</v-chip>
                        </v-row>
                        <v-row>
                            <v-chip class="text-h5 mt-6 px-6 bg-deep-purple-darken-1">Nombre de
                                likes</v-chip>
                        </v-row>
                        <v-icon size="32px" color="red">mdi-heart</v-icon>
                        <span style="display: inline-block;" class="ml-1 pt-2 text-h3 text-red">0</span>
                    </v-col>
                    <v-col cols="5">
                        <v-row>
                            <v-text-field :readonly="true" variant="underlined" class="mt-5">
                                <template v-slot="append">
                                    <v-icon size="20px">mdi-tag</v-icon>
                                    <span class="ml-6">{{ UserInfo.username }}</span>
                                </template>
                            </v-text-field>
                        </v-row>
                        <v-row> <v-chip class="text-h5 mt-4 bg-red ml-3">Nombre de
                                favoris</v-chip></v-row>
                        <div class="ml-10">
                            <v-icon color="yellow" size="32px">mdi-star</v-icon>
                            <span style="display: inline-block;" class="ml-1 pt-2 text-h3 text-lime-lighten-1">0</span>
                        </div>
                    </v-col>
                </v-row>
                <v-row :dense="true">
                    <v-col cols="11">
                        <v-card flat>
                            <v-card-title>Description personnelle</v-card-title>
                            <v-card-text>
                                <v-textarea v-model="UserInfo.description" auto-grow outlined
                                    :label="ifEdit ? 'Ajoutez votre description ici' : ''" :readonly="!ifEdit"
                                    density="compact" :max-rows="maxRows" :rows="maxRows" style="overflow: auto;"
                                    :counter="true"></v-textarea>
                                <v-btn v-show="!ifEdit" text @click="toggleExpand">
                                    {{ isExpanded ? 'Voir moins' : 'Voir plus' }}
                                    <v-icon class="ml-5 pa-0" size="18px">mdi-more</v-icon>
                                </v-btn>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="1">
                        <v-tooltip location="top center" origin="end top" no-click-animation>

                            <template v-slot:activator="{ props }">
                                <v-icon v-bind="props" v-if="ifEdit === false" class="mt-8" size="30px"
                                    @click="ifEdit_f">mdi-pen</v-icon>
                                <v-icon v-bind="props" v-else size="30px" @click="ifEdit_f" class="mt-8">mdi-check-circle</v-icon>
                            </template>

                            <div v-if="ifEdit === false">Cliquez pour modifier la description
                                personnelle.</div>
                            <div v-else>Confirmer.</div>
                        </v-tooltip>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-item>
    </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import settings from './settings.vue';
import { useUserInfo } from '../../../public/stores/userInfo';
import getUserName from '../../../methods/getUserName';

import previsualiser from './previsualiser.vue'

const UserInfo = useUserInfo();

onMounted(async () => {
    try {
        const res = await getUserName()
        UserInfo.username = res;

        if (UserInfo.username) {
            UserInfo.getSrc(UserInfo.username)
            UserInfo.getUserInfo();
        }
    } catch (err) { alert(err) }
})

// 个人简介相关
const isExpanded = ref(false);
const ifEdit = ref(false);
const maxRows = computed(() => {
    return ifEdit.value ? 12 :
        (isExpanded.value ? 12 : 3)
})

function toggleExpand() {
    isExpanded.value = !isExpanded.value;
}
function ifEdit_f() {
    ifEdit.value = !ifEdit.value;
}

watch(ifEdit,async (newValue) => {
    if(newValue === false) {
        await UserInfo.updateDescription();
        UserInfo.getUserInfo();
    }
})

// 头像
const dialog = ref(false);

// 是否开启预览
const ifprevisualiser = ref(false);

let input = null;
const file = ref(null);
function upload() {
    input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg, image/png';

    input.onchange = async (e) => {
        file.value = e.target.files[0];
        if (!file.value) {
            return;
        }
        UserInfo.uploadAvaterPre(file.value);
        ifprevisualiser.value = true;
    };

    input.click();
}

async function uploadDaccord() {
    if (input !== null) {
        await UserInfo.uploadAvater(UserInfo.username, file.value);

        dialog.value = false;
        ifprevisualiser.value = false;
        input = null;
        file.value = null;
        UserInfo.getSrc(UserInfo.username)
    }
}
</script>

<style lang="less" scoped></style>