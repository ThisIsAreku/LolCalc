"use strict";

var LolCalc = new function () {
	var builds = [];
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

	this.save = function () {
		var buildsData = []
		for (var i = builds.length - 1; i >= 0; i--) {
			buildsData[i] = builds[i].save();
		};
		localStorage.setItem('LolCalc', JSON.stringify(buildsData));
		console.log(buildsData);
	}

	this.load = function (callback) {
		if(localStorage.getItem('LolCalc')===null)
			return console.log('no datas');
		var buildsData = JSON.parse(localStorage.getItem('LolCalc'));
		builds = [];
		currentBuildIndex = 0;
		for (var i = buildsData.length - 1; i >= 0; i--) {
			builds[i] = new Build(buildsData[i]);
		};
		if('function'===typeof callback)
			callback();
	}
}

function RuneSet (parent, runeSet) {
	var _parent = parent;
	if('undefined'===typeof runeSet)
		runeSet = {
		blue: [],
		red: [],
		yellow: [],
		black: []
	};
	var _runeSet = runeSet;

	this.getRuneList = function (type) {
		return _runeSet[type];
	}
	this.getAllRunes = function () {
		var r = [];
		for(var runeType in _runeSet){
			r = r.concat(_runeSet[runeType]);
		}
		return r;
	}
	this.appendRune = function (runeId) {
		var rune = DataLoader.rune.data[runeId];
		if (_runeSet[rune.rune.type].length >= RuneSet.RUNE_COUNT[rune.rune.type])
			return -1;
		console.log("Adding " + rune.name + " (" + runeId + ") @ " + _runeSet[rune.rune.type].length);
		_runeSet[rune.rune.type].push(runeId);
		_runeSet[rune.rune.type].sort();
		_parent.compile();
		return _runeSet[rune.rune.type].length-1;
	}
	this.removeRune = function (runeId) {
		var rune = DataLoader.rune.data[runeId];
		var pos = _runeSet[rune.rune.type].indexOf(runeId);
		if (pos == -1)
			return -1;
		console.log("Removing " + rune.name + " (" + runeId + ") @ " + pos);
		_runeSet[rune.rune.type].splice(pos, 1);
		_parent.compile();
		return _runeSet[rune.rune.type].length-1;
	}

	this.save = function () {
		return _runeSet;
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
}



function Build (d) {
	if('undefined'===typeof d)
		d = {
			champion: undefined,
			masteries: undefined,
			runes: undefined,
			items: undefined,
			name: ''
		}
	this.champion = new Champion(this, d.champion);
	this.masteries = new Masteries(this, d.masteries);
	this.runes = new RuneSet(this, d.runes);
	this.items = new ItemSet(this, d.items);

	this.compiledStats = null;

	this.name = d.name;
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

Build.prototype.save = function() {
	return {
		runes: this.runes.save(),
	}
};