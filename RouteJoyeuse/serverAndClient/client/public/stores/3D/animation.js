import { defineStore } from 'pinia';
import * as THREE from 'three';
import * as SO from '../../../src/class/SO.js'
import { useScene } from './scene.js'
import { AnimationClip, AnimationTrack, Keyframe } from '../../../src/class/Animation.js'
import { Timeline } from '../../../src/class/Timeline.js';


const sceneStore = useScene();

export const useAnimation = defineStore('animation', {
    state: () => ({
        mixer: null,
        actions: [],
        longestTrackTime: 0,
        count: 0,
        // 时间线相关的状态
        timeline: new Timeline(),
        isWithinTimeline: false,
        ifshowCurrentTime: true,
        ifShowToTime: false,
        mouseX: 0,
        mouseY: 0,
        currentTime: 0,
        toTime: 0,
        timeLineMainLeft: 0,
        timeLineMainTop: 0,
        timeLineMainWidth: 0,
        timeLineMainHeight: 0,
        playingStatus: 'stop',
        // canvas录制
        canvasRecorder: null,
        recordedBlobs: [],
        url: null,
        colorBlockIdcount: 0,   // 计数器，用于生成唯一的动画色块的ID
        updateTrigger: 0, ///更新缩略图
        videoDuration: 0,  ///视频总时长
    }),
    actions: {
        createAnimationTrack(propertyName) {
            const newTrack = new AnimationTrack(propertyName);
            return newTrack;
        },
        playAnimation_temp(object, animationTracks, trackWeights) {
            const scene = sceneStore.scenes[sceneStore.choisiScene];
            // 暂时移除轨迹线
            const drawLine = sceneStore.drawLine;
            if (drawLine) {
                scene.remove(drawLine);
            }

            // 找到最长时间的轨道
            this.longestTrackTime = 0;
            animationTracks.forEach(track => {
                this.longestTrackTime = Math.max(this.longestTrackTime, track.getTrackDuration());
            });

            this.mixer = new THREE.AnimationMixer(object.object3D);
            this.mixer.time = 0;

            animationTracks.forEach((track, index) => {
                const threeTrack = track.toThreeTrack();
                // 为clip设置正确的时长
                const clip = new THREE.AnimationClip(track.propertyName, this.longestTrackTime / 1000, [threeTrack]);
                const action = this.mixer.clipAction(clip);
                action.setLoop(1);
                // 设置权重
                const weight = trackWeights.map((trackWeight) => trackWeight / 100)[index] || 1;
                action.setEffectiveWeight(weight);
                this.actions.push(action);
            });

            // 播放所有动画
            this.actions.forEach(action => action.play());
        },
        saveURL() {
            if (this.recordedBlobs.length === 0) {
                return;
            } else {
                const blob = new Blob(this.recordedBlobs, { type: 'video/webm' });
                this.url = URL.createObjectURL(blob);
            }
        },
        // 导出成特定格式的文件
        downloadVideo(form = 'mp4') {
            console.log(form)
            const a = document.createElement('a');
            a.style = 'display: none';
            a.href = this.url;
            a.download = 'vidéo.' + form;

            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                window.URL.revokeObjectURL(this.url);
            }, 100);
        }
    }
});
