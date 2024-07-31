class Layer {
    constructor(id, pageNum = 1) {
        if (id === 1)
            this.isActive = true;
        this.id = id;
        this.pages = [];
        for (let index = 1; index <= pageNum; index++) {
            this.pages.push([]);
        }
    }

    //添加绘图（一笔）
    layerAddDraw(drawing, pageIndex) {
        this.pages[pageIndex].push(drawing);
    }

    isActive = false;
}

class Drawing {
    constructor() {
        this.drawingArray = [];
    }

    addDraw(x1, y1, x2, y2, color, width) {
        this.drawingArray.push({ x1, y1, x2, y2, color, width });
    }

    drawingArray = [];
}

class Note {
    constructor(title = 'Nouvelle Note', pageNum = 1) {
        this.id = Date.now();
        this.title = title;
        this.creationDate = new Date();
        this.layers.push(new Layer(1, pageNum));
        ++this.layerCounts;
    }

    static fromJson(json) {
        const obj = JSON.parse(json);
        const note = new Note(obj.title);
        note.id = obj.id;
        note.creationDate = new Date(obj.creationDate);
        note.layers = obj.layers.map(layerObj => {
            const layer = new Layer(layerObj.id);

            const pages = layerObj.pages.map(page => {
                const drawings = page.map(drawingObj => {
                    const drawing = new Drawing();
                    drawingObj.drawingArray.forEach(draw => {
                        drawing.addDraw(draw.x1, draw.y1, draw.x2, draw.y2, draw.color, draw.width);
                    })
                    return drawing;
                });
                return drawings;
            });

            layer.id = layerObj.id;
            layer.isActive = layerObj.isActive;
            layer.pages = pages;

            return layer;
        });

        note.layerCounts = obj.layers.length;
        return note;
    }

    layers = [];
    layerCounts = 0;

    newLayer(pageNum) {
        const newLayerId = this.layers.length + 1;
        const newLayer = new Layer(newLayerId, pageNum);
        this.layers.push(newLayer);
        return newLayer;
    }

    deleteLayer(layerId) {
        this.layers = this.layers.filter(layer => layer.id !== layerId);
    }
}
Note.prototype.toJson = function () {
    return JSON.stringify(this, null, 2); // 格式化输出JSON字符串
};

export default { Note, Drawing, Layer };