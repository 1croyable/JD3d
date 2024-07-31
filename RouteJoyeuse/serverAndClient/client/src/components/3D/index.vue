<template>
    <v-app>
        <!-- saveLoading -->
        <div id="saveLoadingComponent" v-show="ifShowSaveLoading">
            <saveLoadingComponent :saveLoading="saveLoading" :ifSaveError="ifSaveError"></saveLoadingComponent>
        </div>
        <!-- 菜单栏 -->
        <v-navigation-drawer theme="dark" rail v-model="draw" image="/imgs/bg/home bg.png">
            <v-list density="compact" nav v-show="showPre === false">
                <!-- 新建场景 -->
                <v-list-item link :disabled="sceneStore.scenes.length !== 0" @click="sceneStore.newScene();">
                    <template #prepend>
                        <v-icon icon="mdi-plus" size="22"></v-icon>
                    </template>
                </v-list-item>

                <v-divider></v-divider>

                <!-- 添加元素 -->
                <v-list-item :class="showAddEContainer ? 'bg-cyan-darken-2' : ''" :border="addEBorder" link
                    :disabled="sceneStore.scenes.length === 0" class="mt-6" id="AddEIcon" @click="AddEClick();">
                    <template #prepend>
                        <v-icon icon="mdi-cube-send" size="22"></v-icon>
                    </template>
                </v-list-item>

                <!-- 用户移动面板 -->
                <v-list-item :class="showOC ? 'bg-pink-darken-1' : ''" :border="addshowOCBorder" link
                    :disabled="sceneStore.scenes.length === 0" class="mt-6" id="showOC" @click="showOrbitCtrl();">
                    <template #prepend>
                        <v-icon icon="mdi-gesture-tap" size="22" v-if="!enabled"></v-icon>
                        <v-badge color="success" v-else>
                            <v-icon icon="mdi-gesture-tap" size="22"></v-icon>
                            <template #badge>
                                <v-icon size="10">mdi-check</v-icon>
                            </template>
                        </v-badge>
                    </template>
                </v-list-item>

                <!-- 自定义关键帧动画 -->
                <v-list-item link :disabled="sceneStore.scenes.length === 0" class="mt-6" id="showTL"
                    @click="addAnimationChooseObject();">
                    <template #prepend>
                        <v-icon size="22">mdi-film</v-icon>
                    </template>
                </v-list-item>

                <!-- 修改场景中的物体 -->
                <v-list-item :class="showChangeSceneElementsFlag ? 'bg-blue-accent-3' : ''" link
                    :disabled="sceneStore.scenes.length === 0" class="mt-6" id="changeSceneElements"
                    @click="openchangeSceneElements();">
                    <template #prepend>
                        <v-icon size="22">mdi-tune</v-icon>
                    </template>
                </v-list-item>

                <!-- 保存动画数据到后端 -->
                <v-list-item link :disabled="sceneStore.scenes.length === 0" class="mt-6" id="changeSceneElements"
                    @click="saveWork();">
                    <template #prepend>
                        <v-icon size="22">mdi-movie-plus</v-icon>
                    </template>
                </v-list-item>
            </v-list>

            <!-- 预览场景list -->
            <v-list density="compact" nav v-show="showPre === true">
                <!-- （预览）用户移动面板 -->
                <v-list-item :class="showPreOC ? 'bg-pink-darken-1' : ''" :border="showPreOC" link
                    :disabled="sceneStore.scenes.length === 0 || sceneStore.preControl === null" class="mt-6"
                    id="showPreOC" @click="showPreOrbitCtrl();">
                    <template #prepend>
                        <v-icon icon="mdi-gesture-tap" size="22" v-if="!sceneStore.preControl?.enabled"></v-icon>
                        <v-badge color="success" v-else>
                            <v-icon icon="mdi-gesture-tap" size="22"></v-icon>
                            <template #badge>
                                <v-icon size="10">mdi-check</v-icon>
                            </template>
                        </v-badge>
                    </template>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-navigation-drawer width="220" class="px-2" v-model="draw" style="position: relative;">
            <v-list density="compact" nav v-show="showPre === false">
                <!-- 新建场景 -->
                <v-list-item link :disabled="sceneStore.scenes.length !== 0" @click="sceneStore.newScene();">
                    <v-list-item-title class="text-h4 pa-0 py-2">新建场景</v-list-item-title>
                </v-list-item>

                <v-divider></v-divider>
                <!-- 添加元素 -->
                <v-list-item link :disabled="sceneStore.scenes.length === 0" @click="AddEClick()">
                    <v-list-item-title class="text-h4 pa-0 py-2 mt-7">添加元素</v-list-item-title>
                </v-list-item>

                <!-- 用户移动面板 -->
                <v-list-item link :disabled="sceneStore.scenes.length === 0" @click="showOrbitCtrl()">
                    <v-list-item-title class="text-h4 pa-0 py-2 mt-7">视角移动</v-list-item-title>
                </v-list-item>

                <!-- 自定义关键帧动画 -->
                <v-list-item link :disabled="sceneStore.scenes.length === 0" @click="addAnimationChooseObject()">
                    <v-list-item-title class="text-h4 pa-0 py-2 mt-6">关键帧动画</v-list-item-title>
                </v-list-item>

                <!-- 修改场景中的物体 -->
                <v-list-item link :disabled="sceneStore.scenes.length === 0" @click="openchangeSceneElements()">
                    <v-list-item-title class="text-h4 pa-0 py-2 mt-7">修改场景中的物体</v-list-item-title>
                </v-list-item>

                <!-- 保存动画数据到后端 -->
                <v-list-item link :disabled="sceneStore.scenes.length === 0" @click="saveWork()">
                    <v-list-item-title class="text-h4 pa-0 py-2 mt-7">保存工作页</v-list-item-title>
                </v-list-item>
            </v-list>

            <!-- 预览场景list -->
            <v-list density="compact" nav v-show="showPre === true">
                <v-list-item link :disabled="sceneStore.scenes.length === 0 || sceneStore.preControl === null"
                    @click="showPreOrbitCtrl()">
                    <v-list-item-title>视角移动</v-list-item-title>
                </v-list-item>
            </v-list>

            <!-- 展开/收起 -->
            <v-btn :disabled="addAnimationChooseObject_UI" @click="openEtcloseSansCSE();" class="draw-ctrl-btn" rounded
                variant="plain" :color="(sceneStore.scenes.length !== 0) ? 'white' : 'black'">
                <v-icon end :icon="draw ? 'mdi-menu-left' : 'mdi-menu-right'" size="40px"></v-icon>
            </v-btn>
        </v-navigation-drawer>

        <!-- 用户移动面板 -->
        <div v-show="showOC" :class="classShowOC" id="showOCContainer">
            <v-sheet border="md" class="pa-6 text-white mx-auto overflow-y-auto" color="#141518" max-width="28vw"
                max-height="88vh">
                <h4 class="text-h4 font-weight-bold mb-4">调整你的镜头</h4>
                <!-- 通用控制 -->
                <v-divider class="my-4"></v-divider>
                <h5 class="text-h5">通用控制</h5>
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-cog</v-icon>
                    控制是否启用: {{ sceneStore.controlsParams.enabled }}
                </v-chip>
                <br />
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-damping</v-icon>
                    启用阻尼效果: {{ sceneStore.controlsParams.enableDamping }}
                </v-chip>
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-waves</v-icon>
                    阻尼系数: {{ sceneStore.controlsParams.dampingFactor }}
                </v-chip>
                <br />
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-magnify</v-icon>
                    启用缩放: {{ sceneStore.controlsParams.enableZoom }}
                </v-chip>
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-magnify-plus-outline</v-icon>
                    缩放速度: {{ sceneStore.controlsParams.zoomSpeed }}
                </v-chip>
                <br />
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-rotate-3d</v-icon>
                    启用旋转: {{ sceneStore.controlsParams.enableRotate }}
                </v-chip>
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-rotate-right</v-icon>
                    旋转速度: {{ sceneStore.controlsParams.rotateSpeed }}
                </v-chip>
                <br />
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-pan</v-icon>
                    启用平移: {{ sceneStore.controlsParams.enablePan }}
                </v-chip>
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-pan-horizontal</v-icon>
                    平移速度: {{ sceneStore.controlsParams.panSpeed }}
                </v-chip>
                <br />
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-axis-z-arrow-lock</v-icon>
                    屏幕空间平移: {{ sceneStore.controlsParams.screenSpacePanning }}
                </v-chip>
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-keyboard</v-icon>
                    键盘平移速度: {{ sceneStore.controlsParams.keyPanSpeed }}
                </v-chip>

                <div id="ty-switchs">
                    <!-- 阻尼系数 -->
                    <v-slider v-model="controlsParamsDraft.dampingFactor" :min="0" :max="1" :step="0.01" label="阻尼系数"
                        class="ma-2" thumb-label="always"></v-slider>

                    <!-- 缩放速度 -->
                    <v-slider v-model="controlsParamsDraft.zoomSpeed" :min="0.1" :max="5" :step="0.1" label="缩放速度"
                        class="ma-2" thumb-label="always"></v-slider>

                    <!-- 旋转速度 -->
                    <v-slider v-model="controlsParamsDraft.rotateSpeed" :min="0.1" :max="5" :step="0.1" label="旋转速度"
                        class="ma-2" thumb-label="always"></v-slider>

                    <!-- 平移速度 -->
                    <v-slider v-model="controlsParamsDraft.panSpeed" :min="0.1" :max="5" :step="0.1" label="平移速度"
                        class="ma-2" thumb-label="always"></v-slider>

                    <!-- 键盘平移速度 -->
                    <v-slider v-model="controlsParamsDraft.keyPanSpeed" :min="1" :max="10" :step="0.5" label="键盘平移速度"
                        class="ma-2" thumb-label="always"></v-slider>
                </div>

                <!-- 距离控制 -->
                <v-divider class="my-4"></v-divider>
                <h5 class="text-h5">距离控制</h5>
                <v-chip color="green" class="ma-2">
                    <v-icon left>mdi-ray-start-arrow</v-icon>
                    最小距离: {{ sceneStore.controlsParams.minDistance }}
                </v-chip>
                <v-chip color="green" class="ma-2">
                    <v-icon left>mdi-ray-end-arrow</v-icon>
                    最大距离: {{ sceneStore.controlsParams.maxDistance }}
                </v-chip>

                <!-- 最小距离 -->
                <v-slider v-model="controlsParamsDraft.minDistance" :min="0"
                    :max="sceneStore.controlsParams.maxDistance / 2" :step="1" label="最小距离" class="ma-2"
                    thumb-label="always"></v-slider>

                <!-- 角度控制 -->
                <v-divider class="my-4"></v-divider>
                <h5 class="text-h5">角度控制</h5>
                <v-chip color="red" class="ma-2">
                    <v-icon left>mdi-angle-acute</v-icon>
                    最小垂直旋转角度: {{ sceneStore.controlsParams.minPolarAngle }}
                </v-chip>
                <v-chip color="red" class="ma-2">
                    <v-icon left>mdi-angle-obtuse</v-icon>
                    最大垂直旋转角度: {{ sceneStore.controlsParams.maxPolarAngle }}
                </v-chip>
                <v-chip color="red" class="ma-2">
                    <v-icon left>mdi-arrow-left-right-bold-outline</v-icon>
                    最小水平旋转角度: {{ sceneStore.controlsParams.minAzimuthAngle }}
                </v-chip>
                <v-chip color="red" class="ma-2">
                    <v-icon left>mdi-arrow-left-right-bold</v-icon>
                    最大水平旋转角度: {{ sceneStore.controlsParams.maxAzimuthAngle }}
                </v-chip>

                <v-slider v-model="controlsParamsDraft.minPolarAngle" :min="0" :max="Math.PI" :step="0.1"
                    label="最小垂直旋转角度" class="ma-2" thumb-label="always"></v-slider>

                <v-slider v-model="controlsParamsDraft.maxPolarAngle" :min="0" :max="Math.PI" :step="0.1"
                    label="最大垂直旋转角度" class="ma-2" thumb-label="always"></v-slider>

                <!-- 自旋转 -->
                <v-divider class="my-4"></v-divider>
                <h5 class="text-h5">自旋转</h5>
                <v-chip color="purple" class="ma-2">
                    <v-icon left>mdi-autorenew</v-icon>
                    启用自旋转: {{ sceneStore.controlsParams.autoRotate }}
                </v-chip>
                <v-chip color="purple" class="ma-2">
                    <v-icon left>mdi-speedometer</v-icon>
                    自旋转速度: {{ sceneStore.controlsParams.autoRotateSpeed }}
                </v-chip>
                <v-slider v-model="controlsParamsDraft.autoRotateSpeed" :min="0.1" :max="20" :step="0.1" label="自旋转速度"
                    class="ma-2" thumb-label="always"></v-slider>

                <div id="OC-btns">
                    <v-container>
                        <v-row>
                            <v-col cols="6">
                                <v-btn class="text-none text-black mb-2" color="red-accent-2 text-h5" size="x-large"
                                    variant="flat" block @click="orbitCtrl()">
                                    总开关
                                </v-btn>
                                <v-btn class="text-none text-black" color="red-accent-2 text-h5" size="small"
                                    variant="flat" block @click="backToOffset()">
                                    恢复默认设置
                                </v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn class="text-none text-black mb-2" color="red-accent-1 text-h5" size="x-small"
                                    variant="flat" block @click="autoRo()"
                                    :disabled="sceneStore.controls === null || sceneStore.controls.enabled === false">
                                    开关 - 自旋转
                                </v-btn>

                                <v-btn class="text-none text-black mb-2" color="red-accent-1 text-h5" size="x-small"
                                    variant="flat" block @click="SCP()"
                                    :disabled="sceneStore.controls === null || sceneStore.controls.enabled === false">
                                    开关 - 屏幕空间平移
                                </v-btn>

                                <v-btn class="text-none text-black mb-2" color="red-accent-1 text-h5" size="x-small"
                                    variant="flat" block @click="damping()"
                                    :disabled="sceneStore.controls === null || sceneStore.controls.enabled === false">
                                    开关 - 惯性
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-btn class="text-none text-black mb-3" color="red-accent-2 text-h5" size="x-small"
                                variant="outlined" block @click="saveControlParams">
                                保存
                            </v-btn>

                            <v-btn class="text-none text-black" color="red-accent-2 text-h5" size="x-small"
                                variant="outlined" block @click="showOrbitCtrl()">
                                关闭界面
                            </v-btn>
                        </v-row>
                    </v-container>
                </div>
            </v-sheet>
        </div>

        <!-- （预览）用户移动面板 -->
        <div v-show="showPreOC" :class="classShowPreOC" id="showPreOCContainer">
            <v-sheet v-if="sceneStore.preControl !== null" border="md" class="pa-6 text-white mx-auto overflow-y-auto"
                color="#141518" max-width="28vw" max-height="88vh">
                <h4 class="text-h4 font-weight-bold mb-4">调整你的镜头</h4>
                <!-- 通用控制 -->
                <v-divider class="my-4"></v-divider>
                <h5 class="text-h5">通用控制</h5>
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-cog</v-icon>
                    控制是否启用: {{ sceneStore.preControl.enabled }}
                </v-chip>
                <br />
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-damping</v-icon>
                    启用阻尼效果: {{ sceneStore.preControl.enableDamping }}
                </v-chip>
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-waves</v-icon>
                    阻尼系数: {{ sceneStore.preControl.dampingFactor }}
                </v-chip>
                <br />
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-magnify</v-icon>
                    启用缩放: {{ sceneStore.preControl.enableZoom }}
                </v-chip>
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-magnify-plus-outline</v-icon>
                    缩放速度: {{ sceneStore.preControl.zoomSpeed }}
                </v-chip>
                <br />
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-rotate-3d</v-icon>
                    启用旋转: {{ sceneStore.preControl.enableRotate }}
                </v-chip>
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-rotate-right</v-icon>
                    旋转速度: {{ sceneStore.preControl.rotateSpeed }}
                </v-chip>
                <br />
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-pan</v-icon>
                    启用平移: {{ sceneStore.preControl.enablePan }}
                </v-chip>
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-pan-horizontal</v-icon>
                    平移速度: {{ sceneStore.preControl.panSpeed }}
                </v-chip>
                <br />
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-axis-z-arrow-lock</v-icon>
                    屏幕空间平移: {{ sceneStore.preControl.screenSpacePanning }}
                </v-chip>
                <v-chip color="blue" class="ma-2">
                    <v-icon left>mdi-keyboard</v-icon>
                    键盘平移速度: {{ sceneStore.preControl.keyPanSpeed }}
                </v-chip>

                <div id="ty-switchs">
                    <!-- 阻尼系数 -->
                    <v-slider v-model="sceneStore.preControl.dampingFactor" :min="0" :max="1" :step="0.01" label="阻尼系数"
                        class="ma-2" thumb-label="always"></v-slider>

                    <!-- 缩放速度 -->
                    <v-slider v-model="sceneStore.preControl.zoomSpeed" :min="0.1" :max="5" :step="0.1" label="缩放速度"
                        class="ma-2" thumb-label="always"></v-slider>

                    <!-- 旋转速度 -->
                    <v-slider v-model="sceneStore.preControl.rotateSpeed" :min="0.1" :max="5" :step="0.1" label="旋转速度"
                        class="ma-2" thumb-label="always"></v-slider>

                    <!-- 平移速度 -->
                    <v-slider v-model="sceneStore.preControl.panSpeed" :min="0.1" :max="5" :step="0.1" label="平移速度"
                        class="ma-2" thumb-label="always"></v-slider>

                    <!-- 键盘平移速度 -->
                    <v-slider v-model="sceneStore.preControl.keyPanSpeed" :min="1" :max="10" :step="0.5" label="键盘平移速度"
                        class="ma-2" thumb-label="always"></v-slider>
                </div>

                <!-- 距离控制 -->
                <v-divider class="my-4"></v-divider>
                <h5 class="text-h5">距离控制</h5>
                <v-chip color="green" class="ma-2">
                    <v-icon left>mdi-ray-start-arrow</v-icon>
                    最小距离: {{ sceneStore.preControl.minDistance }}
                </v-chip>
                <v-chip color="green" class="ma-2">
                    <v-icon left>mdi-ray-end-arrow</v-icon>
                    最大距离: {{ sceneStore.preControl.maxDistance }}
                </v-chip>

                <!-- 最小距离 -->
                <v-slider v-model="sceneStore.preControl.minDistance" :min="0"
                    :max="sceneStore.preControl.maxDistance / 2" :step="1" label="最小距离" class="ma-2"
                    thumb-label="always"></v-slider>

                <!-- 角度控制 -->
                <v-divider class="my-4"></v-divider>
                <h5 class="text-h5">角度控制</h5>
                <v-chip color="red" class="ma-2">
                    <v-icon left>mdi-angle-acute</v-icon>
                    最小垂直旋转角度: {{ sceneStore.preControl.minPolarAngle }}
                </v-chip>
                <v-chip color="red" class="ma-2">
                    <v-icon left>mdi-angle-obtuse</v-icon>
                    最大垂直旋转角度: {{ sceneStore.preControl.maxPolarAngle }}
                </v-chip>
                <v-chip color="red" class="ma-2">
                    <v-icon left>mdi-arrow-left-right-bold-outline</v-icon>
                    最小水平旋转角度: {{ sceneStore.preControl.minAzimuthAngle }}
                </v-chip>
                <v-chip color="red" class="ma-2">
                    <v-icon left>mdi-arrow-left-right-bold</v-icon>
                    最大水平旋转角度: {{ sceneStore.preControl.maxAzimuthAngle }}
                </v-chip>

                <v-slider v-model="sceneStore.preControl.minPolarAngle" :min="0" :max="Math.PI" :step="0.1"
                    label="最小垂直旋转角度" class="ma-2" thumb-label="always"></v-slider>

                <v-slider v-model="sceneStore.preControl.maxPolarAngle" :min="0" :max="Math.PI" :step="0.1"
                    label="最大垂直旋转角度" class="ma-2" thumb-label="always"></v-slider>

                <!-- 自旋转 -->
                <v-divider class="my-4"></v-divider>
                <h5 class="text-h5">自旋转</h5>
                <v-chip color="purple" class="ma-2">
                    <v-icon left>mdi-autorenew</v-icon>
                    启用自旋转: {{ sceneStore.preControl.autoRotate }}
                </v-chip>
                <v-chip color="purple" class="ma-2">
                    <v-icon left>mdi-speedometer</v-icon>
                    自旋转速度: {{ sceneStore.preControl.autoRotateSpeed }}
                </v-chip>
                <v-slider v-model="sceneStore.preControl.autoRotateSpeed" :min="0.1" :max="20" :step="0.1" label="自旋转速度"
                    class="ma-2" thumb-label="always"></v-slider>

                <div id="OC-btns">
                    <v-container>
                        <v-row>
                            <v-col cols="6">
                                <v-btn class="text-none text-black mb-2" color="red-accent-2 text-h5" size="x-large"
                                    variant="flat" block @click="preOrbitCtrl()">
                                    总开关
                                </v-btn>
                                <v-btn class="text-none text-black" color="red-accent-2 text-h5" size="small"
                                    variant="flat" block @click="backToOffset_pre()">
                                    恢复默认设置
                                </v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn class="text-none text-black mb-2" color="red-accent-1 text-h5" size="x-small"
                                    variant="flat" block @click="preAutoRo()"
                                    :disabled="sceneStore.preControl === null || sceneStore.preControl.enabled === false">
                                    开关 - 自旋转
                                </v-btn>

                                <v-btn class="text-none text-black mb-2" color="red-accent-1 text-h5" size="x-small"
                                    variant="flat" block @click="preSCP()"
                                    :disabled="sceneStore.preControl === null || sceneStore.preControl.enabled === false">
                                    开关 - 屏幕空间平移
                                </v-btn>

                                <v-btn class="text-none text-black mb-2" color="red-accent-1 text-h5" size="x-small"
                                    variant="flat" block @click="preDamping()"
                                    :disabled="sceneStore.preControl === null || sceneStore.preControl.enabled === false">
                                    开关 - 惯性
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-btn class="text-none text-black" color="red-accent-2 text-h5" size="x-small"
                                variant="outlined" block @click="showPreOrbitCtrl()">
                                关闭界面
                            </v-btn>
                        </v-row>
                    </v-container>
                </div>
            </v-sheet>
        </div>

        <!-- 场景 -->
        <div class="scene" v-show="sceneStore.scenes.length !== 0">
            <scene v-show="showPre === false" @finish="animationFinish"></scene>
            <preSceneContainer :showPre="showPre" v-show="showPre === true"></preSceneContainer>
        </div>
        <!-- 添加元素 -->
        <div :class="classDAddE" style="position: absolute; right: -20vw; top: -50vh;" v-show="showAddEContainer">
            <div id="addE-container" ref="addEContainer">
                <addE :showAddEContainer="showAddEContainer"></addE>
            </div>
        </div>
        <!-- 添加关键帧动画菜单 -->
        <transition name="down">
            <v-app-bar theme="dark" v-show="addAnimationChooseObject_UI">
                <v-btn @click="backToEditScene()" variant="outlined" color="primary">返回</v-btn>
                <v-container>
                    <v-row class="mt-3">
                        <v-col cols="3">
                            <v-select clearable label="选择对象" :items="SO_names" v-model="SOnames_choose"
                                no-data-text="场景中暂无对象" menu-icon="mdi-cube-outline" variant="outlined"></v-select>
                        </v-col>
                        <v-col cols="3">
                            <v-text-field v-if="showChooseAnimateName" clearable label="动画名"
                                v-model="newAnimateName"></v-text-field>
                        </v-col>
                        <v-col cols="3">
                            <v-select v-if="showChooseAnimateTracks" clearable label="新轨道类型"
                                :items="['position', 'rotation', 'scale', 'opacity', 'color']"
                                v-model="newAnimationTrackType" variant="outlined">
                                <template #append>
                                    <v-btn @click="addAnimationTrack" color="primary" variant="outlined">添加</v-btn>
                                </template>
                            </v-select>
                        </v-col>
                        <v-col cols="3">
                            <v-btn
                                :icon="sceneStore.tempColtrol?.enabled ? 'mdi-hand-back-left' : 'mdi-hand-back-left-off'"
                                @click="sceneStore.tempColtrol?.enabled ? sceneStore.tempControl_disable() : sceneStore.tempControl_add()">
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
                <v-btn text="清除" size="x-large" @click="sceneStore.clearDrawing()"
                    v-show="sceneStore.drawPoints.length">
                    <template #append>
                        <v-icon size="20px">mdi-delete-circle</v-icon>
                    </template>
                </v-btn>
                <v-text-field v-show="sceneStore.drawPoints.length" v-model="newTrackFirstTime" color="primary"
                    label="关键帧开始时间(ms)" type="number" variant="underlined"></v-text-field>
                <v-text-field v-show="sceneStore.drawPoints.length" v-model="newTrackLastTime" color="primary"
                    label="关键帧结束时间(ms)" type="number" variant="underlined"></v-text-field>
                <v-btn text="保存" size="x-large" @click="saveNewTrack();" v-show="sceneStore.drawPoints.length"
                    :disabled="newTrackFirstTime >= newTrackLastTime || ifPlay" color='primary'></v-btn>
            </v-app-bar>
        </transition>

        <div v-if="showChooseAnimateTracks" style="position: absolute; right: 2%; top: 10%;">
            <v-sheet border rounded>
                <p class="text-h5 mx-10 py-5">新动画轨道列表</p>
                <v-divider></v-divider>
                <v-list class="pa-3">

                    <template v-for="(item, index) in newAnimationTrackArray" :key="index">

                        <v-list-item color="teal-lighten-1" link @click="chooseTrack(item)" :value="index">
                            <v-list-item-title>{{ '#' + (index + 1) + ': ' + item.propertyName }} ,权重：
                                <span style="font-size: 15px;">{{ trackWeights[index].toFixed(1) }}%</span>
                                <v-btn size="x-small" :disabled="TrackToModifier === item || ifPlay" icon="mdi-close"
                                    @click="removeTrack(index)" class="ml-5"></v-btn>
                            </v-list-item-title>
                        </v-list-item>

                        <v-slider v-if="item.keyframes.length" v-model="trackWeights[index]" :max="100"
                            @update:modelValue="adjustWeight(index)" @mousedown="changeIndex = index"
                            :disabled="ifPlay"></v-slider>

                    </template>

                    <v-list-item>
                        <v-btn color="cyan-darken-3" @click="finalizeAnimation_object()"
                            :disabled="!newAnimationTrackArray.length || ifPlay">
                            <template #append>
                                <v-icon icon="mdi-check-decagram" size="22px"></v-icon>
                            </template>
                            新建动画 {{ newAnimateName }}
                        </v-btn>
                        <v-btn :icon="true" color="green" @click="playAnimation()" class="ml-3 mr-2 my-1"
                            :disabled="!newAnimationTrackArray.length || ifPlay" size="x-small">
                            <v-icon icon="mdi-play" size="18px"></v-icon>
                        </v-btn>
                    </v-list-item>
                </v-list>
            </v-sheet>
        </div>
        <!-- 场景切换 -->
        <div v-if="sceneStore.scenes.length > 0" style="z-index: 1; position:absolute; right:2%; bottom:2%;"
            class="d-flex flex-column mx-2">
            <v-btn class="text-h5" @click="showPre_f">{{ (showPre === true) ? '<-编辑' : '->预览' }}</v-btn>
        </div>
        <!-- 修改场景中的参数 -->
        <transition name="fade" mode="out-in">
            <div v-if="showChangeSceneElementsFlag" class="cse">
                <cse></cse>
            </div>
        </transition>
    </v-app>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useScene } from '../../../public/stores/3D/scene'
