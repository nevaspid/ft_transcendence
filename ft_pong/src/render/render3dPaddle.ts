import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { WORLD_W, WORLD_H } from '../core/constants';
import type { Paddle } from '../core/paddle';

/*─────────────────────────────────────────────────────────────────────────────*/
/*  CRÉATION DE LA SCÈNE BABYLON.JS                                           */
/*─────────────────────────────────────────────────────────────────────────────*/
export function createBabylonScene(canvas: HTMLCanvasElement) {
  console.log('🚀 Creating Babylon.js scene...');
  
  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    premultipliedAlpha: false,
  });
  
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // Transparent
  
  // Caméra orthographique alignée sur le monde 2D
  const camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, -100), scene);
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  camera.orthoLeft = -WORLD_W / 2;
  camera.orthoRight = WORLD_W / 2;
  camera.orthoTop = WORLD_H / 2;
  camera.orthoBottom = -WORLD_H / 2;
  camera.setTarget(BABYLON.Vector3.Zero());
  
  // Éclairage simple
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.8;
  
  console.log('✅ Babylon.js scene created');
  return { engine, scene };
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*  CHARGEMENT DES VAISSEAUX STAR WARS                                        */
/*─────────────────────────────────────────────────────────────────────────────*/
export async function loadStarWarsShips(scene: BABYLON.Scene) {
  console.log('🚀 Loading Star Wars ships as paddles...');
  
  const assetsManager = new BABYLON.AssetsManager(scene);
  const leftShipTask = assetsManager.addMeshTask('leftShip', '', '/models/', 'xwing.glb');
  const rightShipTask = assetsManager.addMeshTask('rightShip', '', '/models/', 'tie.glb');
  
  // Gestion des erreurs
  assetsManager.onTaskErrorObservable.add((task) => {
    console.error(`❌ Failed to load ${task.name}:`, task.errorObject);
  });
  
  assetsManager.onTaskSuccessObservable.add((task) => {
    console.log(`✅ Successfully loaded ${task.name}`);
  });
  
  await assetsManager.loadAsync();
  console.log('🎉 All ship assets loaded!');
  
  // Filtrer les meshes valides
  const leftMeshes = leftShipTask.loadedMeshes.filter(m => 
    m instanceof BABYLON.Mesh && m.getTotalVertices() > 0
  ) as BABYLON.Mesh[];
  
  const rightMeshes = rightShipTask.loadedMeshes.filter(m => 
    m instanceof BABYLON.Mesh && m.getTotalVertices() > 0
  ) as BABYLON.Mesh[];
  
  console.log(`X-Wing: ${leftMeshes.length} meshes, TIE Fighter: ${rightMeshes.length} meshes`);
  
  // Configuration X-Wing (gauche)
  leftMeshes.forEach((mesh) => {
    mesh.rotationQuaternion = null;
    mesh.rotation.set(0, 0, Math.PI / 2);  // 90° antihoraire
    mesh.scaling.set(85, 32, 70);          // Taille optimisée
    mesh.position.set(0, -3, 2);           // Position ajustée
  });
  
  // Configuration TIE Fighter (droite)
  rightMeshes.forEach((mesh) => {
    mesh.rotationQuaternion = null;
    mesh.rotation.set(0, 0, -Math.PI / 2); // 90° horaire
    mesh.scaling.set(20, 14, 8);           // Taille optimisée
    mesh.position.set(-20, 51, 2);         // Position ajustée
  });
  
  // Créer des parents pour le grouping
  const leftParent = new BABYLON.Mesh('xwingParent', scene);
  const rightParent = new BABYLON.Mesh('tieParent', scene);
  
  // Parenter les meshes
  leftMeshes.forEach(mesh => mesh.parent = leftParent);
  rightMeshes.forEach(mesh => mesh.parent = rightParent);
  
  console.log('🚀 Ships configured successfully');
  return { leftShip: leftParent, rightShip: rightParent };
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*  SYNCHRONISATION DES VAISSEAUX                                             */
/*─────────────────────────────────────────────────────────────────────────────*/
export function syncStarWarsShips(
  ships: { leftShip: BABYLON.Mesh; rightShip: BABYLON.Mesh },
  leftPaddle: Paddle,
  rightPaddle: Paddle
) {
  const left3D = {
    x: leftPaddle.x - WORLD_W / 2,
    y: -(leftPaddle.y - WORLD_H / 2),
    z: 0
  };
  
  const right3D = {
    x: rightPaddle.x - WORLD_W / 2,
    y: -(rightPaddle.y - WORLD_H / 2),
    z: 0
  };
  
  ships.leftShip.position.set(left3D.x, left3D.y, left3D.z);
  ships.rightShip.position.set(right3D.x, right3D.y, right3D.z);
}