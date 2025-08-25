const API_BASE = 'http://localhost:3100';

export interface CreateTournamentPayload {
	tournamentName: string;
	tournamentId: number;
	nbPlayers: number;
}

export async function postCreateTournament(payload: CreateTournamentPayload): Promise<void> {
	await fetch(`${API_BASE}/createTournament`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
}

export interface CreateMatchPayload {
	isTournament: number; // 1 for tournament, 0 for free play
	matchId: number;
	p1: number;
	p2: number;
	p1Score: number;
	p2Score: number;
	winner: number; // should be either p1 or p2 id
}

export async function postMatch(payload: CreateMatchPayload): Promise<void> {
	await fetch(`${API_BASE}/matches`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
}

export async function getNextMatchId(): Promise<number> {
    const res = await fetch(`${API_BASE}/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'match' })
    });
    const data = await res.json();
    return data.matchId as number;
}

export async function getNextTournamentId(): Promise<number> {
    const res = await fetch(`${API_BASE}/nextId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tournament' })
    });
    const data = await res.json();
    return data.tournamentId as number;
}


