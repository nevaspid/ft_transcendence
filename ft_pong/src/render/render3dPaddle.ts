// MODIFICATION SIMPLE POUR CAMÉRA ISOMÉTRIQUE 30°/45°

import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { WORLD_W, WORLD_H } from '../core/constants';
import type { Paddle } from '../core/paddle';

/*─────────────────────────────────────────────────────────────────────────────*/
/*  CAMÉRA ISOMÉTRIQUE SIMPLE (BASÉE SUR VOTRE CONFIGURATION ACTUELLE)        */
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
  
  // 🎯 CAMÉRA ISOMÉTRIQUE BASÉE SUR VOTRE CONFIG ACTUELLE
  const camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, -100), scene);
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  
  // Gardez vos paramètres orthographiques actuels
  camera.orthoLeft = -WORLD_W / 2;
  camera.orthoRight = WORLD_W / 2;
  camera.orthoTop = WORLD_H / 2;
  camera.orthoBottom = -WORLD_H / 2;
  
  // 🔧 MODIFICATION CLÉE : Ajuster la position et rotation pour l'isométrique
  // Position : reculer et monter la caméra
  camera.position.set(0, -200, -200); // X=200, Y=300 (hauteur), Z=-400 (recul)
  
  // Rotation isométrique : 30° vers le bas, 45° sur Y
  camera.rotation.x = Math.PI / 6;  // 30° vers le bas
  camera.rotation.y = Math.PI / 4;  // 45° rotation horizontale
  camera.rotation.z = 0;            // Pas de rotation sur Z
  
  // Toujours pointer vers le centre
  camera.setTarget(BABYLON.Vector3.Zero());
  
  console.log('📷 Isometric camera configured (30°/45°)');
  
  // Éclairage (gardez votre configuration actuelle)
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.8;
  scene.shadowsEnabled = true;
  
  console.log('✅ Babylon.js scene created');
  return { engine, scene };
}

// 🎮 FONCTION POUR AJUSTER L'ANGLE EN TEMPS RÉEL
export function adjustIsometricAngles(scene: BABYLON.Scene, angleX: number = 30, angleY: number = 45) {
  const camera = scene.activeCamera as BABYLON.FreeCamera;
  if (!camera) return;
  
  // Convertir degrés en radians
  camera.rotation.x = angleX * Math.PI / 180;
  camera.rotation.y = angleY * Math.PI / 180;
  camera.setTarget(BABYLON.Vector3.Zero());
  
  console.log(`📷 Camera angles adjusted: X=${angleX}°, Y=${angleY}°`);
}

// 🔧 CONTRÔLES POUR TESTER L'ANGLE PARFAIT
export function setupSimpleIsometricControls(scene: BABYLON.Scene) {
  // Fonctions globales pour ajuster les angles
  (window as any).setIsoAngles = (angleX: number, angleY: number) => {
    adjustIsometricAngles(scene, angleX, angleY);
  };
  
  (window as any).resetCamera = () => {
    adjustIsometricAngles(scene, 30, 45);
  };
  
  console.log('🎮 CONTRÔLES ISOMÉTRIQUES DISPONIBLES:');
  console.log('  - setIsoAngles(angleX, angleY) : Ajuster les angles');
  console.log('  - resetCamera()                : Remettre à 30°/45°');
  console.log('  💡 Exemples:');
  console.log('    - setIsoAngles(30, 45)  // Isométrique classique');
  console.log('    - setIsoAngles(25, 40)  // Plus doux');
  console.log('    - setIsoAngles(35, 50)  // Plus prononcé');
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*  RESTE DU CODE INCHANGÉ (VAISSEAUX ET SYNCHRONISATION)                     */
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