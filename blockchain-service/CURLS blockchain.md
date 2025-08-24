# 🧪 API Blockchain - Exemples CURL

Exemples de requêtes CURL pour tester toutes les routes du backend `blockchain-service`.

---

## 🔁 POST `/matches`

Créer un match dans un tournoi.

```bash
curl -X POST http://localhost:3100/matches \
  -H "Content-Type: application/json" \
  -d '{
    "isTournament": 1,
    "matchId": 1001,
    "p1Score": 8,
    "p2Score": 6,
    "p1": 1,
    "p2": 2,
    "winner": 1,
    "spaceInvaders": 1
  }'
```

---

## 🔍 GET `/matches/:id`

Récupérer les infos d’un match.

```bash
curl http://localhost:3100/matches/1001
```

---

## 🏆 POST `/createTournament`

Créer un nouveau tournoi.

```bash
curl -X POST http://localhost:3100/createTournament \
  -H "Content-Type: application/json" \
  -d '{
    "tournamentName": "Blockchain Cup",
    "tournamentId": 42,
    "nbPlayers": 8
  }'
```

---

## 📋 GET `/tournament/:id`

Obtenir les infos d’un tournoi.

```bash
curl http://localhost:3100/tournament/42
```

---

## 📚 GET `/playerMatches/:playerId`

Obtenir la liste des matchIds joués par un joueur donné.

```bash
curl http://localhost:3100/playerMatches/1
```

---
