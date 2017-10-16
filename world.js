var greenMaterial = new THREE.MeshPhongMaterial( { color: 0x40ef95, flatShading: true, overdraw: 0.5, shininess: 0 } );
var redMaterial = new THREE.MeshPhongMaterial( { color: 0xf76942, flatShading: true, overdraw: 0.5, shininess: 0 } );
function generateWorld() {
    var world = new THREE.Object3D();
    var islandSpacing = 10;
    var numIslands = 30;
    for (var i = 0; i < numIslands; i++) {
        var x = Math.round(islandSpacing - Math.random() * islandSpacing * 2) * 5 + 2.5;
        var z = Math.round(islandSpacing - Math.random() * islandSpacing * 2) * 5 + 2.5;
        world.add(generateIsland(x, z));
    }

    var light = new THREE.DirectionalLight( 0xffffff, 1.0 );
    light.position.set(1, 3, 2).normalize();
    world.add( light );
    world.add( light.target );
    
    var grid = new THREE.GridHelper(500, 100, 0x000000, 0x000000);
    world.add(grid);
    return world;
}

function generateIsland(x, z) {
    var width = Math.floor(Math.random() * 2) * 5 + 5;
    //console.log(width);
    var height = 1; //Math.floor(Math.random() * 3) + 2;
    var depth = Math.floor(Math.random() * 2) * 5 + 5;
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var cube = new THREE.Mesh( geometry, greenMaterial );
    // Shift up to x and z with additional 2.5 if width ends in 5
    cube.position.x = x + 2.5 * (Math.floor(width / 5) - 1);
    cube.position.z = z + 2.5 * (Math.floor(depth / 5) - 1);
    return cube;
}