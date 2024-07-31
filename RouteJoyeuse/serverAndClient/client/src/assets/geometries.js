import * as SO from '../class/SO'
import { v4 as uuidv4 } from 'uuid';

class geometriesControl {
    constructor() {
        this.creatingObject = null;
    }
    // 素材库
    geometries = [
        { name: '方块', image: '/imgs/前八个几何体图片/立方体.png', onClick: () => this.addCube() },
        { name: '圆角方块', image: '/imgs/前八个几何体图片/圆角立方体.png', onClick: () => this.addRoundedRect() },
        { name: '球体', image: '/imgs/前八个几何体图片/球体.png', onClick: () => this.addSphere() },
        { name: '圆柱体', image: '/imgs/前八个几何体图片/圆柱体.png', onClick: () => this.addCylinder() },
        { name: '圆锥体', image: '/imgs/前八个几何体图片/圆锥体.png', onClick: () => this.addCone() },
        { name: '圆环体', image: '/imgs/前八个几何体图片/圆环体.png', onClick: () => this.addTorus() },
        { name: '正四面体', image: '/imgs/前八个几何体图片/正四面体.png', onClick: () => this.addTetrahedron() },
        { name: '三棱锥', image: '/imgs/前八个几何体图片/三棱锥.png', onClick: () => this.addTriangularPyramid() },
        { name: '五角星', image: '/imgs/几何体图片/五角星.png', onClick: () => this.addStar() },
        { name: '六棱柱', image: '/imgs/几何体图片/六棱柱.png', onClick: () => this.addHexagonalPrism() },
        { name: '五边形', image: '/imgs/几何体图片/五边形.png', onClick: () => this.addPentagon() },
        { name: '椭圆体', image: '/imgs/几何体图片/椭圆体.png', onClick: () => this.addEllipsoid() },
        { name: '十二面体', image: '/imgs/几何体图片/十二面体.png', onClick: () => this.addDodecahedron() },
        { name: '胶囊体', image: '/imgs/几何体图片/胶囊体.png', onClick: () => this.addCapsule() },
        { name: '多面体', image: '/imgs/几何体图片/多面体.png', onClick: () => this.addPolyhedron() },
        { name: '环面结', image: '/imgs/几何体图片/环面结.png', onClick: () => this.addTorusKnot() },
        { name: '二十面体', image: '/imgs/几何体图片/二十面体.png', onClick: () => this.addIcosahedron() },
        { name: '八面体', image: '/imgs/几何体图片/八面体.png', onClick: () => this.addOctahedron() },
        { name: '平面', image: '/imgs/几何体图片/平面.png', onClick: () => this.addPlane() },
        { name: '圆形', image: '/imgs/几何体图片/圆形.png', onClick: () => this.addCircle() },
        { name: '环形', image: '/imgs/几何体图片/环形.png', onClick: () => this.addRing() },
        { name: '台阶', image: '/imgs/几何体图片/台阶.png', onClick: () => this.addStair() },
        { name: '半砖', image: '/imgs/几何体图片/半砖.png', onClick: () => this.addHalfBrick() },
        { name: '栅栏', image: '/imgs/几何体图片/栅栏.png', onClick: () => this.addFence() },
        { name: '拱门', image: '/imgs/几何体图片/拱门.png', onClick: () => this.addArch() },
        { name: '桥梁', image: '/imgs/几何体图片/桥梁.png', onClick: () => this.addBridge() },
        { name: '圆形台阶', image: '/imgs/几何体图片/圆形台阶.png', onClick: () => this.addCircularStair() },
        { name: '梯形平台', image: '/imgs/几何体图片/梯形平台.png', onClick: () => this.addTrapezoidalPlatform() },
        { name: '围墙', image: '/imgs/几何体图片/围墙.png', onClick: () => this.addWall() },
        { name: '柱子', image: '/imgs/几何体图片/柱子.png', onClick: () => this.addColumn() },
        { name: '十字架', image: '/imgs/几何体图片/十字架.png', onClick: () => this.addCross() },
        { name: '二次函数曲面', image: '/imgs/几何体图片/二次函数曲面.png', onClick: () => this.addQuadraticSurface() },
        { name: '三次函数曲面', image: '/imgs/几何体图片/三次函数曲面.png', onClick: () => this.addCubicSurface() },
        { name: '正弦曲面', image: '/imgs/几何体图片/正弦曲面.png', onClick: () => this.addSinSurface() },
        { name: '余弦曲面', image: '/imgs/几何体图片/余弦曲面.png', onClick: () => this.addCosSurface() },
        { name: '双曲抛物面', image: '/imgs/几何体图片/双曲抛物面.png', onClick: () => this.addHyperbolicParaboloid() },
        { name: '椭圆锥曲面', image: '/imgs/几何体图片/椭圆锥曲面.png', onClick: () => this.addEllipticCone() },
        { name: '双曲旋转曲面', image: '/imgs/几何体图片/双曲旋转曲面.png', onClick: () => this.addHyperboloid() },
        { name: '对数螺旋面', image: '/imgs/几何体图片/对数螺旋面.png', onClick: () => this.addLogSpiral() },
        { name: '正弦旋转面', image: '/imgs/几何体图片/正弦旋转面.png', onClick: () => this.addSinWave() },
        { name: '余弦旋转面', image: '/imgs/几何体图片/余弦旋转面.png', onClick: () => this.addCosWave() },
        { name: '截锥体', image: '/imgs/几何体图片/截锥体.png', onClick: () => this.addFrustum() },
        { name: '圆台', image: '/imgs/几何体图片/圆台.png', onClick: () => this.addTruncatedCone() },
        { name: '双锥体', image: '/imgs/几何体图片/双锥体.png', onClick: () => this.addBicone() },
        { name: '棱柱', image: '/imgs/几何体图片/棱柱.png', onClick: () => this.addPrism() },
        { name: '双棱锥', image: '/imgs/几何体图片/双棱锥.png', onClick: () => this.addDipyramid() },
        { name: '斜方体', image: '/imgs/几何体图片/斜方体.png', onClick: () => this.addRhomboid() },
        { name: '楔形体', image: '/imgs/几何体图片/楔形体.png', onClick: () => this.addWedge() },
        { name: '抛物柱', image: '/imgs/几何体图片/抛物柱.png', onClick: () => this.addParabolicCylinder() },
        { name: '球面带', image: '/imgs/几何体图片/球面带.png', onClick: () => this.addSphericalCap() }
    ];


