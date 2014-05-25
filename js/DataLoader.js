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
	var it = this;
	this.currentTier = 1;
	this.versions = null;
	this.tiers = {};
	this.rune = null;
	this.champion = null;
	this.item = null;
	this.language = null;

	$.getScript('http://ddragon.leagueoflegends.com/realms/euw.js', function(script){
		it.versions = Riot.DDragon.m;
		it.loadRunes();
		it.loadLang();
		it.loadChampions();
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
		});
	}

	this.loadLang = function(){
		var url = this.versions.cdn+'/'+this.versions.n.language+'/data/fr_FR/language.json';
		$.getJSON(url, function(data){
			it.language = data;
		});
	}

	this.loadChampions = function(){
		var url = this.versions.cdn+'/'+this.versions.n.champion+'/data/fr_FR/champion.json';
		$.getJSON(url, function(data){
			it.champion = data;
		});
	}

	this.update = function(category) {
		var f = 'update'+category.capitalize()+'List';
		if('function' === typeof this[f])
			this[f]();
	};

	this.updateRunesList = function() {
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

	this.updateChampionList = function() {
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
}
