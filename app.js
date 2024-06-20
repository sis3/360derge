const container = document.body;
const tooltip = document.querySelector('.tooltip');
let spriteActive = false;

class Scene {
    constructor(image, camera) {
        this.image = image;
        this.points = [];
        this.sprites = [];
        this.scene = null;
        this.sphere = null;
        this.camera = camera;
    }

    createScene(scene) {
        this.scene = scene;
        const geometry = new THREE.SphereGeometry(58, 32, 32);
        const texture = new THREE.TextureLoader().load(this.image);
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        material.transparent = true;
        this.sphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.sphere);
        this.points.forEach(this.addTooltip.bind(this));
    }

    addPoint(point) {
        this.points.push(point);
    }

    addTooltip(point) {
        let spriteMap = new THREE.TextureLoader().load('info.png');
        let spriteMaterial = new THREE.SpriteMaterial({
            map: spriteMap
        });
        let sprite = new THREE.Sprite(spriteMaterial);
        sprite.name = point.name;
        sprite.position.copy(point.position.clone().normalize().multiplyScalar(30));
        sprite.scale.multiplyScalar(2);
        this.scene.add(sprite);
        this.sprites.push(sprite);

        sprite.onClick = () => {
            this.activateScene(point.scene); // Activer la scène cible
        };
    }

    activateScene(nextScene) {
        gsap.to(this.sphere.material, { opacity: 0, duration: 1, onComplete: () => {
            this.scene.remove(this.sphere);
            nextScene.createScene(this.scene); // Créer la nouvelle scène
            nextScene.appear(); // Faire apparaître la nouvelle scène
        }});
        this.sprites.forEach((sprite) => {
            gsap.to(sprite.scale, { x: 0, y: 0, z: 0, duration: 1, onComplete: () => {
                this.scene.remove(sprite);
            }});
        });
    }

    appear() {
        this.sphere.material.opacity = 0;
        gsap.to(this.sphere.material, { opacity: 1, duration: 1 });
        this.sprites.forEach((sprite) => {
            sprite.scale.set(0, 0, 0);
            gsap.to(sprite.scale, { x: 2, y: 2, z: 2, duration: 1 });
        });
    }
}

// Initialize renderer before controls
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Scene & Controls
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.rotateSpeed = 0.2;
controls.enableZoom = true; // Activer le zoom
camera.position.set(-1, 0, 0);
controls.update();

// Create and setup scenes
let s1 = new Scene('meuble.jpg', camera);
let s2 = new Scene('oeil.png', camera);

s1.addPoint({
    position: new THREE.Vector3(48.222637300451076, -5.325561239149551, -11.405184246674265),
    name: 'Entrée',
    scene: s2
});

s2.addPoint({
    position: new THREE.Vector3(18.222637300451076, -5.325561239149551, -11.405184246674265),
    name: 'Sortie',
    scene: s1
});

s1.createScene(scene);
s1.appear();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

const rayCaster = new THREE.Raycaster();

function onClick(e) {
    let mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
    );
    rayCaster.setFromCamera(mouse, camera);
    let intersects = rayCaster.intersectObjects(scene.children);
    intersects.forEach(function (intersect) {
        if (intersect.object.type === 'Sprite') {
            if (intersect.object.onClick) intersect.object.onClick();
        }
    });
}

function onMouseMove(e) {
    let mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
    );
    rayCaster.setFromCamera(mouse, camera);
    let foundSprite = false;
    let intersects = rayCaster.intersectObjects(scene.children);
    intersects.forEach(function (intersect) {
        if (intersect.object.type === 'Sprite') {
            let p = intersect.object.position.clone().project(camera);
            tooltip.style.top = ((-1 * p.y + 1) * window.innerHeight / 2) + 'px';
            tooltip.style.left = ((p.x + 1) * window.innerWidth / 2) + 'px';
            tooltip.classList.add('is-active');
            tooltip.innerHTML = intersect.object.name;
            spriteActive = intersect.object;
            foundSprite = true;
        }
    });
    if (!foundSprite && spriteActive) {
        tooltip.classList.remove('is-active');
        spriteActive = false;
    }

    // Mise à jour des OrbitControls
    controls.update();
}

window.addEventListener('resize', onResize);
container.addEventListener('click', onClick);
container.addEventListener('mousemove', onMouseMove);
