<template>
    <v-card variant="elevated" width="30vw">
        <v-card-title class="text-h5">个人设置</v-card-title>
        <v-container>
            <v-row>
                <v-col cols="12">
                    <!-- 昵称设置 -->
                    <v-row dense>
                        <v-col cols="3">
                            <v-chip color="blue">
                                <v-icon size="20px" start>mdi-account-circle-outline</v-icon>
                                <span style="font-size: 16px;">修改昵称</span>
                            </v-chip>
                        </v-col>
                        <v-col cols="8" offset="1">
                            <v-text-field :label="UserInfo.username" placeholder="输入新昵称" dense variant="underlined" v-model="newName"></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- 手机号码设置 -->
                    <v-row dense>
                        <v-col cols="4">
                            <v-chip color="cyan-darken-2">
                                <v-icon size="20px" start>mdi-cellphone-sound</v-icon>
                                <span style="font-size: 16px;">修改手机号</span>
                            </v-chip>
                        </v-col>
                        <v-col cols="7" offset="1">
                            <v-text-field :label="phone ? phone : '请填写手机号码'" variant="underlined" dense v-model="phone"></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- 性别设置 -->
                    <v-row dense>
                        <v-col cols="4">
                            <v-chip color="cyan-darken-2">
                                <v-icon size="20px" start>mdi-gender-male-female</v-icon>
                                <span style="font-size: 16px;">性别</span>
                            </v-chip>
                        </v-col>
                        <v-col cols="7" offset="1">
                            <v-radio-group v-model="gender" inline>
                                <v-radio label="男" value="male"></v-radio>
                                <v-radio label="女" value="female"></v-radio>
                                <v-radio label="保密" value="secret"></v-radio>
                            </v-radio-group>
                        </v-col>
                    </v-row>

                    <v-row>
                        <!-- 保存更改按钮 -->
                        <v-btn block color="success" class="mt-5 text-h5" @click="updateUserInfo()">保存更改</v-btn>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useUserInfo } from '../../../public/stores/userInfo';

const UserInfo = useUserInfo();

//修改用户名、手机号、性别
const phone = ref('');
const newName = ref('');
const gender = ref('');

onMounted(async () => {
    const result = await UserInfo.getUserInfo();
    gender.value = result.gender;
    phone.value = result.phone_number;
})

//提交
async function updateUserInfo(){
    await UserInfo.updateUserInfo(newName.value,phone.value,gender.value);
    //更新用户信息
    UserInfo.getUserInfo();
    
    document.getElementById('overLay_settings_button').click();
}

</script>

<style lang="less" scoped></style>