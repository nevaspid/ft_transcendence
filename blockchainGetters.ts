export type MatchData = {
  matchId: number;
  p1: number;
  p2: number;
  p1Score: number;
  p2Score: number;
  winner: number;
  isTournament: number; // 0 | 1
};

export type TournamentData = {
  tournamentId: number;
  tournamentName: string;
  nbPlayers: number;
  matchIds: number[];
};

//GET /matches/:id
export async function fetchMatch(id: number): Promise<MatchData> {
  if (!Number.isFinite(id) || id < 1) throw new TypeError("id must be a number over 0");

  const res = await fetch(`http://localhost:3100/matches/${id}`);
  if (!res.ok) throw new Error(`GET /matches/${id} -> HTTP ${res.status}`);

  return (await res.json()) as MatchData;
}

//GET /tournament/:id
export async function fetchTournament(id: number): Promise<TournamentData> {
  if (!Number.isFinite(id) || id < 1) throw new TypeError("id must be a number over 0");

  const res = await fetch(`http://localhost:3100/tournament/${id}`);
  if (!res.ok) throw new Error(`GET /tournament/${id} -> HTTP ${res.status}`);

  return (await res.json()) as TournamentData;
}

//GET /playerMatches/:playerId
export async function fetchPlayerMatches(playerId: number): Promise<number[]> {
  if (!Number.isFinite(playerId) || playerId < 1) throw new TypeError("playerId must be a number over 0");

  const res = await fetch(`http://localhost:3100/playerMatches/${playerId}`);
  if (!res.ok) throw new Error(`GET /playerMatches/${playerId} -> HTTP ${res.status}`);

  return (await res.json()) as number[];
}
