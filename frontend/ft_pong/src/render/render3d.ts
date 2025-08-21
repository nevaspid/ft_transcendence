import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { WORLD_W, WORLD_H } from '../core/constants';
import type { Paddle } from '../core/paddle';
import { PaddleAnimation } from './paddleAnimation';

// === SCÈNE 3D SIMPLE ===
export function create3DScene(canvas: HTMLCanvasElement) {
  console.log('🚀 Creating 3D scene...');
  
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  
  // Activer la transparence
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
  
  // Éclairage amélioré
  const hemiLight = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.7;
  hemiLight.diffuse = new BABYLON.Color3(1, 1, 1);
  hemiLight.specular = new BABYLON.Color3(0.8, 0.8, 0.8);
  hemiLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  
  // Lumière directionnelle pour des ombres et reflets
  const dirLight = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-1, -2, -1), scene);
  dirLight.intensity = 0.5;
  dirLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8); // Lumière légèrement chaude
  
  console.log('✅ 3D scene created');
  return { engine, scene };
}

// === CHARGEMENT DES VAISSEAUX ===
export async function loadShips(scene: BABYLON.Scene) {
  console.log('🚀 Loading ships...');
  
  const assetsManager = new BABYLON.AssetsManager(scene);
  const xwingTask = assetsManager.addMeshTask('xwing', '', '/ft_pong/public/models/', 'xwing.glb');
  const tieTask = assetsManager.addMeshTask('tie', '', '/ft_pong/public/models/', 'tie.glb');
  
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
    mesh.renderingGroupId = 2; // Rendu après le terrain (1) mais avant la balle (3)
  });
  
  // Configuration TIE Fighter
  tieMeshes.forEach((mesh) => {
    mesh.parent = tieParent;
    mesh.rotationQuaternion = null;
    mesh.rotation.set(0, 0, -Math.PI / 2); // -90° pour orienter vers la gauche
    mesh.scaling.set(20, 20, 20); // Scaling final
    mesh.position.set(0, 0, 0);
    mesh.renderingGroupId = 2; // Rendu après le terrain (1) mais avant la balle (3)
  });
  
  // Définir aussi le renderingGroupId des parents
  xwingParent.renderingGroupId = 2;
  tieParent.renderingGroupId = 2;

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
  
  // 🎮 SETUP DES CONTRÔLES D'ANIMATION
  PaddleAnimation.setupDebugControls();
  
  console.log('✅ Ships configured');
  
  // Créer le système d'animation des paddles
  const paddleAnimation = new PaddleAnimation(xwingParent, tieParent);
  
  return { xwing: xwingParent, tie: tieParent, paddleAnimation };
}

// === SYNCHRONISATION AVEC LES PADDLES 2D ===

// 🔧 OFFSETS AJUSTABLES POUR LES POSITIONS DES VAISSEAUX
const SHIP_OFFSETS = {
  xwing: { x: 25, y: 0, z: 0 }, // X-Wing à x=25, y=0
  tie: { x: -50, y: 100, z: 5 }   // TIE à x=-50, y=100
};

export function syncShips(
  ships: { xwing: BABYLON.Mesh; tie: BABYLON.Mesh; paddleAnimation: PaddleAnimation },
  leftPaddle: Paddle,
  rightPaddle: Paddle,
  leftUpPressed: boolean,
  leftDownPressed: boolean,
  rightUpPressed: boolean,
  rightDownPressed: boolean
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
  
  // Animer les paddles selon les touches pressées
  const leftDirection = PaddleAnimation.getPaddleDirection(leftUpPressed, leftDownPressed);
  const rightDirection = PaddleAnimation.getPaddleDirection(rightUpPressed, rightDownPressed);
  
  ships.paddleAnimation.animateLeftPaddle(leftDirection);
  ships.paddleAnimation.animateRightPaddle(rightDirection);
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
    SHIP_OFFSETS.xwing = { x: 25, y: 0, z: 0 };
    SHIP_OFFSETS.tie = { x: -50, y: 100, z: 5 };
    console.log('🔧 Ship positions reset to default');
  };
  
  console.log('🎮 CONTRÔLES DE POSITION DISPONIBLES:');
  console.log('  - adjustXwingPosition(x, y, z?) : Ajuster la position du X-Wing');
  console.log('  - adjustTiePosition(x, y, z?)   : Ajuster la position du TIE');
  console.log('  - resetShipPositions()          : Remettre à zéro');
  
  // Fonction pour afficher toutes les positions actuelles
  (window as any).showAllPositions = () => {
    console.log('📍 === POSITIONS ACTUELLES DES ÉLÉMENTS 3D ===');
    console.log('🏞️ Terrain : Z=20 (renderingGroup=0)');
    console.log('🔲 Bordures : Z=10 (renderingGroup=1)');
    console.log('🚀 Vaisseaux : Z=0 (renderingGroup=2)');
    console.log('⚽ Balle : Z=-5 (renderingGroup=3)');
    console.log('📷 Caméra : Position (0, 0, -200)');
    console.log('');
    console.log('📏 Offsets actuels:');
    console.log(`  X-Wing: x=${SHIP_OFFSETS.xwing.x}, y=${SHIP_OFFSETS.xwing.y}, z=${SHIP_OFFSETS.xwing.z}`);
    console.log(`  TIE Fighter: x=${SHIP_OFFSETS.tie.x}, y=${SHIP_OFFSETS.tie.y}, z=${SHIP_OFFSETS.tie.z}`);
    console.log('');
    console.log('🎨 Ordre de rendu (renderingGroupId):');
    console.log('  0 = Terrain et ligne médiane (arrière-plan)');
    console.log('  1 = Bordures');
    console.log('  2 = Vaisseaux');
    console.log('  3 = Balle (premier plan)');
  };
} 