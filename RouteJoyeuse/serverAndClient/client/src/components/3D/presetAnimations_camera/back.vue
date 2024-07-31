<template>
    <v-card id="back" class="bg-teal-accent-1" width="120" height="120" title="向后运动" variant="plain">
        <v-card-text>向后运动</v-card-text>
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
#back {
    width: 30px;
    height: 10px;
}

input {
    width: 30px;
    font-size: 13px;
    line-height: 13px;
}
</style>