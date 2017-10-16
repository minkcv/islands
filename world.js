var material = new THREE.MeshPhongMaterial( { color: 0x40ef95, flatShading: true, overdraw: 0.5, shininess: 0 } );


function generateIsland(x, z)
{
    var width = Math.random() * 5 + 5;
    var height = Math.random() * 3 + 2;
    var depth = Math.random() * 5 + 5;
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var cube = new THREE.Mesh( geometry, material );
    cube.position.x = Math.random() * 10 + x;
    cube.position.z = Math.random() * 10 + z;
    return cube;
}