var keysDown = [];
var keys = { up: 38, down: 40, right: 39, left: 37, a: 65, s: 83, d: 68, w: 87, shift: 16}
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
//scene.rotation.y = -Math.PI / 4.0; // Start isometric
var scale = 16;
var camera = new THREE.OrthographicCamera(width / -scale, width / scale, height / scale, height / -scale, 0, 4000);
camera.translateZ(2000); // Move back so camera is centered on 0, 0, 0

var cam = new THREE.Object3D(); // Parent for camera to rotate/pan easier
cam.add(camera);
scene.add(cam);

// Setup isometri view
cam.rotateY(Math.PI / 4.0);
cam.rotateX(-Math.PI / 4.0);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
threediv.appendChild(renderer.domElement);

var world = new THREE.Object3D();
var islandSpread = 200;
var numIslands = 30;
for (var i = 0; i < numIslands; i++)
    world.add(generateIsland((0.5 - Math.random()) * islandSpread, (0.5 - Math.random()) * islandSpread));


var light = new THREE.DirectionalLight( 0xffffff, 1.0 );
light.position.set(1, 3, 2).normalize();
world.add( light );
world.add( light.target );

var grid = new THREE.GridHelper(500, 100, 0x000000, 0x000000);
world.add(grid);

scene.add(world);

var rotateSpeed = 0.05;
var moveSpeed = 0.4;
var sprintFactor = 1;

function update() {
    if (keys.shift in keysDown)
        sprintFactor = 2;
    else
        sprintFactor = 1;

	if (keys.a in keysDown) {
        cam.translateX(-moveSpeed * sprintFactor);
    }
    else if (keys.d in keysDown) {
        cam.translateX(moveSpeed * sprintFactor);
    }
	if (keys.w in keysDown) {
        cam.rotateX(Math.PI / 4.0);
        cam.translateZ(-moveSpeed * sprintFactor);
        cam.rotateX(-Math.PI / 4.0);
    }
    else if (keys.s in keysDown) {
        cam.rotateX(Math.PI / 4.0);
        cam.translateZ(moveSpeed * sprintFactor);
        cam.rotateX(-Math.PI / 4.0);
    }
    if (keys.right in keysDown) {
        cam.rotateX(Math.PI / 4.0);
        cam.rotateY(rotateSpeed);
        cam.rotateX(-Math.PI / 4.0);
    }
    else if (keys.left in keysDown) {
        cam.rotateX(Math.PI / 4.0);
        cam.rotateY(-rotateSpeed);
        cam.rotateX(-Math.PI / 4.0);
    }
}

function animate() {
	requestAnimationFrame( animate );
	update();
	renderer.render( scene, camera );
}
animate();