    // 添加几何体函数
    addCube() {
        const cube = new SO.CubeObject(uuidv4());
        this.creatingObject = cube;
    }

    addRoundedRect() {
        const rect = new SO.RoundedRectObject(uuidv4());
        this.creatingObject = rect;
    }

    addSphere() {
        const sphere = new SO.SphereObject(uuidv4());
        this.creatingObject = sphere;
    }

    addCylinder() {
        const cylinder = new SO.CylinderObject(uuidv4());
        this.creatingObject = cylinder;
    }

    addCone() {
        const cone = new SO.ConeObject(uuidv4());
        this.creatingObject = cone;
    }

    addTorus() {
        const torus = new SO.TorusObject(uuidv4());
        this.creatingObject = torus;
    }

    addTetrahedron() {
        const tetrahedron = new SO.TetrahedronObject(uuidv4());
        this.creatingObject = tetrahedron;
    }

    addTriangularPyramid() {
        const pyramid = new SO.TriangularPyramidObject(uuidv4());
        this.creatingObject = pyramid;
    }

    // 添加几何体函数
    addStar() {
        const star = new SO.StarObject(uuidv4());
        this.creatingObject = star;
    }

    addHexagonalPrism() {
        const hexagonalPrism = new SO.HexagonalPrismObject(uuidv4());
        this.creatingObject = hexagonalPrism;
    }

    addPentagon() {
        const pentagon = new SO.PentagonObject(uuidv4());
        this.creatingObject = pentagon;
    }

    addEllipsoid() {
        const ellipsoid = new SO.EllipsoidObject(uuidv4());
        this.creatingObject = ellipsoid;
    }

    addDodecahedron() {
        const dodecahedron = new SO.DodecahedronObject(uuidv4());
        this.creatingObject = dodecahedron;
    }

    addCapsule() {
        const capsule = new SO.CapsuleObject(uuidv4());
        this.creatingObject = capsule;
    }

    addPolyhedron() {
        const polyhedron = new SO.PolyhedronObject(uuidv4());
        this.creatingObject = polyhedron;
    }

    addTorusKnot() {
        const torusKnot = new SO.TorusKnotObject(uuidv4());
        this.creatingObject = torusKnot;
    }

    addIcosahedron() {
        const icosahedron = new SO.IcosahedronObject(uuidv4());
        this.creatingObject = icosahedron;
    }

    addOctahedron() {
        const octahedron = new SO.OctahedronObject(uuidv4());
        this.creatingObject = octahedron;
    }

