

import * as THREE from '../node_modules/three/build/three.module.js';

import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../node_modules/three/examples/jsm/loaders/FBXLoader.js';
import { TDSLoader } from '../node_modules/three/examples/jsm/loaders/TDSLoader.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from '../node_modules/three/examples/jsm/loaders/RGBELoader.js';
import { RoughnessMipmapper } from '../node_modules/three/examples/jsm/utils/RoughnessMipmapper.js';

let container, controls;
let camera, scene, renderer;

let infProg = {};
infProg.scene = null;
infProg.material = [];
infProg.dirLight = null;


init();



function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.style.width = '100%';
	renderer.domElement.style.height = '100%';
	
	render();

}



function render() {

	renderer.render( scene, camera );

}


function init() {

	container = document.createElement( 'div' );	
	document.body.appendChild( container );
	
	container.style.position = 'fixed';
	container.style.width = '100%';
	container.style.height = '100%';
	container.style.top = 0;
	container.style.left = 0;	

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 50 );
	camera.position.set( 0, 1, 5 );
	
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xffffff );
	
	let dirLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
	dirLight.castShadow = true;
	dirLight.position.set(3,7,5);	
	scene.add(dirLight);
	
	infProg.dirLight = dirLight;
	
	var gridHelper = new THREE.GridHelper( 10, 10 );
	scene.add( gridHelper );	

	
	
	if(1==2)
	{
		new RGBELoader()
			.setDataType( THREE.UnsignedByteType )
			.setPath( 'textures/' )
			.load( 'sculpture_exhibition_2k.hdr', function ( texture ) {

				var envMap = pmremGenerator.fromEquirectangular( texture ).texture;

				//scene.background = envMap;
				scene.environment = envMap;

				texture.dispose();
				pmremGenerator.dispose();

				render();

				// model

				// use of RoughnessMipmapper is optional
				let roughnessMipmapper = new RoughnessMipmapper( renderer );			
				
				let loader = new GLTFLoader().setPath( 'model/' );
				loader.load( 'scene.gltf', function ( gltf ) {
					
					let cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 512, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );
					let gCubeCam = new THREE.CubeCamera(0.1, 10, cubeRenderTarget);
					gCubeCam.update( renderer, scene );
					gCubeCam.renderTarget.texture.outputEncoding = THREE.sRGBEncoding;

					gltf.scene.scale.set(0.1, 0.1, 0.1);
					
					infProg.scene = gltf.scene;
					
					gltf.scene.traverse( function ( child ) {

						if ( child.isMesh ) {
							child.castShadow = true;	
							child.receiveShadow = true;	
							//child.material.envMap = gCubeCam.renderTarget.texture;
							child.material.needsUpdate = true;	

							addMaterialObjToList({material: child.material});
						}

					} );


					let elemLoad = document.querySelector('[nameId="progress_wrap"]');
					elemLoad.style.display = "none";
					
					scene.add( gltf.scene );
					
					roughnessMipmapper.dispose();
					
					setDefaultMaterial();

					render();
				},
				function ( xhr ) {

					//console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

				});
				

			} );
	}
					
	//load3ds();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;
	renderer.outputEncoding = THREE.sRGBEncoding;
	
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
	
	container.appendChild( renderer.domElement );
	
	var pmremGenerator = new THREE.PMREMGenerator( renderer );
	pmremGenerator.compileEquirectangularShader();	

	renderer.domElement.style.width = '100%';
	renderer.domElement.style.height = '100%';
	renderer.domElement.style.outline = 'none';

	controls = new OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render ); // use if there is no animation loop
	controls.minDistance = 0.1;
	controls.maxDistance = 100;
	controls.target.set( 0, 0.3, 0 );
	controls.update();

	window.addEventListener( 'resize', onWindowResize, false );

	render();
}


let inputFbx = document.body.querySelector('#load_obj_1');
inputFbx.addEventListener( 'change', readURL_2, false );

function readURL_2(e) 
{
	if (this.files[0]) 
	{		
		var reader = new FileReader();
		reader.onload = function (e) 
		{						
			loadFbx({data: e.target.result});
		};				

		reader.readAsArrayBuffer(this.files[0]);  									
	};
};


function loadFbx(params)
{
	deleteObj();

	var loader = new FBXLoader();
	var obj = loader.parse( params.data );		
	scene.add( obj );
	render();

	infProg.scene = obj;

	if(1==2)
	{
		let loader = new FBXLoader();
		loader.load( 'models/kran.fbx', function ( object ) {

			scene.add( object );
			render();

		} );
	}

}


function load3ds()
{

	var loader = new TDSLoader( );
	loader.setResourcePath( 'models/3ds/textures/' );
	loader.load( 'models/3ds/kran.3ds', function ( object ) {

		scene.add( object );
		render();

	} );

}


function deleteObj()
{
	if(!infProg.scene) return;

	let obj = infProg.scene;

	obj.traverse( function ( child ) 
	{
		disposeNode(child);
	});

	infProg.scene = null;
	scene.remove(obj);

}


function disposeNode(node) 
{
	if (node.geometry) { node.geometry.dispose(); }
	
	if (node.material) 
	{
		var materialArray = [];
		
		if(node.material instanceof Array) { materialArray = node.material; }
		else { materialArray = [node.material]; }
		
		materialArray.forEach(function (mtrl, idx) 
		{
			if (mtrl.map) mtrl.map.dispose();
			if (mtrl.lightMap) mtrl.lightMap.dispose();
			if (mtrl.bumpMap) mtrl.bumpMap.dispose();
			if (mtrl.normalMap) mtrl.normalMap.dispose();
			if (mtrl.specularMap) mtrl.specularMap.dispose();
			if (mtrl.envMap) mtrl.envMap.dispose();
			mtrl.dispose();
		});
	}
}


export { init };


