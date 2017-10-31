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
    visceral: {
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
    },
    lunar: {
        wellLightColor: 0xd33682,
        waterColor: 0x073642,
        islandColor: 0xeee8d5,
        woodColor: 0x6c71c4,
        stoneColor: 0x839496,
        buildingColor: 0x2aa198,
        treeLeafColor: 0xcb4b16
    },
	marshes: {
          wellLightColor: 0xdc9656,
          waterColor: 0x7cafc2,
          islandColor: 0xa1b56c,
          woodColor: 0xa16946,
          stoneColor: 0xb8b8b8,
          buildingColor: 0xf7ca88,
          treeLeafColor: 0xba8baf
	}
};

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

var defaultColors = colorSchemes.normal;
var waterMaterial = new THREE.MeshBasicMaterial( { color: defaultColors.waterColor, flatShading: true, overdraw: 0.5, opacity: 0.5, transparent: true } );
var islandMaterial = new THREE.MeshPhongMaterial( { color: defaultColors.islandColor, flatShading: true, overdraw: 0.5, shininess: 0 } );
var woodMaterial = new THREE.MeshPhongMaterial( { color: defaultColors.woodColor, flatShading: true, overdraw: 0.5, shininess: 0} );
var stoneMaterial = new THREE.MeshPhongMaterial( { color: defaultColors.stoneColor, flatShading: true, overdraw: 0.5, shininess: 0 } );
var buildingMaterial = new THREE.MeshPhongMaterial( { color: defaultColors.buildingColor, flatShading: true, overdraw: 0.5, shininess: 0 } );
var treeLeafMaterial = new THREE.MeshPhongMaterial( { color: defaultColors.treeLeafColor, flatShading: true, overdraw: 0.5, shininess: 0 } );