    addPlane() {
        const plane = new SO.PlaneObject(uuidv4());
        this.creatingObject = plane;
    }

    addCircle() {
        const circle = new SO.CircleObject(uuidv4());
        this.creatingObject = circle;
    }

    addRing() {
        const ring = new SO.RingObject(uuidv4());
        this.creatingObject = ring;
    }

    addStair() {
        const stair = new SO.StairObject(uuidv4());
        this.creatingObject = stair;
    }

    addHalfBrick() {
        const halfBrick = new SO.HalfBrickObject(uuidv4());
        this.creatingObject = halfBrick;
    }

    addFence() {
        const fence = new SO.FenceObject(uuidv4());
        this.creatingObject = fence;
    }

    addArch() {
        const arch = new SO.ArchObject(uuidv4());
        this.creatingObject = arch;
    }

    addBridge() {
        const bridge = new SO.BridgeObject(uuidv4());
        this.creatingObject = bridge;
    }

    addCircularStair() {
        const circularStair = new SO.CircularStairObject(uuidv4());
        this.creatingObject = circularStair;
    }

    addTrapezoidalPlatform() {
        const trapezoidalPlatform = new SO.TrapezoidalPlatformObject(uuidv4());
        this.creatingObject = trapezoidalPlatform;
    }

    addWall() {
        const wall = new SO.WallObject(uuidv4());
        this.creatingObject = wall;
    }

    addColumn() {
        const column = new SO.ColumnObject(uuidv4());
        this.creatingObject = column;
    }

    addCross() {
        const cross = new SO.CrossObject(uuidv4());
        this.creatingObject = cross;
    }

    addQuadraticSurface() {
        const quadraticSurface = new SO.QuadraticSurfaceObject(uuidv4());
        this.creatingObject = quadraticSurface;
    }

    addCubicSurface() {
        const cubicSurface = new SO.CubicSurfaceObject(uuidv4());
        this.creatingObject = cubicSurface;
    }

    addSinSurface() {
        const sinSurface = new SO.SinSurfaceObject(uuidv4());
        this.creatingObject = sinSurface;
    }

    addCosSurface() {
        const cosSurface = new SO.CosSurfaceObject(uuidv4());
        this.creatingObject = cosSurface;
    }

    addHyperbolicParaboloid() {
        const hyperbolicParaboloid = new SO.HyperbolicParaboloidObject(uuidv4());
        this.creatingObject = hyperbolicParaboloid;
    }

    addEllipticCone() {
        const ellipticCone = new SO.EllipticConeObject(uuidv4());
        this.creatingObject = ellipticCone;
    }

    addHyperboloid() {
        const hyperboloid = new SO.HyperboloidObject(uuidv4());
        this.creatingObject = hyperboloid;
    }

    addLogSpiral() {
        const logSpiral = new SO.LogSpiralObject(uuidv4());
        this.creatingObject = logSpiral;
    }

    addSinWave() {
        const sinWave = new SO.SinWaveObject(uuidv4());
        this.creatingObject = sinWave;
    }

    addCosWave() {
        const cosWave = new SO.CosWaveObject(uuidv4());
        this.creatingObject = cosWave;
    }

    addFrustum() {
        const frustum = new SO.FrustumObject(uuidv4());
        this.creatingObject = frustum;
    }

    addTruncatedCone() {
        const truncatedCone = new SO.TruncatedConeObject(uuidv4());
        this.creatingObject = truncatedCone;
    }

    addBicone() {
        const bicone = new SO.BiconeObject(uuidv4());
        this.creatingObject = bicone;
    }

    addPrism() {
        const prism = new SO.PrismObject(uuidv4());
        this.creatingObject = prism;
    }

    addDipyramid() {
        const dipyramid = new SO.DipyramidObject(uuidv4());
        this.creatingObject = dipyramid;
    }

    addRhomboid() {
        const rhomboid = new SO.RhomboidObject(uuidv4());
        this.creatingObject = rhomboid;
    }

    addWedge() {
        const wedge = new SO.WedgeObject(uuidv4());
        this.creatingObject = wedge;
    }

    addParabolicCylinder() {
        const parabolicCylinder = new SO.ParabolicCylinderObject(uuidv4());
        this.creatingObject = parabolicCylinder;
    }

    addSphericalCap() {
        const sphericalCap = new SO.SphericalCapObject(uuidv4());
        this.creatingObject = sphericalCap;
    }

}

export default geometriesControl;