import scene from './scene.vue';
import preSceneContainer from './preSceneContainer.vue';
// import saveLoadingComponent from './saveLoadingComponent.vue';
import addE from './addE.vue';
import { computed } from 'vue';
import { watchEffect } from 'vue';
import { toRaw } from 'vue';
import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { useAnimation } from '../../../public/stores/3D/animation';
import cse from './cse.vue';
import axios from 'axios';
import getUserName from '../../../methods/getUserName';


// pinia
const sceneStore = useScene();
const animationStore = useAnimation();
// controls de visibilité d'elements
const draw = ref(false);
const showAddEContainer = ref(false);
const addEBorder = ref(false);
const addshowOCBorder = ref(false);
const addshowTLBorder = ref(false);
const showOC = ref(false);
const showTL = ref(false);
const addAnimationChooseObject_UI = ref(false); // 在场景中添加动画关键帧
const showChooseAnimateName = ref(false);
const showChooseAnimateTracks = ref(false);
const showPre = ref(false);
const showPreOC = ref(false);
const showChangeSceneElementsFlag = ref(false);
const saveLoading = ref(false);
const ifSaveError = ref(false);
const ifShowSaveLoading = ref(false);
// refs d'elements
const addEContainer = ref(null);
// clickFunctions
let t = null;
function AddEClick() {
    if (showChangeSceneElementsFlag.value === true) {
        openchangeSceneElements();
    }

    if (t) return;
    classDAddE.value = 'animate__animated ' + (showAddEContainer.value ? 'animate__fadeOutTopRight' : 'animate__bounceInRight');
    if (showAddEContainer.value === false) {
        showAddEContainer.value = true;
    }
    else {
        t = setTimeout(() => {
            showAddEContainer.value = false;
            t = null;
        }, 500);
    }
    addEBorder.value = !addEBorder.value
}

