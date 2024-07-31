<template>
    <v-avatar left size="100%" rounded="0">
        <v-img v-show="props.previsualiser" :src="UserInfo.previsualiser" ></v-img>
    </v-avatar>
</template>

<script setup>
import { useUserInfo } from '../../../public/stores/userInfo';

const UserInfo = useUserInfo();
const props = defineProps({
    previsualiser: Boolean
})
</script>

<style lang="less" scoped></style>