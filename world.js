var greenMaterial = new THREE.MeshPhongMaterial( { color: 0x34d369, flatShading: true, overdraw: 0.5, shininess: 0 } );
var redMaterial = new THREE.MeshPhongMaterial( { color: 0xf76942, flatShading: true, overdraw: 0.5, shininess: 0 } );
var blueMaterial = new THREE.MeshPhongMaterial( { color: 0x134faf, flatShading: true, overdraw: 0.5, shininess: 0 } );
var brownMaterial = new THREE.MeshPhongMaterial( { color: 0x77551f, flatShading: true, overdraw: 0.5, shininess: 0 } );
var grayMaterial = new THREE.MeshPhongMaterial( { color: 0x888888, flatShading: true, overdraw: 0.5, shininess: 0 } );
var worldSize = 500;
var margin = 5;
var blockSize = 5;
var grid = [];
var TILE = {
    EMPTY:  'EMPTY',
    GRASS:  'GRASS',
    WATER:  'WATER',
    BRIDGE: 'BRIDG',
    GAP:    'GAP  ', // Like empty, but won't be filled by code that generates things.
    STONE:  'STONE'
};
for (var i = 0; i < worldSize; i++) {
    var arr = [];
    for (var j = 0; j < worldSize; j++)
        arr.push(TILE.EMPTY);
    grid.push(arr);
}

function generateIslandGroup(x, z) {
    var world = new THREE.Object3D();
    var islandCenters = []; // Has empty spaces too.
    var spacing = 10;
    var numIslands = 0;
    var maxIslands = 30;
    var emptySpaceChance = 0.5;
    islandCenters.push([x, z])
    var wellCubes = createWell(world, x, z);
    wellCubes.forEach(function(cube) {world.add(cube)});
    while (numIslands < maxIslands) {
        var islandX = x;
        var islandZ = z;
        var placed = false;
        var dir = Math.floor(Math.random() * 4);
        while (!placed) {
            if (dir == 0)
                islandX += spacing;
            else if (dir == 1)
                islandX -= spacing;
            else if (dir == 2)
                islandZ += spacing;
            else if (dir == 3)
                islandZ -= spacing;
            
            if (islandX < margin)
                islandX = margin;
            else if (islandX > worldSize - margin)
                islandX = worldSize - margin;
            if (islandZ < margin)
                islandZ = margin;
            else if (islandZ > worldSize - margin)
                islandZ = worldSize - margin;
                
            var tooClose = false;
            islandCenters.forEach(function(center) {
                if (distance([islandX, islandZ], center) < spacing)
                    tooClose = true;
            });
            if (tooClose) { // Try again to find a new spot.
                dir = Math.floor(Math.random() * 4);
            }
            else
                placed = true;
        }

        islandCenters.push([islandX, islandZ]);
        if (Math.random() > emptySpaceChance) {
            var cubes = null;
            if (distance([islandX, islandZ], [x, z]) < 15)
                cubes = generateRocks(islandX, islandZ);
            else
                cubes = generateIsland(islandX, islandZ);
            cubes.forEach(function(cube){ world.add(cube)});
            numIslands++;
        }
    }
    for (var i = 0; i < grid.length; i++) {
        var length = 0;
        for (var j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === TILE.EMPTY) {
                length++;
            }
            else if (length > 0){
                world.add(addWaterTile(i, j, length));
                length = 0;
            }
        }
        if (length > 0){
            world.add(addWaterTile(i, j, length));
            length = 0;
        }
    }
    generateBridges(world, islandCenters);
    return world;
}

function distance(d1, d2) {
    var dx = Math.abs(d1[0] - d2[0]);
    var dy = Math.abs(d1[1] - d2[1]);
    return Math.sqrt(dx * dx + dy * dy);
}

function createWell(world, x, z) {
    var light = new THREE.PointLight( 0xf97522, 2, 10 * blockSize );
    light.position.set(x * blockSize, -40, z * blockSize);
    world.add(light);
    var radius = 5;
    var innerRadius = 4;
    var cubes = [];
    for (var i = -innerRadius; i <= innerRadius; i++) {
        for (var j = -innerRadius; j <= innerRadius; j++) {
            if (Math.abs(i + j) < 1.5 * innerRadius &&
                Math.abs(i - j) < 1.5 * innerRadius)
            {
                grid[x + i][z + j] = TILE.GAP;
            }
        }
    }
    for (var i = -radius; i <= radius; i++) {
        for (var j = -radius; j <= radius; j++) {
            if (Math.abs(i + j) < 1.5 * radius &&
                Math.abs(i - j) < 1.5 * radius &&
                grid[x +i][z + j] === TILE.EMPTY)
            {
                grid[x + i][z + j] = TILE.STONE;
                cubes.push(addWellTile(x + i, z + j));
            }
        }
    }
    return cubes;
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
        if (grid[x][z] === TILE.WATER)
            continue; // Skip empty island centers;

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

            if (x < 0 || z < 0 || x > worldSize - margin || z > worldSize - margin)
                continue;
            
            if (grid[x][z] === TILE.WATER && !foundWater) {
                foundWater = true;
                bridgeStartX = x;
                bridgeStartZ = z;
            }
            if (grid[x][z] !== TILE.WATER && foundWater) {
                var bridgeTiles = addBridge(bridgeStartX, bridgeStartZ, x, z);
                bridgeTiles.forEach(function(t) {world.add(t)});
                break;
            }
        }
    }
}

