## Documentation du sous-projet ft_pong

Ce document explique l'architecture et le rôle des principaux fichiers du jeu Pong (2D + 3D), du module Tournoi et du mini‑jeu Space Invaders.

### Sommaire
- Jeu Pong (src/)
  - Structure générale et constantes
  - Entrées clavier et viewport (responsive)
  - Rendu 2D et surcouche 3D (BabylonJS)
  - Boucle de jeu et phases, overlays, blockchain
- Tournoi (tournament/main.ts)
- Space Invaders (space_invaders/main.ts)
- Clavier (AZERTY), redimensionnement et debug 3D

---

## Jeu Pong (dossier `src/`)

### 1) Structure générale
- `core/constants.ts`:
  - Définit le monde logique 2D: `WORLD_W = 800`, `WORLD_H = 480`, vitesses (`PADDLE_SPEED`, `BALL_SPEED`), angle de rebond min/max, score de victoire (`WIN_SCORE`), délais de départ/entre manches.
  - `RATIO` sert à adapter l'affichage à la fenêtre tout en conservant les proportions.

- `core/types.ts`:
  - Types utilitaires, notamment `GamePhase` avec les phases: `naming` → `starting` → `playing` → `between` → `gameover`.

- `core/paddle.ts`:
  - Classe `Paddle` (w=15, h=100) avec `move(dy)` bridé aux bords de l'aire de jeu et `draw(ctx)` pour le rendu.

