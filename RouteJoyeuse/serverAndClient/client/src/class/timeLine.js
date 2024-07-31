import * as THREE from 'three';
import { toRaw } from 'vue';

class Timeline {
    constructor() {
        this.camera = null;
        this.timelineObjects = [];
        this.clock = new THREE.Clock(false); // THREE.js的时钟，初始不启动
        this.loading = false;
        this.customUpdates = []; // 用于存储自定义更新函数（属性变化）
        this.customUpdatesClearFns = []; // 用于存储自定义更新函数的清除函数
        this.uploadCustomUpdates = [];
    }

    // 对每个对象（包括相机）的每个轨道处理所有动画（色块位置）
    adjustAnimations() {
        // 处理物体动画
        this.timelineObjects.forEach(obj => {
            obj.tracks.forEach(track => {
                // 确保动画根据时间排序
                track.animations.sort((a, b) => a.positionTime - b.positionTime);

                // 调整动画时间以防止重叠
                for (let i = 0; i < track.animations.length - 1; i++) {
                    const current = track.animations[i];
                    const next = track.animations[i + 1];

                    // 如果当前动画的结束时间大于下一个动画的开始时间
                    if (current.positionTime + current.props.time > next.positionTime) {
                        // 将下一个动画移动到当前动画之后
                        next.positionTime = current.positionTime + current.props.time;
                    }
                }
            });
        });

        // 处理相机动画
        if (this.camera) {
            this.camera.tracks.forEach(track => {
                // 确保动画根据时间排序
                track.animations.sort((a, b) => a.positionTime - b.positionTime);

                // 调整动画时间以防止重叠
                for (let i = 0; i < track.animations.length - 1; i++) {
                    const current = track.animations[i];
                    const next = track.animations[i + 1];

                    // 如果当前动画的结束时间大于下一个动画的开始时间
                    if (current.positionTime + current.props.time > next.positionTime) {
                        // 将下一个动画移动到当前动画之后
                        next.positionTime = current.positionTime + current.props.time;
                    }
                }
            });
        }

        this.checkAndAdjustForOverflow();
    }
    // 动画色块位置调整---辅助函数
    checkAndAdjustForOverflow() {
        // 处理物体动画
        this.timelineObjects.forEach(obj => {
            obj.tracks.forEach(track => {
                // 使用倒序循环来安全删除数组中的元素
                for (let i = track.animations.length - 1; i >= 0; i--) {
                    let animation = track.animations[i];
                    let endTime = animation.positionTime + animation.props.time;
                    if (endTime > 60) {
                        if (animation.animationType === 1) {
                            animation.props.time = 60 - animation.positionTime;  // 调整持续时间，使结束时间为60秒
                            if (animation.props.time <= 0) {
                                track.animations.splice(i, 1); // 如果持续时间为0，则删除这个动画
                            }
                        } else {
                            track.animations.splice(i, 1);
                        }
                    }
                }
            });
        });

        // 处理相机动画
        if (this.camera) {
            this.camera.tracks.forEach(track => {
                // 使用倒序循环来安全删除数组中的元素
                for (let i = track.animations.length - 1; i >= 0; i--) {
                    let animation = track.animations[i];
                    let endTime = animation.positionTime + animation.props.time;
                    if (endTime > 60) {
                        if (animation.animationType === 1) {
                            animation.props.time = 60 - animation.positionTime;  // 调整持续时间，使结束时间为60秒
                            if (animation.props.time <= 0) {
                                track.animations.splice(i, 1); // 如果持续时间为0，则删除这个动画
                            }
                        } else {
                            track.animations.splice(i, 1);
                        }
                    }
                }
            });
        }
    }

    // 添加物体
    addObject(id, object3D, originalObject) {
        const newObj = {
            id,
            originalObject: toRaw(originalObject),
            object3D: toRaw(object3D),
            tracks: [],
            mixer: new THREE.AnimationMixer(toRaw(object3D)) // 为每个对象创建一个动画混合器
        };
        this.timelineObjects.push(newObj);
        return newObj;
    }

    // 创建动画剪辑
    addTrack(objectId) {
        const object = this.timelineObjects.find(obj => obj.id === objectId);
        if (object) {
            const newTrack = {
                trackId: `track${object.tracks.length + 1}`,
                animations: [],
            };
            object.tracks.push(newTrack);
            return newTrack;
        }
        return null;
    }

