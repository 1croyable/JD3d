<template>
    <v-card id="elliptical_fly_out" class="bg-green-accent-2" width="120" height="120" title="椭圆形飞出" variant="plain">
        <template #prepend>
            <v-icon size="15">mdi-arrow-left-bold</v-icon>
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
#elliptical_fly_out {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>