- `core/ball.ts`:
  - Classe `Ball` (size=16) avec vecteurs `vx/vy`, `hitCooldown` (anti multi-collisions), `reset(dir)` et `setDirection(...)` (tirage d'un angle aléatoire entre `MIN_RAD` et `MAX_RAD`).

- `core/physics.ts`:
  - `step(ball, left, right, dt)` calcule la physique (rebonds haut/bas, collisions paddle via SAT simplifiée, sortie d'écran → point pour l’adversaire) et renvoie `'left' | 'right' | null` pour signaler un but.
  - `collideWithPaddle` et `reflectFromPaddle` gèrent le rebond avec un angle dépendant de l’impact (haut/milieu/bas) et une légère accélération (`SPEED_INCREASE`).

### 2) Entrées clavier et viewport
- `io/keyboard.ts`:
  - Expose `pressed(key)` et `pressedCode(code)` pour interroger l’état des touches (avec `keydown/keyup`).

- `io/viewport.ts`:
  - `fitCanvas(wrapper, hud, canvas)` calcule la taille idéale en gardant le ratio (`RATIO`) et met à jour `wrapper` et le `canvas` (responsive, 95% de la fenêtre disponible).

### 3) Rendu 2D et 3D
- `render/draw2d.ts`:
  - Prépare le contexte 2D, applique l’échelle logique → pixels, dessine la bordure du terrain. (Le dessin direct des paddles/ball peut être réactivé si besoin.)

- `render/render3d.ts`:
  - Création `BABYLON.Engine` et `Scene`, lumières, chargement des vaisseaux (X‑Wing, TIE) via `AssetsManager`.
  - Regroupe les meshes dans des parents, applique échelles/rotations, expose des helpers de debug (scaling/position) et la classe `PaddleAnimation` pour animer les vaisseaux en fonction des mouvements des paddles 2D.
  - `syncShips(...)` convertit les coordonnées 2D → 3D (offsets configurables) et trigger les animations `up/down/idle` suivant les touches pressées.

- `render/render3dBall.ts`:
  - Charge la balle 3D (`ball.glb`) avec fallback en sphère procédurale.
  - `syncBall3D(ball3D, ball2D)` synchronise la position de la balle 3D avec la balle 2D (offset Z pour l’ordre de rendu).

- `render/render3dField.ts`:
  - Crée le terrain (box translucide), les bordures, définit l’ordre de rendu (terrain au fond, bordures, vaisseaux, balle au premier plan) et expose des fonctions de debug (taille, transparence, reset...).
  - `addBackgroundImage(scene, 'space.jpg')` place une image de fond + overlay noir pour l’ambiance.
  - `loadStarDestroyerBackground(scene)` charge un décor 3D (Star Destroyer) en arrière-plan, avec paramètres optimisés et helpers debug.

- `render/cam3d.ts`:
  - Crée une caméra orthographique orientée vers le terrain, avec helpers pour pivoter/ajuster en debug.

- `render/debug3d.ts` et `render/paddleAnimation.ts`:
  - `debugAll()` expose dans la console de nombreuses commandes pour ajuster en live le décor, le fond, la caméra, et lister les meshes.
  - `PaddleAnimation` anime les vaisseaux (légère rotation sur X) selon les directions `up/down/idle`.

- `render/hud.ts` (optionnel):
  - Petites utilités de HUD (overlay texte). Non critique au fonctionnement.

### 4) Fichier principal du jeu: `src/main.ts`
- Installation DOM:
  - Crée deux canvas: `webgl` (3D, derrière, pointerEvents=none) et `game` (2D, devant) insérés dans `.game-wrapper`.
  - Récupère divers éléments de HUD/overlays: score, saisie P2, loader de départ, overlay « between », overlay de victoire.

- État du jeu:
  - Paddles `left/right`, `ball`, scores, phase (`GamePhase`), compteur `countdown`.
  - Lecture des noms joueurs via DOM et URL (mode tournoi): si `?tournament=1`, les noms `p1/p2` sont injectés et la saisie locale est sautée.

- Phases & overlays:
  - `setPhase(...)` affiche/masque les overlays adéquats et déclenche `ball.reset('random')` au passage en `playing`.
  - En `between`: petit délai entre les points. En `gameover`: affiche l’overlay de victoire et poste le résultat (cf. blockchain).

- Boucle de jeu:
  - `runGameplay(dt)` lit les touches pour déplacer `left` et `right` (W/S pour gauche, flèches pour droite), appelle `step(...)` pour la physique, met à jour le score ou la phase si but.
  - `loop()` met à jour `countdown`, commute les phases, appelle le rendu 2D, le debug (victoire instantanée via Numpad1/Numpad2), et `requestAnimationFrame`.

- 3D:
  - `init3D()` crée la scène, la caméra, le terrain, charge les vaisseaux et la balle, le fond Star Destroyer + image `space.jpg`, active `debugAll()`, et lance `engine.runRenderLoop(...)` pour synchroniser en continu ships/balle 3D avec l’état 2D.

- Responsive:
  - `fitCanvas(...)` à l’init et sur `resize`, recalcule les tailles et appelle `engine3D.resize()`.

- Blockchain (`src/blockchainApi.ts`):
  - `postMatch(...)` envoie un match, `getNextMatchId()` récupère un id.
  - En mode tournoi, le résultat est aussi stocké dans `localStorage('pong_result')` et un événement `window.dispatchEvent(new CustomEvent('match:posted', {...}))` est émis.

---

## Tournoi (`tournament/main.ts`)

- État persistant (`localStorage: 'tournament_state'`):
  - Noms `p1..p4`, vainqueurs et scores des deux demi‑finales (`sf1/sf2`) et de la finale, plus les éléments UI correspondants.

- Création tournoi côté blockchain:
  - `ensureTournamentCreated()` utilise `getNextTournamentId()` puis `postCreateTournament(...)`. L’id est mémorisé dans `localStorage('current_tournament_id')` avec des drapeaux pour éviter les doublons.

- Lancer un match Pong:
  - `runMatch(pLeft, pRight)` redirige vers `index1.html?tournament=1&p1=...&p2=...`, note `tournament_last` et le callback via `localStorage`. Le jeu Pong lit ces paramètres, joue, poste le résultat et revient à la page tournoi.

- Récupération du résultat:
  - `checkMatchResult()` lit `localStorage('pong_result')` à la fin d’un match, met à jour UI/état (vainqueur + score) et déclenche la suite (activation du bouton suivant, cases finale, etc.).

- Boutons:
  - Enforce l’ordre de jeu: DF1 → DF2 → Finale. Un bouton Reset remet à zéro et recrée un tournoi.

---

## Space Invaders (`space_invaders/main.ts`)

- Canvas, UI et responsive:
  - Crée un canvas plein écran (dans `#si-wrapper`) avec un fond `space.jpg`. Deux modes: `solo` et `coop` (sélection via overlay, nom du P2 saisi si coop).
  - Responsive complet: recalcul des tailles, vitesses et positions proportionnelles au redimensionnement (via `scaleX/scaleY`), y compris grille d’ennemis et boss.

- Entrées:
  - P1: `←/→` pour bouger, `Espace` pour tirer.
  - P2 (coop): `A/Q` et `D` pour bouger, `Z/W` pour tirer (AZERTY ou QWERTY pris en charge).

- Gameplay:
  - Progression basée sur un score d’équipe (`score`) qui débloque 2 puis 3 tirs simultanés.
  - Vagues d’ennemis en lignes alternant la direction, descente par paliers quand bord atteint. Tirs ennemis avec limitation.
  - Boss final dimensionné dynamiquement (hp et pattern de tirs) après suffisamment de vagues.
  - Multiplieurs P1/P2, séries de touches (`hitStreak`), invulnérabilité temporaire à la perte de vie, affichage des vies via coeurs.

- Boucle `update/draw/loop`:
  - `update(dt)` gère mouvements, tirs, collisions, progression et conditions de victoire/défaite.
  - `draw()` affiche fond, ligne de garde, joueurs, ennemis, boss, projectiles, et le HUD des vies.

- Overlays et navigation:
  - Overlays de victoire/défaite avec bouton « Retry ». Bouton « Menu » pour revenir à `menu.html` du sous‑projet.

- Blockchain:
  - Post des résultats via `postMatch(...)` en solo/défaite/coop (avec `spaceInvaders: 1`). Utilise `getNextMatchId()`, `pseudoUser`/`userId`.

---

## Clavier, redimensionnement et debug

- Clavier (Pong):
  - Gauche: `W/S` (haut/bas). Droite: `Flèche haut/bas`.
  - Conseil AZERTY: pour remapper en `Z/S`, adapter les tests dans `src/main.ts` (utiliser `pressed('z')` en plus de `pressed('w')`).

- Redimensionnement:
  - Pong: `fitCanvas(...)` + `engine3D.resize()` maintiennent le ratio et la taille des canvases 2D/3D.
  - Space Invaders: tout est recalculé proportionnellement (`scaleX/scaleY`) pour conserver la jouabilité.

- Debug 3D (console navigateur):
  - Terrain: `adjustFieldPosition(x,y,z)`, `adjustFieldSize(w,h,d)`, `setFieldTransparency(a)`, `hideBorders()`, `resetField()`…
  - Vaisseaux: `adjustXwingPosition(x,y,z?)`, `adjustTiePosition(x,y,z?)`, `adjustShipScaling(xwing,tie)`, `resetShipScaling()`…
  - Balle 3D: `adjustBallOffset(x,y,z?)`, `resetBallOffset()`.
  - Caméra: `setCameraXRotation(deg)`, `setCameraYRotation(deg)`, `adjustCameraPosition(x,y,z)`, `resetCamera()`.
  - Fond: `moveBackground(...)`, `scaleBackground(...)`, `setBackgroundOverlay(a)`, `resetBackground()`.
  - Divers: `listAllMeshes()`, `help()` pour la liste complète.

---

## Flux typiques

- Partie libre Pong:
  1. Saisie (nom P2) → `starting` (compte à rebours) → `playing`.
  2. `step()` gère rebonds/buts → score + overlay `between` → repart en `playing`.
  3. `gameover` → overlay de victoire et `postMatch` (isTournament=0).

- Mode tournoi:
  1. Écran tournoi: boutons DF1/DF2/Finale, création du tournoi sur la blockchain si besoin.
  2. Lancement d’un match: redirection vers `index1.html?tournament=1&p1=...&p2=...`.
  3. À la fin du match, Pong écrit `localStorage('pong_result')` et poste sur la blockchain, puis revient à la page tournoi.
  4. La page tournoi lit le résultat, met à jour l’UI et débloque l’étape suivante.

---

## Emplacements d’actifs
- Modèles 3D et images de fond: `ft_pong/public/models/` (ex: `xwing.glb`, `tie.glb`, `ball.glb`, `star_destroyer.glb`, `space.jpg`).
- Polices: `ft_pong/public/fonts/`.

---

Si tu veux que je remappe les touches du paddle gauche en `Z/S` (AZERTY) dans Pong, dis‑le moi et je le fais directement dans `src/main.ts`.


