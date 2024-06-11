const scene = new THREE.scene
const camera =new THREE.perspectivecamera(75,window.innerWidth /window.innerHeightnerHeigh, 0.1,200 );
const controls =new THREE.orbicontrols(camera)
controls.rotatespeed =0.2
controls.enablezoom =false
controls.Autorotate =true
camera.position.set(1,0,0)
controls.update()
const grometry = new THREE. SahereGeomctrx( 50, 32, 32 )
const textureloader  =new THBEE.Textureloader()
const texture =textureloader.load('360.jpg')
texture.wzaps = THREE.RepeatWrapping
texture.repeat.x = -1
const material = new IHREE.MeshBisirMaterial( {
    map:texture,
    side:THREE.Doubleside
    } )
const sphere   = new IHREE.Mesh( geometry, material );
scene.add( sphere )

const renderer=new THREE.renderer();
renderer.setzize(window.innerHeight,window.innerWidth)
document.body.appendChild(renderer.domElement)

function animate(){
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene,camera);
}
animate()

function onRezize(){
    renderersetsize(window.innerHeight,window.innerHeight)
    camera.aspect =window.innerHeight /window.innerHeight
    camera.updateProjectionMatrix()

}
windowaddEventListener('resize',onresize)