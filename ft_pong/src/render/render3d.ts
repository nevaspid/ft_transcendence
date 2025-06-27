import * as BABYLON from 'babylonjs';
import { AssetsManager } from 'babylonjs';
import { WORLD_W, WORLD_H } from '../core/constants';
import { Ball } from '../core/ball';
import { Paddle } from '../core/paddle';
import 'babylonjs-loaders';

export function createBabylonScene(canvas: HTMLCanvasElement) {
	const engine = new BABYLON.Engine(canvas, true,
		 { preserveDrawingBuffer: true, stencil: true, premultipliedAlpha: false });

	const scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

	const camera = new BABYLON.FreeCamera( 'cam', new BABYLON.Vector3(0, 0, -100), scene);
	camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
	camera.orthoTop = WORLD_H / 2;
	camera.orthoBottom = -WORLD_H / 2;
	camera.orthoLeft = -WORLD_W / 2;
	camera.orthoRight = WORLD_W / 2;

	new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
	return { engine, scene };
}

export async function loadAssets(scene: BABYLON.Scene) {
	const manager = new AssetsManager(scene);

	const ballTask = manager.addMeshTask('ball',   '', '/models/', 'ball.glb');
	const leftTask = manager.addMeshTask('left',   '', '/models/', 'xwing.glb');
	const rightTask = manager.addMeshTask('right',   '', '/models/', 'tie.glb');
	const fieldTask = manager.addMeshTask('field',   '', '/models/', 'force.glb');

	await manager.loadAsync();

	const ballMesh = ballTask.loadedMeshes[0];
	const leftMesh = leftTask.loadedMeshes[0];
	const rightMesh = rightTask.loadedMeshes[0];
	const fieldMesh = fieldTask.loadedMeshes[0];

	ballMesh.scaling.setAll(8);
	leftMesh.scaling.set(5, 25, 5);
	rightMesh.scaling.setAll(12);
	fieldMesh.scaling.set(WORLD_W, WORLD_H, 1);

	ballMesh.setPivotPoint(BABYLON.Vector3.Zero());
	ballMesh.rotationQuaternion = null;
	ballMesh.rotation.set(-Math.PI / 2, 0, -10);
	ballMesh.scaling.setAll(8);

	leftMesh.setPivotPoint(BABYLON.Vector3.Zero());
	leftMesh.rotationQuaternion = null;
	leftMesh.rotation.set(-Math.PI / 2, Math.PI, 0);
	leftMesh.scaling.set(5, 5, 5);

	rightMesh.setPivotPoint(BABYLON.Vector3.Zero());
	rightMesh.rotationQuaternion = null;
	rightMesh.rotation.set(-Math.PI / 2, 0, 0);
	rightMesh.scaling.set(5, 5, 5);

	fieldMesh.setPivotPoint(BABYLON.Vector3.Zero());
	fieldMesh.rotationQuaternion = null;
	fieldMesh.rotation.set(-Math.PI / 2, 0, 0);
	fieldMesh.scaling.set(WORLD_W, WORLD_H, 1);
	fieldMesh.position.z = -2;
	//(fieldMesh.material as BABYLON.Material).emissiveColor = new BABYLON.Color3(0, 1, 1);

	return { ballMesh, leftMesh, rightMesh };
}

export function syncMeshes(meshes: { ballMesh: BABYLON.AbstractMesh;
									 leftMesh: BABYLON.AbstractMesh;
									 rightMesh: BABYLON.AbstractMesh; },
									 ball: Ball, left: Paddle, right: Paddle) {
	const toScene = (x: number, y: number) =>
	new BABYLON.Vector3(x - WORLD_W / 2, -(y - WORLD_H / 2), 0);

	meshes.ballMesh.position  = toScene(ball.x,  ball.y);
	meshes.leftMesh.position  = toScene(left.x,  left.y);
	meshes.rightMesh.position = toScene(right.x, right.y);

	meshes.ballMesh.position.z  = 0.5;
	meshes.leftMesh.position.z  = 1;
	meshes.rightMesh.position.z = 1;
}