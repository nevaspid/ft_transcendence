import * as BABYLON from 'babylonjs';
import { WORLD_W, WORLD_H } from '../core/constants';
import 'babylonjs-loaders';

// === CRÉATION DU PLATEAU DE JEU 3D ===
export function createGameField(scene: BABYLON.Scene): BABYLON.Mesh {
  console.log('🏟️ Creating 3D game field...');
  
  // Créer un plan (rectangle) pour représenter le plateau de jeu
  const field = BABYLON.MeshBuilder.CreateBox('gameField', {
    width: WORLD_W,
    height: WORLD_H,
    depth: 8, // épaisseur du plateau
  }, scene);

  // Positionner le plateau au centre, bien en arrière-plan (Z positif pour être derrière les vaisseaux)
  field.position.set(0, 0, 20);

  // Matériau pour le plateau de jeu - style moderne et élégant
  const fieldMaterial = new BABYLON.StandardMaterial('fieldMaterial', scene);
  fieldMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.7, 1); // Bleu clair
  fieldMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  fieldMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.03, 0.04); // Légère lueur
  fieldMaterial.alpha = 0.2; // Opacité réduite pour mieux voir le fond
  fieldMaterial.backFaceCulling = false;
  field.material = fieldMaterial;

  // === CRÉATION DES BORDURES DU PLATEAU ===
  // Matériau pour les rebords haut/bas (gris clair très transparent)
  const borderMaterialViolet = new BABYLON.StandardMaterial('borderMaterialViolet', scene);
  borderMaterialViolet.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9); // Gris clair
  borderMaterialViolet.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
  borderMaterialViolet.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  borderMaterialViolet.alpha = 0.1; // Très transparent
  borderMaterialViolet.wireframe = false;

  // Bordure supérieure - muret 3D
  const topBorder = BABYLON.MeshBuilder.CreateBox('topBorder', {
    width: WORLD_W + 40,
    height: 30, // largeur verticale d'origine
    depth: 80, // plus haut sur l'axe Z
  }, scene);
  topBorder.position.set(0, WORLD_H / 2 + 10, 10); // ajusté pour rester centré
  topBorder.material = borderMaterialViolet;

  // Bordure inférieure - muret 3D
  const bottomBorder = BABYLON.MeshBuilder.CreateBox('bottomBorder', {
    width: WORLD_W + 40,
    height: 30, // largeur verticale d'origine
    depth: 80, // plus haut sur l'axe Z
  }, scene);
  bottomBorder.position.set(0, -WORLD_H / 2 - 10, 10); // ajusté pour rester centré
  bottomBorder.material = borderMaterialViolet;

  // Matériau pour les rebords latéraux (blanc cassé)
  const borderMaterial = new BABYLON.StandardMaterial('borderMaterial', scene);
  borderMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9); // Blanc cassé
  borderMaterial.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
  borderMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  borderMaterial.alpha = 1;
  borderMaterial.wireframe = false;

  // Bordure gauche (plate, sans relief)
  const leftBorder = BABYLON.MeshBuilder.CreateBox('leftBorder', {
    width: 20,
    height: WORLD_H,
    depth: 1, // très fin pour effet plat
  }, scene);
  leftBorder.position.set(-WORLD_W / 2, 0, 10);
  leftBorder.material = borderMaterial;

  // Bordure droite (plate, sans relief)
  const rightBorder = BABYLON.MeshBuilder.CreateBox('rightBorder', {
    width: 20,
    height: WORLD_H,
    depth: 1, // très fin pour effet plat
  }, scene);
  rightBorder.position.set(WORLD_W / 2, 0, 10);
  rightBorder.material = borderMaterial;

  // Grouper tous les éléments du terrain
  const fieldGroup = new BABYLON.TransformNode('fieldGroup', scene);
  field.parent = fieldGroup;
  topBorder.parent = fieldGroup;
  bottomBorder.parent = fieldGroup;
  leftBorder.parent = fieldGroup;
  rightBorder.parent = fieldGroup;

  // 🎮 FONCTIONS DE DEBUG POUR AJUSTER LE PLATEAU
  (window as any).adjustFieldPosition = (x: number, y: number, z: number) => {
    fieldGroup.position.set(x, y, z);
    console.log(`🔧 Field position: (${x}, ${y}, ${z})`);
  };
  
  // Définir le terrain en arrière-plan pour éviter qu'il masque les vaisseaux
  field.renderingGroupId = 0; // Arrière-plan
  topBorder.renderingGroupId = 1; // Entre le terrain et les vaisseaux
  bottomBorder.renderingGroupId = 1; // Entre le terrain et les vaisseaux
  leftBorder.renderingGroupId = 1; // Entre le terrain et les vaisseaux
  rightBorder.renderingGroupId = 1; // Entre le terrain et les vaisseaux
  
  (window as any).adjustFieldSize = (width: number, height: number, depth: number) => {
    fieldGroup.scaling.set(width / WORLD_W, height / WORLD_H, depth / 8);
    console.log(`🔧 Field size: ${width}x${height}x${depth}`);
  };
  
  (window as any).setFieldWireframe = (enabled: boolean) => {
    if (field.material) {
      (field.material as any).wireframe = enabled;
      console.log(`🔧 Field wireframe: ${enabled ? 'ON' : 'OFF'}`);
    }
  };
  
  (window as any).setFieldTransparency = (alpha: number) => {
    if (field.material) {
      field.material.alpha = alpha;
      console.log(`🔧 Field transparency: ${alpha}`);
    }
  };
  
  (window as any).setBorderTransparency = (alpha: number) => {
    if (borderMaterial) {
      borderMaterial.alpha = alpha;
      console.log(`🔧 Border transparency: ${alpha}`);
    }
  };
  
  (window as any).hideBorders = () => {
    topBorder.setEnabled(false);
    bottomBorder.setEnabled(false);
    leftBorder.setEnabled(false);
    rightBorder.setEnabled(false);
    console.log('🔧 Borders hidden');
  };
  
  (window as any).showBorders = () => {
    topBorder.setEnabled(true);
    bottomBorder.setEnabled(true);
    leftBorder.setEnabled(true);
    rightBorder.setEnabled(true);
    console.log('🔧 Borders shown');
  };
  
  (window as any).hideField = () => {
    fieldGroup.setEnabled(false);
    console.log('🔧 Field hidden');
  };
  
  (window as any).showField = () => {
    fieldGroup.setEnabled(true);
    console.log('🔧 Field shown');
  };
  
  (window as any).resetField = () => {
    fieldGroup.position.set(0, 0, 0);
    fieldGroup.scaling.set(1, 1, 1);
    fieldGroup.setEnabled(true);
    if (field.material) {
      field.material.alpha = 0.9;
    }
    if (borderMaterial) {
      borderMaterial.alpha = 0.7;
    }
    console.log('🔧 Field reset to default');
  };
  
  console.log('🎮 CONTRÔLES DU PLATEAU DISPONIBLES:');
  console.log('  - adjustFieldPosition(x, y, z) : Ajuster la position');
  console.log('  - adjustFieldSize(w, h, d)     : Ajuster la taille');
  console.log('  - setFieldTransparency(0-1)   : Ajuster la transparence du terrain');
  console.log('  - setBorderTransparency(0-1)  : Ajuster la transparence des bordures');
  console.log('  - hideBorders()               : Masquer les bordures');
  console.log('  - showBorders()               : Afficher les bordures');
  console.log('  - hideField()                  : Cacher complètement le plateau');
  console.log('  - showField()                  : Afficher le plateau');
  console.log('  - resetField()                 : Remettre aux valeurs par défaut');

  console.log('✅ Game field with borders and center line created');
  return field;
} 

