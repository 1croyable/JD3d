const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const THREE = require('three');
const config = require('../config/config.js');
const dbConfig1 = config.dbConfig1;
const multer = require('multer');
const axios = require('axios');
const { SplineCurve } = require('three');  // 使用Three.js中的SplineCurve
const { Vector2 } = require('three');  // 使用Three.js中的Vector2

// 配置Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const connection1 = mysql.createConnection(dbConfig1);
connection1.connect(error => {
  if (error) throw error;
});

async function query(query, params) {
  return new Promise((resolve, reject) => {
    connection1.query(query, params, (error, results, fields) => {
      if (error) reject(error);
      resolve(results);
    });
  })
}

router.post('/saveWork', async (req, res) => {
  const { data, userId } = req.body;
  try {
    // 查找用户的现有工作记录
    const existingWork = await query('SELECT * FROM Work WHERE user_id = (SELECT id FROM User WHERE username = ?)', [userId]);

    if (existingWork.length > 0) {
      // 如果存在，则更新现有记录
      await query('UPDATE Work SET data = ?, updated_at = NOW() WHERE user_id = (SELECT id FROM User WHERE username = ?)', [JSON.stringify(data), userId]);
    } else {
      // 如果不存在，则创建新记录
      // 先拿到id
      const user = await query('SELECT id FROM User WHERE username = ?', [userId]);
      await query('INSERT INTO Work (user_id, data, created_at, updated_at) VALUES (?, ?, NOW(), NOW())', [user[0].id, JSON.stringify(data)]);
    }

    res.status(200).json({ message: '工作数据保存成功' });
  } catch (error) {
    console.error('保存工作数据出错:', error);
    res.status(500).json({ message: '保存工作数据出错' });
  }
});

