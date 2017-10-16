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

var scale = 16;
var camera = new THREE.OrthographicCamera(width / -scale, width / scale, height / scale, height / -scale, 0, 4000);
camera.translateZ(2000); // Move back so camera is centered on 0, 0, 0

var cam = new THREE.Object3D(); // Parent for camera to rotate/pan easier
cam.add(camera);
scene.add(cam);

var axes = new THREE.AxisHelper(3);
cam.add(axes);

// Setup isometric view
cam.rotateY(Math.PI / 4.0);
cam.rotateX(-Math.PI / 4.0);
axes.rotateX(Math.PI / 4.0);
axes.rotateY(-Math.PI / 4.0);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
threediv.appendChild(renderer.domElement);

var world = generateWorld();
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
        axes.rotateY(-rotateSpeed);
    }
    else if (keys.left in keysDown) {
        cam.rotateX(Math.PI / 4.0);
        cam.rotateY(-rotateSpeed);
        cam.rotateX(-Math.PI / 4.0);
        axes.rotateY(rotateSpeed);
    }
}

function animate() {
	requestAnimationFrame( animate );
	update();
	renderer.render( scene, camera );
}
animate();

