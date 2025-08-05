# 📡 API - Module Blockchain

API REST exposée par le service backend `blockchain-service`. Chaque route correspond à une fonction Solidity du contrat `Tournament`.

---

## 🔁 POST `/matches`
### 🎯 Créer un match sur la blockchain
Appelle `createMatch(...)` sur le contrat.

#### ✅ Payload attendu :
```json
{
  "isTournament": 1,
  "matchId": 1001,
  "p1Score": 8,
  "p2Score": 6,
  "p1": 1,
  "p2": 2,
  "winner": 1
}
```

#### 📦 Exemple `fetch()` :
```js
await fetch('http://localhost:3000/matches', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    isTournament: 1,
    matchId: 1001,
    p1Score: 8,
    p2Score: 6,
    p1: 1,
    p2: 2,
    winner: 1
  })
})
```

---

## 🔍 GET `/matches/:id`
### 🎯 Obtenir les données d’un match
Appelle `getMatchData(uint)`.

#### 📦 Exemple `fetch()` :
```js
const res = await fetch('http://localhost:3000/matches/1001')
const match = await res.json()
```

---

## 🏆 POST `/createTournament`
### 🎯 Créer un tournoi sur la blockchain
Appelle `createTournament(...)`.

#### ✅ Payload attendu :
```json
{
  "tournamentName": "Blockchain Cup",
  "tournamentId": 42,
  "nbPlayers": 8
}
```

#### 📦 Exemple `fetch()` :
```js
await fetch('http://localhost:3000/createTournament', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tournamentName: "Blockchain Cup",
    tournamentId: 42,
    nbPlayers: 8
  })
})
```

---

## 📋 GET `/tournament/:id`
### 🎯 Obtenir les infos d’un tournoi
Appelle `getTournamentData(uint)`.

#### 📦 Exemple `fetch()` :
```js
const res = await fetch('http://localhost:3000/tournament/42')
const tournament = await res.json()
```

---

## 📚 GET `/playerMatches/:playerId`
### 🎯 Liste les matchs associés à un joueur
Appelle `getPlayerMatches(uint)`.

#### 📦 Exemple `fetch()` :
```js
const res = await fetch('http://localhost:3000/playerMatches/1')
const matchIds = await res.json()
```

---

## ✅ Serveur local

L’API est dispo en local après lancement du conteneur Docker :

```bash
http://localhost:3000
```