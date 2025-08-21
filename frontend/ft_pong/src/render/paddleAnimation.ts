import * as BABYLON from 'babylonjs';

// Configuration de l'animation
const ANIMATION_CONFIG = {
  ROTATION_ANGLE: Math.PI / 12, // 15 degrés en radians
  DURATION: 0.5, // 0.5 secondes
  FPS: 60, // FPS pour la fluidité
  INTERPOLATION_STEPS: 30, // Nombre d'étapes d'interpolation (plus = plus fluide)
  EASING: new BABYLON.CubicEase() // Transition douce
};

export class PaddleAnimation {
  private leftPaddleMesh: BABYLON.Mesh;
  private rightPaddleMesh: BABYLON.Mesh;
  private leftAnimation: BABYLON.Animation | null = null;
  private rightAnimation: BABYLON.Animation | null = null;
  private leftCurrentRotation: number = 0;
  private rightCurrentRotation: number = 0;

  constructor(leftPaddle: BABYLON.Mesh, rightPaddle: BABYLON.Mesh) {
    this.leftPaddleMesh = leftPaddle;
    this.rightPaddleMesh = rightPaddle;
    
    // Initialiser les rotations à 0
    this.leftPaddleMesh.rotation.x = 0;
    this.rightPaddleMesh.rotation.x = 0;
  }

  // Animer le paddle gauche
  animateLeftPaddle(direction: 'up' | 'down' | 'idle'): void {
    this.animatePaddle(this.leftPaddleMesh, direction, 'left');
  }

  // Animer le paddle droit
  animateRightPaddle(direction: 'up' | 'down' | 'idle'): void {
    this.animatePaddle(this.rightPaddleMesh, direction, 'right');
  }