const classDAddE = ref('animate__animated');
// 视角移动管理
const enabled = ref(false);
let t2 = null;
let classShowOC = ref('animate__animated');
function showOrbitCtrl() {
    if (t2) return;
    classShowOC.value = 'animate__animated ' + (showOC.value ? 'animate__bounceOutUp' : 'animate__bounceInDown');
    if (showOC.value === false) {
        showOC.value = true;
    }
    else {
        t2 = setTimeout(() => {
            showOC.value = false;
            t2 = null;
        }, 1000);
    }
    addshowOCBorder.value = !addshowOCBorder.value;
}
let t4 = null;
let classShowPreOC = ref('animate__animated');
function showPreOrbitCtrl() {
    if (t4) return;
    classShowPreOC.value = 'animate__animated ' + (showPreOC.value ? 'animate__bounceOutUp' : 'animate__bounceInDown');
    if (showPreOC.value === false) {
        showPreOC.value = true;
    }
    else {
        t4 = setTimeout(() => {
            showPreOC.value = false;
            t4 = null;
        }, 1000);
    }
}
function orbitCtrl() {
    if (sceneStore.controls === null) {
        sceneStore.orbitCtrl_add();
    }
    enabled.value = !enabled.value;
    sceneStore.setControlsEnabled(enabled.value);
}
function preOrbitCtrl() {
    sceneStore.setPreControlEnabled(!sceneStore.preControl.enabled);
}
const autoRotateEnabled = ref(false);
function autoRo() {
    autoRotateEnabled.value = !autoRotateEnabled.value;
    sceneStore.setAutoRotateEnabled(autoRotateEnabled.value);
}
function preAutoRo() {
    sceneStore.setPreAutoRotateEnabled(!sceneStore.preControl.autoRotate);
}
const screenSpacePanningEnabled = ref(false);
function SCP() {
    screenSpacePanningEnabled.value = !screenSpacePanningEnabled.value;
    sceneStore.setScreenSpacePanningEnabled(screenSpacePanningEnabled.value);
}
function preSCP() {
    sceneStore.setPreScreenSpacePanningEnabled(!sceneStore.preControl.screenSpacePanning);
}
const dampingEnabled = ref(false);
function damping() {
    dampingEnabled.value = !dampingEnabled.value;
    sceneStore.setEnableDamping(dampingEnabled.value);
}
function preDamping() {
    sceneStore.setPreEnableDamping(!sceneStore.preControl.enableDamping);
}
// 保存
const controlsParamsDraft = ref({ ...sceneStore.controlsParams });
function saveControlParams() {
    controlsParamsDraft.value = { ...sceneStore.controlsParams };
    controlsParamsDraft.value.enabled = enabled.value;
    controlsParamsDraft.value.enablePan = enabled.value;
    controlsParamsDraft.value.enableZoom = enabled.value;
    controlsParamsDraft.value.enableRotate = enabled.value;

    controlsParamsDraft.value.autoRotate = autoRotateEnabled.value;

    controlsParamsDraft.value.screenSpacePanning = screenSpacePanningEnabled.value;

    controlsParamsDraft.value.enableDamping = dampingEnabled.value;

    sceneStore.updateControlsParams(controlsParamsDraft.value);
}
// 恢复默认设置
const controlsParamsOffset = ref({ ...sceneStore.controlsParams });
function backToOffset() {
    controlsParamsOffset.value.enabled = enabled.value;
    controlsParamsOffset.value.enablePan = enabled.value;
    controlsParamsOffset.value.enableZoom = enabled.value;
    controlsParamsOffset.value.enableRotate = enabled.value;

    controlsParamsOffset.value.autoRotate = autoRotateEnabled.value;

    controlsParamsOffset.value.screenSpacePanning = screenSpacePanningEnabled.value;

    controlsParamsOffset.value.enableDamping = dampingEnabled.value;

    controlsParamsDraft.value = { ...controlsParamsOffset.value };

    sceneStore.updateControlsParams(controlsParamsOffset.value);
}
function backToOffset_pre() {
    sceneStore.backToOffset_pre();
}