    // 转换动画成threejs适合的类型
    convertAnimations() {
        this.loading = true;

        // 转换物体动画
        toRaw(this.timelineObjects).forEach(obj => {
            if (!obj.mixer) {
                obj.mixer = new THREE.AnimationMixer(toRaw(obj.object3D));
            }
            obj.tracks.forEach(track => {
                track.animations.forEach(animation => {
                    console.log(animation)
                    let startTime = animation.positionTime;

                    if (animation.animationType === 1) {
                        const action = obj.mixer.clipAction(this.createAnimationClip(toRaw(animation), obj.object3D));
                        action.startAt(startTime);
                        action.setEffectiveTimeScale(1);
                        action.setLoop(THREE.LoopOnce);
                        action.clampWhenFinished = true;
                        obj.originalObject.trackAnimations.push(action);
                    } else if (animation.animationType === 3) {
                        // 对于类型3的动画，直接使用已有的action
                        const action = obj.mixer.clipAction(animation.animation);
                        action.startAt(startTime);
                        action.setEffectiveTimeScale(1);
                        action.setLoop(THREE.LoopOnce);
                        action.clampWhenFinished = true;
                        obj.originalObject.trackAnimations.push(action);
                    } else if (animation.animationType === 4) {/* 如何把这个放进HTML中还是个问题 */
                        const duration = animation.props.time;
                        const positionTime = animation.positionTime;
                        // 对于属性修改动画，每个属性的解析方式不同
                        const propertyName = animation.props.params.property;
                        switch (propertyName) {
                            case '圆角半径':
                                const { from, to } = animation.props.params;
                                const SO = obj.originalObject;

                                // 定义动画函数
                                const update = () => {
                                    const elapsedTime = this.clock.getElapsedTime();
                                    if (elapsedTime >= startTime && elapsedTime <= startTime + duration) {
                                        // 线性插值计算新的圆角半径
                                        const t = (elapsedTime - startTime) / duration;
                                        SO.corner_radius = from + t * (to - from);
                                        SO.updateGeometry();
                                    } else if (elapsedTime > startTime + duration) {
                                        // 动画结束
                                        SO.corner_radius = to;
                                        SO.updateGeometry();
                                    }
                                };

                                // 保存圆角动画标识和必要参数
                                this.uploadCustomUpdates.push({
                                    uuid: obj.object3D.uuid,
                                    type: 'corner_radius_animation',
                                    from,
                                    to,
                                    startTime,
                                    duration
                                });

                                const clear = () => {
                                    SO.corner_radius = from;
                                    SO.updateGeometry();
                                }
                                this.customUpdatesClearFns.push(clear);

                                // 添加自定义更新函数到数组中
                                this.customUpdates.push(update);
                                break;
                        }
                    } else {
                        setTimeout(() => {
                            const animationTHREE = animation.animation.toThreeAnimationClip(obj.object3D);
                            const action = obj.mixer.clipAction(animationTHREE);
                            action.startAt(startTime);
                            action.setEffectiveTimeScale(1);
                            action.setLoop(THREE.LoopOnce);
                            action.clampWhenFinished = true;
                            obj.originalObject.trackAnimations.push(action);
                        }, animation.positionTime * 1000);
                    }
                });
            });
        });

        // 转换相机动画
        if (this.camera) {
            if (!this.camera.mixer) {
                this.camera.mixer = new THREE.AnimationMixer(toRaw(this.camera)); // 为相机创建一个动画混合器
            }
            this.camera.tracks.forEach(track => {
                track.animations.forEach(animation => {
                    let startTime = toRaw(animation).positionTime;
                    const action = toRaw(this.camera.mixer).clipAction(this.createCameraAnimationClip(toRaw(animation), this.camera));
                    console.log(action)
                    action.startAt(startTime);
                    action.setEffectiveTimeScale(1);
                    action.setLoop(THREE.LoopOnce);
                    action.clampWhenFinished = true;
                    this.camera.trackAnimations.push(action);
                });
            });
        }

        this.loading = false;
    }

