/*
* array used to determine winner of each round in a secion in the truco game
*  
*   gameround[0] = contain winner of "envido"
*   gameround[1] = contain winner of "truco" 
*   gameround[2] = contain winner of "reTruco"
*   gameround[3] = contain winner of "valeCuatro"
*
*   gameround[i] can be 1 or 2. where | 1 refers to "player 1"
*                                     | 2 refers to "player 2"
*/

var gameRound = {[0,0,0,0]};

/*
 * This is the Round Object
 */

function gRound(){
  this.gRound = gameRound[4];
}

/*
 * returns true if the round ended but false
 * check if there are rounds to play and if any player return his cards
 */

function Finishied(payerRestore){
	if (playerRestore==true) { 
		return true; 
	} else {
		var i = 0 ;
		While(i<4 && gRound[i] != 0 ){
			i++;
		}
		if (i>=4){
			return true;
		}else{
			return false;
		}
	}
}

/*
 * Load the player who won a new round
 * checks for any round without winning
 */

function newWinner(player1, player2){
	if (gRound[3] != 0){
		if (payer1.points > player2.points){
			var player = player1
		}else{
			var player = player2
		}
		var i = 1 ;
		While(i<4 && gRound[i]!=0 ){
			i++;
		}
		gRound.splice(i, 0 , player);
}

/*
 * returns the winner of a round
 */

function winnerRound(numberRound){
return this.gRound[numberRound]

/*
function goPlayer(number){
return bool
*/



