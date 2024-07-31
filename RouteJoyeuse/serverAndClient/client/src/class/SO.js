import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { toRaw } from 'vue';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';


// 基类 SceneObject
class SceneObject {
    constructor(id) {
        this.id = id;   //每一个物体要有自己的id
        this.name = '';    //名字
        this.animations = [];   //每一个物体都有处理好的threejs动画
        this.trackAnimations = [];  //表示该实例的轨道动画，只有动画参数，暂未处理
        this.object3D = null;  //每一个物体都有对应的threejs对象
        this.fatherSceneIndex = [];  //该物体存在于哪（些）个场景中
    }

    addToScene(scene) {
        scene.add(toRaw(this.object3D));
    }

    removeFromScene(scene) {
        scene.remove(toRaw(this.object3D));
    }
}

// 方块类 CubeObject
class CubeObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
        });
        return new THREE.Mesh(geometry, material);
    }
}

// 圆角矩形体类 RoundedRectObject
class RoundedRectObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = this.createRoundedRectGeometry(1, 1, 1, 0.2, 5);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
        });
        return new THREE.Mesh(geometry, material);
    }

    createRoundedRectGeometry(width, height, depth, radius, smoothness) {
        const shape = new THREE.Shape();
        const eps = 0.00001;
        const radius0 = radius - eps;

        shape.absarc(eps, eps, radius0, -Math.PI / 2, -Math.PI, true);
        shape.absarc(eps, height - radius * 2, radius0, Math.PI, Math.PI / 2, true);
        shape.absarc(width - radius * 2, height - radius * 2, radius0, Math.PI / 2, 0, true);
        shape.absarc(width - radius * 2, eps, radius0, 0, -Math.PI / 2, true);

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: depth,
            bevelEnabled: true,
            bevelSegments: smoothness * 2,
            steps: 1,
            bevelSize: radius0,
            bevelThickness: radius0,
            curveSegments: smoothness,
        });

        geometry.center();
        return geometry;
    }
}

// 球体类 SphereObject
class SphereObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 圆柱体类 CylinderObject
class CylinderObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 圆锥体类 ConeObject
class ConeObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.ConeGeometry(1, 2, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 圆环体类 TorusObject
class TorusObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 正四面体类 TetrahedronObject
class TetrahedronObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.TetrahedronGeometry(1, 0);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 三棱锥体类 TriangularPyramidObject
class TriangularPyramidObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.ConeGeometry(1, 1, 3);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 五角星体类 StarObject
class StarObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const shape = new THREE.Shape();
        const outerRadius = 1;
        const innerRadius = 0.5;
        const numPoints = 5;

        for (let i = 0; i < numPoints * 2; i++) {
            const angle = (i / (numPoints * 2)) * Math.PI * 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        shape.closePath();

        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 });
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 六棱柱类 HexagonalPrismObject
class HexagonalPrismObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const shape = new THREE.Shape();
        const radius = 1;

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        shape.closePath();

        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: false });
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 五边形体类 PentagonObject
class PentagonObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const shape = new THREE.Shape();
        const radius = 1;

        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        shape.closePath();

        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false });
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 椭圆体类 EllipsoidObject
class EllipsoidObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        geometry.scale(1, 1.5, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 十二面体类
class DodecahedronObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.DodecahedronGeometry(1);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 胶囊体类
class CapsuleObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.CapsuleGeometry(1, 1, 4, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 多面体类
class PolyhedronObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        // 使用柏拉图体之一的顶点和面来初始化几何体
        const vertices = [
            1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1,
            1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, -1
        ];
        const indices = [
            2, 1, 0, 0, 3, 2, 0, 1, 5, 5, 4, 0,
            1, 6, 5, 6, 7, 5, 7, 4, 5, 4, 3, 0,
            6, 1, 2, 2, 3, 4, 2, 7, 6, 7, 2, 3
        ];
        const geometry = new THREE.PolyhedronGeometry(vertices, indices, 1, 0);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}


// 环面节类
class TorusKnotObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}


// 二十面体类
class IcosahedronObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.IcosahedronGeometry(1);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 八面体类
class OctahedronObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.OctahedronGeometry(1);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 平面类
class PlaneObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.DoubleSide });
        return new THREE.Mesh(geometry, material);
    }
}

