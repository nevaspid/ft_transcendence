import { pseudoUser, userId } from '../../src/script';
import { postCreateTournament, getNextTournamentId } from '../src/blockchainApi';
type MatchId = 'sf1' | 'sf2' | 'final';

interface TournamentState {
  p1: string; p2: string; p3: string; p4: string;
  sf1Winner: string | null;
  sf2Winner: string | null;
  finalWinner: string | null;
  sf1Score: string | null;
  sf2Score: string | null;
  finalScore: string | null;
}

const p1Input = document.getElementById('p1-name') as HTMLInputElement;
const p2Input = document.getElementById('p2-name') as HTMLInputElement;
const p3Input = document.getElementById('p3-name') as HTMLInputElement;
const p4Input = document.getElementById('p4-name') as HTMLInputElement;

const sf1p1 = document.getElementById('sf1-p1')!;
const sf1p2 = document.getElementById('sf1-p2')!;
const sf2p1 = document.getElementById('sf2-p1')!;
const sf2p2 = document.getElementById('sf2-p2')!;
const finalp1 = document.getElementById('final-p1')!;
const finalp2 = document.getElementById('final-p2')!;

const sf1WinnerEl = document.getElementById('sf1-winner')!;
const sf2WinnerEl = document.getElementById('sf2-winner')!;
const finalWinnerEl = document.getElementById('final-winner')!;

const sf1Btn = document.getElementById('sf1-play') as HTMLButtonElement;
const sf2Btn = document.getElementById('sf2-play') as HTMLButtonElement;
const finalBtn = document.getElementById('final-play') as HTMLButtonElement;
const resetBtn = document.getElementById('t-reset') as HTMLButtonElement;
const randomizeBtn = document.getElementById('t-randomize') as HTMLButtonElement;


function loadState(): TournamentState {
  try {
    const raw = localStorage.getItem('tournament_state');
    if (raw) return JSON.parse(raw) as TournamentState;
  } catch {}
  return {
    p1: pseudoUser || 'Player 1',
    p2: '', p3: '', p4: '',
    sf1Winner: null,
    sf2Winner: null,
    finalWinner: null,
    sf1Score: null,
    sf2Score: null,
    finalScore: null,
  };
}

function persist(): void {
  try { localStorage.setItem('tournament_state', JSON.stringify(state)); } catch {}
}

const state: TournamentState = loadState();

function saveNames(): void {
  state.p1 = pseudoUser|| 'Player 1';
  state.p2 = p2Input.value.trim() || 'Player 2';
  state.p3 = p3Input.value.trim() || 'Player 3';
  state.p4 = p4Input.value.trim() || 'Player 4';
  sf1p1.textContent = state.p1;
  sf1p2.textContent = state.p2;
  sf2p1.textContent = state.p3;
  sf2p2.textContent = state.p4;
  persist();
}

function updateFinalSlots(): void {
  finalp1.textContent = state.sf1Winner || 'Vainqueur DF1';
  finalp2.textContent = state.sf2Winner || 'Vainqueur DF2';
}

function updateButtons(): void {
  // Enforce strict order: DF1 -> DF2 -> Final
  sf1Btn.disabled = !!state.sf1Winner || !!state.finalWinner;
  sf2Btn.disabled = !state.sf1Winner || !!state.sf2Winner || !!state.finalWinner;
  finalBtn.disabled = !(state.sf1Winner && state.sf2Winner) || !!state.finalWinner;
}

function runMatch(pLeft: string, pRight: string, onDone: (winner: string, score: string) => void): void {
  const params = new URLSearchParams();
  params.set('tournament', '1');
  params.set('p1', encodeURIComponent(pLeft));
  params.set('p2', encodeURIComponent(pRight));
  localStorage.setItem('tournament_return_to', location.pathname);
  localStorage.setItem('tournament_callback', '1');
  localStorage.setItem('tournament_match', JSON.stringify({ pLeft, pRight }));
  localStorage.setItem('tournament_on_done', '1');
  // Encode a simple flag that Pong will read and write back the result
  location.href = `index1.html?${params.toString()}`;
}

async function ensureTournamentCreated(): Promise<void> {
  const createdFlag = localStorage.getItem('tournament_created');
  if (createdFlag === '1') return;
  const tournamentId = await getNextTournamentId();
  localStorage.setItem('current_tournament_id', String(tournamentId));
  try {
    await postCreateTournament({
      tournamentName: 'Pong Tournament',
      tournamentId,
      nbPlayers: 4
    });
    localStorage.setItem('tournament_created', '1');
  } catch (err) {
    console.warn('createTournament failed:', err);
  }
}

