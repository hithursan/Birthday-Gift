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

const starsGeometry = new THREE.SphereGeometry(40000, 64, 64);
const starsMaterial = new THREE.MeshBasicMaterial({
    map: textures.stars,
    side: THREE.BackSide,
});
const starField = new THREE.Mesh(starsGeometry, starsMaterial);
scene.add(starField);

const starsGeo = new THREE.BufferGeometry();
const starsCount = 10000;
const starsPositions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount; i++) {
    const radius = 5000 + Math.random() * 25000;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    starsPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starsPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starsPositions[i * 3 + 2] = radius * Math.cos(phi);
}

starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));

const starsPointMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 5,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
});

const glowStars = new THREE.Points(starsGeo, starsPointMaterial);
scene.add(glowStars);


const sunGeometry = new THREE.SphereGeometry(60, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({
    map: textures.sun,
    color: 0xfff5e0,
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);