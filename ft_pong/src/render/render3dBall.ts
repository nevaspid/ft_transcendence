import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { WORLD_W, WORLD_H } from '../core/constants';
import type { Ball } from '../core/ball';

// === CHARGEMENT DE LA BALLE 3D ===
export async function loadBall3D(scene: BABYLON.Scene) {
  console.log('⚽ Loading 3D ball...');
  
  try {
    const assetsManager = new BABYLON.AssetsManager(scene);
    const ballTask = assetsManager.addMeshTask('ball3D', '', '/models/', 'ball.glb');
    
    ballTask.onSuccess = (task) => {
      console.log('✅ Ball model loaded successfully');
    };
    
    ballTask.onError = (task, message, exception) => {
      console.warn('⚠️ Failed to load ball.glb, using fallback sphere');
      throw new Error('Ball model loading failed');
    };
    
    await assetsManager.loadAsync();
    
    // Filtrer les meshes valides
    const ballMeshes = ballTask.loadedMeshes.filter(m => 
      m instanceof BABYLON.Mesh && m.getTotalVertices() > 0
    ) as BABYLON.Mesh[];
    
    console.log(`Ball model: ${ballMeshes.length} meshes found`);
    
    // 🔧 SOLUTION: Ne garder que le PREMIER mesh (éliminer les doublons)
    if (ballMeshes.length > 1) {
      console.log('⚠️ Multiple meshes detected - keeping only the first one');
      
      // Supprimer tous les meshes sauf le premier
      for (let i = 1; i < ballMeshes.length; i++) {
        console.log(`🗑️ Removing mesh: ${ballMeshes[i].name}`);
        ballMeshes[i].dispose();
      }
    }
    
    // Ne garder que le premier mesh
    const mainMesh = ballMeshes[0];
    if (!mainMesh) {
      throw new Error('No valid mesh found');
    }
    
    // Créer un parent
    const ballParent = new BABYLON.Mesh('ballParent', scene);
    
    // Configuration du mesh unique
    mainMesh.rotationQuaternion = null;
    mainMesh.parent = ballParent;
    mainMesh.rotation.set(-Math.PI / 2, 0, 0);
    
    // Scaling pour correspondre à la hitbox 16x16
    const targetSize = 16;
    mainMesh.scaling.setAll(calculateBallScale(mainMesh, targetSize));
    mainMesh.position.set(0, 0, 0);
    
    // 🎮 FONCTIONS DE DEBUG POUR AJUSTER LE SCALING DE LA BALLE
    (window as any).adjustBallScaling = (scale: number) => {
      mainMesh.scaling.setAll(scale);
      console.log(`🔧 Ball scaling: ${scale}`);
    };
    
    (window as any).resetBallScaling = () => {
      const targetSize = 16;
      const scale = calculateBallScale(mainMesh, targetSize);
      mainMesh.scaling.setAll(scale);
      console.log('🔧 Ball scaling reset to calculated size');
    };
    
    console.log('🎮 CONTRÔLES DE SCALING DE LA BALLE DISPONIBLES:');
    console.log('  - adjustBallScaling(scale) : Ajuster le scaling');
    console.log('  - resetBallScaling()        : Remettre au calcul automatique');
    
    console.log('⚽ Ball 3D model configured');
    return ballParent;
    
  } catch (error) {
    console.log('🔄 Using fallback: procedural sphere');
    return createFallbackSphere(scene);
  }
}

// === SPHÈRE DE FALLBACK ===
function createFallbackSphere(scene: BABYLON.Scene): BABYLON.Mesh {
  console.log('🔵 Creating fallback sphere...');
  
  const sphere = BABYLON.MeshBuilder.CreateSphere('ballSphere', {
    diameter: 16,
    segments: 16
  }, scene);
  
  sphere.rotation.set(-Math.PI / 2, 0, 0);
  
  const ballMaterial = new BABYLON.StandardMaterial('ballMaterial', scene);
  ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
  ballMaterial.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
  ballMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  sphere.material = ballMaterial;
  
  console.log('✅ Fallback sphere created');
  return sphere;
}

// === CALCUL DU SCALING ===
function calculateBallScale(mesh: BABYLON.Mesh, targetSize: number): number {
  try {
    mesh.computeWorldMatrix(true);
    
    const boundingInfo = mesh.getBoundingInfo();
    const box = boundingInfo.boundingBox;
    
    const currentSize = Math.max(
      box.extendSizeWorld.x * 2,
      box.extendSizeWorld.y * 2,
      box.extendSizeWorld.z * 2
    );
    
    console.log(`📏 Ball model size: ${currentSize.toFixed(2)} → target: ${targetSize}`);
    
    if (currentSize > 0) {
      const scale = targetSize / currentSize;
      console.log(`🔧 Ball scale factor: ${scale.toFixed(3)}`);
      return scale;
    }
  } catch (error) {
    console.warn('⚠️ Failed to calculate ball scale:', error);
  }
  
  return 1;
}

// === SYNCHRONISATION BALLE 2D → 3D ===

// 🔧 OFFSETS AJUSTABLES POUR LA POSITION DE LA BALLE
const BALL_OFFSET = {
  x: 4,     // Décalage horizontal (+ = droite, - = gauche)
  y: -8,    // Décalage vertical (+ = haut, - = bas) - ajusté pour aligner avec les bordures
  z: 5      // Hauteur au-dessus du plan (+ = plus haut) - position Z simplifiée
};

export function syncBall3D(ball3D: BABYLON.Mesh, ball2D: Ball) {
  const ball3DPos = {
    x: ball2D.x - WORLD_W / 2 + BALL_OFFSET.x,
    y: -(ball2D.y - WORLD_H / 2) + BALL_OFFSET.y,
    z: BALL_OFFSET.z
  };
  
  ball3D.position.set(ball3DPos.x, ball3DPos.y, ball3DPos.z);
}

// 🎮 FONCTIONS DE DEBUG POUR AJUSTER LA POSITION
export function setupBallControls() {
  // Ajuster la position de la balle
  (window as any).adjustBallOffset = (x: number, y: number, z?: number) => {
    BALL_OFFSET.x = x;
    BALL_OFFSET.y = y;
    if (z !== undefined) {
      BALL_OFFSET.z = z;
    }
    console.log(`🔧 Ball offset: x=${BALL_OFFSET.x}, y=${BALL_OFFSET.y}, z=${BALL_OFFSET.z}`);
  };
  
  // Remettre à zéro
  (window as any).resetBallOffset = () => {
    BALL_OFFSET.x = 4;
    BALL_OFFSET.y = -8;
    BALL_OFFSET.z = 5;
    console.log('🔧 Ball offset reset to default');
  };
  
  console.log('🎮 CONTRÔLES DE LA BALLE DISPONIBLES:');
  console.log('  - adjustBallOffset(x, y, z?) : Ajuster la position');
  console.log('  - resetBallOffset()          : Remettre à zéro');
} 