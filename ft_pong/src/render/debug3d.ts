import * as BABYLON from 'babylonjs';

// Variables globales pour stocker les références
let starDestroyerParent: BABYLON.TransformNode | null = null;
let backgroundPlane: BABYLON.Mesh | null = null;
let backgroundOverlay: BABYLON.Mesh | null = null;

// === FONCTIONS DE DEBUG POUR LE STAR DESTROYER ===

export function setStarDestroyerReferences(parent: BABYLON.TransformNode) {
  starDestroyerParent = parent;
  console.log('🔧 Références Star Destroyer configurées');
}

export function debugStarDestroyer() {
  if (!starDestroyerParent) {
    console.error('❌ Star Destroyer non trouvé. Assurez-vous qu\'il est chargé.');
    return;
  }

  // Position du Star Destroyer
  (window as any).moveStarDestroyer = (x: number, y: number, z: number) => {
    if (starDestroyerParent) {
      starDestroyerParent.position.set(x, y, z);
      console.log(`🛸 Star Destroyer position: (${x}, ${y}, ${z})`);
    }
  };

  // Rotation du Star Destroyer
  (window as any).rotateStarDestroyer = (x: number, y: number, z: number) => {
    if (starDestroyerParent) {
      const rotX = x * Math.PI / 180;
      const rotY = y * Math.PI / 180;
      const rotZ = z * Math.PI / 180;
      starDestroyerParent.rotation.set(rotX, rotY, rotZ);
      console.log(`🛸 Star Destroyer rotation: (${x}°, ${y}°, ${z}°)`);
    }
  };

  // Taille du Star Destroyer
  (window as any).scaleStarDestroyer = (scale: number) => {
    if (starDestroyerParent) {
      starDestroyerParent.scaling.set(scale, scale, scale);
      console.log(`🛸 Star Destroyer scale: ${scale}`);
    }
  };

  // Taille différente sur chaque axe
  (window as any).scaleStarDestroyerXYZ = (x: number, y: number, z: number) => {
    if (starDestroyerParent) {
      starDestroyerParent.scaling.set(x, y, z);
      console.log(`🛸 Star Destroyer scale: (${x}, ${y}, ${z})`);
    }
  };

  // Cacher/Montrer le Star Destroyer
  (window as any).hideStarDestroyer = () => {
    if (starDestroyerParent) {
      starDestroyerParent.setEnabled(false);
      console.log('🛸 Star Destroyer caché');
    }
  };

  (window as any).showStarDestroyer = () => {
    if (starDestroyerParent) {
      starDestroyerParent.setEnabled(true);
      console.log('🛸 Star Destroyer affiché');
    }
  };

  // Reset du Star Destroyer
  (window as any).resetStarDestroyer = () => {
    if (starDestroyerParent) {
      starDestroyerParent.position.set(0, 0, 250);
      starDestroyerParent.rotation.set(150 * Math.PI / 180, -40 * Math.PI / 180, -200 * Math.PI / 180);
      starDestroyerParent.scaling.set(0.8, 0.8, 0.8);
      starDestroyerParent.setEnabled(true);
      console.log('🛸 Star Destroyer remis à vos valeurs optimales');
    }
  };

  // Afficher les informations actuelles
  (window as any).getStarDestroyerInfo = () => {
    if (starDestroyerParent) {
      const pos = starDestroyerParent.position;
      const rot = starDestroyerParent.rotation;
      const scale = starDestroyerParent.scaling;
      console.log('🛸 Star Destroyer Info:');
      console.log(`  Position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
      console.log(`  Rotation: (${(rot.x * 180 / Math.PI).toFixed(2)}°, ${(rot.y * 180 / Math.PI).toFixed(2)}°, ${(rot.z * 180 / Math.PI).toFixed(2)}°)`);
      console.log(`  Scale: (${scale.x.toFixed(2)}, ${scale.y.toFixed(2)}, ${scale.z.toFixed(2)})`);
      console.log(`  Enabled: ${starDestroyerParent.isEnabled()}`);
    }
  };

  console.log('🎮 CONTRÔLES STAR DESTROYER DISPONIBLES:');
  console.log('  - moveStarDestroyer(x, y, z)     : Déplacer le Star Destroyer');
  console.log('  - rotateStarDestroyer(x, y, z)   : Faire pivoter le Star Destroyer (en degrés)');
  console.log('  - scaleStarDestroyer(scale)      : Redimensionner uniformément');
  console.log('  - scaleStarDestroyerXYZ(x,y,z)   : Redimensionner sur chaque axe');
  console.log('  - hideStarDestroyer()            : Cacher le Star Destroyer');
  console.log('  - showStarDestroyer()            : Afficher le Star Destroyer');
  console.log('  - resetStarDestroyer()           : Remettre aux valeurs par défaut');
  console.log('  - getStarDestroyerInfo()         : Afficher les informations actuelles');
}

// === FONCTIONS DE DEBUG POUR L'IMAGE DE FOND ===

export function setBackgroundReferences(plane: BABYLON.Mesh, overlay: BABYLON.Mesh) {
  backgroundPlane = plane;
  backgroundOverlay = overlay;
  console.log('🔧 Références image de fond configurées');
}

export function debugBackground() {
  if (!backgroundPlane) {
    console.error('❌ Image de fond non trouvée. Assurez-vous qu\'elle est chargée.');
    return;
  }

  // Position de l'image de fond
  (window as any).moveBackground = (x: number, y: number, z: number) => {
    if (backgroundPlane) {
      backgroundPlane.position.set(x, y, z);
      if (backgroundOverlay) {
        backgroundOverlay.position.set(x, y, z - 1);
      }
      console.log(`🖼️ Background position: (${x}, ${y}, ${z})`);
    }
  };

  // Rotation de l'image de fond
  (window as any).rotateBackground = (x: number, y: number, z: number) => {
    if (backgroundPlane) {
      const rotX = x * Math.PI / 180;
      const rotY = y * Math.PI / 180;
      const rotZ = z * Math.PI / 180;
      backgroundPlane.rotation.set(rotX, rotY, rotZ);
      if (backgroundOverlay) {
        backgroundOverlay.rotation.set(rotX, rotY, rotZ);
      }
      console.log(`🖼️ Background rotation: (${x}°, ${y}°, ${z}°)`);
    }
  };

  // Taille de l'image de fond
  (window as any).scaleBackground = (width: number, height: number) => {
    if (backgroundPlane) {
      backgroundPlane.scaling.set(width / 2000, height / 1200, 1);
      if (backgroundOverlay) {
        backgroundOverlay.scaling.set(width / 2000, height / 1200, 1);
      }
      console.log(`🖼️ Background size: ${width}x${height}`);
    }
  };

  // Transparence de l'image de fond
  (window as any).setBackgroundTransparency = (alpha: number) => {
    if (backgroundPlane && backgroundPlane.material) {
      backgroundPlane.material.alpha = alpha;
      console.log(`🖼️ Background transparency: ${alpha}`);
    }
  };

  // Intensité de l'overlay noir
  (window as any).setBackgroundOverlay = (alpha: number) => {
    if (backgroundOverlay && backgroundOverlay.material) {
      backgroundOverlay.material.alpha = alpha;
      console.log(`🖼️ Background overlay intensity: ${alpha}`);
    }
  };

  // Cacher/Montrer l'image de fond
  (window as any).hideBackground = () => {
    if (backgroundPlane) backgroundPlane.setEnabled(false);
    if (backgroundOverlay) backgroundOverlay.setEnabled(false);
    console.log('🖼️ Background caché');
  };

  (window as any).showBackground = () => {
    if (backgroundPlane) backgroundPlane.setEnabled(true);
    if (backgroundOverlay) backgroundOverlay.setEnabled(true);
    console.log('🖼️ Background affiché');
  };

  // Reset de l'image de fond
  (window as any).resetBackground = () => {
    if (backgroundPlane) {
      backgroundPlane.position.set(0, 200, 1000);
      backgroundPlane.rotation.set(-20 * Math.PI / 180, 0, 0);
      backgroundPlane.scaling.set(1, 1, 1);
      backgroundPlane.setEnabled(true);
      if (backgroundPlane.material) {
        backgroundPlane.material.alpha = 1;
      }
    }
    if (backgroundOverlay) {
      backgroundOverlay.position.set(0, 200, 999);
      backgroundOverlay.rotation.set(-20 * Math.PI / 180, 0, 0);
      backgroundOverlay.scaling.set(1, 1, 1);
      backgroundOverlay.setEnabled(true);
      if (backgroundOverlay.material) {
        backgroundOverlay.material.alpha = 0.6;
      }
    }
    console.log('🖼️ Background remis à vos valeurs optimales');
  };

  // Afficher les informations actuelles
  (window as any).getBackgroundInfo = () => {
    if (backgroundPlane) {
      const pos = backgroundPlane.position;
      const rot = backgroundPlane.rotation;
      const scale = backgroundPlane.scaling;
      const alpha = backgroundPlane.material ? backgroundPlane.material.alpha : 1;
      const overlayAlpha = backgroundOverlay && backgroundOverlay.material ? backgroundOverlay.material.alpha : 0.6;
      
      console.log('🖼️ Background Info:');
      console.log(`  Position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
      console.log(`  Rotation: (${(rot.x * 180 / Math.PI).toFixed(2)}°, ${(rot.y * 180 / Math.PI).toFixed(2)}°, ${(rot.z * 180 / Math.PI).toFixed(2)}°)`);
      console.log(`  Scale: (${scale.x.toFixed(2)}, ${scale.y.toFixed(2)}, ${scale.z.toFixed(2)})`);
      console.log(`  Alpha: ${alpha.toFixed(2)}`);
      console.log(`  Overlay Alpha: ${overlayAlpha.toFixed(2)}`);
      console.log(`  Enabled: ${backgroundPlane.isEnabled()}`);
    }
  };

  console.log('🎮 CONTRÔLES IMAGE DE FOND DISPONIBLES:');
  console.log('  - moveBackground(x, y, z)        : Déplacer l\'image de fond');
  console.log('  - rotateBackground(x, y, z)      : Faire pivoter l\'image (en degrés)');
  console.log('  - scaleBackground(width, height) : Redimensionner l\'image');
  console.log('  - setBackgroundTransparency(0-1) : Ajuster la transparence');
  console.log('  - setBackgroundOverlay(0-1)      : Ajuster l\'intensité de l\'overlay noir');
  console.log('  - hideBackground()               : Cacher l\'image de fond');
  console.log('  - showBackground()               : Afficher l\'image de fond');
  console.log('  - resetBackground()              : Remettre aux valeurs par défaut');
  console.log('  - getBackgroundInfo()            : Afficher les informations actuelles');
}

// === FONCTIONS DE DEBUG GÉNÉRALES ===

export function debugAll() {
  debugStarDestroyer();
  debugBackground();
  
  // Fonctions utilitaires générales
  (window as any).listAllMeshes = () => {
    const scene = backgroundPlane?.getScene();
    if (scene) {
      console.log('📋 Tous les meshes dans la scène:');
      scene.meshes.forEach((mesh, index) => {
        console.log(`  ${index}: ${mesh.name} - Position: (${mesh.position.x.toFixed(1)}, ${mesh.position.y.toFixed(1)}, ${mesh.position.z.toFixed(1)})`);
      });
    }
  };

  (window as any).help = () => {
    console.log('🎮 === AIDE DEBUG 3D ===');
    console.log('');
    console.log('🛸 STAR DESTROYER:');
    console.log('  moveStarDestroyer(x, y, z)     - Déplacer');
    console.log('  rotateStarDestroyer(x, y, z)   - Faire pivoter');
    console.log('  scaleStarDestroyer(scale)      - Redimensionner');
    console.log('  hideStarDestroyer()            - Cacher');
    console.log('  showStarDestroyer()            - Afficher');
    console.log('  resetStarDestroyer()           - Reset');
    console.log('  getStarDestroyerInfo()         - Infos');
    console.log('');
    console.log('🖼️ IMAGE DE FOND:');
    console.log('  moveBackground(x, y, z)        - Déplacer');
    console.log('  rotateBackground(x, y, z)      - Faire pivoter');
    console.log('  scaleBackground(w, h)          - Redimensionner');
    console.log('  setBackgroundTransparency(0-1) - Transparence');
    console.log('  setBackgroundOverlay(0-1)      - Overlay noir');
    console.log('  hideBackground()               - Cacher');
    console.log('  showBackground()               - Afficher');
    console.log('  resetBackground()              - Reset');
    console.log('  getBackgroundInfo()            - Infos');
    console.log('');
    console.log('📷 CAMÉRA:');
    console.log('  adjustCameraPosition(x, y, z)  - Position caméra');
    console.log('  setCameraXRotation(degrees)    - Inclinaison X');
    console.log('  setCameraYRotation(degrees)    - Rotation Y');
    console.log('  resetCamera()                  - Reset caméra');
    console.log('');
    console.log('🔧 UTILITAIRES:');
    console.log('  listAllMeshes()                - Lister tous les objets');
    console.log('  help()                         - Cette aide');
  };

  console.log('🎮 === SYSTÈME DE DEBUG 3D ACTIVÉ ===');
  console.log('Tapez help() dans la console pour voir toutes les commandes disponibles');
} 