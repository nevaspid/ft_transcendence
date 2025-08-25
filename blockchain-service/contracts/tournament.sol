// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Tournament {

	address private owner;

	constructor() {
		owner = msg.sender;
	}

	modifier onlyOwner() {
		require(msg.sender == owner);
		_;
	}

	struct MatchData {
		uint	isTournament;
		uint 	matchId;
		uint 	p1;
		uint 	p1Score;
		uint 	p2;
		uint 	p2Score;
		uint 	winner;
		uint	spaceInvaders;

	}

	struct TournamentData {
		string 	tournamentName;
		uint	tournamentId;
		uint	nbPlayers;

		uint[] matchIds;
	}

	mapping(uint => TournamentData) tournaments;
	mapping(uint => MatchData) matches;

	function createTournament(string calldata _tournamentName, uint _tournamentId, uint _nbPlayers) external onlyOwner() {
		TournamentData memory newTournament = TournamentData({
			tournamentName: _tournamentName,
			tournamentId: _tournamentId,
			nbPlayers: _nbPlayers,
			matchIds: new uint[](0)
		});

		tournaments[_tournamentId] = newTournament;
	}

	function addMatchInTournament(uint _matchId, uint _tournamentId) internal {
		require(tournaments[_tournamentId].tournamentId != 0, "Tournament does not exist");
    	tournaments[_tournamentId].matchIds.push(_matchId);
	}

	function createMatch(uint _isTournament, uint _matchId, uint _p1Score, uint _p2Score, uint _p1, uint _p2, uint _winner, uint _spaceInvaders) external onlyOwner() {
		MatchData memory newMatch = MatchData({
			isTournament: _isTournament,
			matchId: _matchId,
			p1Score: _p1Score,
			p2Score: _p2Score,
			p1:	_p1,
			p2:	_p2,
			winner:	_winner,
			spaceInvaders: _spaceInvaders
		});

		if(_isTournament > 0) {
			addMatchInTournament(_matchId, _isTournament);
		}

		matches[_matchId] = newMatch;
	}

	function getMatchData(uint _matchId) external view returns (
	uint isTournament,
    uint matchId,
    uint p1,
    uint p1Score,
    uint p2,
    uint p2Score,
    uint winner,
	uint spaceInvaders
	) {
		require(matches[_matchId].matchId != 0, "Match does not exist");
		MatchData memory matchData = matches[_matchId];
		return (matchData.isTournament, matchData.matchId, matchData.p1, matchData.p1Score, matchData.p2, matchData.p2Score, matchData.winner, matchData.spaceInvaders);
	}

	function getTournamentData(uint _tournamentId) external view returns (
	string memory tournamentName,
	uint tournamentId,
	uint nbPlayers,
	uint[] memory matchIds
	) {
		require(tournaments[_tournamentId].tournamentId != 0, "Tournament does not exist");
		TournamentData memory tournamentData = tournaments[_tournamentId];
		return (tournamentData.tournamentName, tournamentData.tournamentId, tournamentData.nbPlayers, tournamentData.matchIds);
	}

	function getPlayerMatches(uint _player) external view  returns (uint[] memory) {
    	uint count = 0;
    	for (uint i = 1; matches[i].matchId != 0; i++) {
    	    if (matches[i].p1 == _player || matches[i].p2 == _player) {
    	        count++;
    	    }
    	}

    	uint[] memory playerMatches = new uint[](count);
    	uint idx = 0;
    	for (uint i = 1; matches[i].matchId != 0; i++) {
    	    if (matches[i].p1 == _player || matches[i].p2 == _player) {
    	        playerMatches[idx++] = matches[i].matchId;
    	    }
    	}
    	return playerMatches;
	} //! optimisable
}
