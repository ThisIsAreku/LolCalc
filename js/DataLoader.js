String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
//fake Riot object
var Riot = {
	DDragon: {
		m: null
	}
}
var DataLoader = new function () {
	var loadProgress = 0;
	var maxLoadProgress = 6;
	var it = this;
	var _currentTier = localStorage.LolCalcProps_CurrentTier; (_currentTier == undefined ? 1 : _currentTier);
	this.versions = null;
	this.tiers = {};
	this.rune = null;
	this.champion = null;
	this.championDetail = {};
	this.item = null;
	this.mastery = null;
	this.language = null;

	$(it).trigger('loadProgress', [0, maxLoadProgress]);
	$.getScript('http://ddragon.leagueoflegends.com/realms/euw.js', function(script){
		it.versions = Riot.DDragon.m;
		$(it).trigger('loadProgress', [++loadProgress, maxLoadProgress]);
		it.loadRunes();
		it.loadLang();
		it.loadChampions();
		it.loadItems();
		it.loadMasteries();
	});

	this.preload = function(){
		var objectsToPreload = ['rune', 'champion'];
		var urlsToPreload = [];
		for (var i = objectsToPreload.length - 1; i >= 0; i--) {
			var objectsListKey = objectsToPreload[i];
			var objectsList = this[objectsListKey].data;
			for(var objectsKey in objectsList){
				var object = objectsList[objectsKey];
				var sprite = this.versions.n[objectsListKey]+'/img/sprite/'+object.image.sprite;
				if(jQuery.inArray(sprite, urlsToPreload) === -1)
					urlsToPreload.push(sprite);
				urlsToPreload.push(this.versions.n[objectsListKey]+'/img/'+object.image.group+'/'+object.image.full);
				if(objectsListKey == 'champion')
					urlsToPreload.push('img/champion/splash/'+objectsKey+ '_0.jpg');
			}
		}
		console.log(urlsToPreload);
		var maxThreads = 6;
		var loadThread = 0;
		var loadedCount = 0;
		var loadedMax = urlsToPreload.length;
		var loadFunc = function (){
			if(loadedCount == loadedMax)
				return;
			if(loadThread >= maxThreads)
				return setTimeout(loadFunc, 50);

			for (var i = loadedCount; i < urlsToPreload.length && loadThread < maxThreads; i++) {
				loadThread++;
				var url = urlsToPreload[i];
				var img = new Image();
				$(img).load(function (e){
					$(it).trigger('loadProgress', [++loadedCount, loadedMax]);
					loadThread--;
				})
				img.src = it.versions.cdn+'/'+url;
			};
			setTimeout(loadFunc, 100);
		};
		$(it).trigger('loadProgress', [0, loadedMax]);
		loadFunc();
	}

	this.loadRunes = function(){
		var url = this.versions.cdn+'/'+this.versions.n.rune+'/data/fr_FR/rune.json';
		$.getJSON(url, function(data){
			it.rune = data;
			data = data.data;
			for(var runeId in data){
				if('undefined' === typeof it.tiers[data[runeId].rune.tier])
					it.tiers[data[runeId].rune.tier] = [];
				it.tiers[data[runeId].rune.tier].push(runeId);
			}
			$(it).trigger('loadProgress', [++loadProgress, maxLoadProgress]);
		});
	}

	this.loadLang = function(){
		var url = this.versions.cdn+'/'+this.versions.n.language+'/data/fr_FR/language.json';
		$.getJSON(url, function(data){
			it.language = data;
			$(it).trigger('loadProgress', [++loadProgress, maxLoadProgress]);
		});
	}

	this.loadChampions = function(){
		var url = this.versions.cdn+'/'+this.versions.n.champion+'/data/fr_FR/champion.json';
		$.getJSON(url, function(data){
			it.champion = data;
			$(it).trigger('loadProgress', [++loadProgress, maxLoadProgress]);
		});
	}

	this.loadItems = function(){
		var url = this.versions.cdn+'/'+this.versions.n.item+'/data/fr_FR/item.json';
		$.getJSON(url, function(data){
			it.item = data;
			$(it).trigger('loadProgress', [++loadProgress, maxLoadProgress]);
		});
	}

	this.loadMasteries = function(){
		var url = this.versions.cdn+'/'+this.versions.n.mastery+'/data/fr_FR/mastery.json';
		$.getJSON(url, function(data){
			it.mastery = data;
			$(it).trigger('loadProgress', [++loadProgress, maxLoadProgress]);
		});
	}

	this.update = function(category) {
		var f = 'update'+category.capitalize()+'List';
		if('function' === typeof this[f]){
			console.log('launching ' + f);
			this[f]();
		}
	};

	this.getRunesOfTier = function(tier) {
		if('undefined' === typeof tier)
			tier = this.getRuneTier();
		return this.tiers[tier];
	};

	this.getChampionLargeIcon = function (key) {
		return this.versions.cdn+'/'+this.versions.n.champion+'/img/'+this.champion.data[key].image.group+'/'+this.champion.data[key].image.full;
	}
	this.getChampionArtwork = function (key, index, callback) {
		return this.versions.cdn+'/img/champion/splash/'+key + '_'+index+'.jpg';
	}

	this.loadChampionInfo = function (key, callback) {
		if('undefined' !== typeof this.championDetail[key]){
			callback(this.championDetail[key].data[key], false);
			return this.championDetail[key].data[key];
		}

		if('undefined' === typeof this.champion.data[key]){
			callback(null);
			return false;
		}

		var url = this.versions.cdn+'/'+this.versions.n.champion+'/data/fr_FR/champion/'+key+'.json';
		$.getJSON(url, function(data){
			it.championDetail[key] = data;
			callback(data.data[key], true);
		});
		return null;
	}


	this.setRuneTier = function (t) {
		if(t < 1 || t > 3)
			return;
		
		_currentTier = t;
		localStorage.LolCalcProps_CurrentTier = t;
	}
	this.getRuneTier = function () {
		return _currentTier;
	}
}
