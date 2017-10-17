var greenMaterial = new THREE.MeshPhongMaterial( { color: 0x40ef95, flatShading: true, overdraw: 0.5, shininess: 0 } );
var redMaterial = new THREE.MeshPhongMaterial( { color: 0xf76942, flatShading: true, overdraw: 0.5, shininess: 0 } );
var worldSize = 100;
var blockSize = 5;
var grid = [];
for (var i = 0; i < worldSize; i++) {
    var arr = [];
    for (var j = 0; j < worldSize; j++)
        arr.push(false);
    grid.push(arr);
}

function generateWorld() {
    var world = new THREE.Object3D();
    var margin = 5;
    for (var i = -worldSize / 2 + margin; i < worldSize / 2 - margin; i++) {
        for (var j = -worldSize / 2 + margin; j < worldSize / 2 - margin; j++) {
            if (Math.random() < 0.98)
                continue;
            
            var cubes = generateIsland(i, j);
            cubes.forEach(function(cube){ world.add(cube)});
        }
    }

    var light = new THREE.DirectionalLight( 0xffffff, 1.0 );
    light.position.set(1, 3, 2).normalize();
    world.add( light );
    world.add( light.target );
    
    var gridHelper = new THREE.GridHelper(500, 100, 0x000000, 0x000000);
    world.add(gridHelper);
    return world;
}

var templates = [
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]]
]

function generateIsland(x, z) {
    var template = templates[Math.floor(Math.random() * templates.length)];
    var cubes = [];
    for (var i = 0; i < template.length; i++)
        cubes.push(addTile(x + template[i][0], z + template[i][1]));

    return cubes;
}

function addTile(x, z) {
    var geometry = new THREE.BoxGeometry(blockSize, 1, blockSize);
    var cube = new THREE.Mesh( geometry, greenMaterial );
    cube.position.x = x * blockSize + blockSize / 2;
    cube.position.z = z * blockSize + blockSize / 2;
    grid[x + worldSize / 2][z + worldSize / 2] = true;
    return cube;
}