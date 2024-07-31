<template>
    <div class="pdf-viewer" style="z-index: 1">
        <div ref="pdfCanvas" class="pdfcanvas"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { usePdfStore } from '../../../public/stores/pdfStore';
// 引入pdf.js和worker
import { getDocument } from 'pdfjs-dist/legacy/build/pdf';

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../../public/workers/pdf.worker.min.js';
import { useNotesStore } from '../../../public/stores/canvas';
import { getPdfPages } from '../../../methods/pdf/getPdfPages';

const pdfStore = usePdfStore();
const notesStore = useNotesStore();

const pdfCanvas = ref(null);

let renderArray = [];

onMounted(() => {
    watch(() => pdfStore.pdfData, () => {
        if (pdfStore.pdfData !== null) {
            pdfStore.pdfUrl = '';
            loadPdf();
        }
        else {
            pdfCanvas.value.innerHTML = '';
        }
    })
    watch(() => pdfStore.pdfUrl, () => {
        if (pdfStore.pdfUrl !== '') {
            pdfStore.pdfData = null;
            loadPdfByUrl();
        }
        else {
            pdfCanvas.value.innerHTML = '';
        }
    })
});

let pageCount = 0;
async function loadAndRenderPDF(pdfSource) {
    const loadingTask = pdfjsLib.getDocument(pdfSource);
    try {
        pageCount = await getPdfPages(pdfStore.file);
        pdfStore.numPages = pageCount;
        const pdfDoc = await loadingTask.promise;

        pdfCanvas.value.innerHTML = '';

        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
            await stokpage(pdfDoc, pageNum);
        }
        //仅展示第一层（1-10页）
        if (pageCount < 10) {
            renderArray.forEach(async element => {
                const page = element.page;
                const canvas = element.canvas;
                const canvasContext = element.canvasContext;
                const viewport = element.viewport;

                pdfCanvas.value.appendChild(canvas);
                await page.render({ canvasContext, viewport }).promise;
                ++pdfStore.progress;
            });
        }
        else {
            for (let i = 1; i <= 10; i++) {
                const page = renderArray[i - 1].page;
                const canvas = renderArray[i - 1].canvas;
                const canvasContext = renderArray[i - 1].canvasContext;
                const viewport = renderArray[i - 1].viewport;

                pdfCanvas.value.appendChild(canvas);
                await page.render({ canvasContext, viewport }).promise;
                ++pdfStore.progress;
            }
        }

        pdfStore.loading = false;
        pdfStore.progress = 0;
        pdfStore.show = true;
        notesStore.file = pdfStore.file
    } catch (error) {
        console.error('Error loading/rendering PDF:', error);
    }
}
watch(() => notesStore.pageIndex, async () => {
    if (notesStore.pageIndex >= 0) {
        console.log(notesStore.pageIndex)

        pdfStore.loading = true;
        const startIndex = notesStore.pageIndex * 10 + 1;
        const endIndex = (startIndex + 10 - 1 >= pageCount - 1) ? pageCount - 1 : startIndex + 10 - 1;


        //移除所有的子元素
        while (pdfCanvas.value.firstChild) {
            pdfCanvas.value.removeChild(pdfCanvas.value.firstChild);
        }

        for (let i = startIndex; i <= endIndex; i++) {
            const page = renderArray[i - 1].page;
            const canvas = renderArray[i - 1].canvas;
            const canvasContext = renderArray[i - 1].canvasContext;
            const viewport = renderArray[i - 1].viewport;

            pdfCanvas.value.appendChild(canvas);
            await page.render({ canvasContext, viewport }).promise;
            ++pdfStore.progress;
        }
        pdfStore.loading = false;
        pdfStore.progress = 0;
    }
})

async function stokpage(pdfDoc, pageNum) {
    // 获取页面
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.3 });
    // 创建一个canvas元素来渲染页面
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
        page: page,
        canvas: canvas,
        canvasContext: context,
        viewport: viewport,
    };

    //保存好
    renderArray.push(renderContext);
}

// 使用函数
function loadPdf() {
    loadAndRenderPDF({ data: pdfStore.pdfData });
}

function loadPdfByUrl() {
    loadAndRenderPDF(pdfStore.pdfUrl);
}
</script>

<style>
.pdf-viewer canvas {
    border: 1px solid black;
}

.pdfcanvas {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    gap: 10px;
}
</style>