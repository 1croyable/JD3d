import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserInfo = defineStore('UI', {
    state: () => ({
        src: '',
        previsualiser: '',
        username: '',
        phone: '',
        gender: '',
        description: ''
    }),
    actions: {
        uploadAvater(username, file) {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'UserName': username
                }
            }

            const formData = new FormData();
            formData.append('file', file);

            return new Promise((resolve, reject) => {
                axios.put('api/avatar', formData, config).then(res => {
                    resolve(res.data);
                }).catch(err => reject(err.response.data));
            })
        },
        getSrc(username) {
            axios.get(`api/srcAvatar?username=${username}`).then(res => {
                this.src = res.data.Url;
            }).catch(err => alert(err.response.data));
        },
        uploadAvaterPre(file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                this.previsualiser = e.target.result;
            };

            reader.readAsDataURL(file);
        },
        updateUserInfo(newName, phone, gender) {
            return new Promise((resolve, reject) => {
                axios.put('api/updateUserInfo', { username: this.username, newName, phone, gender }).then(res => {resolve(res.data);});
            })
        },
        getUserInfo() {
            return new Promise((resolve, reject) => {
                axios.get(`api/getUserInfo?username=${this.username}`).then(res => {
                    this.phone = res.data.phone_number;
                    this.gender = res.data.gender;
                    this.description = res.data.description;
                    resolve(res.data)
                });
            });
        },
        updateDescription() {
            return new Promise((resolve, reject) => {
                axios.put('api/updateDescription', { username: this.username, description: this.description }).then(res => {resolve(res.data);});
            });
        }
    },
});