// 关闭所有栏目
function openEtcloseSansCSE() {
    if (draw.value === true) {

        if (showOC.value === true) {
            showOrbitCtrl();
        }
        if (showAddEContainer.value === true) {
            AddEClick();
        }
        if (showPreOC.value === true) {
            showPreOrbitCtrl();
        }
        addEBorder.value = false;
        addshowOCBorder.value = false;
        addshowTLBorder.value = false;
    }
    draw.value = !draw.value;
}
function openEtclose() {
    if (draw.value === true) {
        draw.value = !draw.value;
    }
    if (showOC.value === true) {
        showOrbitCtrl();
    }
    if (showAddEContainer.value === true) {
        AddEClick();
    }
    if (showPreOC.value === true) {
        showPreOrbitCtrl();
    }
    if (showChangeSceneElementsFlag.value === true) {
        openchangeSceneElements();
    }
    addEBorder.value = false;
    addshowOCBorder.value = false;
    addshowTLBorder.value = false;
}

function showPre_f() {
    if (!animationStore.timeline.camera) {
        animationStore.timeline.addCamera(toRaw(sceneStore.cameras[sceneStore.choisiCamera + 1]));
    }
    showPre.value = !showPre.value;
    openEtclose();
}
// ================================================================================
// 修改场景中物体的信息
function openchangeSceneElements() {
    if (showAddEContainer.value === true) {
        AddEClick();
    }
    showChangeSceneElementsFlag.value = !showChangeSceneElementsFlag.value;
    sceneStore.captureImages();
    console.log(sceneStore.graphiques)
}
// ================================================================================


