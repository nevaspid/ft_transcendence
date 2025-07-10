//NEEDED FUNCTIONS, FUTURE DOCUMENTATION


//! FIRST MATCH MUST BE ID 1, NOT 0, AS IT IS USED TO CHECK IF A MATCH EXISTS
//! FIRST TOURNAMENT MUST BE ID 1, NOT 0, AS IT ISUSED TO CHECK IF A TOURNAMENT EXISTS


function createTournament(string _name, uint _tournamentId, uint _nbPlayers) public onlyOwner;
//CREATES AND STORES A NEW TOURNAMENT IN : tournaments[]

function createMatch(int _isTournament, uint _matchId, Score _scores, uint _p1, uint _p2, uint _winner) public onlyOwner;
//CREATES AND STORES A NEW MATCH IN : matchs[] THAT WILL BE ADDED TO tournaments.matchIds IF IS A TOURNAMENT MATCH (seen with the _isTournament value reprensenting tournament id)

function addMatchInTournament(uint _tournamentId) public onlyOwner;
//ADDS NEW MATCH ID TO THE MATCH ARRAY IN SPECIFIC TOURNAMENT

function getMatchData(uint _matchId) public view;
//RETRIEVES DATA OF A MATCH BY ID

function getTournamentData(uint _tournamentId) public view;
//RETRIEVES DATA OF A TOURNAMENT BY ID

function getPlayerMatches(uint _player) public view
//RETRIEVES ALL PLAYER INVOLVED MATCHS
