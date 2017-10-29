var keysDown = [];
var keys = { up: 38, down: 40, right: 39, left: 37, a: 65, s: 83, d: 68, w: 87, shift: 16, r: 82}
addEventListener("keydown", function(e) {
    if (e.keyCode == keys.r)
        location.reload();
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];
}, false);

var threediv = document.getElementById('threediv');
var width = threediv.clientWidth;
var height = threediv.clientHeight;

var scene = new THREE.Scene();
scene.background = new THREE.Color(bgColor);

var scale = 16;
var camera = new THREE.OrthographicCamera(width / -scale, width / scale, height / scale, height / -scale, 0, 4000);
camera.translateZ(2000); // Move back so camera is centered on 0, 0, 0
camera.zoom = 0.3;
camera.updateProjectionMatrix();

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

cam.position.x = worldSize / 2 * blockSize + blockSize / 2;
cam.position.z = worldSize / 2 * blockSize + blockSize / 2;

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
threediv.appendChild(renderer.domElement);

var world = generateIslandGroup(worldSize / 2, worldSize / 2);
scene.add(world);

/*
var gridHelper = new THREE.GridHelper(worldSize * 5, worldSize, 0x000000, 0x000000);
gridHelper.position.x = worldSize / 2 * blockSize;
gridHelper.position.z = worldSize / 2 * blockSize;
world.add(gridHelper);
*/

var light = new THREE.DirectionalLight( 0xffffff, 1.0 );
light.position.set(1, 3, 2).normalize();
world.add( light );
world.add( light.target );

var rotateSpeed = 0.05;
var moveSpeed = 1;
var sprintFactor = 1;
var maxZoomIn = 2;
var maxZoomOut = 0.1;

function update() {
    if (keys.shift in keysDown)
        sprintFactor = 4;
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
    if (keys.up in keysDown) {
        camera.zoom *= 1.1;
        if (camera.zoom > maxZoomIn)
            camera.zoom = maxZoomIn;
        camera.updateProjectionMatrix();
    }
    else if (keys.down in keysDown) {
        camera.zoom *= 0.9;
        if (camera.zoom < maxZoomOut)
            camera.zoom = maxZoomOut;
        camera.updateProjectionMatrix();
    }
}

function animate() {
	requestAnimationFrame( animate );
	update();
	renderer.render( scene, camera );
}
animate();

