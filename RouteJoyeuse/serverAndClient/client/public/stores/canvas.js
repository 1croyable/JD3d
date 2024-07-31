import { defineStore } from 'pinia';
import note from '../../src/class/Note';
import axios from 'axios';
import { useUserInfo } from './userInfo';
import { usePdfStore } from './pdfStore';

const pdfStore = usePdfStore();

const UserInfo = useUserInfo();

const Note = note.Note;
const Layer = note.Layer;

export const useNotesStore = defineStore('notes', {
    state: () => ({
        notes: [], //核心状态
        undo: [],
        redo: [],
        selectedNoteIndex: -1,
        file: null,
        // 文件的宽高
        fileWidth: 0,
        fileHeight: 0,
        // 可视图层和可编辑图层
        activeLayers: [],
        canEditIndex: -1,
        //更新canvas的标识
        render: 0,
        //颜色选择和粗细
        color: '#000000',
        lineWidth: 1,
        // 页码和页数
        pageIndex: 0,
    }),
    actions: {
        createNote(newNoteName = 'Nouvelle Note', pageNum = 1) {
            this.notes.push(new Note(newNoteName, pageNum));
            this.selectedNoteIndex = this.notes.length - 1;
            return this.selectedNoteIndex;
        },
        chooseNote(index) {
            this.selectedNoteIndex = index;
        },
        //保存笔记
        saveNote() {
            return new Promise(async (resolve, reject) => {
                try {
                    const notesJsonString = JSON.stringify(this.notes.map(note => note.toJson()));

                    await axios.put('/api/note/save', {
                        notes: notesJsonString,
                        fileId: this.file.fileId
                    })

                    resolve(notesJsonString);
                } catch (error) {
                    reject(error);
                }
            });
        },
        getNotes() {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.get(`/api/note/get?fileId=${this.file.fileId}`);
                    const notesJsonArray = response.data;

                    if (notesJsonArray.length !== 0) {
                        this.notes = [...notesJsonArray.map(noteJson => Note.fromJson(noteJson))];
                    }
                    else {
                        this.notes = [];
                        this.undo = [];
                    }
                    resolve(this.notes);
                } catch (error) {
                    reject(error);
                }
            });
        },
        deleteNote(index) {
            this.notes = this.notes.filter((note, noteIndex) => noteIndex !== index);

            return new Promise(async (resolve, reject) => {
                try {
                    await this.saveNote();
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            })
        },
        addLayerToSelectedNote() {
            if (this.selectedNoteIndex < 0 || this.selectedNoteIndex >= this.notes.length) {
                return;
            }
            const note = this.notes[this.selectedNoteIndex];
            note.newLayer(pdfStore.numPages);
            this.setEditableLayerByActive();
            return;
        },
        deleteLayerFromSelectedNote(layerId) {
            if (this.selectedNoteIndex < 0 || this.selectedNoteIndex >= this.notes.length) {
                return;
            }
            const note = this.notes[this.selectedNoteIndex];
            note.deleteLayer(layerId);
            this.saveState();
            this.setEditableLayerByActive();
            return;
        },
        setEditableLayer(index) {
            this.canEditIndex = index;
        },
        //更改可编辑图层为第一个isActive是true的图层
        setEditableLayerByActive() {
            if (this.selectedNoteIndex < 0 || this.selectedNoteIndex >= this.notes.length)
                return;

            let flag = 0

            for (const layer of this.notes[this.selectedNoteIndex].layers) {
                if (layer.isActive && !flag) {
                    this.setEditableLayer(layer.id - 1);
                    this.saveState();
                    flag = 1;
                }
            }

            if (!flag) {
                this.setEditableLayer(0);
                this.notes[this.selectedNoteIndex].layers[0].isActive = true;
                this.activeLayers.push(1);
                this.saveState();
            }
        },
        //保存当前状态到undo
        saveState() {
            if (this.selectedNoteIndex < 0 || this.selectedNoteIndex >= this.notes.length) {
                return;
            }
            let state = {
                activeLayers: this.activeLayers,
                canEditIndex: this.canEditIndex,
                notes: [...this.copyNotes(this.notes)]
            }
            this.undo.push(state);
            this.redo = [];
        },
        // 返回上一个状态
        undo_f() {
            if (this.undo.length === 1) {
                return;
            }
            const lastUndo = this.undo.pop();
            this.notes = [...this.copyNotes(this.undo[this.undo.length - 1].notes)];
            this.activeLayers = this.undo[this.undo.length - 1].activeLayers;
            this.canEditIndex = this.undo[this.undo.length - 1].canEditIndex;
            let state = {
                activeLayers: lastUndo.activeLayers,
                canEditIndex: lastUndo.canEditIndex,
                notes: [...this.copyNotes(lastUndo.notes)]
            }
            this.redo.push(state);
            ++this.render;
        },
        // 重做
        redo_f() {
            if (this.redo.length === 0) {
                return;
            }
            const lastRedo = this.redo.pop();
            this.notes = [...this.copyNotes(lastRedo.notes)];
            this.activeLayers = lastRedo.activeLayers;
            this.canEditIndex = lastRedo.canEditIndex;
            let state = {
                activeLayers: lastRedo.activeLayers,
                canEditIndex: lastRedo.canEditIndex,
                notes: [...this.copyNotes(lastRedo.notes)]
            }
            this.undo.push(state);
            ++this.render;
        },
        copyNotes(notes) {
            let noteJsonArray = [];
            for (const note of notes) {
                noteJsonArray.push(note.toJson())
            }
            return noteJsonArray.map(noteJson => Note.fromJson(noteJsonArray));
        },
        // 翻页
        lastPage() {
            if(this.pageIndex !== 0)
            {
                --this.pageIndex;
            }
        },
        // 下一页
        nextPage() {
            if(this.pageIndex !== this.notes[this.selectedNoteIndex].layers.filter((layer, index) => (layer.id - 1) === this.canEditIndex)[0].pages.length - 1)
            {
                ++this.pageIndex;
            }
        }
    },
});
