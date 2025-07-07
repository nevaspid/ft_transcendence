// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Tournament is Ownable {

	struct MatchData {
		uint 	matchId;
		uint 	p1;
		uint 	p1Score;
		uint 	p2;
		uint 	p2Score;
		uint 	winner;

	}

	struct TournamentData {
		string 	tournamentName;
		uint	tournamentId;
		uint	nbPlayers;

		uint[] matchIds;
	}

	mapping(uint => TournamentData) tournaments;
	mapping(uint => MatchData) matches;

	function createTournament(string _tournamentName, uint _tournamentId, uint _nbPlayers) public onlyOwner {
    	TournamentData memory newTournament = TournamentData({
    	    tournamentName: _tournamentName,
    	    tournamentId: _tournamentId,
    	    nbPlayers: _nbPlayers,
    	    matchIds: new uint[](0)
    	});

		tournaments[_tournamentId] = newTournament;
	}

	function createMatch(uint _matchId, uint _p1Score, uint _p2Score, uint _p1, uint _p2, uint _winner) public onlyOwner {
		MatchData memory newMatch = MatchData({
			matchId: _matchId,
			p1Score: _p1Score,
			p2Score: _p2Score,
			p1:	_p1,
			p2:	_p2,
			winner:	_winner
		});
	}
}
