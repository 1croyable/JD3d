
<template>
    <v-card id="fadeIn" class="bg-purple-accent-3" width="120" height="120" title="淡入" variant="plain">
        <template #prepend>
            <v-icon size="15">mdi-alpha-f-box</v-icon>
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
#fadeIn {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>
