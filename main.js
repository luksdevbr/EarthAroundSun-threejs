import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();

const loader = new THREE.TextureLoader();
const spaceTexture = loader.load("/public/stars.jpg");

spaceTexture.mapping = THREE.EquirectangularReflectionMapping;
spaceTexture.colorSpace = THREE.SRGBColorSpace;

scene.background = spaceTexture;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: false });

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

camera.position.z = 0;

document.body.appendChild(renderer.domElement);

const earthGeometry = new THREE.SphereGeometry(2, 32, 32);

const earthTexture = loader.load("public/earth_daymap.jpg");
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });

const earth = new THREE.Mesh(earthGeometry, earthMaterial);

scene.add(earth);

const moonGeometry = new THREE.SphereGeometry(0.5, 32, 32);

const moonTexture = loader.load("/public/moon.jpg");
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });

const moon = new THREE.Mesh(moonGeometry, moonMaterial);

scene.add(moon);

const ambientLight = new THREE.AmbientLight(0x0000004a); 
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 10**5, 1000);
sunLight.position.set(1, 1, 1);

scene.add(sunLight)

sunLight.castShadow = true;

sunLight.shadow.mapSize.width = 1024; 
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 10000; 

const sunGeometry = new THREE.SphereGeometry(10, 32, 32);

const sunTexture = loader.load("/public/sun.jpg");
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });

const sun = new THREE.Mesh(sunGeometry, sunMaterial);

sun.position.set(1, 1, 1);

scene.add(sun)

const controls = new OrbitControls(camera, renderer.domElement);

controls.enabled = true;
controls.update();


function createOrbit(primary, orbiter, radius, angle, speed, follow=false) {
  angle -= speed;

  orbiter.position.x = primary.position.x + radius * Math.cos(angle);
  orbiter.position.z = primary.position.z + radius * Math.sin(angle);
  orbiter.position.y = primary.position.y;  

  if (follow) {   
    camera.position.x = orbiter.position.x + 10 * Math.cos(angle);
    camera.position.z = orbiter.position.z + 10 * Math.sin(angle);
    camera.position.y = orbiter.position.y + 3; 

    camera.lookAt(orbiter.position)
  }

  return angle;
}

const lunarOrbitRadius = 5;
let lunarOrbitAngle = 0;
const lunarOrbitSpeed = 0.02;

const earthOrbitRadius = 100;
let earthOrbitAngle = 0;
const earthOrbitSpeed = 0.001;

let isPaused = false;

renderer.domElement.addEventListener("mousedown", () => {
  isPaused = true;

  controls.target.set(earth.position.x, earth.position.y, earth.position.z)  
  controls.update();
});

renderer.domElement.addEventListener("mouseup", () => {
  isPaused = false;
});

function animation() {

  if (!isPaused) {
    lunarOrbitAngle = createOrbit(earth, moon, lunarOrbitRadius, lunarOrbitAngle, lunarOrbitSpeed);
    earthOrbitAngle = createOrbit(sun, earth, earthOrbitRadius, earthOrbitAngle, earthOrbitSpeed, true);

    earth.rotation.y += 0.01; 
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animation);
