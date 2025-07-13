import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { WORLD_W, WORLD_H } from '../core/constants';
import type { Paddle } from '../core/paddle';

// === SCÈNE 3D SIMPLE ===
export function create3DScene(canvas: HTMLCanvasElement) {
  console.log('🚀 Creating 3D scene...');
  
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  
  // Activer la transparence
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
  
  // Éclairage simple
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.8;
  
  console.log('✅ 3D scene created');
  return { engine, scene };
}

// === CHARGEMENT DES VAISSEAUX ===
export async function loadShips(scene: BABYLON.Scene) {
  console.log('🚀 Loading ships...');
  
  const assetsManager = new BABYLON.AssetsManager(scene);
  const xwingTask = assetsManager.addMeshTask('xwing', '', '/models/', 'xwing.glb');
  const tieTask = assetsManager.addMeshTask('tie', '', '/models/', 'tie.glb');
  
  // Gestion des erreurs
  assetsManager.onTaskErrorObservable.add((task) => {
    console.error(`❌ Failed to load ${task.name}:`, task.errorObject);
  });
  
  await assetsManager.loadAsync();
  console.log('✅ Ships loaded');
  
  // Configuration X-Wing (gauche)
  const xwingMeshes = xwingTask.loadedMeshes.filter(m => 
    m instanceof BABYLON.Mesh && m.getTotalVertices() > 0
  ) as BABYLON.Mesh[];
  
  // Configuration TIE Fighter (droite)
  const tieMeshes = tieTask.loadedMeshes.filter(m => 
    m instanceof BABYLON.Mesh && m.getTotalVertices() > 0
  ) as BABYLON.Mesh[];
  
  console.log(`X-Wing: ${xwingMeshes.length} meshes, TIE: ${tieMeshes.length} meshes`);
  
  // Créer des parents pour le grouping
  const xwingParent = new BABYLON.Mesh('xwingParent', scene);
  const tieParent = new BABYLON.Mesh('tieParent', scene);
  
  // Configuration X-Wing
  xwingMeshes.forEach((mesh) => {
    mesh.parent = xwingParent;
    mesh.rotationQuaternion = null;
    mesh.rotation.set(0, 0, Math.PI / 2); // 90° pour orienter vers la droite
    mesh.scaling.set(90, 90, 90); // Scaling maintenu pour correspondre à la hitbox
    mesh.position.set(0, 0, 0);
    mesh.renderingGroupId = 1; // Premier plan
  });
  
  // Configuration TIE Fighter
  tieMeshes.forEach((mesh) => {
    mesh.parent = tieParent;
    mesh.rotationQuaternion = null;
    mesh.rotation.set(0, 0, -Math.PI / 2); // -90° pour orienter vers la gauche
    mesh.scaling.set(20, 20, 20); // Scaling final
    mesh.position.set(0, 0, 0);
    mesh.renderingGroupId = 1; // Premier plan
  });
  
  // 🎮 FONCTIONS DE DEBUG POUR AJUSTER LE SCALING
  (window as any).adjustShipScaling = (xwingScale: number, tieScale: number) => {
    xwingMeshes.forEach(mesh => mesh.scaling.setAll(xwingScale));
    tieMeshes.forEach(mesh => mesh.scaling.setAll(tieScale));
    console.log(`🔧 Ship scaling: X-Wing=${xwingScale}, TIE=${tieScale}`);
  };
  
  (window as any).resetShipScaling = () => {
    xwingMeshes.forEach(mesh => mesh.scaling.set(90, 90, 90));
    tieMeshes.forEach(mesh => mesh.scaling.set(20, 20, 20));
    console.log('🔧 Ship scaling reset to default');
  };
  
  console.log('🎮 CONTRÔLES DE SCALING DISPONIBLES:');
  console.log('  - adjustShipScaling(xwingScale, tieScale) : Ajuster le scaling');
  console.log('  - resetShipScaling()                      : Remettre aux valeurs par défaut');
  
  // 🎮 SETUP DES CONTRÔLES DE POSITION
  setupShipPositionControls();
  
  console.log('✅ Ships configured');
  return { xwing: xwingParent, tie: tieParent };
}

// === SYNCHRONISATION AVEC LES PADDLES 2D ===

// 🔧 OFFSETS AJUSTABLES POUR LES POSITIONS DES VAISSEAUX
const SHIP_OFFSETS = {
  xwing: { x: 21, y: -2, z: 30 }, // X-Wing offsets - Z très en avant pour éviter le clipping
  tie: { x: -50, y: 50, z: 10 }    // TIE Fighter offsets - position Z normale
};

export function syncShips(
  ships: { xwing: BABYLON.Mesh; tie: BABYLON.Mesh },
  leftPaddle: Paddle,
  rightPaddle: Paddle
) {
  // Convertir les coordonnées 2D en 3D avec offsets
  const left3D = {
    x: leftPaddle.x - WORLD_W / 2 + SHIP_OFFSETS.xwing.x,
    y: -(leftPaddle.y - WORLD_H / 2) + SHIP_OFFSETS.xwing.y,
    z: SHIP_OFFSETS.xwing.z
  };
  
  const right3D = {
    x: rightPaddle.x - WORLD_W / 2 + SHIP_OFFSETS.tie.x,
    y: -(rightPaddle.y - WORLD_H / 2) + SHIP_OFFSETS.tie.y,
    z: SHIP_OFFSETS.tie.z
  };
  
  // Appliquer les positions
  ships.xwing.position.set(left3D.x, left3D.y, left3D.z);
  ships.tie.position.set(right3D.x, right3D.y, right3D.z);
}

// 🎮 FONCTIONS DE DEBUG POUR AJUSTER LES POSITIONS
export function setupShipPositionControls() {
  // Ajuster la position du X-Wing
  (window as any).adjustXwingPosition = (x: number, y: number, z?: number) => {
    SHIP_OFFSETS.xwing.x = x;
    SHIP_OFFSETS.xwing.y = y;
    if (z !== undefined) SHIP_OFFSETS.xwing.z = z;
    console.log(`🔧 X-Wing position: x=${x}, y=${y}, z=${SHIP_OFFSETS.xwing.z}`);
  };
  
  // Ajuster la position du TIE Fighter
  (window as any).adjustTiePosition = (x: number, y: number, z?: number) => {
    SHIP_OFFSETS.tie.x = x;
    SHIP_OFFSETS.tie.y = y;
    if (z !== undefined) SHIP_OFFSETS.tie.z = z;
    console.log(`🔧 TIE position: x=${x}, y=${y}, z=${SHIP_OFFSETS.tie.z}`);
  };
  
  // Remettre les positions à zéro
  (window as any).resetShipPositions = () => {
    SHIP_OFFSETS.xwing = { x: 21, y: -2, z: 30 };
    SHIP_OFFSETS.tie = { x: -50, y: 50, z: 10 };
    console.log('🔧 Ship positions reset to default');
  };
  
  console.log('🎮 CONTRÔLES DE POSITION DISPONIBLES:');
  console.log('  - adjustXwingPosition(x, y, z?) : Ajuster la position du X-Wing');
  console.log('  - adjustTiePosition(x, y, z?)   : Ajuster la position du TIE');
  console.log('  - resetShipPositions()          : Remettre à zéro');
} 