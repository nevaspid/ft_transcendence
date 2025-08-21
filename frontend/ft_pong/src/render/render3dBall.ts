import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { WORLD_W, WORLD_H } from '../core/constants';
import type { Ball } from '../core/ball';

// === CHARGEMENT DE LA BALLE 3D ===
export async function loadBall3D(scene: BABYLON.Scene) {
  console.log('⚽ Loading 3D ball...');
  
  try {
    const assetsManager = new BABYLON.AssetsManager(scene);
    const ballTask = assetsManager.addMeshTask('ball3D', '', '/ft_pong/public/models/', 'ball.glb');
    
    ballTask.onSuccess = (task) => {
      console.log('✅ Ball model loaded successfully');
    };
    
    ballTask.onError = (task, message, exception) => {
      console.warn('⚠️ Failed to load ball.glb, using fallback sphere');
      throw new Error('Ball model loading failed');
    };
    
    await assetsManager.loadAsync();

    // Regrouper tous les meshes (hors __root__) dans un parent
    const ballMeshes = ballTask.loadedMeshes.filter(m => m instanceof BABYLON.Mesh && m.name !== '__root__') as BABYLON.Mesh[];
    if (ballMeshes.length === 0) {
      throw new Error('No valid mesh found');
    }
    const ballParent = new BABYLON.TransformNode('ballParent', scene);
    // Grouper les bounding box pour le scaling
    let min = ballMeshes[0].getBoundingInfo().boundingBox.minimumWorld.clone();
    let max = ballMeshes[0].getBoundingInfo().boundingBox.maximumWorld.clone();
    ballMeshes.forEach(m => {
      m.parent = ballParent;
      m.rotationQuaternion = null;
      m.position = m.position.clone(); // préserve la position relative
      const box = m.getBoundingInfo().boundingBox;
      min = BABYLON.Vector3.Minimize(min, box.minimumWorld);
      max = BABYLON.Vector3.Maximize(max, box.maximumWorld);
    });
    const size = Math.max(max.x - min.x, max.y - min.y, max.z - min.z);
    const targetSize = 16;
    const scale = targetSize / size;
    ballParent.scaling.set(scale, scale, scale);
    ballParent.position.set(0, 0, 0);
    ballParent.renderingGroupId = 3;
    console.log('⚽ Ball 3D model (multi-mesh) configured');
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
  
  // Assurer que la sphère de fallback est aussi au premier plan
  sphere.renderingGroupId = 3;
  
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
  x: 0,     // Décalage horizontal (+ = droite, - = gauche)
  y: 0,     // Décalage vertical (+ = haut, - = bas)
  z: -5     // Position Z très en avant (négatif = plus proche de la caméra)
};

export function syncBall3D(ball3D: BABYLON.Mesh, ball2D: Ball) {
  // Conversion directe des coordonnées 2D vers 3D avec offsets
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
    BALL_OFFSET.x = 0;
    BALL_OFFSET.y = 0;
    BALL_OFFSET.z = -5;
    console.log('🔧 Ball offset reset to default');
  };
  
  console.log('🎮 CONTRÔLES DE LA BALLE DISPONIBLES:');
  console.log('  - adjustBallOffset(x, y, z?) : Ajuster la position');
  console.log('  - resetBallOffset()          : Remettre à zéro');
} 