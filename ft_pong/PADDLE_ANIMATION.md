# 🎮 Animation des Paddles 3D

## 📋 Description

Le système d'animation des paddles permet de faire pivoter les modèles 3D des vaisseaux (X-Wing et TIE Fighter) selon les mouvements des joueurs.

## 🎯 Fonctionnement

### Contrôles
- **Paddle Gauche (X-Wing)** : `Z` (monter) / `S` (descendre)
- **Paddle Droit (TIE Fighter)** : `↑` (monter) / `↓` (descendre)

### Animations
1. **Rotation vers le haut** : 0° → +15° en 0.5 secondes
2. **Rotation vers le bas** : 0° → -15° en 0.5 secondes  
3. **Retour à la position de base** : Retour à 0° en 0.5 secondes quand la touche est relâchée

## 🔧 Configuration

### Paramètres par défaut
- **Angle de rotation** : 15 degrés
- **Durée d'animation** : 0.5 secondes
- **FPS** : 60 (pour une animation fluide)
- **Étapes d'interpolation** : 30 (pour une rotation progressive)
- **Easing** : CubicEase (transition douce)

### Contrôles de debug disponibles

Ouvrez la console du navigateur (F12) et utilisez ces commandes :

```javascript
// Ajuster l'angle de rotation
adjustPaddleRotationAngle(20); // 20 degrés au lieu de 15

// Ajuster la durée d'animation
adjustPaddleAnimationDuration(0.3); // 0.3 secondes au lieu de 0.5

// Ajuster le FPS pour plus de fluidité
adjustPaddleAnimationFPS(120); // 120 FPS pour une animation ultra-fluide

// Ajuster la fluidité de l'interpolation
adjustPaddleInterpolationSteps(60); // 60 étapes pour une rotation ultra-progressive

// Remettre les paramètres par défaut
resetPaddleAnimationConfig();

// Afficher la configuration actuelle
showPaddleAnimationConfig();
```

## 🎨 Détails techniques

### Rotation sur l'axe X
- Les vaisseaux pivotent sur l'axe X (rotation avant/arrière)
- Rotation positive = mouvement vers le haut
- Rotation négative = mouvement vers le bas

### Gestion des animations
- Les animations en cours sont automatiquement interrompues
- Transition fluide entre les états avec interpolation progressive
- Rotation degré par degré pour un effet naturel
- Pas de conflit entre les animations des deux paddles

### Performance
- Animations optimisées avec Babylon.js
- Pas d'impact sur les performances du jeu
- Gestion automatique de la mémoire

## 🚀 Utilisation

1. Lancez le jeu avec `npm run dev`
2. Utilisez les touches pour déplacer les paddles
3. Observez les rotations des vaisseaux 3D
4. Ajustez les paramètres via la console si nécessaire

## 🐛 Dépannage

Si les animations ne fonctionnent pas :
1. Vérifiez que la 3D est bien initialisée
2. Vérifiez les contrôles dans la console
3. Utilisez `showPaddleAnimationConfig()` pour vérifier la configuration
4. Redémarrez le serveur si nécessaire 