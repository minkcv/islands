var keysDown = [];
var keys = { up: 38, down: 40, right: 39, left: 37, a: 65, s: 83, d: 68, w: 87 }
addEventListener("keydown", function(e) {
    e.preventDefault();
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function(e) {
    e.preventDefault();
    delete keysDown[e.keyCode];
}, false);

var threediv = document.getElementById('threediv');
var width = threediv.clientWidth - 1;
var height = threediv.clientHeight - 20;

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x4286f4);
var scale = 16;
var camera = new THREE.OrthographicCamera(width / -scale, width / scale, height / scale, height / -scale, 0, 4000);
camera.position.z = 10;
camera.position.y = 15;
camera.rotation.x = -Math.PI / 4.0;
var rotation = 0;
var xPos = 0;
var zPos = 0;
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
threediv.appendChild(renderer.domElement);

var light = new THREE.DirectionalLight( 0xffffff, 1.0 );
light.position.set(1, 3, 2).normalize();
scene.add( light );
scene.add( light.target );

var grid = new THREE.GridHelper(50, 10, 0x000000, 0x000000);
scene.add(grid);

var geometry = new THREE.BoxGeometry( 3, 3, 3 );
var material = new THREE.MeshPhongMaterial( { color: 0x40ef95, flatShading: true, overdraw: 0.5, shininess: 0 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );


function update() {
	if (keys.d in keysDown) {
        scene.position.x += 0.2;
    }
    else if (keys.a in keysDown) {
        scene.position.x -= 0.2;
    }
	if (keys.s in keysDown) {
        scene.position.z += 0.2;
    }
    else if (keys.w in keysDown) {
        scene.position.z -= 0.2;
    }
    if (keys.right in keysDown) {
		scene.rotation.y -= 0.05;
    }
    else if (keys.left in keysDown) {
		scene.rotation.y += 0.05;
    }
}

function animate() {
	requestAnimationFrame( animate );
	update();
	renderer.render( scene, camera );
}
animate();

