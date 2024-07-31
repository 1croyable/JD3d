import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import axios from 'axios';

async function getPdfPages(file) {
    const buffer = await axios.get(`/api/note/pdfBuffer?key=${file.cosKey}`)
    console.log(buffer)
    return new Promise((resolve, reject) => {
        const loadingTask = pdfjsLib.getDocument({ data: buffer.data });

        loadingTask.promise.then(pdf => {
            const totalPages = pdf.numPages;
            resolve(totalPages);
        }).catch(reason => {
            reject(reason);
        });
    });
}

export { getPdfPages };