// 暂时用不着
router.post('/exportToJSON', async (req, res) => {
  try {
    const { data } = req.body;
    console.log(data.scene)
    if (!data) {
      return res.status(400).json({ error: '没有数据提供' });
    }

    // 场景和相机数据不需要进一步处理，直接使用 data 中的对象
    const sceneJSON = data.scene.toJSON();
    const cameraJSON = data.camera.toJSON();

    // 渲染器数据
    const rendererSettings = {
      antialias: data.renderer.antialias,
      backgroundColor: data.renderer.backgroundColor
    };

    // 构建 objects 数据
    const objects = data.objects.map(obj => ({
      id: obj.id,
      uuid: obj.object3D.uuid,
      type: obj.object3D.type,
      geometry: obj.object3D.geometry ? obj.object3D.geometry.toJSON() : null,
      material: obj.object3D.material ? obj.object3D.material.toJSON() : null,
      position: {
        x: obj.object3D.position.x,
        y: obj.object3D.position.y,
        z: obj.object3D.position.z
      },
      rotation: {
        x: obj.object3D.rotation.x,
        y: obj.object3D.rotation.y,
        z: obj.object3D.rotation.z
      },
      scale: {
        x: obj.object3D.scale.x,
        y: obj.object3D.scale.y,
        z: obj.object3D.scale.z
      }
    }));

    // 构建 actionsInTimeLine 数据
    const actionsInTimeLine = data.actionsInTimeLine.map(action => ({
      target: action.target,
      animationClip: action.animationClip.toJSON()
    }));

    // 构建最终的 JSON 数据
    const exportData = {
      scene: sceneJSON,
      camera: cameraJSON,
      renderer: rendererSettings,
      objects: objects,
      actionsInTimeLine: actionsInTimeLine
    };

    // 将 JSON 数据转换为字符串
    const jsonData = JSON.stringify(exportData, null, 2);

    // 定义文件路径和名称
    const fileName = `${Date.now()}.json`;
    const exportsDir = path.join(__dirname, '../exports');
    const filePath = path.join(exportsDir, fileName);

    // 确保导出目录存在
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // 写入 JSON 文件
    fs.writeFileSync(filePath, jsonData);

    // 下载文件并删除临时文件
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('发送文件失败', err);
        return res.status(500).json({ error: '下载文件失败' });
      }

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('删除文件失败:', err);
        }
      });
    });
  } catch (error) {
    console.error('服务器内部错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.post('/exportToHTML', async (req, res) => {
  const { jsonData, ifCircle, showcaseMode } = req.body;

  const loopOption = ifCircle ? 'THREE.LoopRepeat' : 'THREE.LoopOnce';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Three.js Animation</title>
  <style>
    body { margin: 0; }
    canvas { display: block; background-color: ${showcaseMode ? 'transparent' : 'white'}; }
  </style>
</head>
<body>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.136.0/examples/js/controls/OrbitControls.js"></script>
  <script>
    const data = JSON.parse(\`${jsonData.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/'/g, '\\\'')}\`);

    const loader = new THREE.ObjectLoader();
    const scene = loader.parse(data.scene);
    const camera = loader.parse(data.camera);

    const mixers = [];
    const clock = new THREE.Clock();
    let elapsedTime = 0;

    data.actionsInTimeLine.forEach(actionData => {
      let target;
      if (actionData.target === 'camera') {
        target = camera;
      } else {
        target = scene.getObjectByProperty('uuid', actionData.target);
      }

      if (target) {
        if (!target.mixer) {
          target.mixer = new THREE.AnimationMixer(target);
          mixers.push(target.mixer);
        }
        const clip = THREE.AnimationClip.parse(actionData.animationClip);
        const action = target.mixer.clipAction(clip);
        action.setLoop(${loopOption});
        action.clampWhenFinished = !${ifCircle};
        action.play();
      }
    });

    const renderer = new THREE.WebGLRenderer({ alpha: ${showcaseMode} });
    renderer.setSize(window.innerWidth, window.innerHeight);
    ${showcaseMode ? 'renderer.shadowMap.enabled = true;' : ''}
    document.body.appendChild(renderer.domElement);

    ${showcaseMode ? `
    // 添加透明的地面
    const planeGeometry = new THREE.PlaneGeometry(400, 400);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -30;
    plane.receiveShadow = true;
    scene.add(plane);

    // 启用场景中所有模型的阴影
    scene.traverse(object => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    // 初始化相机位置和光源设置
    const objects = scene.children.filter(child => child.isMesh);
    if (objects.length === 1) {

      const boundingBox = new THREE.Box3().setFromObject(objects[0]);
      const center = boundingBox.getCenter(new THREE.Vector3());
      const size = boundingBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraZ = Math.abs(maxDim * 1.1);

      camera.position.set(50,50,-50);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.rotateSpeed = 0.5; // 左键旋转的阻尼效果

      // 设置光源
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(center.x + 20, center.y + 40, -center.z - 10);
      light.castShadow = true;
      light.shadow.mapSize.width = 2048;
      light.shadow.mapSize.height = 2048;
      light.shadow.camera.left = -maxDim * 2;
      light.shadow.camera.right = maxDim * 2;
      light.shadow.camera.top = maxDim * 2;
      light.shadow.camera.bottom = -maxDim * 2;
      scene.add(light);
    }
    ` : ''}

    function createRoundedRectGeometry(width, height, depth, radius, smoothness) {
      const shape = new THREE.Shape();
      const eps = 0.00001;
      const radius0 = radius - eps;

      // 四个角的圆角弧线
      shape.absarc(eps, eps, radius0, -Math.PI / 2, -Math.PI, true);
      shape.absarc(eps, height - radius0 * 2, radius0, Math.PI, Math.PI / 2, true);
      shape.absarc(width - radius0 * 2, height - radius0 * 2, radius0, Math.PI / 2, 0, true);
      shape.absarc(width - radius0 * 2, eps, radius0, 0, -Math.PI / 2, true);

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depth,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius0,
        bevelThickness: radius0,
        curveSegments: smoothness
      });

      // 中心化几何体
      geometry.center();
      return geometry;
    }

    function updateGeometry(target, width, height, depth, corner_radius, smoothness) {
      const newGeometry = createRoundedRectGeometry(width, height, depth, corner_radius, smoothness);
      const oldMaterial = target.material;
      const oldPosition = target.position.clone();
      const oldRotation = target.rotation.clone();
      const oldScale = target.scale.clone();

      target.geometry.dispose(); // 释放旧几何体的内存
      target.geometry = newGeometry; // 赋值新几何体
      target.material = oldMaterial; // 保留材质
      target.position.copy(oldPosition); // 恢复位置
      target.rotation.copy(oldRotation); // 恢复旋转
      target.scale.copy(oldScale); // 恢复缩放
    }

    function animate() {
      const delta = clock.getDelta();
      elapsedTime += delta;

      mixers.forEach(mixer => mixer.update(delta));

      // 调用自定义更新函数
      data.uploadCustomUpdates.forEach(updateData => {
        const { uuid, type, from, to, startTime, duration } = updateData;
        const target = scene.getObjectByProperty('uuid', uuid);
        if (target && type === 'corner_radius_animation') {
          const width = target.userData.width || 1;
          const height = target.userData.height || 1;
          const depth = target.userData.depth || 1;
          const smoothness = target.userData.smoothness || 5;

          if (elapsedTime >= startTime && elapsedTime <= startTime + duration) {
            const t = (elapsedTime - startTime) / duration;
            target.userData.corner_radius = from + t * (to - from);
            updateGeometry(target, width, height, depth, target.userData.corner_radius, smoothness);
          } else if (elapsedTime > startTime + duration) {
            target.userData.corner_radius = to;
            updateGeometry(target, width, height, depth, target.userData.corner_radius, smoothness);
          }
        }
      });

      // 如果是模型展示模式，进行自旋转
      if (${showcaseMode}) {
        const objects = scene.children.filter(child => child.isMesh);
        if (objects.length === 1) {
          objects[1].rotation.y += delta * 0.1; // 调整旋转速度
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>
`;

  try {
    res.setHeader('Content-Disposition', 'attachment; filename="export.html"');
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error generating HTML: ', error);
    res.status(500).send('Error generating HTML');
  }
});


router.post('/image2model', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send({ message: 'No file uploaded.' });
  }

  try {
    // 创建Blob对象
    const blob = new Blob([file.buffer], { type: file.mimetype });

    // 创建表单数据
    const formData = new FormData();
    formData.append('file', blob, file.originalname);

    // 使用 Axios 发送带有正确 headers 的请求
    const response = await axios.post('http://localhost:8000/process_image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    const blocks = response.data.blocks;

    console.log('blocks',blocks);

    // 处理从FastAPI返回的数据
    const processedBlocks = blocks.map(block => {
      const points = block.vertices.map(vertex => new Vector2(vertex[0], vertex[1]));
      const curve = new SplineCurve(points);
      const divisions = 1000;  // 增加细分数以提高精度
      const splinePoints = curve.getPoints(divisions).map(p => [p.x, p.y]);

      return {
        color: `rgb(${block.color[0]}, ${block.color[1]}, ${block.color[2]})`,
        vertices: splinePoints,
        relativePosition: block.relative_position,
        isHole: block.is_hole  // 新增字段，标记是否为孔洞
      };
    });

    res.send({
      blocks: processedBlocks,
    });
  } catch (error) {
    console.error('无法解析图片:', error);
    res.status(500).send({ message: '无法解析图片' });
  }
});

















module.exports = router;
