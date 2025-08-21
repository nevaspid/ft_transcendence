# Contrôles de Debug 3D pour Pong

## Contrôles de la Caméra
- `adjustCameraPosition(x, y, z)` : Ajuster la position de la caméra
  - Exemple : `adjustCameraPosition(0, 0, -300)` pour reculer
- `resetCamera()` : Remettre la caméra à sa position par défaut

## Contrôles du Terrain
- `adjustFieldPosition(x, y, z)` : Ajuster la position du terrain
- `adjustFieldSize(width, height, depth)` : Ajuster la taille du terrain
- `setFieldTransparency(0-1)` : Ajuster la transparence du terrain
- `setCenterLineTransparency(0-1)` : Ajuster la transparence de la ligne médiane
- `setBorderTransparency(0-1)` : Ajuster la transparence des bordures
- `hideBorders()` / `showBorders()` : Masquer/Afficher les bordures
- `hideCenterLine()` / `showCenterLine()` : Masquer/Afficher la ligne médiane
- `hideField()` / `showField()` : Masquer/Afficher le terrain
- `resetField()` : Remettre le terrain aux valeurs par défaut

## Contrôles de la Balle
- `adjustBallOffset(x, y, z)` : Ajuster la position de la balle
  - Exemple : `adjustBallOffset(0, 0, -10)` pour rapprocher encore plus de la caméra
- `resetBallOffset()` : Remettre la position par défaut
- `adjustBallScaling(scale)` : Ajuster la taille de la balle
- `resetBallScaling()` : Remettre la taille par défaut

## Contrôles des Vaisseaux
- `adjustXwingPosition(x, y, z)` : Ajuster la position du X-Wing (gauche)
- `adjustTiePosition(x, y, z)` : Ajuster la position du TIE Fighter (droite)
- `resetShipPositions()` : Remettre les positions par défaut
- `adjustShipScaling(xwingScale, tieScale)` : Ajuster la taille des vaisseaux
- `resetShipScaling()` : Remettre les tailles par défaut

## Fonction d'Information
- `showAllPositions()` : Affiche toutes les positions et l'ordre de rendu des éléments 3D

## Comment utiliser ces contrôles

1. Ouvrez la console du navigateur (F12)
2. Tapez directement la fonction souhaitée
3. Exemple : `adjustBallOffset(0, 0, -10)` pour mettre la balle encore plus en avant

## Positions actuelles optimisées

### Positions Z (profondeur)
- **Terrain** : Z=20 (fond)
- **Bordures** : Z=10 (milieu)
- **Vaisseaux** : Z=0
- **Balle** : Z=-5 (premier plan, devant tout)
- **Caméra** : Position (0, 0, -200) regardant vers (0, 0, 20)

### Ordre de rendu (renderingGroupId)
- **0** : Terrain et ligne médiane (rendus en premier = arrière-plan)
- **1** : Bordures
- **2** : Vaisseaux
- **3** : Balle (rendue en dernier = au-dessus de tout)

### Offsets spécifiques
- **TIE Fighter** : Y=50 (position idéale confirmée)
- **X-Wing** : Y=0 (aligné avec le paddle gauche)

Ces valeurs ont été ajustées pour que :
- La balle soit toujours visible au premier plan
- Le TIE Fighter soit correctement aligné avec le paddle droit
- L'ordre de rendu garantit que la balle apparaît devant tous les autres éléments
- Le rendu soit moderne et élégant avec un terrain gris-bleu foncé et des bordures lumineuses 