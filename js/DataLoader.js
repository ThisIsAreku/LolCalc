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
	this.currentTier = 1;
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
		if('function' === typeof this[f])
			this[f]();
	};

	this.updateRunesList = function() {
		if(this.rune === null){
			setTimeout(function (){ DataLoader.updateRunesList() }, 1000);
			return;
		}
		var rune, runeId;
		var runeList = this.getRuneTier();
		$('#runes-list ul.list-group').empty();
		for (var i = 0; i < runeList.length; i++) {
			runeId = runeList[i];
			rune = this.rune.data[runeId];
			//console.log(rune);
			var $li = $('<li class="list-group-item" />').data('runeName', rune.name);
			var $runePict = $('<a href="#" class="rune-img draggable" />');
			setRune($runePict, runeId);
			$li.append($runePict).append('<span class="name">'+rune.name + '</span>');
			$('#runes-list-'+rune.rune.type+' ul.list-group').append($li);
		};


		$('#runes-list').overscroll({
			hoverThumbs: true,
			direction: 'vertical',
			cancelOn: 'span'
		});

		
		//updateDraggable();
	}

	this.updateChampionsList = function() {
		var $championsList = $('#champions-list');
		$championsList.empty();
		for (var champKey in this.champion.data) {
			var champ = this.champion.data[champKey];
			 $('<a />', {
				'class': 'champion-img',
				href: '#'+champKey,
				title: champKey,
				css: {
					backgroundImage: 'url("'+this.versions.cdn+'/'+this.versions.n.champion+'/img/sprite/'+champ.image.sprite+'")',
					backgroundPosition: '-'+champ.image.x+'px -'+champ.image.y+'px'
				},
				data: {
					champId: champKey
				}
			}).tooltip().appendTo($championsList);
		}
	}

	this.getRuneTier = function(tier) {
		if('undefined' === typeof tier)
			tier = this.currentTier;
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
}
