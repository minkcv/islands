var keysDown = [];
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
var scale = 32;
var camera = new THREE.OrthographicCamera(width / -scale, width / scale, height / scale, height / -scale, 0, 4000);
camera.position.z = 10;
camera.position.y = 10;
camera.rotation.x = -Math.PI / 4.0;
var rotation = 0;
var xPos = 0;
var zPos = 0;
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
threediv.appendChild(renderer.domElement);

var light = new THREE.DirectionalLight( 0xffffff, 1.0 );
light.position.set(70, 70, 100).normalize();
scene.add( light );

var axes = new THREE.AxisHelper(3, 3, 3);
scene.add(axes);

var geometry = new THREE.BoxGeometry( 3, 3, 3 );
var material = new THREE.MeshPhongMaterial( { color: 0x40ef95, flatShading: true, overdraw: 0.5, shininess: 0 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

function update() {
	if (38 in keysDown) { // UP
        scene.position.x += 0.5;
        light.position.x += 0.5;
    }
    else if (40 in keysDown) { // DOWN
        scene.position.x -= 0.5;
        light.position.x += 0.5;
    }
    if (39 in keysDown) { // RIGHT
		scene.rotation.y -= 0.05;
        light.rotation.y -= 0.05;
    }
    else if (37 in keysDown) { // LEFT
		scene.rotation.y += 0.05;
        light.rotation.y += 0.05;
    }
}

function animate() {
	requestAnimationFrame( animate );
	update();
	renderer.render( scene, camera );
}
animate();

