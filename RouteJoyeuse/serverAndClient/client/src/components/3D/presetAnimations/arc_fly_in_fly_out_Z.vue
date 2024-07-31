<template>
    <v-card id="arc_fly_in_fly_out_Z" class="bg-pink-accent-2" width="120" height="120" title="弧形飞入飞出" variant="plain">
        <template #prepend>
            <v-icon size="15">mdi-swap-horizontal</v-icon>
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
#arc_fly_in_fly_out_Z {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>