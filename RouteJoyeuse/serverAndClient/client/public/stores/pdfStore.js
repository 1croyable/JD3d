import { defineStore } from 'pinia';
import axios from 'axios';
import getUserName from '../../methods/getUserName';

export const usePdfStore = defineStore('pdfStore', {
    state: () => ({
        pdfUrl: '',
        pdfData: null,
        show: false,
        file: null,
        loading: false,
        numPages: 0,
        progress: 0
    }),
    actions: {
        uploadPdf(file, config, ifR = false) {
            return new Promise(async (resolve, reject) => {
                const formData = new FormData();
                formData.append('file', file);

                if (ifR === false) {
                    axios.post('/api/note/getPdfBlob', formData, config).then((response) => {
                        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                        this.pdfData = response.data;
                        if (this.pdfUrl !== '')
                            this.pdfUrl = '';
                        resolve(pdfBlob);
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    axios.post('/api/note/savePdf', formData, config).then((response) => {
                        this.pdfUrl = response.data.url.Url;
                        if (this.pdfData !== null) {
                            this.pdfData = null;
                        }
                        resolve(response.data.key);
                    }).catch((error) => {
                        reject(error);
                    })
                }
            });
        }
    }
});