// 添加关键帧动画
function addAnimationChooseObject() {
    draw.value = false;
    sceneStore.saveState();

    if (showOC.value === true) {
        showOrbitCtrl();
    }
    if (showAddEContainer.value === true) {
        AddEClick();
    }
    if (showChangeSceneElementsFlag.value === true) {
        openchangeSceneElements();
    }
    addAnimationChooseObject_UI.value = true;
    // 删除移动器
    sceneStore.orbitCtrl_remove();
    // 开启临时移动器
    sceneStore.tempControl_add();
}

const SOnames_choose = ref(null);
const SO_names = computed(() => {
    if (sceneStore.objects.length === 0) return [];
    return sceneStore.objects.map(o => {
        return '类型：' + o.type + ' , ID：' + o.id;
    });
})

watch(SOnames_choose, () => {
    if (SOnames_choose.value) {
        const id = SOnames_choose.value.split('：')[2];
        const SO = sceneStore.objects.find(o => toRaw(o).id == id);

        if (SO) {
            let { x, y, z } = SO.object3D.position;
            sceneStore.cameraMove({ x: x + 10, y: y + 10, z: z + 20 })
            sceneStore.cameraLookAt({ x: x, y: y, z: z });
            showChooseAnimateName.value = true;
            newAnimateName.value = '';
            SO_position.value = SO.object3D.position.clone();
        }
    }
    else {
        newAnimateName.value = '';
        showChooseAnimateName.value = false;
    }
});
const newAnimateName = ref('');
const newAnimationTrackType = ref(null);
watch(newAnimateName, () => {
    if (newAnimateName.value && newAnimateName.value.length > 0) {
        showChooseAnimateTracks.value = true;
    }
    else {
        newAnimationTrackArray.value = [];
        newAnimationTrackType.value = null;
        showChooseAnimateTracks.value = false;
    }
})
// 创建的关键帧轨道
const newAnimationTrackArray = ref([]);     //新轨道列表
const trackWeights = ref([]);     // 轨道的权重
const changeIndex = ref(0);     // 当前修改的索引

