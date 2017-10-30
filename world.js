var colorSchemes = {
    normal: {
        wellLightColor: 0xf97522,
        waterColor: 0x134faf,
        islandColor: 0x34d369,
        woodColor: 0x77551f,
        stoneColor: 0x888888,
        buildingColor: 0xf2cf8e,
        treeLeafColor: 0xe87ae0
    },
    hell: {
        wellLightColor: 0x00aaff,
        waterColor: 0x7c2121,
        islandColor: 0x7c0c0c,
        woodColor: 0x353535,
        stoneColor: 0x503030,
        buildingColor: 0xe0e0e0,
        treeLeafColor: 0x1c1c1c
    },
    midnight: {
        wellLightColor: 0xf97522,
        waterColor: 0x000c0c,
        islandColor: 0x1c773a,
        woodColor: 0x443112,
        stoneColor: 0x666666,
        buildingColor: 0x706042,
        treeLeafColor: 0x6d3a6a
    }
}
var defaultColors = colorSchemes.normal;
var waterMaterial = new THREE.MeshBasicMaterial( { color: defaultColors.waterColor, flatShading: true, overdraw: 0.5, opacity: 0.5, transparent: true } );
var islandMaterial = new THREE.MeshPhongMaterial( { color: defaultColors.islandColor, flatShading: true, overdraw: 0.5, shininess: 0 } );
var woodMaterial = new THREE.MeshPhongMaterial( { color: defaultColors.woodColor, flatShading: true, overdraw: 0.5, shininess: 0} );
var stoneMaterial = new THREE.MeshPhongMaterial( { color: defaultColors.stoneColor, flatShading: true, overdraw: 0.5, shininess: 0 } );
var buildingMaterial = new THREE.MeshPhongMaterial( { color: defaultColors.buildingColor, flatShading: true, overdraw: 0.5, shininess: 0 } );
var treeLeafMaterial = new THREE.MeshPhongMaterial( { color: defaultColors.treeLeafColor, flatShading: true, overdraw: 0.5, shininess: 0 } );

function changeColor(colorSchemeName) {
    var cs = colorSchemes[colorSchemeName];
    waterMaterial.color.set(cs.waterColor);
    islandMaterial.color.set(cs.islandColor);
    woodMaterial.color.set(cs.woodColor);
    stoneMaterial.color.set(cs.stoneColor);
    buildingMaterial.color.set(cs.buildingColor);
    treeLeafMaterial.color.set(cs.treeLeafColor);
    scene.background.set(cs.waterColor);
    wellLights.forEach(function(light) {light.color.set(cs.wellLightColor)});
    document.getElementById('color_scheme_changer').blur();
}

var wellLights = []; // So we can change their colors later.
var worldSize = 500;
var margin = 5;
var blockSize = 5;
var grid = [];
var TILE = {
    EMPTY:    'EMPTY',
    GRASS:    'GRASS',
    WATER:    'WATER',
    BRIDGE:   'BRIDG',
    GAP:      'GAP  ', // Like empty, but won't be filled by code that generates things.
    STONE:    'STONE',
    BUILDING: 'BLDNG'
};

function generateWorld() {
    grid = [];
    for (var i = 0; i < worldSize; i++) {
        var arr = [];
        for (var j = 0; j < worldSize; j++)
            arr.push(TILE.EMPTY);
        grid.push(arr);
    }
    var world = new THREE.Object3D();
    generateIslandGroup(world, worldSize / 2, worldSize / 2);
    return world;
}

