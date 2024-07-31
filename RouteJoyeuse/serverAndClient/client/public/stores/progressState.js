import { defineStore } from 'pinia';

export const useProgress = defineStore('P', {
    state: () => ({
        progress: 0,
        ifshowProgress: false,
        ifshowCheckmark: false
    }),
    actions: {
        setProgress(progress){
            this.progress = progress;
        },
        showProgress(){
            this.ifshowProgress = true;
        },
        hideProgress(){
            this.ifshowProgress = false;
        },
        showCheckmark(){
            this.ifshowCheckmark = true;
        },
        hideCheckmark(){
            this.ifshowCheckmark = false;
        },
        showCheckmarkTemporarily(duration = 2000) {
            this.ifshowCheckmark = true;
            setTimeout(() => {
                this.ifshowCheckmark = false;
                this.hideProgress();
                this.setProgress(0);
            }, duration);
        }
    }
});