// === AJOUTER UNE IMAGE DE FOND EN 3D ===
export function addBackgroundImage(scene: BABYLON.Scene, imageName: string) {
  const plane = BABYLON.MeshBuilder.CreatePlane('backgroundImage', {
    width: 2000, // Très large pour couvrir tout le champ
    height: 1200,
  }, scene);
  plane.position.set(0, 0, 1000); // Encore plus loin derrière tout
  plane.renderingGroupId = 0;
  const mat = new BABYLON.StandardMaterial('backgroundImageMat', scene);
  const tex = new BABYLON.Texture(`/models/${imageName}`, scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, 
    undefined, 
    (msg, tex) => { console.error('Erreur de chargement de la texture de fond', msg, tex); }
  );
  mat.emissiveTexture = tex;
  mat.diffuseTexture = null;
  mat.specularColor = new BABYLON.Color3(0, 0, 0);
  mat.backFaceCulling = false;
  // mat.emissiveTexture.hasAlpha = true; // décommente si image transparente
  mat.alpha = 1;
  // Assombrir l'image de fond
  mat.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.05); // très sombre
  plane.material = mat;
  plane.isPickable = false;

  // Ajout d'un plan noir semi-transparent devant pour assombrir l'image
  const overlay = BABYLON.MeshBuilder.CreatePlane('backgroundOverlay', {
    width: 2000,
    height: 1200,
  }, scene);
  overlay.position = plane.position.clone();
  overlay.position.z = plane.position.z - 1; // juste devant l'image
  const overlayMat = new BABYLON.StandardMaterial('overlayMat', scene);
  overlayMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
  overlayMat.alpha = 0.6; // ajuste pour plus ou moins de noir
  overlay.material = overlayMat;
  overlay.isPickable = false;
  console.log('🖼️ Image de fond chargée:', imageName);
}