  private animatePaddle(paddleMesh: BABYLON.Mesh, direction: 'up' | 'down' | 'idle', side: 'left' | 'right'): void {
    // Arrêter l'animation en cours si elle existe
    if (side === 'left' && this.leftAnimation) {
      paddleMesh.animations = [];
      this.leftAnimation = null;
    } else if (side === 'right' && this.rightAnimation) {
      paddleMesh.animations = [];
      this.rightAnimation = null;
    }

    let targetRotation: number;
    
    switch (direction) {
      case 'up':
        targetRotation = ANIMATION_CONFIG.ROTATION_ANGLE; // Rotation positive pour monter
        break;
      case 'down':
        targetRotation = -ANIMATION_CONFIG.ROTATION_ANGLE; // Rotation négative pour descendre
        break;
      case 'idle':
        targetRotation = 0; // Retour à la position de base
        break;
      default:
        return;
    }

    // Créer l'animation de rotation sur l'axe X
    const animation = new BABYLON.Animation(
      `paddleRotation_${side}`,
      'rotation.x',
      ANIMATION_CONFIG.FPS, // FPS configurable
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Définir les keyframes avec interpolation progressive
    const currentRotation = side === 'left' ? this.leftCurrentRotation : this.rightCurrentRotation;
    const totalFrames = ANIMATION_CONFIG.DURATION * ANIMATION_CONFIG.FPS;
    
    const keyFrames = [];
    const steps = Math.min(ANIMATION_CONFIG.INTERPOLATION_STEPS, totalFrames);
    
    for (let i = 0; i <= steps; i++) {
      const frame = Math.round((i / steps) * totalFrames);
      const progress = i / steps;
      const rotation = currentRotation + (targetRotation - currentRotation) * progress;
      keyFrames.push({ frame, value: rotation });
    }
    animation.setKeys(keyFrames);

    // Appliquer l'easing
    animation.setEasingFunction(ANIMATION_CONFIG.EASING);

    // Lancer l'animation
    paddleMesh.animations = [animation];
    const animatable = paddleMesh.getScene()!.beginAnimation(paddleMesh, 0, ANIMATION_CONFIG.DURATION * ANIMATION_CONFIG.FPS, false);

    // Mettre à jour la rotation actuelle
    if (side === 'left') {
      this.leftAnimation = animation;
      this.leftCurrentRotation = targetRotation;
    } else {
      this.rightAnimation = animation;
      this.rightCurrentRotation = targetRotation;
    }

    // Callback quand l'animation se termine
    animatable.onAnimationEndObservable.add(() => {
      if (side === 'left') {
        this.leftAnimation = null;
      } else {
        this.rightAnimation = null;
      }
    });
  }

  // Fonction utilitaire pour obtenir la direction basée sur les touches pressées
  static getPaddleDirection(isUpPressed: boolean, isDownPressed: boolean): 'up' | 'down' | 'idle' {
    if (isUpPressed && !isDownPressed) return 'up';
    if (isDownPressed && !isUpPressed) return 'down';
    return 'idle';
  }

  // 🎮 FONCTIONS DE DEBUG POUR AJUSTER LES ANIMATIONS
  static setupDebugControls() {
    // Ajuster l'angle de rotation
    (window as any).adjustPaddleRotationAngle = (angleDegrees: number) => {
      const angleRadians = (angleDegrees * Math.PI) / 180;
      ANIMATION_CONFIG.ROTATION_ANGLE = angleRadians;
      console.log(`🔧 Paddle rotation angle: ${angleDegrees}° (${angleRadians.toFixed(3)} rad)`);
    };
    
    // Ajuster la durée de l'animation
    (window as any).adjustPaddleAnimationDuration = (durationSeconds: number) => {
      ANIMATION_CONFIG.DURATION = durationSeconds;
      console.log(`🔧 Paddle animation duration: ${durationSeconds}s`);
    };
    
    // Ajuster le FPS de l'animation
    (window as any).adjustPaddleAnimationFPS = (fps: number) => {
      ANIMATION_CONFIG.FPS = fps;
      console.log(`🔧 Paddle animation FPS: ${fps}`);
    };
    
    // Ajuster le nombre d'étapes d'interpolation
    (window as any).adjustPaddleInterpolationSteps = (steps: number) => {
      ANIMATION_CONFIG.INTERPOLATION_STEPS = steps;
      console.log(`🔧 Paddle interpolation steps: ${steps}`);
    };
    
    // Remettre les paramètres par défaut
    (window as any).resetPaddleAnimationConfig = () => {
      ANIMATION_CONFIG.ROTATION_ANGLE = Math.PI / 12; // 15 degrés
      ANIMATION_CONFIG.DURATION = 0.5; // 0.5 secondes
      ANIMATION_CONFIG.FPS = 60; // 60 FPS
      ANIMATION_CONFIG.INTERPOLATION_STEPS = 30; // 30 étapes d'interpolation
      console.log('🔧 Paddle animation config reset to default');
    };
    
    // Afficher la configuration actuelle
    (window as any).showPaddleAnimationConfig = () => {
      const angleDegrees = (ANIMATION_CONFIG.ROTATION_ANGLE * 180) / Math.PI;
      console.log('🎮 === CONFIGURATION ANIMATION PADDLES ===');
      console.log(`  Angle de rotation: ${angleDegrees.toFixed(1)}°`);
      console.log(`  Durée d'animation: ${ANIMATION_CONFIG.DURATION}s`);
      console.log(`  FPS: ${ANIMATION_CONFIG.FPS}`);
      console.log(`  Étapes d'interpolation: ${ANIMATION_CONFIG.INTERPOLATION_STEPS}`);
      console.log(`  Easing: CubicEase`);
    };
    
    console.log('🎮 CONTRÔLES D\'ANIMATION PADDLES DISPONIBLES:');
    console.log('  - adjustPaddleRotationAngle(degrees) : Ajuster l\'angle de rotation');
    console.log('  - adjustPaddleAnimationDuration(seconds) : Ajuster la durée');
    console.log('  - adjustPaddleAnimationFPS(fps) : Ajuster le FPS (fluidité)');
    console.log('  - adjustPaddleInterpolationSteps(steps) : Ajuster la fluidité de l\'interpolation');
    console.log('  - resetPaddleAnimationConfig() : Remettre aux valeurs par défaut');
    console.log('  - showPaddleAnimationConfig() : Afficher la configuration actuelle');
  }
} 