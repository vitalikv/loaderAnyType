

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
infProg.boundBox = null;
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

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 10000 );
	camera.position.set( 0, 1, 5 );
	
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xffffff );
	
	let dirLight_1 = new THREE.DirectionalLight( 0xffffff, 0.4 );
	dirLight_1.castShadow = true;
	dirLight_1.position.set(3,7,5);	
	scene.add(dirLight_1);
	
	let dirLight_2 = new THREE.DirectionalLight( 0xffffff, 0.4 );
	dirLight_2.castShadow = true;
	dirLight_2.position.set(-3,7,-5);	
	scene.add(dirLight_2);	
	
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
	controls.maxDistance = 10000;
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

let div_triangles_1 = document.body.querySelector('[nameId="div_triangles_1"]');
let div_countMesh_1 = document.body.querySelector('[nameId="div_countMesh_1"]');
let div_countMaterial_1 = document.body.querySelector('[nameId="div_countMaterial_1"]');
let div_objSize_1 = document.body.querySelector('[nameId="div_objSize_1"]');

function loadFbx(params)
{
	deleteObj();

	var loader = new FBXLoader();
	var obj = loader.parse( params.data );
	//obj.scale.set(0.01, 0.01, 0.01);		
	scene.add( obj );
	render();

	getBoundObject_1({obj: obj});
	fitCameraToObject({obj: infProg.boundBox});

	infProg.scene = obj;

	let count = {g: 0, m: 0};

	obj.traverse( function ( child ) 
	{
		if (child.geometry) 
		{ 
			count.g += 1; 
		}

		if (child.material)
		{
			let materialArray = [];
		
			if(child.material instanceof Array) { materialArray = child.material; }
			else { materialArray = [child.material]; }
			
			count.m += materialArray.length;
		}
	});	

	div_triangles_1.innerText = 'triangles: ' +renderer.info.render.triangles;
	div_countMesh_1.innerText = 'mesh: ' +count.g;	
	div_countMaterial_1.innerText = 'material: ' +count.m;

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
	if(infProg.boundBox)
	{
		disposeNode(infProg.boundBox);		
		scene.remove(infProg.boundBox);
		infProg.boundBox = null;
	}


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
		let materialArray = [];
		
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



function getBoundObject_1(params)
{
	let obj = params.obj;
	
	if(!obj) return;
	
	let arr = [];
	let arrFloor = [];

	obj.updateMatrixWorld(true);
	
	obj.traverse(function(child) 
	{
		if (child instanceof THREE.Mesh)
		{
			if(child.geometry) 
			{ 
				arr[arr.length] = child;					
			}
		}
	});	

	//scene.updateMatrixWorld();
	
	let v = [];
	let bound;
	
	for ( let i = 0; i < arr.length; i++ )
	{		
		arr[i].geometry.computeBoundingBox();	
		arr[i].geometry.computeBoundingSphere();

		bound = arr[i].geometry.boundingBox;
		
		//console.log(111111, arr[i], bound);

		v[v.length] = new THREE.Vector3(bound.min.x, bound.min.y, bound.max.z).applyMatrix4( arr[i].matrixWorld );
		v[v.length] = new THREE.Vector3(bound.max.x, bound.min.y, bound.max.z).applyMatrix4( arr[i].matrixWorld );
		v[v.length] = new THREE.Vector3(bound.min.x, bound.min.y, bound.min.z).applyMatrix4( arr[i].matrixWorld );
		v[v.length] = new THREE.Vector3(bound.max.x, bound.min.y, bound.min.z).applyMatrix4( arr[i].matrixWorld );

		v[v.length] = new THREE.Vector3(bound.min.x, bound.max.y, bound.max.z).applyMatrix4( arr[i].matrixWorld );
		v[v.length] = new THREE.Vector3(bound.max.x, bound.max.y, bound.max.z).applyMatrix4( arr[i].matrixWorld );
		v[v.length] = new THREE.Vector3(bound.min.x, bound.max.y, bound.min.z).applyMatrix4( arr[i].matrixWorld );
		v[v.length] = new THREE.Vector3(bound.max.x, bound.max.y, bound.min.z).applyMatrix4( arr[i].matrixWorld );

		
		let pos = arr[i].geometry.boundingSphere.center.clone().applyMatrix4( arr[i].matrixWorld );
		
		arrFloor[arrFloor.length] = {o: arr[i], name: arr[i].name, pos: pos};
	}
	
	bound = { min : { x : 999999, y : 999999, z : 999999 }, max : { x : -999999, y : -999999, z : -999999 } };
	
	for(let i = 0; i < v.length; i++)
	{
		if(v[i].x < bound.min.x) { bound.min.x = v[i].x; }
		if(v[i].x > bound.max.x) { bound.max.x = v[i].x; }
		if(v[i].y < bound.min.y) { bound.min.y = v[i].y; }
		if(v[i].y > bound.max.y) { bound.max.y = v[i].y; }			
		if(v[i].z < bound.min.z) { bound.min.z = v[i].z; }
		if(v[i].z > bound.max.z) { bound.max.z = v[i].z; }		
	}
	
	let newPos = new THREE.Vector3(-((bound.max.x - bound.min.x)/2 + bound.min.x), -((bound.max.y - bound.min.y)/2 + bound.min.y), -((bound.max.z - bound.min.z)/2 + bound.min.z));
	//obj.position.copy(newPos);
	
	let centerPos = new THREE.Vector3(((bound.max.x - bound.min.x)/2 + bound.min.x), ((bound.max.y - bound.min.y)/2 + bound.min.y), ((bound.max.z - bound.min.z)/2 + bound.min.z));
	let x = (bound.max.x - bound.min.x);
	let y = (bound.max.y - bound.min.y);
	let z = (bound.max.z - bound.min.z);			

	if(1==1)
	{
		let geometry = new THREE.BoxGeometry(x, y, z);	
		let material = new THREE.MeshLambertMaterial( {color: 0x00ff00, transparent: true, opacity: 0.5} );
		let cube = new THREE.Mesh( geometry, material );
		cube.position.copy(centerPos);
		cube.visible = false;
		scene.add( cube );

		infProg.boundBox = cube;
	}


	x = Math.round(x*100)/100;
	y = Math.round(y*100)/100;
	z = Math.round(z*100)/100;
	div_objSize_1.innerText = `size: x: ${x}, y: ${y}, z: ${z}`;

	render();
}


function fitCameraToObject(params)
{
	let obj = params.obj; 
	
	if(!obj) return;

	let v = [];
	
	obj.updateMatrixWorld();
	obj.geometry.computeBoundingBox();	

	let bound = obj.geometry.boundingBox;
	
	v[v.length] = new THREE.Vector3(bound.min.x, bound.min.y, bound.max.z).applyMatrix4( obj.matrixWorld );
	v[v.length] = new THREE.Vector3(bound.max.x, bound.min.y, bound.max.z).applyMatrix4( obj.matrixWorld );
	v[v.length] = new THREE.Vector3(bound.min.x, bound.min.y, bound.min.z).applyMatrix4( obj.matrixWorld );
	v[v.length] = new THREE.Vector3(bound.max.x, bound.min.y, bound.min.z).applyMatrix4( obj.matrixWorld );

	v[v.length] = new THREE.Vector3(bound.min.x, bound.max.y, bound.max.z).applyMatrix4( obj.matrixWorld );
	v[v.length] = new THREE.Vector3(bound.max.x, bound.max.y, bound.max.z).applyMatrix4( obj.matrixWorld );
	v[v.length] = new THREE.Vector3(bound.min.x, bound.max.y, bound.min.z).applyMatrix4( obj.matrixWorld );
	v[v.length] = new THREE.Vector3(bound.max.x, bound.max.y, bound.min.z).applyMatrix4( obj.matrixWorld );			


	{
		bound = { min : { x : 999999, y : 999999, z : 999999 }, max : { x : -999999, y : -999999, z : -999999 } };
		
		for(let i = 0; i < v.length; i++)
		{
			if(v[i].x < bound.min.x) { bound.min.x = v[i].x; }
			if(v[i].x > bound.max.x) { bound.max.x = v[i].x; }
			if(v[i].y < bound.min.y) { bound.min.y = v[i].y; }
			if(v[i].y > bound.max.y) { bound.max.y = v[i].y; }			
			if(v[i].z < bound.min.z) { bound.min.z = v[i].z; }
			if(v[i].z > bound.max.z) { bound.max.z = v[i].z; }		
		}		
		
		
		let center = new THREE.Vector3((bound.max.x - bound.min.x)/2 + bound.min.x, (bound.max.y - bound.min.y)/2 + bound.min.y, (bound.max.z - bound.min.z)/2 + bound.min.z);
		
		
		let fitOffset = 1;
		let maxSize = Math.max( bound.max.x - bound.min.x, bound.max.y - bound.min.y );  
		//let fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );		
		//let fitWidthDistance = fitHeightDistance / camera.aspect;		
		//let distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );		
		
		
		let dir = obj.getWorldDirection().multiplyScalar( maxSize * 2 );	
		camera.position.copy(center).add(dir);
		camera.lookAt(center);		
		
		controls.target.copy( center );
	}
	
	
	camera.updateProjectionMatrix();
	
	render();
}



export { init };


