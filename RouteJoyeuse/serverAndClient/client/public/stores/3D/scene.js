import { defineStore } from 'pinia';
import * as THREE from 'three';
import * as SO from '../../../src/class/SO.js'
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AnimationClip, AnimationTrack, Keyframe } from '../../../src/class/Animation.js'
import { toRaw } from 'vue';

const loader = new THREE.ObjectLoader();

// 清理材质的函数
function cleanMaterial(material) {
    material.dispose();

    // 如果材质有纹理，需要释放纹理资源
    for (const key of Object.keys(material)) {
        if (material[key] && material[key].isTexture) {
            material[key].dispose();
        }
    }
}

export const useScene = defineStore('scene', {
    state: () => ({
        // 基本状态及选择
        scenes: [],
        cameras: [],
        renderers: [],
        choisiScene: 0,
        choisiCamera: 0,
        choisiRenderer: 0,
        // 渲染监听
        renderAction: 0,
        // 创建的对象
        objects: [],
        //视角移动
        controls: null,
        ifRenderControls: false,
        tempColtrol: null,// 创建动画 的时候的临时移动器
        ifRenderTempControl: false,
        controlsParams: {
            enabled: false, // 控制是否启用控制器
            enableDamping: true, // 启用阻尼效果（惯性），使控制器更加平滑
            dampingFactor: 0.05, // 阻尼系数
            enableZoom: false, // 启用缩放
            zoomSpeed: 1.0, // 缩放速度
            enableRotate: false, // 启用旋转
            rotateSpeed: 1.0, // 旋转速度
            enablePan: false, // 启用平移
            panSpeed: 1.0, // 平移速度
            screenSpacePanning: false, // 如果为true，平移操作沿着屏幕空间方向进行，否则沿世界空间方向（垂直于相机向上方向）
            keyPanSpeed: 7.0, // 使用箭头键平移的速度

            // 距离控制
            minDistance: 0, // 相机距离目标的最小距离，用于限制缩放
            maxDistance: 100, // 相机距离目标的最大距离

            // 角度控制
            minPolarAngle: 0, // 弧度制，用于限制垂直旋转的下限（向下旋转）
            maxPolarAngle: Math.PI, // 弧度制，用于限制垂直旋转的上限（向上旋转）
            minAzimuthAngle: -Infinity, // 弧度制，用于限制水平旋转的左限
            maxAzimuthAngle: Infinity, // 弧度制，用于限制水平旋转的右限

            // 自旋转
            autoRotate: false, // 启用后，控制器将自动旋转相机围绕其目标
            autoRotateSpeed: 2.0, // 自动旋转的速度
        },
        helperPlane: null, // 存储辅助平面
        drawing: false, // 是否正在绘制轨迹
        drawPoints: [], // 存储轨迹点的数组
        drawLine: null, // 存储轨迹线的数组
        drawhistoryTemp: [], // 存储轨迹线的历史，临时记录
        raycaster: null,

        snapshot: null,        // 状态快照
        // 预览窗口的控制器
        preControl: null,
        ifRenderPreControls: false,
        // 给对象拍照
        snapshotCamera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
        graphiques: [],
        // 保存几何体的贴图
        textures: [],
        // 模型自带动画相关
        modelAnimation: [],
        // 用于保存数据
        textureFiles: [],   // 纹理文件
    }),
    actions: {
        newScene() {
            // 添加动画定义和编辑场景
            const scene = new THREE.Scene()
            this.scenes.push(scene);

            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 20;
            this.cameras.push(camera);

            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderers.push(renderer);

            const ambientLight = new THREE.AmbientLight(0x404040); // 环境光
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 定向光
            directionalLight.position.set(1, 1, 1).normalize();
            scene.add(directionalLight);

            // 添加预览场景，使用的场景是同一个
            const previewCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            previewCamera.position.z = 5;
            this.cameras.push(previewCamera);

            const previewRenderer = new THREE.WebGLRenderer({ antialias: true });
            previewRenderer.setSize(window.innerWidth * 60 / 100, window.innerHeight * 60 / 100);
            this.renderers.push(previewRenderer);

            ++this.renderAction;
        },
        addObjectToCurrentScene(object) {
            const currentSceneIndex = this.choisiScene;
            const currentScene = this.scenes[currentSceneIndex];
            
            // 检查 object 是否已经存在于当前场景中
            if (!object.fatherSceneIndex.includes(currentSceneIndex)) {
                object.fatherSceneIndex.push(currentSceneIndex);
                this.objects.push(object);
                
                object.addToScene(toRaw(currentScene));
            }
        },
        removeObjectFromCurrentScene(objectId) {
            const currentSceneIndex = this.choisiScene;
            const currentScene = this.scenes[currentSceneIndex];
            const objectIndex = this.objects.findIndex(obj => obj.id === objectId);

            if (objectIndex !== -1) {
                const object = this.objects[objectIndex];

                // 从场景中移除对象
                if (object.fatherSceneIndex.includes(currentSceneIndex)) {
                    object.removeFromScene(toRaw(currentScene))
                    // 从 fatherSceneIndex 中移除当前场景索引
                    object.fatherSceneIndex = object.fatherSceneIndex.filter(index => index !== currentSceneIndex);

                    // 如果对象不再属于任何场景，从 objects 数组中移除
                    if (object.fatherSceneIndex.length === 0) {
                        this.objects.splice(objectIndex, 1);
                    }

                    // 如果对象不再属于任何场景，从 objects 数组中移除
                    if (object.fatherSceneIndex.length === 0) {
                        this.objects.splice(objectIndex, 1);

                        // 彻底删除对象
                        object.object3D.geometry.dispose();
                        if (object.object3D.material.isMaterial) {
                            cleanMaterial(object.object3D.material);
                        } else {
                            for (const material of object.object3D.material) cleanMaterial(material);
                        }
                    }
                }
            }
        },
        // 添加对象
        newSO(type, config) {
            this.textures.push([])
            return new Promise(async (resolve, reject) => {
                switch (type) {
                    case 'model':
                        const url = config.modelURLChoosed;
                        const model = new SO.ModelObject(this.objects.length, url);
                        await model.loadModel(() => {
                        }).then((result) => {
                            // 保存模型动画数据到状态库中
                            this.modelAnimation.push(result);
                            resolve({ gltf: model.gltf });
                        }).catch((error) => {
                            console.error('加载模型失败', error);
                            reject(error);
                        });
                        this.objects.push(model);
                        this.updateCameraControls();
                        break;
                    case 'text':
                        const text = config.text;
                        const textModel = new SO.TextObject(this.objects.length, config.text);
                        await textModel.loadFont().then((res) => {
                            resolve({ text: textModel });
                        }).catch(err => {
                            console.error('加载字体失败', err);
                            reject(err);
                        });
                        break;
                    case 'group':
                        const children = config.blocks;
                        const group = new SO.GroupObject(this.objects.length, config.source);
                        children.forEach(child => {
                            child.mesh.position.set(child.relativePosition[0], child.relativePosition[1], 0); // 设置子对象的相对位置
                            group.add(child.mesh); // 添加子对象到组
                        });
                        group.object3D.position.set(0, 0, 0); // 设置组的位置
                        resolve({ group });
                        break;
                }
            })
        },
        // 视角移动管理
        // 添加控制器和初始化
        orbitCtrl_add() {
            this.controls = new OrbitControls(this.cameras[this.choisiCamera], this.renderers[this.choisiRenderer].domElement);
            this.preControl = new OrbitControls(this.cameras[this.choisiCamera + 1], this.renderers[this.choisiRenderer + 1].domElement);
            this.preControl.enableDamping = true; // 启用阻尼效果
            this.preControl.dampingFactor = 0.05; // 设置阻尼因子
            this.ifRenderControls = true;
            this.ifRenderPreControls = true;
            this.applyControlsParams();
            this.updateCameraControls();
        },
        // 删除控制器
        orbitCtrl_remove() {
            if (this.controls !== null) {
                this.ifRenderControls = false;
                this.controls.dispose();
                this.controls = null;
            }
        },
        //临时移动器
        tempControl_add() {
            if (this.tempColtrol === null) {
                this.tempColtrol = new OrbitControls(this.cameras[this.choisiCamera], this.renderers[this.choisiRenderer].domElement);
                this.ifRenderTempControl = true;
            } else {
                this.tempColtrol.enabled = true;
            }
        },
        //禁用临时移动器
        tempControl_disable() {
            if (this.tempColtrol === null) {
                return
            } else {
                this.tempColtrol.enabled = false;
            }
        },
        //删除临时移动器
        tempControl_delete() {
            if (this.tempColtrol === null) {
                return
            } else {
                this.ifRenderTempControl = false;
                this.tempColtrol.dispose();
                this.tempColtrol = null;
            }
        },
        // 将控制器参数应用于实际的控制器实例 --- 内部方法
        applyControlsParams() {
            if (this.controls) {
                Object.keys(this.controlsParams).forEach(key => {
                    this.controls[key] = this.controlsParams[key];
                })
            }
        },
        // 更新控制器参数，用于从用户获取
        updateControlsParams(params) {
            Object.assign(this.controlsParams, params);
            this.applyControlsParams();
        },
        // 更新控制器的可用于否
        setControlsEnabled(enabled) {
            this.controls.enabled = enabled;
            this.controls.enableRotate = enabled;
            this.controls.enableZoom = enabled;
            this.controls.enablePan = enabled;
            this.controlsParams.enabled = enabled;
            this.controlsParams.enableRotate = enabled;
            this.controlsParams.enableZoom = enabled;
            this.controlsParams.enablePan = enabled;
        },
        setPreControlEnabled(enabled) {
            this.preControl.enabled = enabled;
            this.preControl.enableZoom = enabled;
            this.preControl.enableRotate = enabled;
            this.preControl.enablePan = enabled;
        },
        // 开关自旋转
        setAutoRotateEnabled(enabled) {
            this.controlsParams.autoRotate = enabled;
            this.controls.autoRotate = enabled;
        },
        setPreAutoRotateEnabled(enabled) {
            this.preControl.autoRotate = enabled;
        },
        // 开关屏幕空间平移
        setScreenSpacePanningEnabled(enabled) {
            this.controlsParams.screenSpacePanning = enabled;
            this.controls.screenSpacePanning = enabled;
        },
        setPreScreenSpacePanningEnabled(enabled) {
            this.preControl.screenSpacePanning = enabled;
        },
        // 开关惯性
        setEnableDamping(enabled) {
            this.controlsParams.enableDamping = enabled;
            this.controls.enableDamping = enabled;
        },
        setPreEnableDamping(enabled) {
            this.preControl.enableDamping = enabled;
        },
        // 更新控制器的镜头距离，适应与objects的更新 --- 内部方法
        updateCameraControls() {
            if (this.controls) {
                let maxDistance = 0;
                this.objects.forEach(obj => {
                    if (obj.object3D && obj.object3D.position) {
                        const distance = obj.object3D.position.length();
                        if (distance > maxDistance) {
                            maxDistance = distance;
                        }
                    }
                });
                if (maxDistance < 50) {
                    maxDistance = 50;
                }
                this.controls.maxDistance = maxDistance * 2;
                this.controls.target.set(0, 0, 0);
                this.preControl.maxDistance = maxDistance * 2;
                this.preControl.target.set(0, 0, 0);
                this.controlsParams.maxDistance = maxDistance * 2;
            }
        },
        //镜头平滑运动
        cameraMove(position, time = 2000) {
            let camera = this.cameras[this.choisiCamera];
            new TWEEN.Tween(camera.position)
                .to(position, time)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        },
        //镜头平滑转向
        cameraLookAt(target, time = 2000) {
            let { x, y, z } = target;
            let camera = this.cameras[this.choisiCamera];
            let targetPosition = new THREE.Vector3(x, y, z);
            let direction = targetPosition.sub(camera.position).normalize();
            let targetLookAt = new THREE.Vector3().addVectors(camera.position, direction);

            new TWEEN.Tween({ x: camera.position.x, y: camera.position.y, z: camera.position.z })
                .to({ x: targetLookAt.x, y: targetLookAt.y, z: targetLookAt.z }, time)
                .onUpdate(function (obj) {
                    camera.lookAt(obj.x, obj.y, obj.z);
                })
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        },
        //创建辅助平面
        createHelperPlaneForSO(soName) {
            const id = soName.split('：')[2];

            const object = this.objects.find(obj => obj.id == id);
            if (!object) return;

            const gridHelper = new THREE.GridHelper(100, 50, 0xffffff, 0xffffff);

            gridHelper.position.copy(object.object3D.position);

            if (this.helperPlane) {
                this.scenes[this.choisiScene].remove(this.helperPlane);
            }

            this.scenes[this.choisiScene].add(gridHelper);
            this.helperPlane = gridHelper;
        },
        // 初始化绘制功能，设置事件监听等
        initDrawing() {
            const canvas = this.renderers[this.choisiRenderer].domElement;

            canvas.addEventListener('mousedown', this.startDrawing);
            canvas.addEventListener('mousemove', this.draw);
            canvas.addEventListener('mouseup', this.stopDrawing);
            canvas.addEventListener('mouseleave', this.stopDrawing);
        },
        // 开始绘制
        startDrawing(event) {
            if (this.tempColtrol && this.tempColtrol.enabled === false) {
                if (!this.drawPoints.length && this.helperPlane) {
                    this.drawPoints.push(this.helperPlane.position.clone());
                }

                this.raycaster = new THREE.Raycaster();

                this.drawing = true;

                this.addDrawPoint(event);
            }
        },
        // 绘制中
        draw(event) {
            if (!this.drawing) return;
            this.addDrawPoint(event);
        },
        addDrawPoint(event) {
            const rect = this.renderers[this.choisiRenderer].domElement.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            this.raycaster.setFromCamera({ x, y }, this.cameras[this.choisiCamera]);

            const intersects = this.raycaster.intersectObject(this.helperPlane);

            if (intersects.length > 0) {
                const intersectPoint = intersects[0].point;
                this.drawPoints.push(intersectPoint);
                this.renderDrawing();
            }
        },
        stopDrawing() {
            this.drawing = false;
            this.raycaster = null;
        },
        clearDrawing() {
            this.drawPoints = [];
            if (this.drawLine) {
                this.scenes[this.choisiScene].remove(this.drawLine);
                this.drawLine.geometry.dispose();
                this.drawLine.material.dispose();
                this.drawLine = null;
            }
            this.raycaster = null;
            this.drawhistoryTemp = [];
            this.renderDrawing();
        },
        clearDrawingExceptHistory() {
            this.drawPoints = [];
            if (this.drawLine) {
                this.scenes[this.choisiScene].remove(this.drawLine);
                this.drawLine.geometry.dispose();
                this.drawLine.material.dispose();
                this.drawLine = null;
            }
            this.raycaster = null;
            this.renderDrawing();
        },
        renderDrawing() {
            if (this.drawLine) {
                this.scenes[this.choisiScene].remove(this.drawLine);
                this.drawLine.geometry.dispose();
                this.drawLine.material.dispose();
                this.drawLine = null;
            }

            // 创建新的轨迹线
            const geometry = new THREE.BufferGeometry().setFromPoints(this.drawPoints);
            const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
            this.drawLine = new THREE.Line(geometry, material);

            // 将新的轨迹线添加到场景中
            this.scenes[this.choisiScene].add(this.drawLine);
        },
        renderFromHistory(TrackToModifier) {
            if (!this.drawhistoryTemp || this.drawhistoryTemp.length === 0) return;
            if (TrackToModifier.keyframes.length === 0) return;

            let target = undefined;
            this.drawhistoryTemp.forEach((track) => {
                TrackToModifier.createTime = track.createTime;
                target = TrackToModifier;
            });
            if (!target) return;

            // 渲染轨迹线
            const points = target.createPoints();
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
            this.drawLine = new THREE.Line(geometry, material);
            // 将新的轨迹线添加到场景中
            this.scenes[this.choisiScene].add(this.drawLine);
        },
        saveNewTrack(startTime, endTime, TrackToModifier) {
            if (!TrackToModifier) return;

            this.drawPoints.forEach((point, index) => {
                const fraction = index / (this.drawPoints.length - 1);
                const time = startTime + (endTime - startTime) * fraction;
                const keyframe = new Keyframe(time, [point.x, point.y, point.z]);
                TrackToModifier.addKeyframe(keyframe);
            });

            if (this.drawhistoryTemp.length === 0) {
                this.drawhistoryTemp.push(TrackToModifier);
            }
            else {
                for (let i = 0; i < this.drawhistoryTemp.length; i++) {
                    if (this.drawhistoryTemp[i].createTime === TrackToModifier.createTime) {
                        this.drawhistoryTemp[i] = TrackToModifier;
                        break;
                    } else {
                        if (i === this.drawhistoryTemp.length - 1) {
                            this.drawhistoryTemp.push(TrackToModifier);
                        }
                    }
                }
            }

            this.clearDrawingExceptHistory();
        },
        finalizeAnimation_object(SO, animationName, TrackToModifierArray, trackWeights) {
            if (!SO) return;

            let animationClip = new AnimationClip(animationName);

            TrackToModifierArray.forEach((track, index) => {
                animationClip.addTrack(track, trackWeights[index]);
            });

            SO.addAnimation(animationClip)


            // 清理工作
            this.clearDrawing();
            this.raycaster = null;
            if (this.helperPlane) {
                this.scenes[this.choisiScene].remove(this.helperPlane);
            }
            this.helperPlane = null;

            this.tempControl_delete();

            const canvas = this.renderers[this.choisiRenderer].domElement;

            canvas.removeEventListener('mousedown', this.startDrawing);
            canvas.removeEventListener('mousemove', this.draw);
            canvas.removeEventListener('mouseup', this.stopDrawing);
            canvas.removeEventListener('mouseleave', this.stopDrawing);
        },
        //保存状态快照
        saveState() {
            // 保存每个对象的状态
            if (this.objects.length === 0) return;

            this.snapshot = this.objects.map(object => ({
                position: object.object3D.position.clone(),
                rotation: object.object3D.rotation.clone(),
                scale: object.object3D.scale.clone()
            }));

            // 相机状态
            const cameraState = JSON.stringify(this.cameras[this.choisiCamera].toJSON());
            this.snapshot.camera = cameraState;
        },
        //使用状态快照
        loadState() {
            // 恢复对象的状态
            if (this.objects.length === 0) return;

            this.snapshot.forEach((state, index) => {
                if (this.objects[index]) {
                    this.objects[index].object3D.position.copy(state.position);
                    this.objects[index].object3D.rotation.copy(state.rotation);
                    this.objects[index].object3D.scale.copy(state.scale);
                }
            });

            // 恢复相机状态
            this.cameras[this.choisiCamera] = loader.parse(JSON.parse(this.snapshot.camera));

            // 如果使用了 OrbitControls，重新初始化它
            this.orbitCtrl_add();
        },
        // 恢复默认设置，就是重新创建一个control
        backToOffset_pre() {
            if (this.preControl !== null) {
                this.ifRenderPreControls = false;
                this.preControl.dispose();
                this.preControl = null;
                this.preControl = new OrbitControls(this.cameras[this.choisiCamera + 1], this.renderers[this.choisiRenderer + 1].domElement);

                this.ifRenderPreControls = true;
            }
        },
        captureImages() {
            this.graphiques = [];
            const scene = this.scenes[this.choisiScene];
            const camera = this.snapshotCamera;
            const renderer = new THREE.WebGLRenderer({ antialias: true });

            //先给背景拍照
            const distantPosition = 10000;
            camera.position.set(distantPosition, distantPosition, distantPosition);

            // 渲染背景场景
            renderer.render(toRaw(scene), toRaw(camera));
            const backgroundImageUrl = renderer.domElement.toDataURL('image/png');
            this.graphiques.push(backgroundImageUrl);

            const captureObject = (object3D) => {
                if (!object3D) return;

                // 计算物体的外接边界并设置相机
                const box = new THREE.Box3().setFromObject(object3D);
                const center = new THREE.Vector3();
                box.getCenter(center);

                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * (Math.PI / 180);

                // 计算相机距离物体中心点的距离，包括所有维度，并确保从一个好的观察角度观看
                let distance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.7;

                // 计算相机的新位置
                const offset = new THREE.Vector3(distance, distance, distance);
                const newPosition = new THREE.Vector3().addVectors(center, offset);

                camera.position.set(newPosition.x, newPosition.y, newPosition.z * 1.5);
                camera.lookAt(center);

                // 渲染场景
                renderer.render(toRaw(scene), toRaw(camera));
                const imageUrl = renderer.domElement.toDataURL('image/png');
                this.graphiques.push(imageUrl);
            };

            this.objects.forEach(objData => {
                const object3D = objData.object3D;
                if (!object3D) return;

                if (objData.type === 'model') {
                    captureObject(object3D);
                } else if (object3D.type === 'Group') {
                    object3D.children.forEach(child => {
                        captureObject(child);
                    });
                } else {
                    captureObject(object3D);
                }
            });
        }

    },
});
