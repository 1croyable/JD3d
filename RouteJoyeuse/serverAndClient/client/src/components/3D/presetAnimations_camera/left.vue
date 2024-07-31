
<template>
    <v-card id="left" class="bg-teal-accent-3" width="120" height="120" title="向左运动" variant="plain">
        <v-card-text>向左运动</v-card-text>
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
#left {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>