// === CHARGEMENT DU DÉCOR STAR DESTROYER EN FOND ===
export async function loadStarDestroyerBackground(scene: BABYLON.Scene) {
  const assetsManager = new BABYLON.AssetsManager(scene);
  const starDestroyerTask = assetsManager.addMeshTask('starDestroyer', '', '/models/', 'star_destroyer.glb');
  await assetsManager.loadAsync();

  const starMeshes = starDestroyerTask.loadedMeshes.filter(m => m instanceof BABYLON.Mesh && m.name !== '__root__') as BABYLON.Mesh[];
  if (starMeshes.length > 0) {
    const starParent = new BABYLON.TransformNode('starDestroyerParent', scene);
    let min = starMeshes[0].getBoundingInfo().boundingBox.minimumWorld.clone();
    let max = starMeshes[0].getBoundingInfo().boundingBox.maximumWorld.clone();
    starMeshes.forEach(m => {
      m.parent = starParent;
      m.rotationQuaternion = null;
      m.position = m.position.clone();
      m.renderingGroupId = 0;
      const box = m.getBoundingInfo().boundingBox;
      min = BABYLON.Vector3.Minimize(min, box.minimumWorld);
      max = BABYLON.Vector3.Maximize(max, box.maximumWorld);
    });
    const size = Math.max(max.x - min.x, max.y - min.y, max.z - min.z);
    const targetSize = 600;
    const scale = targetSize / size;
    starParent.scaling.set(scale, scale, scale);
    starParent.position.set(0, 0, 250);
    starParent.rotation = new BABYLON.Vector3(Math.PI / 8, 3 * Math.PI / 4, 0);
    console.log('🛸 Star Destroyer chargé en fond');
    // Helper debug
    (window as any).debugStarDestroyerMaterial = () => {
      starMeshes.forEach(m => {
        const mat = new BABYLON.StandardMaterial('debugMat', scene);
        mat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 1);
        mat.backFaceCulling = false;
        m.material = mat;
      });
      console.log('🎨 Matériau debug appliqué au star destroyer');
    };
    const originalStarMaterials = starMeshes.map(m => m.material);
    (window as any).resetStarDestroyerMaterial = () => {
      starMeshes.forEach((m, i) => {
        m.material = originalStarMaterials[i];
      });
      console.log('🎨 Matériau d\'origine restauré pour le star destroyer');
    };
  }
} 