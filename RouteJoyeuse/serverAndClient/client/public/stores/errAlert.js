import { defineStore } from 'pinia';

export const useErrAlert = defineStore('errorAlert', {
    state: () => ({
        msg: '',
        show: false,
    }),
    actions: {
        showErr(msg, durant = 3000) {
            this.msg = msg;
            this.show = true;
            setTimeout(() => {
                this.show = false;
            }, durant);
        }
    },
});
