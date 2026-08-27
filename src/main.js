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

const sunGlowGeo = new THREE.SphereGeometry(70, 32, 32);
const sunGlowMat = new THREE.ShaderMaterial({
    uniforms: {
        c: { value: 0.4 },
        p: { value: 5.0 },
        glowColor: { value: new THREE.Color(0xffdd88) },
    },
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        uniform float c;
        uniform float p;
        varying vec3 vNormal;
        void main() {
            float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
            gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
});
const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
scene.add(sunGlow);


const sunLight = new THREE.PointLight(0xffffff, 3, 0, 0);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0x333344, 0.3);
scene.add(ambientLight);

const planets = [];

const planetData = [
    { name: 'Mercury', size: 8,  distance: 150,  speed: 0.008,  texture: textures.mercury, tilt: 0.03 },
    { name: 'Venus',   size: 14, distance: 220,  speed: 0.006,  texture: textures.venus,   tilt: 3.09 },
    { name: 'Earth',   size: 16, distance: 310,  speed: 0.005,  texture: textures.earth,   tilt: 0.41, hasClouds: true },
    { name: 'Mars',    size: 11, distance: 400,  speed: 0.004,  texture: textures.mars,    tilt: 0.44 },
    { name: 'Jupiter', size: 42, distance: 550,  speed: 0.002,  texture: textures.jupiter, tilt: 0.05 },
    { name: 'Saturn',  size: 36, distance: 720,  speed: 0.0015, texture: textures.saturn,  tilt: 0.47, hasRings: true },
    { name: 'Uranus',  size: 22, distance: 880,  speed: 0.001,  texture: textures.uranus,  tilt: 1.71 },
    { name: 'Neptune', size: 21, distance: 1050, speed: 0.0008, texture: textures.neptune, tilt: 0.49 },
];

planetData.forEach((data) => {
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const geometry = new THREE.SphereGeometry(data.size, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        map: data.texture,
        roughness: 0.8,
        metalness: 0.1,
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.x = data.distance;
    planet.rotation.z = data.tilt;
    planetGroup.add(planet);

    planetGroup.rotation.y = Math.random() * Math.PI * 2;

    planets.push({
        group: planetGroup,
        mesh: planet,
        data: data,
    });
});
    // ============================================
    // EARTH CLOUDS
    // ============================================
    if (data.hasClouds) {
        const cloudGeo = new THREE.SphereGeometry(data.size * 1.02, 64, 64);
        const cloudMat = new THREE.MeshStandardMaterial({
            map: textures.earthClouds,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
        });
        const clouds = new THREE.Mesh(cloudGeo, cloudMat);
        planet.add(clouds);
        planet.userData.clouds = clouds;
    }

   
    if (data.hasRings) {
        const ringGeo = new THREE.RingGeometry(data.size * 1.4, data.size * 2.3, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            map: textures.saturnRing,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
        });
        const rings = new THREE.Mesh(ringGeo, ringMat);
        rings.rotation.x = Math.PI / 2 - 0.3;
        planet.add(rings);
    }
       
    const orbitPoints = [];
    for (let i = 0; i <= 256; i++) {
        const angle = (i / 256) * Math.PI * 2;
        orbitPoints.push(
            new THREE.Vector3(
                Math.cos(angle) * data.distance,
                0,
                Math.sin(angle) * data.distance
            )
        );
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMat = new THREE.LineBasicMaterial({
        color: 0x88aacc,
        transparent: true,
        opacity: 0.4,
    });
    const orbit = new THREE.LineLoop(orbitGeo, orbitMat);
    scene.add(orbit);

let currentStage = 'loading';

function startIntroAnimation() {
    currentStage = 'intro';

    camera.position.set(0, 30, 150);
    camera.lookAt(0, 0, 0);

    const tl = gsap.timeline();

    tl.to(camera.position, {
        x: 0, y: 150, z: 400,
        duration: 5, ease: 'power2.out',
        onUpdate: () => camera.lookAt(0, 0, 0),
    });

    tl.to(camera.position, {
        x: 200, y: 350, z: 1000,
        duration: 12, ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0, 0, 0),
    });

    tl.to(camera.position, {
        x: 300, y: 500, z: 1400,
        duration: 6, ease: 'power2.out',
        onUpdate: () => camera.lookAt(0, 0, 0),
        onComplete: () => {
            currentStage = 'poem';
            showPoem();
            zoomInForPoem();
        }
    });
}

