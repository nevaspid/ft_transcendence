import * as BABYLON from 'babylonjs';
import { WORLD_W, WORLD_H } from '../core/constants';

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
  field.position.set(0, 0, 150);

  // Matériau pour le plateau de jeu
  const fieldMaterial = new BABYLON.StandardMaterial('fieldMaterial', scene);
  fieldMaterial.diffuseColor = new BABYLON.Color3(0.95, 0.91, 0.82); // Beige clair élégant
  fieldMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  fieldMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.05); // Légère teinte chaude
  fieldMaterial.alpha = 0.9; // Presque opaque pour un rendu propre
  fieldMaterial.backFaceCulling = false;
  field.material = fieldMaterial;

  // === CRÉATION DE LA LIGNE MÉDIANE 3D ===
  const centerLineMaterial = new BABYLON.StandardMaterial('centerLineMaterial', scene);
  centerLineMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Gris foncé pour contraster avec le beige
  centerLineMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.05);
  centerLineMaterial.alpha = 0.8; // Bien visible sur le fond beige

  // Ligne médiane verticale
  const centerLine = BABYLON.MeshBuilder.CreateBox('centerLine', {
    width: 6, // Épaisseur de la ligne
    height: WORLD_H,
    depth: 3, // Hauteur de la ligne
  }, scene);
  centerLine.position.set(0, 0, 149); // Juste au-dessus du terrain
  centerLine.material = centerLineMaterial;

  // === CRÉATION DES BORDURES DU PLATEAU ===
  const borderMaterial = new BABYLON.StandardMaterial('borderMaterial', scene);
  borderMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2); // Brun doré pour les bordures
  borderMaterial.specularColor = new BABYLON.Color3(0.3, 0.2, 0.1);
  borderMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.03, 0.02);
  borderMaterial.alpha = 0.7; // Plus visible
  borderMaterial.wireframe = false; // Bordures pleines maintenant

  // Bordure supérieure
  const topBorder = BABYLON.MeshBuilder.CreateBox('topBorder', {
    width: WORLD_W + 20,
    height: 10,
    depth: 5,
  }, scene);
  topBorder.position.set(0, WORLD_H / 2 + 5, 150);
  topBorder.material = borderMaterial;

  // Bordure inférieure
  const bottomBorder = BABYLON.MeshBuilder.CreateBox('bottomBorder', {
    width: WORLD_W + 20,
    height: 10,
    depth: 5,
  }, scene);
  bottomBorder.position.set(0, -WORLD_H / 2 - 5, 150);
  bottomBorder.material = borderMaterial;

  // Bordure gauche
  const leftBorder = BABYLON.MeshBuilder.CreateBox('leftBorder', {
    width: 10,
    height: WORLD_H + 20,
    depth: 5,
  }, scene);
  leftBorder.position.set(-WORLD_W / 2 - 5, 0, 150);
  leftBorder.material = borderMaterial;

  // Bordure droite
  const rightBorder = BABYLON.MeshBuilder.CreateBox('rightBorder', {
    width: 10,
    height: WORLD_H + 20,
    depth: 5,
  }, scene);
  rightBorder.position.set(WORLD_W / 2 + 5, 0, 150);
  rightBorder.material = borderMaterial;

  // Grouper tous les éléments du terrain
  const fieldGroup = new BABYLON.TransformNode('fieldGroup', scene);
  field.parent = fieldGroup;
  centerLine.parent = fieldGroup;
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
  centerLine.renderingGroupId = 0; // Arrière-plan
  topBorder.renderingGroupId = 0; // Arrière-plan
  bottomBorder.renderingGroupId = 0; // Arrière-plan
  leftBorder.renderingGroupId = 0; // Arrière-plan
  rightBorder.renderingGroupId = 0; // Arrière-plan
  
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
  
  (window as any).setCenterLineTransparency = (alpha: number) => {
    if (centerLineMaterial) {
      centerLineMaterial.alpha = alpha;
      console.log(`🔧 Center line transparency: ${alpha}`);
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
  
  (window as any).hideCenterLine = () => {
    centerLine.setEnabled(false);
    console.log('🔧 Center line hidden');
  };
  
  (window as any).showCenterLine = () => {
    centerLine.setEnabled(true);
    console.log('🔧 Center line shown');
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
    if (centerLineMaterial) {
      centerLineMaterial.alpha = 0.7;
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
  console.log('  - setCenterLineTransparency(0-1): Ajuster la transparence de la ligne médiane');
  console.log('  - setBorderTransparency(0-1)  : Ajuster la transparence des bordures');
  console.log('  - hideBorders()               : Masquer les bordures');
  console.log('  - showBorders()               : Afficher les bordures');
  console.log('  - hideCenterLine()            : Masquer la ligne médiane');
  console.log('  - showCenterLine()            : Afficher la ligne médiane');
  console.log('  - hideField()                  : Cacher complètement le plateau');
  console.log('  - showField()                  : Afficher le plateau');
  console.log('  - resetField()                 : Remettre aux valeurs par défaut');

  console.log('✅ Game field with borders and center line created');
  return field;
} 