// 圆形类
class CircleObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.CircleGeometry(1, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.DoubleSide });
        return new THREE.Mesh(geometry, material);
    }
}

// 环形类
class RingObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.RingGeometry(0.5, 1, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.DoubleSide });
        return new THREE.Mesh(geometry, material);
    }
}

// 台阶
class StairObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const group = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.BoxGeometry(1, 0.5, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
            const step = new THREE.Mesh(geometry, material);
            step.position.set(0, 0.25 + i * 0.5, i);
            group.add(step);
        }
        return group;
    }
}

// 半砖
class HalfBrickObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.BoxGeometry(1, 0.5, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 栅栏
class FenceObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const group = new THREE.Group();
        const postGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
        const postMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        for (let i = 0; i < 5; i++) {
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.set(i * 0.5, 0.5, 0);
            group.add(post);
        }
        const railGeometry = new THREE.BoxGeometry(2, 0.1, 0.1);
        const rail = new THREE.Mesh(railGeometry, postMaterial);
        rail.position.set(1, 0.75, 0);
        group.add(rail);
        return group;
    }
}

// 拱门
class ArchObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, 1);
        shape.absarc(0.5, 1, 0.5, Math.PI, 0, false);
        shape.lineTo(1, 0);
        shape.lineTo(0, 0);
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 桥梁
class BridgeObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const group = new THREE.Group();
        const plankGeometry = new THREE.BoxGeometry(1, 0.1, 4);
        const plankMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        for (let i = 0; i < 3; i++) {
            const plank = new THREE.Mesh(plankGeometry, plankMaterial);
            plank.position.set(0, 0, i * 1.5);
            group.add(plank);
        }
        return group;
    }
}

// 圆形台阶
class CircularStairObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const group = new THREE.Group();
        for (let i = 0; i < 10; i++) {
            const geometry = new THREE.BoxGeometry(1, 0.2, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
            const step = new THREE.Mesh(geometry, material);
            step.position.set(Math.cos(i * Math.PI / 5), 0.1 + i * 0.2, Math.sin(i * Math.PI / 5));
            step.rotation.y = i * Math.PI / 5;
            group.add(step);
        }
        return group;
    }
}

// 梯形平台
class TrapezoidalPlatformObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const shape = new THREE.Shape();
        shape.moveTo(-1, -0.5);
        shape.lineTo(1, -0.5);
        shape.lineTo(0.5, 0.5);
        shape.lineTo(-0.5, 0.5);
        shape.lineTo(-1, -0.5);
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 围墙
class WallObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.BoxGeometry(5, 2, 0.1);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 柱子
class ColumnObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 十字架
class CrossObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const group = new THREE.Group();
        const verticalGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
        const horizontalGeometry = new THREE.BoxGeometry(1, 0.2, 0.2);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        const vertical = new THREE.Mesh(verticalGeometry, material);
        const horizontal = new THREE.Mesh(horizontalGeometry, material);
        horizontal.position.set(0, 0.5, 0);
        group.add(vertical);
        group.add(horizontal);
        return group;
    }
}

