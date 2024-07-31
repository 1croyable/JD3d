import { defineStore } from 'pinia';

export const useUIBStore = defineStore('UIB', {
    state: () => ({
        status: 0b00,
        file: {},
        folder: {},
        actionType: '',
    }),
    actions: {
        setStatus_null() {
            this.status = 0b00;
        },
        setStatus_file() {
            this.status = 0b10;
        },
        setStatus_folder() {
            this.status = 0b01;
        },
        setStatus_books() {
            this.status = 0b11;
        },
        choisirFile(file) {
            this.file = file;
        },
        choisirFolder(folder) {
            this.folder = folder;
        },
        setActionType(actionType) {
            this.actionType = actionType;
        },
        clearActionType() {
            this.actionType = '';
        }
    },
});

//无操作是00
//用户选中文件夹01，要包含操作：删除 重命名 查看属性
//用户选中文件10, 查看 复制 移动 删除 重命名 查看属性 下载
//用户置于books界面中11 创建文件夹 上传文件
