(function() {
	var moveCount = 0;
	var _Game_Player_prototype_executeMove = Game_Player.prototype.executeMove;
	Game_Player.prototype.executeMove = function(direction) {
		_Game_Player_prototype_executeMove.call(this, direction);
		moveCount++;
		console.log("moveCount: " + moveCount);
		if (moveCount == 10) {
			$gameMessage.add('10歩あるいて疲れてしまった。')
		}
	};
})();
