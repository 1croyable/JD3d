import { defineStore } from 'pinia';
import getUserName from '../../methods/getUserName';
import getFolders from '../../methods/getFolders';
import getfiles from '../../methods/getfiles';

export const useFFStore = defineStore('FF', {
    state: () => ({
        folders: [],
        relations: [],
        currentFolder: -1
    }),
    actions: {
        setStatus() {
            return new Promise((resolve, reject) => {
                getUserName().then(async (res) => {
                    let userName = res;
                    this.folders = await getFolders(userName);
                    getfiles(userName, this.folders, (data) => {
                        this.relations = data;
                        resolve('ok');
                    });
                }).catch((err) => {
                    reject(err);
                });
            })
        },
        clearStates(){
            this.folders = [];
            this.relations = [];
        }
    },
    getters: {
        getFolders: (state) => state.folders,
        getRelations: (state) => state.relations,
        getCurrentFolder: (state) => state.currentFolder
    }
});