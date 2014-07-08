var LolCalc = new function () {
	var builds = {};
	var currentBuildIndex = 0;
	builds[0] = new Build();


	this.getBuild = function (n){
		if('undefined' === typeof n)
			n = currentBuildIndex;
		return builds[n];
	}
	this.getBuildCount = function (){
		return builds.length
	}
}

function RuneSet (parent) {
	var _parent = parent;
	var runeSet = {
		blue: [],
		red: [],
		yellow: [],
		black: []
	}

	this.getRuneList = function (type) {
		return runeSet[type];
	}
	this.getAllRunes = function () {
		var r = [];
		for(var runeType in runeSet){
			r = r.concat(runeSet[runeType]);
		}
		return r;
	}
	this.appendRune = function (runeId) {
		var rune = DataLoader.rune.data[runeId];
		if (runeSet[rune.rune.type].length >= RuneSet.RUNE_COUNT[rune.rune.type])
			return -1;
		console.log("Adding " + rune.name + " (" + runeId + ") @ " + runeSet[rune.rune.type].length);
		runeSet[rune.rune.type].push(runeId);
		runeSet[rune.rune.type].sort();
		_parent.compile();
		return runeSet[rune.rune.type].length-1;
	}
	this.removeRune = function (runeId) {
		var rune = DataLoader.rune.data[runeId];
		var pos = runeSet[rune.rune.type].indexOf(runeId);
		if (pos == -1)
			return -1;
		console.log("Removing " + rune.name + " (" + runeId + ") @ " + pos);
		runeSet[rune.rune.type].splice(pos, 1);
		_parent.compile();
		return runeSet[rune.rune.type].length-1;
	}
}
RuneSet.RUNE_TYPE = {
	BLUE: 'blue',
	RED: 'red',
	YELLOW: 'yellow',
	BLACK: 'black',
}
RuneSet.RUNE_COUNT = {
	blue: 9,
	red: 9,
	yellow: 9,
	black: 3
}

function ItemSet () {

}

function Masteries () {

}

function Champion () {
	this.key = null;
	this.level = 1;
}



function Build () {
	this.champion = new Champion(this);
	this.masteries = new Masteries(this);
	this.runes = new RuneSet(this);
	this.items = new ItemSet(this);

	this.compiledStats = null;
}
Build.prototype.compile = function() {
	var runeStats = jQuery.extend({}, DataLoader.rune.basic.stats)
	var runes = this.runes.getAllRunes();
	var runeId;
	var rune;
	for (var i = runes.length - 1; i >= 0; i--) {
		runeId = runes[i];
		rune = DataLoader.rune.data[runeId];
		for(var statName in rune.stats)
		{
			runeStats[statName] += rune.stats[statName];
		}
	}
	this.compiledStats = runeStats;
	return runeStats;
};