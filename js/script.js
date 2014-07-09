"use strict";

String.prototype.endsWithSkeet = function(str) {
	var lastIndex = this.lastIndexOf(str);
	return (lastIndex != -1) && (lastIndex + str.length == this.length);
}

//ddragon.leagueoflegends.com/cdn/4.2.6/img/sprite/rune0.png