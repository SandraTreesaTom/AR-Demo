import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

let camera, scene, renderer;
let stats, glbModel, dialModel = [], orbitControls, jData, redMaterial, greenMaterial, dialMaterial, blackMaterial;
let planes = [], textMesh = [], box = [], dialLoaded = false, whiteC, blackC, canedit = true;
let grid;
let controls;

function init() {

    const container = document.getElementById('container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(render);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    stats = new Stats();
    container.appendChild(stats.dom);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    // camera.position.set(10, 5, 15);
    camera.position.set(0, 0, 8);

    controls = new OrbitControls(camera, container);
    controls.maxDistance = 9;
    controls.maxPolarAngle = THREE.MathUtils.degToRad(90);
    controls.target.set(0, 0.5, 0);
    controls.enablePan = false;
    controls.update();

    // ORBIT CAMERA CONTROLS
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.mouseButtons = {
        MIDDLE: THREE.MOUSE.ROTATE,
        RIGHT: THREE.MOUSE.PAN
    }
    orbitControls.enableDamping = true
    orbitControls.enablePan = true
    orbitControls.minDistance = 5
    orbitControls.maxDistance = 60
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.05 // prevent camera below ground
    orbitControls.minPolarAngle = Math.PI / 4        // prevent top down view
    orbitControls.update();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    scene.environment = new RGBELoader().load('textures/texture.hdr');
    scene.environment.mapping = THREE.EquirectangularReflectionMapping;
    scene.fog = new THREE.Fog(0x333333, 10, 20);

    grid = new THREE.GridHelper(20, 40, 0xffffff, 0xffffff);
    grid.material.opacity = 0.2;
    grid.material.depthWrite = false;
    grid.material.transparent = true;
    grid.receiveShadow = true;
    // scene.add(grid);

    const groundGeo = new THREE.PlaneGeometry(10000, 10000);
    const groundTexture = new THREE.TextureLoader().load( "Images/land.jpeg" );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 10000, 10000 );
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;
    const groundMat = new THREE.MeshLambertMaterial({ map: groundTexture } );
    groundMat.color.setHSL(0.095, 1, 0.75);

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = 0;
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 1000, 0);
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);


    // const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    // dirLight.color.setHSL(0.1, 1, 0.95);
    // dirLight.position.set(- 1, 1.75, 1);
    // dirLight.position.multiplyScalar(30);
    // scene.add(dirLight);

    // dirLight.castShadow = true;

    // dirLight.shadow.mapSize.width = 2048;
    // dirLight.shadow.mapSize.height = 2048;

    // const d = 10;

    // dirLight.shadow.camera.left = - d;
    // dirLight.shadow.camera.right = d;
    // dirLight.shadow.camera.top = d;
    // dirLight.shadow.camera.bottom = - d;

    // dirLight.shadow.camera.far = 3500;
    // dirLight.shadow.bias = - 0.0001;

    // Model
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('js/Draco/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load('models/house.glb', function (gltf) {
        glbModel = gltf.scene;
        glbModel.scale.set(.1, .1, .1);
        glbModel.position.set(0, -.04, 0);
        glbModel.rotation.set(0, -90, 0);
        scene.add(glbModel);
        glbModel.traverse(function (node) {
            if (node.isMesh || node.isLight) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        })
    });
  
}

init();
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