function adjustWeight(changedIndex) {
    if (changedIndex === changeIndex.value) {
        let totalWeight = 0;
        trackWeights.value.forEach((weight) => {
            totalWeight += weight;
        });

        if (totalWeight > 100) {
            let excess = totalWeight - 100;
            // 除了改变的轨道外，每个轨道需要平均减少的权重
            let adjustPerTrack = excess / (trackWeights.value.length - 1);
            let no = []; //不够分的轨道index

            adjust(changedIndex, excess, adjustPerTrack, no)
        }
    }
}
function adjust(index, excess, adjustPerTrack, no) {
    trackWeights.value.forEach((weight, i) => {
        if (i !== index) {
            let flag = false;
            for (let j = 0; j < no.length; j++) {
                if (i === no[j]) {
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                if (weight - adjustPerTrack > 0) {
                    trackWeights.value[i] -= adjustPerTrack;
                    excess -= adjustPerTrack;
                } else {
                    trackWeights.value[i] = 0;
                    excess -= trackWeights.value[i];
                    no.push(i);
                }
            }
        }
    });

    if (excess > 0) {
        adjustPerTrack = excess / (trackWeights.value.length - 1 - no.length);
        adjust(index, excess, adjustPerTrack, no);
    }
    else return;
}

function addAnimationTrack() {
    trackWeights.value.push(0);
    if (newAnimationTrackType.value === 'position') {
        const newTrack = animationStore.createAnimationTrack('position');
        newAnimationTrackArray.value.push(newTrack);
    }
}

function removeTrack(index) {
    newAnimationTrackArray.value.splice(index, 1);
    trackWeights.value.splice(index, 1);
}

// 选中的待修改轨道
const TrackToModifier = ref(null);
watch(TrackToModifier, () => {
    sceneStore.clearDrawingExceptHistory();
    sceneStore.renderFromHistory(TrackToModifier.value);
})
function chooseTrack(item) {
    TrackToModifier.value = item;
    sceneStore.createHelperPlaneForSO(SOnames_choose.value);
    sceneStore.initDrawing();
}
// 关键帧时间范围
const newTrackFirstTime = ref(0);
const newTrackLastTime = ref(1000);
function saveNewTrack() {
    if (TrackToModifier.value.keyframes.length) {
        TrackToModifier.value.keyframes = [];
    }
    sceneStore.saveNewTrack(newTrackFirstTime.value, newTrackLastTime.value, TrackToModifier.value);
    sceneStore.renderFromHistory(TrackToModifier.value);
}
// 确认新建绑定到物体的动画
function ifCanFinalizeAnimation() {
    for (let i = 0; i < newAnimationTrackArray.value.length; i++) {
        if (newAnimationTrackArray.value[i].keyframes.length == 0) {
            return false;
        }
    }
    return true;
}
function finalizeAnimation_object() {
    let flag = ifCanFinalizeAnimation();
    if (!flag) return;

    const id = SOnames_choose.value.split('：')[2];
    const SO = sceneStore.objects.find(o => toRaw(o).id == id);
    sceneStore.finalizeAnimation_object(SO, newAnimateName.value, newAnimationTrackArray.value, trackWeights.value);
    addAnimationChooseObject_UI.value = false;
    SOnames_choose.value = null;
    newAnimationTrackArray.value = [];
    trackWeights.value = [];

    sceneStore.loadState();
}

// 新建关键帧动画，保存后播放
const SO_position = ref(new THREE.Vector3(0, 0, 0));
function playAnimation() {
    for (let i = 0; i < newAnimationTrackArray.value.length; ++i) {
        if (newAnimationTrackArray.value[i].keyframes.length == 0)
            return;
    }

    for (let i = 0; i < trackWeights.value.length; i++) {
        if (trackWeights.value[i] === 0) return;
    }

    if (SOnames_choose.value) {
        const id = SOnames_choose.value.split('：')[2];
        const SO = sceneStore.objects.find(o => toRaw(o).id == id);
        ifPlay.value = true;
        animationStore.playAnimation_temp(SO, newAnimationTrackArray.value, trackWeights.value);
    }
}
const ifPlay = ref(false);
function animationFinish() {
    const id = SOnames_choose.value.split('：')[2];
    const SO = sceneStore.objects.find(o => toRaw(o).id == id);
    //恢复当前SO的位置
    SO.object3D.position.copy(SO_position.value);

    // 停止并删除所有动画动作
    if (animationStore.mixer) {
        animationStore.actions.forEach(action => action.stop());
        animationStore.actions = [];

        animationStore.mixer = null;
        ifPlay.value = false;
    }
}

function backToEditScene() {
    addAnimationChooseObject_UI.value = false;
    SOnames_choose.value = null;
    newAnimationTrackArray.value = [];
    trackWeights.value = [];

    sceneStore.loadState();
}

async function saveWork() {
    saveLoading.value = true;
    animationStore.timeline.convertAnimations();
    const actionsInTimeLine = [];
    animationStore.timeline.timelineObjects.forEach(obj => {
        obj.originalObject.trackAnimations.forEach(action => {
            actionsInTimeLine.push({
                target: obj.id,
                action: action
            });
        })
    })
    if (animationStore.timeline.camera) {
        animationStore.timeline.camera.trackAnimations.forEach(action => {
            actionsInTimeLine.push({
                target: 'camera',
                action: action
            });
        })
    }
    const data = {
        scene: toRaw(sceneStore.scenes[sceneStore.choisiScene]),
        camera1: toRaw(sceneStore.cameras[sceneStore.choisiCamera]),
        camera2: toRaw(sceneStore.cameras[sceneStore.choisiCamera + 1]),
        renderer: toRaw(sceneStore.renderers[sceneStore.choisiRenderer]),
        objects: toRaw(sceneStore.objects),
        textureFiles: toRaw(sceneStore.textureFiles),
        timeline: toRaw(animationStore.timeline),
        actionsInTimeLine: toRaw(actionsInTimeLine),
    }
    const userId = await getUserName();
    axios.post('/api/3D/saveWork', { data: data, userId: userId }).then(res => { saveLoading.value = false; }).catch(err => {
        console.log('保存文件出错, ', err);
        ifSaveError.value = true;
        saveLoading.value = false;
    })
}

watch(saveLoading, (newVal, oldVal) => {
    if (!newVal) {
        setTimeout(() => {
            ifShowSaveLoading.value = false;
        }, 3000);
    } else {
        ifShowSaveLoading.value = true;
    }
})

</script>

<style lang="less" scoped>
.draw-ctrl-btn {
    position: absolute;
    top: 50%;
    right: -57px;
    transform: translateY(-50%);
}

.scene {
    position: absolute;
    width: 100vw;
    height: 100vh;
}

#addE-container {
    background-color: rgb(231, 231, 231);
    height: 200vh;
    width: 55vw;
    transform: rotateZ(-5deg);
    z-index: 10;
}

