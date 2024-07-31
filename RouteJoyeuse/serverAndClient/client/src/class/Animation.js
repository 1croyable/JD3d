import * as THREE from 'three';

class Keyframe {
    constructor(time, values) {
        this.time = time;
        this.values = values;
    }
}

class AnimationTrack {
    constructor(propertyName) {
        this.propertyName = propertyName;
        this.keyframes = [];
        this.createTime = Date.now();
    }

    // 添加关键帧
    addKeyframe(keyframe) {
        this.keyframes.push(keyframe);
        this.keyframes.sort((a, b) => a.time - b.time);
    }

    // 根据keyframes创建点的集合
    createPoints() {
        if (this.keyframes.length === 0) return;
        if (this.propertyName !== 'position') return;

        let points = [];
        for (let i = 0; i < this.keyframes.length; i++) {
            points.push(new THREE.Vector3(this.keyframes[i].values[0], this.keyframes[i].values[1], this.keyframes[i].values[2]));
        }
        return points;
    }

    // 转换为three.js的track
    toThreeTrack(baseObject) {
        const times = this.keyframes.map(keyframe => keyframe.time / 1000);
        let values = [];
        let baseValues;

        // 根据属性名获取基准值
        switch (this.propertyName) {
            case 'position':
                baseValues = baseObject.position.toArray();
                break;
            // 可以在这里添加更多的属性处理，比如rotation, scale等
            default:
                throw new Error('不支持的属性');
        }

        // 调整每个关键帧的值
        this.keyframes.forEach(keyframe => {
            const adjustedValues = keyframe.values.map((value, index) => value + baseValues[index]);
            values = values.concat(adjustedValues);
        });

        return new THREE.VectorKeyframeTrack(`${baseObject.name}.${this.propertyName}`, times, values);
    }

    // 拿到轨道的持续时间
    getTrackDuration() {
        if (this.keyframes.length === 0) {
            return 0; // 如果没有关键帧，持续时间为0
        }
        // 返回最后一个关键帧的时间作为轨道的持续时间
        return this.keyframes[this.keyframes.length - 1].time;
    }

    // 新增方法：将关键帧的值转换为相对于第一个关键帧的值
    convertToRelativeKeyframes() {
        if (this.keyframes.length > 0) {
            const baseValues = this.keyframes[0].values;
            this.keyframes.forEach((keyframe, index) => {
                if (index > 0) {
                    keyframe.values = keyframe.values.map((value, idx) => value - baseValues[idx]);
                } else {
                    keyframe.values = keyframe.values.map(() => 0);
                }
            });
        }
    }
}

class AnimationClip {
    constructor(name) {
        this.name = name;
        this.tracks = [];
        this.trackWeights = [];
        this.duration = 0;
    }

    addTrack(track, trackWeight) {
        track.convertToRelativeKeyframes();
        this.tracks.push(track);
        this.trackWeights.push(trackWeight);
        this.updateDuration();
    }

    updateDuration() {
        // 遍历所有轨道，找出最晚的结束时间作为动画的总持续时间
        this.duration = this.tracks.reduce((maxDuration, track) => {
            if (track.keyframes.length === 0) {
                return maxDuration;
            }
            const lastKeyframeTime = track.keyframes[track.keyframes.length - 1].time;
            return Math.max(maxDuration, lastKeyframeTime);
        }, 0);
    }

    // 新增方法：获取最长的动画轨道时间
    getLongestTrackDuration() {
        return this.duration;
    }

    toThreeAnimationClip(object3D, positionTime) {
        const threeTracks = this.tracks.map(track => track.toThreeTrack(object3D));
        return new THREE.AnimationClip(this.name, this.duration / 1000, threeTracks);
    }
}

export {
    AnimationClip, AnimationTrack, Keyframe
}