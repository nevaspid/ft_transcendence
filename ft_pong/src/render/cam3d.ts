import * as BABYLON from 'babylonjs';
import { WORLD_W, WORLD_H } from '../core/constants';

// === CAMÉRA ORTHOGRAPHIQUE SIMPLE ===
export function createCamera(scene: BABYLON.Scene): BABYLON.FreeCamera {
  console.log('📷 Creating orthographic camera...');
  
  const camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, -200), scene);
  
  // Configuration orthographique ajustée pour une meilleure vue
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  const orthoScale = 1.2; // Facteur pour voir un peu plus large que le terrain
  camera.orthoLeft = -WORLD_W / 2 * orthoScale;
  camera.orthoRight = WORLD_W / 2 * orthoScale;
  camera.orthoTop = WORLD_H / 2 * orthoScale;
  camera.orthoBottom = -WORLD_H / 2 * orthoScale;
  
  // Position et orientation optimisées (caméra d'origine)
  camera.position.set(0, 0, -200);
  camera.setTarget(new BABYLON.Vector3(0, 0, 20)); // Regarder le terrain à Z=20

  // Fonction globale pour tourner la caméra autour de l'axe Y depuis la console
  (window as any).setCameraYRotation = (degrees: number) => {
    const angleY = degrees * Math.PI / 180;
    const radius = 200;
    camera.position.set(
      Math.sin(angleY) * radius,
      0,
      -Math.cos(angleY) * radius
    );
    camera.setTarget(new BABYLON.Vector3(0, 0, 20));
    console.log(`📷 Caméra tournée de ${degrees}° autour de l'axe Y.`);
  };
  
  // Fonction globale pour tourner la caméra autour de l'axe X depuis la console
  (window as any).setCameraXRotation = (degrees: number) => {
    const angleX = degrees * Math.PI / 180;
    const radius = 200;
    camera.position.set(
      0,
      Math.sin(angleX) * radius,
      -Math.cos(angleX) * radius
    );
    camera.setTarget(new BABYLON.Vector3(0, 0, 20));
    console.log(`📷 Caméra inclinée de ${degrees}° autour de l'axe X.`);
  };
  
  console.log('✅ Orthographic camera created');
  return camera;
}

// === CONTRÔLES SIMPLES ===
export function setupCameraControls(camera: BABYLON.FreeCamera) {
  // Ajuster la position de la caméra
  (window as any).adjustCameraPosition = (x: number, y: number, z: number) => {
    camera.position.set(x, y, z);
    console.log(`📷 Camera position: (${x}, ${y}, ${z})`);
  };
  
  // Remettre la caméra à la position par défaut
  (window as any).resetCamera = () => {
    camera.position.set(0, 0, -200);
    camera.setTarget(new BABYLON.Vector3(0, 0, 20));
    console.log('📷 Camera reset to default position');
  };

  // Fonction globale pour debug : passer en perspective et positionner la caméra
  (window as any).setCameraPerspective = (x: number, y: number, z: number, targetX: number, targetY: number, targetZ: number) => {
    camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
    camera.position.set(x, y, z);
    camera.setTarget(new BABYLON.Vector3(targetX, targetY, targetZ));
    console.log(`🎥 Camera en perspective à (${x}, ${y}, ${z}), cible (${targetX}, ${targetY}, ${targetZ})`);
  };
  
  console.log('🎮 CONTRÔLES DE CAMÉRA DISPONIBLES:');
  console.log('  - adjustCameraPosition(x, y, z) : Ajuster la position');
  console.log('  - resetCamera()                 : Remettre à la position par défaut');
} 