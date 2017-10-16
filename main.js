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
scene.rotation.y = -Math.PI / 4.0; // Start isometric
var scale = 16;
var camera = new THREE.OrthographicCamera(width / -scale, width / scale, height / scale, height / -scale, 0, 4000);
camera.position.z = 40; // Back
camera.position.y = 40; // Up
camera.rotation.x = -Math.PI / 4.0; // Down 45 degrees.
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
threediv.appendChild(renderer.domElement);

var light = new THREE.DirectionalLight( 0xffffff, 1.0 );
light.position.set(1, 3, 2).normalize();
scene.add( light );
scene.add( light.target );

var grid = new THREE.GridHelper(500, 100, 0x000000, 0x000000);
scene.add(grid);

var islandSpread = 200;
var numIslands = 30;
for (var i = 0; i < numIslands; i++)
    scene.add(generateIsland((0.5 - Math.random()) * islandSpread, (0.5 - Math.random()) * islandSpread));


var rotateSpeed = 0.05;
var moveSpeed = 0.4;
var sprintFactor = 1;

function update() {
    if (keys.shift in keysDown)
        sprintFactor = 2;
    else
        sprintFactor = 1;

	if (keys.a in keysDown) {
        scene.position.x += moveSpeed * sprintFactor;
    }
    else if (keys.d in keysDown) {
        scene.position.x -= moveSpeed * sprintFactor;
    }
	if (keys.w in keysDown) {
        scene.position.z += moveSpeed * sprintFactor;
    }
    else if (keys.s in keysDown) {
        scene.position.z -= moveSpeed * sprintFactor;
    }
    if (keys.right in keysDown) {
        scene.rotation.y -= rotateSpeed;
    }
    else if (keys.left in keysDown) {
		scene.rotation.y += rotateSpeed;
    }
}

function animate() {
	requestAnimationFrame( animate );
	update();
	renderer.render( scene, camera );
}
animate();