    // 转换动画成threejs适合的类型 --- 辅助函数
    createAnimationClip(animation, object3D) {
        let times, values, track;

        let duration = animation.props.time;

        switch (animation.name) {
            case 'moveZ':
                times = [0, duration]; // 动画开始和结束的相对时间
                values = [object3D.position.x, object3D.position.y, object3D.position.z, object3D.position.x, object3D.position.y, object3D.position.z + parseInt(animation.props.params['param1'], 10)];
                track = new THREE.VectorKeyframeTrack(`${object3D.uuid}.position`, times, values, THREE.InterpolateLinear);
                return new THREE.AnimationClip('moveZ', -1, [track]);

            case 'routate2pi':
                // 动画开始、中间、结束的相对时间
                times = [0, duration / 2, duration];
                // 旋转轴x,y,z
                let x = parseInt(animation.props.params['param1'], 10);
                let y = parseInt(animation.props.params['param2'], 10);
                let z = parseInt(animation.props.params['param3'], 10);

                // 使用物体当前的四元数作为起始四元数
                const startQuaternion = object3D.quaternion.clone();

                // 定义旋转轴
                const axis = new THREE.Vector3(x, y, z);
                axis.normalize();

                // 计算两个中间四元数，每个旋转180度（π弧度）绕z轴
                const halfSpin = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI);
                const midQuaternion1 = startQuaternion.clone().multiply(halfSpin);
                const midQuaternion2 = midQuaternion1.clone().multiply(halfSpin);

                // 四元数值数组
                values = [...startQuaternion.toArray(), ...midQuaternion1.toArray(), ...midQuaternion2.toArray()];

                // 跟踪对象的四元数属性
                track = new THREE.QuaternionKeyframeTrack(`${object3D.uuid}.quaternion`, times, values, THREE.InterpolateLinear);
                // 创建并返回动画剪辑
                return new THREE.AnimationClip('rotate2pi', -1, [track]);
            case 'arc_fly_in_fly_out_Z':
                // 定义参数和时间点
                const radius1 = parseFloat(animation.props.params['param1']);
                const radius2 = parseFloat(animation.props.params['param2']);
                const numSteps = 20; // 分成20步

                // 获取对象的初始位置
                const startX = object3D.position.x;
                const startY = object3D.position.y;
                const startZ = object3D.position.z;

                // 时间数组
                times = [];
                for (let i = 0; i <= numSteps; i++) {
                    times.push((i / numSteps) * (duration / 2));
                }
                for (let i = 0; i <= numSteps; i++) {
                    times.push((duration / 2) + (i / numSteps) * (duration / 2));
                }

                // 位置数组
                values = [];
                // 飞入部分（左半弧）
                for (let i = 0; i <= numSteps; i++) {
                    const t = (i / numSteps) * Math.PI / 2; // 从0到π/2
                    const xPos1 = startX + radius1 * Math.sin(t);
                    const zPos1 = startZ + radius1 - radius1 * Math.cos(t);
                    values.push(xPos1, startY, zPos1);
                }

                const midX = startX + radius1;
                const midZ = startZ + radius1;

                // 飞出部分（右半弧）
                for (let i = 0; i <= numSteps; i++) {
                    const t = (i / numSteps) * Math.PI / 2; // 从0到π/2
                    const xPos2 = midX + radius2 - radius2 * Math.cos(t);
                    const zPos2 = midZ - radius2 * Math.sin(t);
                    values.push(xPos2, startY, zPos2);
                }

                // 创建位置关键帧跟踪
                track = new THREE.VectorKeyframeTrack(`${object3D.uuid}.position`, times, values, THREE.InterpolateLinear);
                return new THREE.AnimationClip('arc_fly_in_fly_out_Z', -1, [track]);
            case 'elliptical_fly_in':
                // 定义参数和时间点
                const xRadius = parseFloat(animation.props.params['param1']);
                const zRadius = parseFloat(animation.props.params['param2']);
                const numStepsElliptical = 20; // 分成20步

                // 获取对象的初始位置
                const startXElliptical = object3D.position.x;
                const startYElliptical = object3D.position.y;
                const startZElliptical = object3D.position.z;

                // 时间数组
                times = [];
                for (let i = 0; i <= numStepsElliptical; i++) {
                    times.push((i / numStepsElliptical) * duration);
                }

                // 位置数组
                values = [];
                // 椭圆形飞入
                for (let i = 0; i <= numStepsElliptical; i++) {
                    const t = (i / numStepsElliptical) * Math.PI / 2; // 从0到π/2
                    const xPos = startXElliptical + xRadius - xRadius * Math.cos(t);
                    const zPos = startZElliptical + zRadius * Math.sin(t);
                    values.push(xPos, startYElliptical, zPos);
                }

                // 创建位置关键帧跟踪
                track = new THREE.VectorKeyframeTrack(`${object3D.uuid}.position`, times, values, THREE.InterpolateLinear);
                return new THREE.AnimationClip('elliptical_fly_in', -1, [track]);
            case 'elliptical_fly_out':
                // 定义参数和时间点
                const xRadiusOut = parseFloat(animation.props.params['param1']);
                const zRadiusOut = parseFloat(animation.props.params['param2']);
                const numStepsEllipticalOut = 20; // 分成20步

                // 获取对象的初始位置
                const startXEllipticalOut = object3D.position.x;
                const startYEllipticalOut = object3D.position.y;
                const startZEllipticalOut = object3D.position.z;

                // 时间数组
                times = [];
                for (let i = 0; i <= numStepsEllipticalOut; i++) {
                    times.push((i / numStepsEllipticalOut) * duration);
                }

                // 位置数组
                values = [];
                // 椭圆形飞出
                for (let i = 0; i <= numStepsEllipticalOut; i++) {
                    const t = (i / numStepsEllipticalOut) * Math.PI / 2; // 从0到π/2
                    const xPosOut = startXEllipticalOut + xRadiusOut * Math.sin(t);
                    const zPosOut = startZEllipticalOut + zRadiusOut - zRadiusOut * Math.cos(t);
                    values.push(xPosOut, startYEllipticalOut, zPosOut);
                }

                // 创建位置关键帧跟踪
                track = new THREE.VectorKeyframeTrack(`${object3D.uuid}.position`, times, values, THREE.InterpolateLinear);
                return new THREE.AnimationClip('elliptical_fly_out', -1, [track]);

            case 'bounce':
                const bounceHeight = parseInt(animation.props.params['param1'], 10);
                times = [
                    0, duration * 0.1, duration * 0.2, duration * 0.3, duration * 0.4,
                    duration * 0.5, duration * 0.6, duration * 0.7, duration * 0.8,
                    duration * 0.9, duration
                ];

                values = [
                    object3D.position.x, object3D.position.y, object3D.position.z, // 起始位置
                    object3D.position.x, object3D.position.y + bounceHeight, object3D.position.z, // 最高点
                    object3D.position.x, object3D.position.y + bounceHeight * 0.8, object3D.position.z, // 下落
                    object3D.position.x, object3D.position.y + bounceHeight * 0.6, object3D.position.z, // 下落
                    object3D.position.x, object3D.position.y + bounceHeight * 0.4, object3D.position.z, // 下落
                    object3D.position.x, object3D.position.y, object3D.position.z, // 回到原点
                    object3D.position.x, object3D.position.y + bounceHeight * 0.5, object3D.position.z, // 再次弹跳
                    object3D.position.x, object3D.position.y + bounceHeight * 0.25, object3D.position.z, // 下落
                    object3D.position.x, object3D.position.y + bounceHeight * 0.125, object3D.position.z, // 下落
                    object3D.position.x, object3D.position.y + bounceHeight * 0.05, object3D.position.z, // 下落
                    object3D.position.x, object3D.position.y, object3D.position.z // 回到原点
                ];
                console.log('Creating bounce animation with times:', times);
                console.log('Creating bounce animation with values:', values);
                track = new THREE.VectorKeyframeTrack(`${object3D.uuid}.position`, times, values, THREE.InterpolateLinear);
                return new THREE.AnimationClip('bounce', -1, [track]);
        }
        return null;
    }

    // 转换动画成threejs适合的类型 --- 辅助函数
    createCameraAnimationClip(animation, camera) {
        let times, values, track;
        let duration = animation.props.time;

        switch (animation.name) {
            case 'back':
                times = [0, duration];
                values = [
                    camera.position.x, camera.position.y, camera.position.z,
                    camera.position.x, camera.position.y, camera.position.z + 30
                ];
                track = new THREE.VectorKeyframeTrack(`${camera.uuid}.position`, times, values, THREE.InterpolateLinear);
                break;
            case '向前':
                times = [0, duration];
                values = [
                    camera.position.x, camera.position.y, camera.position.z,
                    camera.position.x, camera.position.y, camera.position.z - parseInt(animation.props.params['param1'], 10)
                ];
                track = new THREE.VectorKeyframeTrack(`${camera.uuid}.position`, times, values, THREE.InterpolateLinear);
                break;
            case '向左':
                times = [0, duration];
                values = [
                    camera.position.x, camera.position.y, camera.position.z,
                    camera.position.x - parseInt(animation.props.params['param1'], 10), camera.position.y, camera.position.z
                ];
                track = new THREE.VectorKeyframeTrack(`${camera.uuid}.position`, times, values, THREE.InterpolateLinear);
                break;
            case '向右':
                times = [0, duration];
                values = [
                    camera.position.x, camera.position.y, camera.position.z,
                    camera.position.x + parseInt(animation.props.params['param1'], 10), camera.position.y, camera.position.z
                ];
                track = new THREE.VectorKeyframeTrack(`${camera.uuid}.position`, times, values, THREE.InterpolateLinear);
                break;
            case '旋转':
                times = [0, duration];
                const startQuaternion = camera.quaternion.clone();
                const endQuaternion = new THREE.Quaternion().setFromEuler(
                    new THREE.Euler(
                        parseInt(animation.props.params['param1'], 10) * (Math.PI / 180),
                        parseInt(animation.props.params['param2'], 10) * (Math.PI / 180),
                        parseInt(animation.props.params['param3'], 10) * (Math.PI / 180)
                    )
                );
                values = [...startQuaternion.toArray(), ...endQuaternion.toArray()];
                track = new THREE.QuaternionKeyframeTrack(`${camera.uuid}.quaternion`, times, values, THREE.InterpolateLinear);
                break;
            default:
                console.warn(`未知动画名: ${animation.name}`);
                return null;
        }

        return new THREE.AnimationClip(animation.name, duration, [track]);
    }

    // 时间更新函数，在animate中调用
    update() {
        const delta = this.clock.getDelta();
        this.timelineObjects.forEach(obj => obj.mixer.update(delta));
        if (this.camera && this.camera.mixer) {
            this.camera.mixer.update(delta);
        }

        // 调用自定义的更新函数
        this.customUpdates.forEach(updateFn => updateFn());
    }

    // 开始动画
    startAllAnimations() {

        this.timelineObjects.forEach(obj => {
            obj.originalObject.trackAnimations.forEach(action => {
                action.play();
            });
        });

        if (this.camera) {
            this.camera.trackAnimations.forEach(action => {
                action.play();
            });
        }

        this.clock.start(); // 启动时钟
    }

    // 暂停所有动画
    pauseAllAnimations() {
        this.timelineObjects.forEach(obj => {
            obj.mixer.timeScale = 0; // 将时间尺度设置为0来暂停动画
        });

        if (this.camera && this.camera.mixer) {
            this.camera.mixer.timeScale = 0;
        }

        this.clock.stop(); // 同时停止时间，确保一致性
    }

    // 恢复所有动画
    resumeAllAnimations() {
        this.timelineObjects.forEach(obj => {
            obj.mixer.timeScale = 1; // 将时间尺度恢复为1来恢复动画
        });

        if (this.camera && this.camera.mixer) {
            this.camera.mixer.timeScale = 1;
        }

        this.clock.start(); // 重新启动时钟
    }

    // 停止所有动画（彻底取消，此时可以导出）
    stopAllAnimations() {
        this.timelineObjects.forEach(obj => {
            // 停止并删除所有动画操作
            obj.mixer.stopAllAction();
            obj.mixer = new THREE.AnimationMixer(toRaw(obj.object3D));
            obj.originalObject.trackAnimations = [];
        });

        if (this.camera && this.camera.mixer) {
            // 停止并删除所有动画操作
            this.camera.mixer.stopAllAction();
            this.camera.mixer = new THREE.AnimationMixer(toRaw(this.camera));
            this.camera.trackAnimations = [];
        }

        // 重置全局时钟，确保从头开始
        this.clock.stop();
        this.clock.elapsedTime = 0;

        // 重置自定义更新函数数组
        this.customUpdatesClearFns.forEach(clearFn => clearFn());
    }

    // 添加相机
    addCamera(camera) {
        this.camera = toRaw(camera);

        this.camera.tracks = [];
        this.camera.trackAnimations = [];
    }

    // 添加相机轨道
    addCameraTrack() {
        const newTrack = {
            trackId: `CameraTrack${this.camera.tracks.length + 1}`,
            animations: [],
        };
        this.camera.tracks.push(newTrack);
        return newTrack;
    }
}

export { Timeline };
