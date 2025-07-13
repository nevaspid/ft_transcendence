import * as BABYLON from 'babylonjs';
import { WORLD_W, WORLD_H } from '../core/constants';

// === CAMÉRA ORTHOGRAPHIQUE SIMPLE ===
export function createCamera(scene: BABYLON.Scene): BABYLON.FreeCamera {
  console.log('📷 Creating orthographic camera...');
  
  const camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 200, -100), scene);
  
  // Configuration orthographique simple
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  camera.orthoLeft = -WORLD_W / 2;
  camera.orthoRight = WORLD_W / 2;
  camera.orthoTop = WORLD_H / 2;
  camera.orthoBottom = -WORLD_H / 2;
  
  // Position et orientation
  camera.position.set(0, -40, -100);
  camera.setTarget(BABYLON.Vector3.Zero());
  
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
    camera.position.set(0, -40, -100);
    camera.setTarget(BABYLON.Vector3.Zero());
    console.log('📷 Camera reset to default position');
  };
  
  console.log('🎮 CONTRÔLES DE CAMÉRA DISPONIBLES:');
  console.log('  - adjustCameraPosition(x, y, z) : Ajuster la position');
  console.log('  - resetCamera()                 : Remettre à la position par défaut');
} 