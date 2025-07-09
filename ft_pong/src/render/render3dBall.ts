// VERSION SIMPLIFIÉE POUR CORRIGER LE DOUBLE RENDU - SANS ERREURS

import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { WORLD_W, WORLD_H } from '../core/constants';
import type { Ball } from '../core/ball';

/*─────────────────────────────────────────────────────────────────────────────*/
/*  CHARGEMENT DE LA BALLE 3D - VERSION CORRIGÉE                              */
/*─────────────────────────────────────────────────────────────────────────────*/
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
    
    // Scaling
    const targetSize = 16;
    mainMesh.scaling.setAll(calculateBallScale(mainMesh, targetSize));
    mainMesh.position.set(0, 0, 0);
    
    console.log('⚽ Ball 3D model configured (single mesh)');
    return ballParent;
    
  } catch (error) {
    console.log('🔄 Using fallback: procedural sphere');
    return createFallbackSphere(scene);
  }
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*  SPHÈRE DE FALLBACK                                                        */
/*─────────────────────────────────────────────────────────────────────────────*/
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

/*─────────────────────────────────────────────────────────────────────────────*/
/*  CALCUL DU SCALING                                                         */
/*─────────────────────────────────────────────────────────────────────────────*/
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

/*─────────────────────────────────────────────────────────────────────────────*/
/*  SYNCHRONISATION BALLE 2D → 3D AVEC OFFSET AJUSTABLE                       */
/*─────────────────────────────────────────────────────────────────────────────*/

// 🔧 PARAMÈTRES D'AJUSTEMENT - Modifiez ces valeurs pour repositionner la balle 3D
const BALL_OFFSET = {
  x: 0,    // Décalage horizontal (+ = droite, - = gauche)
  y: 0,    // Décalage vertical (+ = haut, - = bas)
  z: 5     // Hauteur au-dessus du plan (+ = plus haut)
};

export function syncBall3D(ball3D: BABYLON.Mesh, ball2D: Ball) {
  const ball3DPos = {
    x: ball2D.x - WORLD_W / 2 + BALL_OFFSET.x,
    y: -(ball2D.y - WORLD_H / 2) + BALL_OFFSET.y,
    z: BALL_OFFSET.z
  };
  
  ball3D.position.set(ball3DPos.x, ball3DPos.y, ball3DPos.z);
}

// 🎮 FONCTION POUR AJUSTER LA POSITION EN TEMPS RÉEL
export function adjustBallOffset(offsetX: number, offsetY: number, offsetZ?: number) {
  BALL_OFFSET.x = offsetX;
  BALL_OFFSET.y = offsetY;
  if (offsetZ !== undefined) {
    BALL_OFFSET.z = offsetZ;
  }
  
  console.log(`🔧 Ball offset updated: x=${BALL_OFFSET.x}, y=${BALL_OFFSET.y}, z=${BALL_OFFSET.z}`);
}

// 🎯 FONCTION POUR TESTER DIFFÉRENTS OFFSETS RAPIDEMENT
export function setupBallOffsetTesting() {
  // Ajouter des fonctions globales pour tester depuis la console
  (window as any).ballOffset = (x: number, y: number, z?: number) => {
    adjustBallOffset(x, y, z);
  };
  
  (window as any).resetBallOffset = () => {
    adjustBallOffset(0, 0, 5);
  };
  
  console.log('🎮 CONTRÔLES DE LA BALLE DISPONIBLES:');
  console.log('  - ballOffset(x, y, z) : Ajuster la position');
  console.log('  - resetBallOffset()   : Remettre à zéro');
  console.log('  Exemple: ballOffset(-2, 3, 5)');
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*  FONCTION DE DIAGNOSTIC SIMPLE                                             */
/*─────────────────────────────────────────────────────────────────────────────*/
export function checkBallCount(scene: BABYLON.Scene) {
  const allMeshes = scene.meshes;
  const ballMeshes = allMeshes.filter(mesh => 
    mesh.name.toLowerCase().includes('ball') || 
    mesh.name.toLowerCase().includes('sphere')
  );
  
  console.log(`🔍 Total meshes in scene: ${allMeshes.length}`);
  console.log(`🔍 Ball-related meshes: ${ballMeshes.length}`);
  
  ballMeshes.forEach((mesh, index) => {
    console.log(`  - Ball ${index}: "${mesh.name}" at position ${mesh.position.toString()}`);
  });
  
  return ballMeshes.length;
}