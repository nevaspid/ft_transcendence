# 🎮 Guide de Debug 3D - Pong Game

Ce guide vous explique comment utiliser les fonctions de debug pour ajuster le Star Destroyer et l'image de fond dans votre jeu Pong 3D.

## 🚀 Comment utiliser

1. **Ouvrez la console de votre navigateur** (F12 → Console)
2. **Attendez que le jeu soit chargé** (vous devriez voir "🎮 === SYSTÈME DE DEBUG 3D ACTIVÉ ===")
3. **Tapez `help()`** pour voir toutes les commandes disponibles

## 🛸 Contrôles du Star Destroyer

### Position
```javascript
// Déplacer le Star Destroyer
moveStarDestroyer(x, y, z)

// Exemples :
moveStarDestroyer(0, 100, 300)    // Le déplacer vers le haut
moveStarDestroyer(-200, 0, 250)   // Le déplacer vers la gauche
moveStarDestroyer(0, 0, 500)      // L'éloigner en arrière-plan
```

### Rotation
```javascript
// Faire pivoter le Star Destroyer (en degrés)
rotateStarDestroyer(x, y, z)

// Exemples :
rotateStarDestroyer(0, 90, 0)     // Le faire pivoter de 90° sur Y
rotateStarDestroyer(45, 0, 0)     // L'incliner de 45° sur X
rotateStarDestroyer(0, 0, 180)    // Le retourner sur Z
```

### Taille
```javascript
// Redimensionner uniformément
scaleStarDestroyer(scale)

// Redimensionner sur chaque axe
scaleStarDestroyerXYZ(x, y, z)

// Exemples :
scaleStarDestroyer(2)             // Le rendre 2x plus grand
scaleStarDestroyer(0.5)           // Le rendre 2x plus petit
scaleStarDestroyerXYZ(1, 2, 1)    // L'étirer verticalement
```

### Visibilité
```javascript
hideStarDestroyer()               // Cacher le Star Destroyer
showStarDestroyer()               // Afficher le Star Destroyer
```

### Reset et Infos
```javascript
resetStarDestroyer()              // Remettre aux valeurs optimales (150°, -40°, -200°, scale 0.8)
getStarDestroyerInfo()            // Afficher les informations actuelles
```

## 🖼️ Contrôles de l'Image de Fond

### Position
```javascript
// Déplacer l'image de fond
moveBackground(x, y, z)

// Exemples :
moveBackground(0, 200, 1000)      // La déplacer vers le haut
moveBackground(-500, 0, 1000)     // La déplacer vers la gauche
moveBackground(0, 0, 1500)        // L'éloigner en arrière-plan
```

### Rotation
```javascript
// Faire pivoter l'image de fond (en degrés)
rotateBackground(x, y, z)

// Exemples :
rotateBackground(0, 0, 90)        // La faire pivoter de 90° sur Z
rotateBackground(30, 0, 0)        // L'incliner de 30° sur X
rotateBackground(0, 45, 0)        // La faire pivoter de 45° sur Y
```

### Taille
```javascript
// Redimensionner l'image de fond
scaleBackground(width, height)

// Exemples :
scaleBackground(3000, 1800)       // La rendre plus grande
scaleBackground(1000, 600)        // La rendre plus petite
```

### Transparence et Overlay
```javascript
// Ajuster la transparence de l'image (0 = transparent, 1 = opaque)
setBackgroundTransparency(0.5)

// Ajuster l'intensité de l'overlay noir (0 = pas d'overlay, 1 = complètement noir)
setBackgroundOverlay(0.3)
```

### Visibilité
```javascript
hideBackground()                  // Cacher l'image de fond
showBackground()                  // Afficher l'image de fond
```

### Reset et Infos
```javascript
resetBackground()                 // Remettre aux valeurs optimales (Y: 200, rotation: -20°)
getBackgroundInfo()               // Afficher les informations actuelles
```

## 📷 Contrôles de la Caméra

```javascript
// Position de la caméra
adjustCameraPosition(x, y, z)

// Rotation de la caméra
setCameraXRotation(degrees)       // Inclinaison sur l'axe X
setCameraYRotation(degrees)       // Rotation sur l'axe Y

// Reset de la caméra
resetCamera()
```

## 🔧 Fonctions Utilitaires

```javascript
// Lister tous les objets 3D dans la scène
listAllMeshes()

// Afficher l'aide complète
help()
```

## 💡 Conseils d'Utilisation

### Pour ajuster le Star Destroyer après rotation de caméra :
1. Utilisez `getStarDestroyerInfo()` pour voir sa position actuelle
2. Ajustez avec `moveStarDestroyer()` et `rotateStarDestroyer()`
3. Testez différentes valeurs jusqu'à obtenir l'effet désiré

### Pour ajuster l'image de fond après rotation de caméra :
1. Utilisez `getBackgroundInfo()` pour voir sa position actuelle
2. Ajustez avec `moveBackground()` et `rotateBackground()`
3. Utilisez `setBackgroundTransparency()` pour l'intégrer mieux

### Exemples de configurations populaires :

**Star Destroyer en arrière-plan lointain :**
```javascript
moveStarDestroyer(0, 0, 800)
rotateStarDestroyer(150, -40, -200)  // Vos valeurs optimales
scaleStarDestroyer(0.8)              // Votre scale optimal
```

**Image de fond plus proche :**
```javascript
moveBackground(0, 200, 500)       // Votre position Y optimale
rotateBackground(-20, 0, 0)       // Votre rotation optimale
setBackgroundTransparency(0.8)
```

**Caméra plus inclinée :**
```javascript
setCameraXRotation(-35)
```

## 🎯 Dépannage

- **Si les commandes ne fonctionnent pas** : Vérifiez que le jeu est complètement chargé
- **Si un objet disparaît** : Utilisez la fonction `show...()` correspondante
- **Pour revenir aux valeurs par défaut** : Utilisez les fonctions `reset...()`
- **Pour voir tous les objets** : Utilisez `listAllMeshes()`

## 🎨 Personnalisation Avancée

Vous pouvez combiner ces fonctions pour créer des effets spectaculaires :

```javascript
// Créer un effet de Star Destroyer menaçant
moveStarDestroyer(0, -50, 400)
rotateStarDestroyer(15, 30, 0)
scaleStarDestroyer(1.2)

// Créer un fond spatial dynamique
moveBackground(0, 100, 800)
rotateBackground(20, 0, 0)
setBackgroundTransparency(0.7)
setBackgroundOverlay(0.4)
```

Amusez-vous bien avec votre jeu Pong 3D ! 🚀 