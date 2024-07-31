
<template>
    <v-card id="fadeOut" class="bg-purple-accent-4" width="120" height="120" title="淡出" variant="plain">
        <template #prepend>
            <v-icon size="15">mdi-alpha-f-box-outline</v-icon>
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
#fadeOut {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>