function checkMatchResult(): void {
  // When returning from Pong, it should have stored the result
  const resRaw = localStorage.getItem('pong_result');
  if (!resRaw) return;
  const res = JSON.parse(resRaw) as { winner: string; score: string };
  localStorage.removeItem('pong_result');
  const lastMatch = localStorage.getItem('tournament_last');
  if (!lastMatch) return;
  if (lastMatch === 'sf1') {
    state.sf1Winner = res.winner;
    state.sf1Score = res.score;
    sf1WinnerEl.textContent = `${res.winner} (${res.score})`;
  } else if (lastMatch === 'sf2') {
    state.sf2Winner = res.winner;
    state.sf2Score = res.score;
    sf2WinnerEl.textContent = `${res.winner} (${res.score})`;
  } else if (lastMatch === 'final') {
    state.finalWinner = res.winner;
    state.finalScore = res.score;
    finalWinnerEl.textContent = `${res.winner} (${res.score})`;
  }
  updateFinalSlots();
  persist();
  updateButtons();
}

// Bind inputs
document.getElementById('p2-save')?.addEventListener('click', saveNames);
document.getElementById('p3-save')?.addEventListener('click', saveNames);
document.getElementById('p4-save')?.addEventListener('click', saveNames);
[p2Input, p3Input, p4Input].forEach(inp => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveNames(); }}));

sf1Btn.addEventListener('click', () => {
  saveNames();
  localStorage.setItem('tournament_last', 'sf1');
  runMatch(state.p1, state.p2, () => {});
});

sf2Btn.addEventListener('click', () => {
  saveNames();
  localStorage.setItem('tournament_last', 'sf2');
  runMatch(state.p3, state.p4, () => {});
});

finalBtn.addEventListener('click', () => {
  if (!(state.sf1Winner && state.sf2Winner)) return;
  localStorage.setItem('tournament_last', 'final');
  runMatch(state.sf1Winner!, state.sf2Winner!, () => {});
});

resetBtn.addEventListener('click', () => {
  // if (!confirm('Réinitialiser le tournoi ? Les résultats et les noms P2/P3/P4 seront effacés.')) return;
  state.sf1Winner = null; state.sf1Score = null;
  state.sf2Winner = null; state.sf2Score = null;
  state.finalWinner = null; state.finalScore = null;
  // Reset P2/P3/P4 names
  state.p1 = pseudoUser || 'Player 1';
  state.p2 = 'Player 2'; state.p3 = 'Player 3'; state.p4 = 'Player 4';
  p2Input.value = state.p2; p3Input.value = state.p3; p4Input.value = state.p4;
  // Update slots and winners UI
  sf1WinnerEl.textContent = '';
  sf2WinnerEl.textContent = '';
  finalWinnerEl.textContent = '';
  sf1p1.textContent = state.p1; sf1p2.textContent = state.p2; sf2p1.textContent = state.p3; sf2p2.textContent = state.p4;
  updateFinalSlots();
  updateButtons();
  persist();
  // New tournament on reset
  try { localStorage.removeItem('tournament_created'); } catch {}
  try { localStorage.removeItem('current_tournament_id'); } catch {}
  void ensureTournamentCreated();
});

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

randomizeBtn.addEventListener('click', () => {
  // Only before any match started
  if (state.sf1Winner || state.sf2Winner || state.finalWinner) return;
  // Shuffle only P2, P3, P4; keep P1
  const pool = [
    (p2Input.value || 'Player 2').trim(),
    (p3Input.value || 'Player 3').trim(),
    (p4Input.value || 'Player 4').trim(),
  ];
  const [b, c, d] = shuffleArray(pool);
  p2Input.value = b; p3Input.value = c; p4Input.value = d;
  saveNames();
});

// Initialize from saved state
p1Input.value = pseudoUser || 'Player 1'; p2Input.value = state.p2; p3Input.value = state.p3; p4Input.value = state.p4;
sf1WinnerEl.textContent = state.sf1Winner ? `${state.sf1Winner}${state.sf1Score ? ' (' + state.sf1Score + ')' : ''}` : '';
sf2WinnerEl.textContent = state.sf2Winner ? `${state.sf2Winner}${state.sf2Score ? ' (' + state.sf2Score + ')' : ''}` : '';
finalWinnerEl.textContent = state.finalWinner ? `${state.finalWinner}${state.finalScore ? ' (' + state.finalScore + ')' : ''}` : '';
sf1p1.textContent = pseudoUser; sf1p2.textContent = state.p2; sf2p1.textContent = state.p3; sf2p2.textContent = state.p4;
updateFinalSlots();
updateButtons();
checkMatchResult();
// Ensure tournament is created once on initial load
void ensureTournamentCreated();
