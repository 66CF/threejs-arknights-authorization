let scene, camera, renderer, controls;

// 初始化场景
function init() {
    // 创建场景
    scene = new THREE.Scene();
    
    // 创建渐变背景
    const bgTexture = new THREE.TextureLoader().load(createGradientTexture());
    scene.background = bgTexture;

    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 添加轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404080, 0.5);
    scene.add(ambientLight);

    // 添加主要方向光
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(10, 10, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // 添加填充光
    const fillLight = new THREE.DirectionalLight(0x8844ff, 0.5);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // 添加重点光源
    const spotLight = new THREE.SpotLight(0x4477ff, 1);
    spotLight.position.set(0, 10, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.distance = 200;
    scene.add(spotLight);

    // 添加3D文字
    const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new THREE.TextGeometry('contrail', {
            font: font,
            size: 6,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        });

        // 居中文字
        textGeometry.computeBoundingBox();
        const centerOffset = new THREE.Vector3();
        textGeometry.boundingBox.getCenter(centerOffset).multiplyScalar(-1);
        
        const textMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.copy(centerOffset);
        textMesh.position.z = -20; // 将文字放在更远的位置
        textMesh.position.y = 5;   // 稍微向上调整
        scene.add(textMesh);
    });

    // 加载3D模型
    const modelLoader = new THREE.GLTFLoader();
    modelLoader.load(
        './model.glb',
        function (gltf) {
            scene.add(gltf.scene);
            // 自动调整相机位置以适应模型大小
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.z = maxDim * 2;
            controls.target.copy(center);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% 已加载');
        },
        function (error) {
            console.error('加载模型时发生错误:', error);
        }
    );

    // 添加窗口大小改变的监听器
    window.addEventListener('resize', onWindowResize, false);
}

// 处理窗口大小改变
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// 添加创建渐变纹理的函数
function createGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    
    // 深蓝色到紫色的渐变
    gradient.addColorStop(0, '#1a237e');  // 深蓝色
    gradient.addColorStop(1, '#4a148c');  // 深紫色
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 512);
    
    return canvas.toDataURL();
}

// 修改渲染器设置
renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// 启动应用
init();
animate();