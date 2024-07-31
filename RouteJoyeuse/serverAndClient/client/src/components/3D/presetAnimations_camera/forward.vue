
<template>
    <v-card id="forward" class="bg-teal-accent-2" width="120" height="120" title="向前运动" variant="plain">
        <v-card-text>向前运动</v-card-text>
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
#forward {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>
