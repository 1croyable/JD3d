<template>
    <v-card id="moveZ" class="bg-teal-accent-2" width="120" height="120" title="沿z轴" variant="plain">
        <template #prepend>
            <v-icon size="15">mdi-taxi</v-icon>
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
#moveZ {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>