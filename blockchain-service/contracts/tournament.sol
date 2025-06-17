// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Tournament is Ownable {
	struct Score {
		uint p1Score;
		uint p2Score;
	}

	struct MatchDatas {
		uint 	matchId;
		Score 	playersScore;
		uint 	p1;
		uint 	p2;
		uint 	winner;

	}

	struct TournamentData {
		string 	tournamentName;
		uint	tournamentId;
		uint	nbPlayers;

		uint[] matchIds;
	}

	TournamentData[] 	public tournaments;
	MatchData[] 		public matchs;

	
}