var templates = [
    [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [2, 1], [2, 2]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [-1, 0], [0, -1], [-1, -1]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [-1, 0]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [-1, 0], [2, 1], [2, 2], [1, 2], [2, 0], [0, -1], [1, -1]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [-1, 0], [1, 2], [0, -1]]
];

// Should all have [0, 0] first.
var rockTemplates = [
    [[0, 0], [-2, -3], [2, 4], [-2, 3]],
    [[0, 0], [-1, 2], [4, -1], [2, 1], [-1, 3]],
    [[0, 0], [-1, 3], [4, 2], [-2, 1], [3, -4]]
]

function addBridge(startX, startZ, endX, endZ) {
    var planes = [];
    if (startX > endX) { // -X direction
        for (var i = 0; i < startX - endX; i++) {
            planes.push(addBridgeTile(startX - i, startZ, 1));
        }
    }
    if (startZ > endZ) { // -Z direction
        for (var i = 0; i < startZ - endZ; i++) {
            planes.push(addBridgeTile(startX, startZ - i, 1));
        }
    }
    if (endX > startX) { // +X direction
        for (var i = 0; i < endX - startX; i++) {
            planes.push(addBridgeTile(startX + i, startZ, 1));
        }
    }
    if (endZ > startZ) { // +Z direction
        for (var i = 0; i < endZ - startZ; i++) {
            planes.push(addBridgeTile(startX, startZ + i, 1));
        }
    }
    return planes;
}

function generateRocks(x, z) {
    var template = rockTemplates[Math.floor(Math.random() * rockTemplates.length)];
    var cubes = [];
    var height = 2;
    for (var i = 0; i < template.length; i++) {
        if (i !== 0)
            height = (Math.random() * 6) + 2;
        cubes.push(addTile(x + template[i][0], z + template[i][1], height, TILE.STONE));
    }
    return cubes;
}

function generateIsland(x, z) {
    var template = templates[Math.floor(Math.random() * templates.length)];
    var cubes = [];
    var height = 2;
    for (var i = 0; i < template.length; i++) {
        cubes.push(addTile(x + template[i][0], z + template[i][1], height, TILE.GRASS));
    }
    return cubes;
}

function addTile(x, z, height, tileType) {
    var geometry = new THREE.BoxGeometry(blockSize, height, blockSize);
    var mat = null;
    if (tileType === TILE.GRASS)
        mat = greenMaterial;
    else if (tileType === TILE.STONE)
        mat = grayMaterial;
    var cube = new THREE.Mesh( geometry, mat );
    cube.position.x = x * blockSize + blockSize / 2;
    cube.position.z = z * blockSize + blockSize / 2;
    cube.position.y = height / 2;
    grid[x][z] = tileType;
    return cube;
}

function addBridgeTile(x, z) {
    var geometry = new THREE.PlaneGeometry(blockSize, blockSize);
    var plane = new THREE.Mesh( geometry, brownMaterial );
    plane.position.x = x * blockSize + blockSize / 2;
    plane.position.z = z * blockSize + blockSize / 2;
    plane.position.y = 2;
    plane.rotation.x = -Math.PI / 2;
    grid[x][z] = TILE.BRIDGE;
    return plane;
}

function addWaterTile(x, z, length) {
    var geometry = new THREE.PlaneGeometry(blockSize, blockSize * length);
    var plane = new THREE.Mesh( geometry, blueMaterial );
    plane.position.x = x * blockSize + blockSize / 2;
    plane.position.z = z * blockSize - (length * blockSize / 2);
    plane.rotation.x = -Math.PI / 2;
    for (var i = -length; i < 0; i++)
        grid[x][i + z] = TILE.WATER;
    return plane;
}

function addWellTile(x, z) {
    var height = 50;
    var geometry = new THREE.BoxGeometry(blockSize, height, blockSize);
    var cube = new THREE.Mesh( geometry, grayMaterial );
    cube.position.x = x * blockSize + blockSize / 2;
    cube.position.z = z * blockSize + blockSize / 2;
    cube.position.y = -height / 2 + 2;
    grid[x][z] = TILE.STONE;
    return cube;
}
