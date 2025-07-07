//NEEDED FUNCTIONS


function createTournament(string _name, uint _tournamentId, uint _nbPlayers) public onlyOwner; //CREATES AND STORES A NEW TOURNAMENT IN : tournaments[]

function createMatch(uint _matchId, Score _scores, uint _p1, uint _p2, uint _winner) public onlyOwner; //CREATES AND STORES A NEW MATCH IN : matchs[] THAT WILL BE ADDED TO tournaments.matchIds IF IS A TOURNAMENT MATCH

function addMatchInTournament(uint _tournamentId) public onlyOwner; //ADDS NEW MATCH ID TO THE MATCH ARRAY IN SPECIFIC TOURNAMENT

function getMatchData(uint _matchId) public view; //RETRIEVES DATA OF A MATCH BY ID

function getTournamentData(uint _tournamentId) public view; //RETRIEVES DATA OF A TOURNAMENT BY ID

function getPlayerMatches(uint _player) public view; //RETRIEVES ALL PLAYER INVOLVED MATCHS