// 二次函数曲面
class QuadraticSurfaceObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new ParametricGeometry((u, v, target) => {
            const x = u * 20 - 10;
            const y = v * 20 - 10;
            const z = x * x + y * y;
            target.set(x, y, z);
        }, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 三次函数曲面
class CubicSurfaceObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new ParametricGeometry((u, v, target) => {
            const x = u * 20 - 10;
            const y = v * 20 - 10;
            const z = x * x * x - 3 * x * y * y;
            target.set(x, y, z);
        }, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 正弦曲面
class SinSurfaceObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new ParametricGeometry((u, v, target) => {
            const x = u * 20 - 10;
            const y = v * 20 - 10;
            const z = Math.sin(x);
            target.set(x, y, z);
        }, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 余弦曲面
class CosSurfaceObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new ParametricGeometry((u, v, target) => {
            const x = u * 20 - 10;
            const y = v * 20 - 10;
            const z = Math.cos(x);
            target.set(x, y, z);
        }, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 双曲抛物面
class HyperbolicParaboloidObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new ParametricGeometry((u, v, target) => {
            const x = u * 20 - 10;
            const y = v * 20 - 10;
            const z = x * x - y * y;
            target.set(x, y, z);
        }, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 椭圆锥曲面
class EllipticConeObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new ParametricGeometry((u, v, target) => {
            const x = u * 20 - 10;
            const y = v * 20 - 10;
            const z = Math.sqrt(x * x + y * y);
            target.set(x, y, z);
        }, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 双曲旋转曲面
class HyperboloidObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new ParametricGeometry((u, v, target) => {
            const x = u * 20 - 10;
            const y = v * 20 - 10;
            const z = Math.sqrt(x * x - y * y);
            target.set(x, y, z);
        }, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 对数螺旋面
class LogSpiralObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new ParametricGeometry((u, v, target) => {
            const theta = u * 2 * Math.PI;
            const r = Math.exp(0.1 * theta);
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            const z = v * 20 - 10;
            target.set(x, y, z);
        }, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 正弦旋转面
class SinWaveObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new ParametricGeometry((u, v, target) => {
            const r = Math.sqrt(u * u + v * v);
            const theta = Math.atan2(v, u);
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            const z = Math.sin(r);
            target.set(x, y, z);
        }, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 余弦旋转面
class CosWaveObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new ParametricGeometry((u, v, target) => {
            const r = Math.sqrt(u * u + v * v);
            const theta = Math.atan2(v, u);
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            const z = Math.cos(r);
            target.set(x, y, z);
        }, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 截锥体
class FrustumObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.CylinderGeometry(1, 0.5, 2, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 圆台
class TruncatedConeObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.CylinderGeometry(1, 0.5, 2, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 双锥体
class BiconeObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const group = new THREE.Group();
        const geometry = new THREE.ConeGeometry(1, 2, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        const cone1 = new THREE.Mesh(geometry, material);
        const cone2 = new THREE.Mesh(geometry, material);
        cone2.rotation.x = Math.PI;
        cone2.position.y = -2;
        group.add(cone1);
        group.add(cone2);
        return group;
    }
}

// 棱柱
class PrismObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(1, 0);
        shape.lineTo(0.5, 1);
        shape.lineTo(0, 0);
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 双棱锥
class DipyramidObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.OctahedronGeometry(1);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 斜方体
class RhomboidObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        geometry.scale(1, 1.5, 0.5);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 楔形体
class WedgeObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const shape = new THREE.Shape();
        shape.moveTo(-1, -1);
        shape.lineTo(1, -1);
        shape.lineTo(0, 1);
        shape.lineTo(-1, -1);
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 抛物柱
class ParabolicCylinderObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.ParametricGeometry((u, v, target) => {
            const x = u * 20 - 10;
            const z = v * 20 - 10;
            const y = x * x;
            target.set(x, y, z);
        }, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 球面带
class SphericalCapObject extends SceneObject {
    constructor(id) {
        super(id);
        this.object3D = this.initObject3D();
    }

    initObject3D() {
        const geometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
}

// 模型类 ModelObject
class ModelObject extends SceneObject {
    constructor(id, modelUrl) {
        super(id, 'model');
        this.modelUrl = modelUrl;
        this.loader = new GLTFLoader();
        this.object3D = null;
        this.gltf = null;
        this.modifier = null;
    }

    // 加载模型
    loadModel(callback = () => { }, onProgress = () => { }, onError = (error) => {
        console.error('加载模型出错', error);
    }) {
        return new Promise((resolve, reject) => {
            this.loader.load(this.modelUrl, (gltf) => {
                this.object3D = gltf.scene;
                this.modifier = {
                    position: this.object3D.position,
                    rotation: this.object3D.rotation,
                    scale: this.object3D.scale,
                }
                this.gltf = gltf;

                // 解析模型自带的动画，并截取有效部分
                const animations = gltf.animations.map((clip) => {
                    try {
                        // 找到最大的时间
                        clip.tracks.forEach(track => {
                            const firstTime = track.times[0];
                            track.times = track.times.map(time => time - firstTime);
                        });
                        // 找到最大的时间
                        let duration = 0;
                        clip.tracks.forEach(track => {
                            const trackDuration = track.times[track.times.length - 1];
                            if (trackDuration > duration) {
                                duration = trackDuration;
                            }
                        });
                        clip.duration = duration;
                        return clip;
                    } catch (e) {
                        console.error(`创建动画失败: ${clip.name}:`, e);
                        return null;
                    }
                }).filter(action => action !== null);

                // 将动画数据存储到模型对象
                this.animations = animations;
                console.log(animations)

                resolve({
                    id: this.id,
                    animations: this.animations
                });
            }, onProgress, () => { onError(); reject(); })
        });
    }
}

// 文本类 TextObject
class TextObject extends SceneObject {
    constructor(id, text) {
        super(id, 'text');
        this.text = text;
        this.object3D = new THREE.Group();
        this.loader = new FontLoader();
        this.bevelEnabled = true;
        this.depth = 0.4;
        this.size = 14;
        this.hover = 6;
        this.curveSegments = 0.8;
        this.bevelThickness = 0.4;
        this.bevelSize = 0.3;
        this.color = 0xffffff;
        this.modifier = {
            position: this.object3D.position,
            rotation: this.object3D.rotation,
            scale: this.object3D.scale,
        };
    }

    createText(font) {
        const textGeo = new TextGeometry(this.text, {
            font: font,
            size: this.size,
            height: this.depth,
            curveSegments: this.curveSegments,
            bevelThickness: this.bevelThickness,
            bevelSize: this.bevelSize,
            bevelEnabled: this.bevelEnabled,
        });

        textGeo.computeBoundingBox();

        const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

        const materials = [
            new THREE.MeshPhongMaterial({ color: this.color, flatShading: true }), // front
            new THREE.MeshPhongMaterial({ color: this.color }) // side
        ];

        const textMesh = new THREE.Mesh(textGeo, materials);

        textMesh.position.x = centerOffset;
        textMesh.position.y = this.hover;
        textMesh.position.z = 0;

        textMesh.rotation.x = 0;
        textMesh.rotation.y = Math.PI * 2;

        this.object3D.add(textMesh);
    }

    // 加载字体并创建mesh
    loadFont() {
        return new Promise((resolve, reject) => {
            this.loader.load('../fonts/白鸽天行体.json', (font) => {
                this.createText(font);
                resolve(this.object3D);
            }, undefined, reject);
        });
    }

    // 更新文字几何体
    updateText() {
        this.object3D.clear(); // 清除现有的子对象
        this.loadFont(); // 重新加载字体并创建文本
    }
}

class GroupObject extends SceneObject {
    constructor(id, children, source) {
        super(id, 'group');
        this.source = source;
        this.object3D = new THREE.Group();
        this.modifier = {
            position: this.object3D.position,
            rotation: this.object3D.rotation,
            scale: this.object3D.scale,
            visible: true,
        };
    }

    // 添加子对象
    add(object) {
        this.object3D.add(object);
    }
}

export {
    CubeObject,
    RoundedRectObject,
    SphereObject,
    CylinderObject,
    ConeObject,
    TorusObject,
    TetrahedronObject,
    TriangularPyramidObject,
    StarObject,
    HexagonalPrismObject,
    PentagonObject,
    EllipsoidObject,
    DodecahedronObject,
    CapsuleObject,
    PolyhedronObject,
    TorusKnotObject,
    IcosahedronObject,
    OctahedronObject,
    PlaneObject,
    CircleObject,
    RingObject,
    StairObject,
    HalfBrickObject,
    FenceObject,
    ArchObject,
    BridgeObject,
    CircularStairObject,
    TrapezoidalPlatformObject,
    WallObject,
    ColumnObject,
    CrossObject,
    QuadraticSurfaceObject,
    CubicSurfaceObject,
    SinSurfaceObject,
    CosSurfaceObject,
    HyperbolicParaboloidObject,
    EllipticConeObject,
    HyperboloidObject,
    LogSpiralObject,
    SinWaveObject,
    CosWaveObject,
    FrustumObject,
    TruncatedConeObject,
    BiconeObject,
    PrismObject,
    DipyramidObject,
    RhomboidObject,
    WedgeObject,
    ParabolicCylinderObject,
    SphericalCapObject,
    ModelObject,
    TextObject,
    GroupObject
};