#AddEIcon,
#showOC,
#showPreOC,
#showTL {
    transition: background-color 0.5s ease;
}

#showOCContainer,
#showPreOCContainer {
    position: absolute;
    left: 20%;
    top: 7%;
    z-index: 10;
}

#OC-btns {
    position: sticky;
    bottom: 0;
}

down-enter-from,
.down-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}

.down-enter-to,
.down-leave-from {
    transform: translateY(0);
    opacity: 1;
}

.down-enter-active,
.down-leave-active {
    transition: transform 1s ease, opacity 1s ease;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.75s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
}

.cse {
    position: fixed;
    top: 2.5vh;
    right: 10px;
    width: 33%;
    height: 95vh;
    background-color: rgb(255, 255, 255);
    backdrop-filter: blur(10px);
    box-shadow: -5px -5px 20px rgba(0, 0, 0, 0.2);
    transform: translateZ(50px);
    border-right: 1px solid rgba(255, 255, 255, 0.75);
    padding: 20px;
    color: #333;
    font-family: 'Arial', sans-serif;
    border-radius: 7%;
    border: 3px solid rgb(255, 170, 0);
    box-shadow: inset 5px 0 10px rgba(0, 0, 0, 0.5);
    overflow-y: auto;
}

#saveLoadingComponent {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
}
</style>