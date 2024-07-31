<template>
    <v-card id="routate2pi" class="bg-lime-darken-1" width="120" height="120" title="旋转一圈" variant="plain">
        <template #prepend>
            <v-icon size="15">mdi-autorenew</v-icon>
        </template>
        <template #append>
            <input v-model="props.proprietes.time" type="number" />
        </template>
    </v-card>
</template>

<script setup>
const props = defineProps({
    proprietes: Object,
})

</script>

<style lang="less" scoped>
#routate2pi {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>