function generateIslandGroup(world, x, z) {
    var islandCenters = []; // Has empty spaces too.
    var spacing = 10;
    var numIslands = 0;
    var maxIslands = 30;
    var emptySpaceChance = 0.5;
    var posVariance = 1;
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

        if (Math.random() > emptySpaceChance) {
            if (Math.random() > 0.5) {
                if (Math.random() > 0.5)
                    islandX += posVariance;
                else
                    islandX -= posVariance;
            }
            else {
                if (Math.random() > 0.5)
                    islandZ += posVariance;
                else
                    islandZ -= posVariance;
            }
            var cubes = null;
            if (distance([islandX, islandZ], [x, z]) < 15)
                cubes = generateRocks(islandX, islandZ);
            else
                cubes = generateIsland(islandX, islandZ);
            cubes.forEach(function(cube){ world.add(cube)});
            numIslands++;
        }
        islandCenters.push([islandX, islandZ]);
    }
    for (var i = 0; i < grid.length; i++) {
        var length = 0;
        for (var j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === TILE.EMPTY)
                grid[i][j] = TILE.WATER;
        }
    }
    var waterMargin = 60;
    for (var i = x - waterMargin; i < x + waterMargin; i++) {
        var length = 0;
        for (var j = z - waterMargin; j < z + waterMargin; j++) {
            if (grid[i][j] === TILE.WATER) {
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
    var light = new THREE.PointLight( defaultColors.wellLightColor, 2, 10 * blockSize );
    light.position.set(x * blockSize, -40, z * blockSize);
    world.add(light);
    wellLights.push(light);
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
        var maxBridgeLength = 20; // Should be at least islandSpacing
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

//  xxx
// xxxxx
// xxxxx
// xxxxx
//  xxx
var base = [[-2, -1], [-2, 0], [-2, 1], 
            [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2], 
            [0, -2], [0, -1], [0, 0], [0, 1], [0, 2], 
            [1, -2], [1, -1], [1, 0], [1, 1], [1, 2],
            [2, -1], [2, 0], [2, 1]];

var templates = [
    base,
    base.concat([[3, 3]]),
    base.concat([[1, 3], [2, 3], [2, 4], [-3, 4]]),
    base.concat([[-1, 3], [1, -3], [-1, 4], [3, -1]]),
];

// Should all have [0, 0] first.
var rockTemplates = [
    [[0, 0], [-2, -3], [2, 4], [-2, 3]],
    [[0, 0], [-1, 2], [4, -1], [2, 1], [-2, -3]],
    [[0, 0], [-1, 3], [4, 2], [-2, 1], [3, -4]]
]

function addBridge(startX, startZ, endX, endZ) {
    var cubes = [];
    if (startX > endX) { // -X direction
        for (var i = 0; i < startX - endX; i++) {
            cubes.push(addBridgeTile(startX - i, startZ, 1));
        }
    }
    if (startZ > endZ) { // -Z direction
        for (var i = 0; i < startZ - endZ; i++) {
            cubes.push(addBridgeTile(startX, startZ - i, 1));
        }
    }
    if (endX > startX) { // +X direction
        for (var i = 0; i < endX - startX; i++) {
            cubes.push(addBridgeTile(startX + i, startZ, 1));
        }
    }
    if (endZ > startZ) { // +Z direction
        for (var i = 0; i < endZ - startZ; i++) {
            cubes.push(addBridgeTile(startX, startZ + i, 1));
        }
    }
    return cubes;
}

function generateRocks(x, z) {
    var template = rockTemplates[Math.floor(Math.random() * rockTemplates.length)];
    var cubes = [];
    var height = 2;
    var y = -6;
    for (var i = 0; i < template.length; i++) {
        height = 2 - y;
        if (i !== 0)
            height = (Math.random() * 10) - y ;
        cubes.push(addTile(x + template[i][0], y, z + template[i][1], height, TILE.STONE));
        y += (5 - Math.random() * 10);
        if (y > -6)
            y = -6;
    }
    return cubes;
}

function generateIsland(x, z) {
    var template = templates[Math.floor(Math.random() * templates.length)];
    var cubes = [];
    var height = 12;
    var y = -14;
    for (var i = 0; i < template.length; i++) {
        height = 2 - y;
        cubes.push(addTile(x + template[i][0], y, z + template[i][1], height, TILE.GRASS));
        y = -12 + (4 - Math.random() * 8);
        if (y > -6)
            y = -6;
        if (y < -20)
            y = -20;
    }
    if (Math.random() > 0.9)
        createTree(x, z).forEach(function(cube){cubes.push(cube)});
    else if (Math.random() > 0.5)
        createBuilding(x, z).forEach(function(cube){cubes.push(cube)});
    return cubes;
}

function createTree(x, z) {
    var cubes = [];
    var height = 25 + Math.random() * 3;
    var geometry = new THREE.BoxGeometry(blockSize, height, blockSize);
    var cube = new THREE.Mesh( geometry, woodMaterial );
    cube.position.x = x * blockSize + blockSize / 2;
    cube.position.z = z * blockSize + blockSize / 2;
    cube.position.y = height / 2;
    cubes.push(cube);

    var geometry2 = new THREE.BoxGeometry(4 * blockSize, 3 * blockSize, 4 * blockSize);
    var cube2 = new THREE.Mesh( geometry2, treeLeafMaterial );
    cube2.position.x = x * blockSize + blockSize / 2;
    cube2.position.z = z * blockSize + blockSize / 2;
    cube2.position.y = height;
    cubes.push(cube2);
    return cubes;
}
function createBuilding(x, z) {
    var cubes = [];
    var height = 12 + Math.random() * 3;
    cubes.push(addTile(x - 1, 2, z - 1, height, TILE.BUILDING));
    height = 7 + Math.random() * 3;
    if (Math.random() > 0.5)
        cubes.push(addTile(x + 1, 2, z - 1, height, TILE.BUILDING));

    if (Math.random() > 0.5)
        cubes.push(addTile(x - 1, 2, z + 1, height, TILE.BUILDING));
    return cubes;
}

function addTile(x, y, z, height, tileType) {
    var geometry = new THREE.BoxGeometry(blockSize, height, blockSize);
    var mat = null;
    if (tileType === TILE.GRASS)
        mat = islandMaterial;
    else if (tileType === TILE.STONE)
        mat = stoneMaterial;
    else if (tileType === TILE.BUILDING)
        mat = buildingMaterial;
    var cube = new THREE.Mesh( geometry, mat );
    cube.position.x = x * blockSize + blockSize / 2;
    cube.position.z = z * blockSize + blockSize / 2;
    cube.position.y = height / 2 + y;
    grid[x][z] = tileType;
    return cube;
}

function addBridgeTile(x, z) {
    var geometry = new THREE.BoxGeometry(blockSize, 1, blockSize);
    var cube = new THREE.Mesh( geometry, woodMaterial );
    cube.position.x = x * blockSize + blockSize / 2;
    cube.position.z = z * blockSize + blockSize / 2;
    cube.position.y = 1.5;
    grid[x][z] = TILE.BRIDGE;
    return cube;
}

function addWaterTile(x, z, length) {
    var geometry = new THREE.PlaneGeometry(blockSize, blockSize * length);
    var plane = new THREE.Mesh( geometry, waterMaterial );
    plane.position.x = x * blockSize + blockSize / 2;
    plane.position.z = z * blockSize - (length * blockSize / 2);
    plane.rotation.x = -Math.PI / 2;
    for (var i = -length; i < 0; i++)
        grid[x][i + z] = TILE.WATER;
    return plane;
}

function addWellTile(x, z) {
    var height = 50 + Math.random() * 16;
    var geometry = new THREE.BoxGeometry(blockSize, height, blockSize);
    var cube = new THREE.Mesh( geometry, stoneMaterial );
    cube.position.x = x * blockSize + blockSize / 2;
    cube.position.z = z * blockSize + blockSize / 2;
    cube.position.y = -height / 2 + 2;
    grid[x][z] = TILE.STONE;
    return cube;
}
