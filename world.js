var greenMaterial = new THREE.MeshPhongMaterial( { color: 0x40ef95, flatShading: true, overdraw: 0.5, shininess: 0 } );
var redMaterial = new THREE.MeshPhongMaterial( { color: 0xf76942, flatShading: true, overdraw: 0.5, shininess: 0 } );
var blueMaterial = new THREE.MeshPhongMaterial( { color: 0x134faf, flatShading: true, overdraw: 0.5, shininess: 0 } );
var brownMaterial = new THREE.MeshPhongMaterial( { color: 0x77551f, flatShading: true, overdraw: 0.5, shininess: 0 } );
var worldSize = 100;
var blockSize = 5;
var grid = [];
var TILE = {
    EMPTY: "EMPTY",
    GRASS: "GRASS",
    WATER: "WATER"
};
for (var i = 0; i < worldSize; i++) {
    var arr = [];
    for (var j = 0; j < worldSize; j++)
        arr.push(TILE.EMPTY);
    grid.push(arr);
}

function generateWorld() {
    var world = new THREE.Object3D();
    var margin = 5;
    var islandCenters = []; // Has empty spaces too.
    var spacing = 15;
    var numIslands = 0;
    var maxIslands = 100;
    var emptySpaceChance = 0.7;
    for (var i = -worldSize / 2 + margin; i < worldSize / 2 - margin; i++) {
        for (var j = -worldSize / 2 + margin; j < worldSize / 2 - margin; j++) {
            if (numIslands >= maxIslands)
                continue;

            var point = [i, j];
            var tooClose = false;
            islandCenters.forEach(function(center) {
                if (distance(point, center) < spacing)
                tooClose = true;
            });
            if (tooClose)
                continue;
                
            islandCenters.push(point);
            if (Math.random() < emptySpaceChance) {
                var cubes = generateIsland(i, j);
                cubes.forEach(function(cube){ world.add(cube)});
            }
        }
    }
    for (var i = 0; i < grid.length; i++) {
        var length = 0;
        for (var j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === TILE.EMPTY) {
                length++;
            }
            else if (length > 0){
                world.add(addWaterTile(i - worldSize / 2, j - worldSize / 2, length));
                length = 0;
            }
        }
        if (length > 0){
            world.add(addWaterTile(i - worldSize / 2, worldSize / 2, length));
            length = 0;
        }
    }
    //generateBridges(world, islandCenters);

    var light = new THREE.DirectionalLight( 0xffffff, 1.0 );
    light.position.set(1, 3, 2).normalize();
    world.add( light );
    world.add( light.target );
    
    var gridHelper = new THREE.GridHelper(500, 100, 0x000000, 0x000000);
    world.add(gridHelper);
    return world;
}

function distance(d1, d2) {
    var dx = Math.abs(d1[0] - d2[0]);
    var dy = Math.abs(d1[1] - d2[1]);
    return Math.sqrt(dx * dx + dy * dy);
}

function generateBridges(world, islandCenters) {
    for (var i = 0; i < islandCenters.length; i++) {
        var startX = islandCenters[i][0];
        var startZ = islandCenters[i][1];
        var x = startX;
        var z = startZ;
        var direction = Math.floor(Math.random() * 4);
        var length = 0;
        var maxBridgeLength = 30; // Should be at least islandSpacing
        var foundWater = false;
        var bridgeStartX = 0;
        var bridgeStartZ = 0;
        while (length < maxBridgeLength) {
            length++
            if (direction == 0)
                x++;
            else if (direction == 1)
                z++;
            else if (direction == 2)
                x--;
            else if (direction == 3)
                z--;

            if (x < 0 || z < 0 || x > worldSize || z > worldSize)
                continue;
            
            if (grid[x][z] === TILE.WATER && !foundWater) {
                foundWater = true;
                bridgeStartX = x;
                bridgeStartZ = z;
            }
            if (grid[x][z] !== TILE.WATER && foundWater) {
                var bridgeTiles = addBridge(bridgeStartX, bridgeStartZ, x, z);
                console.log(bridgeStartX + ' ' + x + ' ' + bridgeStartZ + ' ' + z);
                bridgeTiles.forEach(function(t) {world.add(t)});
                break;
            }
        }
    }
}

var templates = [
    [[0, 0], [0, 1], [1, 0]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [-1, 0]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [-1, 0], [2, 1], [2, 2], [1, 2], [2, 0], [0, -1], [1, -1]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [-1, 0], [1, 2], [0, -1]]
];

function addBridge(startX, startZ, endX, endZ) {
    startX -= worldSize / 2;
    startZ -= worldSize / 2;
    endX -= worldSize / 2;
    endZ -= worldSize / 2;
    var cubes = [];
    for (var i = 0; i < startX - endX + 1; i++) {
        cubes.push(addTile(startX + i, startZ, 1));
    }
    for (var i = 0; j < startZ - endZ + 1; j++) {
        cubes.push(addTile(startX, startZ + i, 1));
    }
    for (var i = 0; i < endX - startX + 1; i++) {
        cubes.push(addTile(startX - i, startZ, 1));
    }
    for (var i = 0; j < endZ - startZ + 1; j++) {
        cubes.push(addTile(startX, startZ - i, 1));
    }
    return cubes;
}

function generateIsland(x, z) {
    var template = templates[Math.floor(Math.random() * templates.length)];
    var cubes = [];
    for (var i = 0; i < template.length; i++)
        cubes.push(addTile(x + template[i][0], z + template[i][1], 2));

    return cubes;
}

function addTile(x, z, height) {
    var geometry = new THREE.BoxGeometry(blockSize, height, blockSize);
    var cube = new THREE.Mesh( geometry, greenMaterial );
    cube.position.x = x * blockSize + blockSize / 2;
    cube.position.z = z * blockSize + blockSize / 2;
    cube.position.y = height / 2;
    grid[x + worldSize / 2][z + worldSize / 2] = TILE.GRASS;
    return cube;
}

function addWaterTile(x, z, length) {
    var geometry = new THREE.PlaneGeometry(blockSize, blockSize * length);
    var plane = new THREE.Mesh( geometry, blueMaterial );
    plane.position.x = x * blockSize + blockSize / 2;
    plane.position.z = z * blockSize - (length * blockSize / 2);
    plane.rotation.x = -Math.PI / 2;
    for (var i = -length; i < 0; i++)
        grid[x + worldSize / 2][i + z + worldSize / 2] = TILE.WATER;
    return plane;
}