function zoomInForPoem() {
    gsap.to(camera.position, {
        x: 200, y: 300, z: 900,
        duration: 4, ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0, 0, 0),
    });
}

function showPoem() {
    const overlay = document.getElementById('poemOverlay');
    overlay.classList.add('show');

    const lines = document.querySelectorAll('.poem-line');
    lines.forEach((line, i) => {
        gsap.to(line, {
            opacity: 1, 
            y: 0,
            duration: 2, 
            delay: 1 + i * 2,
            ease: 'power2.out',
        });
    });

    setTimeout(() => {
        document.getElementById('scrollInstruction').classList.add('show');
        currentStage = 'scroll-ready';
    }, 12000);
}

const chapterCameraPositions = [
    { x: 200, y: 300, z: 900 },
    { x: 0, y: 400, z: -2000 },
    { x: -500, y: 500, z: -4000 },
    { x: 300, y: 600, z: -6000 },
    { x: -300, y: 400, z: -8000 },
    { x: 500, y: 700, z: -10000 },
    { x: -400, y: 500, z: -12000 },
    { x: 200, y: 800, z: -14000 },
];

let scrollStarted = false;

window.addEventListener('scroll', () => {
    if (currentStage !== 'scroll-ready' && currentStage !== 'exploring') return;

    if (window.scrollY > 50 && !scrollStarted) {
        scrollStarted = true;
        currentStage = 'exploring';
        document.getElementById('scrollInstruction').classList.add('hide');
        document.getElementById('poemOverlay').classList.add('hide');
    }

    if (!scrollStarted) return;

    const chapters = document.querySelectorAll('.chapter');
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    const chaptersStart = windowHeight;
    const chapterHeight = windowHeight;

    const chapterProgress = (scrollY - chaptersStart) / chapterHeight;

    const chapterFloat = Math.max(0, Math.min(7, chapterProgress + 1));
    const chapterInt = Math.floor(chapterFloat);
    const chapterFrac = chapterFloat - chapterInt;

    const fromPos = chapterCameraPositions[Math.min(chapterInt, 7)];
    const toPos = chapterCameraPositions[Math.min(chapterInt + 1, 7)];

    if (fromPos && toPos) {
        const targetX = fromPos.x + (toPos.x - fromPos.x) * chapterFrac;
        const targetY = fromPos.y + (toPos.y - fromPos.y) * chapterFrac;
        const targetZ = fromPos.z + (toPos.z - fromPos.z) * chapterFrac;

        gsap.to(camera.position, {
            x: targetX,
            y: targetY,
            z: targetZ,
            duration: 1.5,
            ease: 'power2.out',
            overwrite: true,
            onUpdate: () => camera.lookAt(0, 0, 0),
        });
    }

    // Chapter card focus/blur system
    chapters.forEach((chapter) => {
        const card = chapter.querySelector('.chapter-card');
        const rect = chapter.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        const cardCenter = rect.top + rect.height / 2;
        const distance = cardCenter - viewportCenter;

        card.classList.remove('focused', 'preview', 'passed');

        if (Math.abs(distance) < window.innerHeight * 0.35) {
            card.classList.add('focused');
        } else if (distance > 0 && distance < window.innerHeight * 1.2) {
            card.classList.add('preview');
        } else if (distance < 0) {
            card.classList.add('passed');
        }
    });
});