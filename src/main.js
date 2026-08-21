import * as THREE from 'three';
import { gsap } from 'gsap';


const canvas = document.getElementById('threeCanvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100000
);
camera.position.set(0, 400, 2500);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

loadingManager.onProgress = (url, loaded, total) => {
    const progress = (loaded / total) * 100;
    document.getElementById('loaderProgress').textContent = `${Math.floor(progress)}%`;
};

loadingManager.onLoad = () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hide');
        startIntroAnimation();
    }, 500);
};

const textures = {
    sun: textureLoader.load('/textures/planets/sun.jpg'),
    mercury: textureLoader.load('/textures/planets/mercury.jpg'),
    venus: textureLoader.load('/textures/planets/venus.jpg'),
    earth: textureLoader.load('/textures/planets/earth.jpg'),
    earthClouds: textureLoader.load('/textures/planets/earth-clouds.jpg'),
    mars: textureLoader.load('/textures/planets/mars.jpg'),
    jupiter: textureLoader.load('/textures/planets/jupiter.jpg'),
    saturn: textureLoader.load('/textures/planets/saturn.jpg'),
    saturnRing: textureLoader.load('/textures/planets/saturn-ring.png'),
    uranus: textureLoader.load('/textures/planets/uranus.jpg'),
    neptune: textureLoader.load('/textures/planets/neptune.jpg'),
    stars: textureLoader.load('/textures/sky/stars.jpg'),
};