function ChampionsUI() {
	this.champSkinIndex = 0;
}
ChampionsUI.prototype.initialize = function() {
	var $championsList = $('#champions-list');
	$championsList.empty();
	for (var champKey in DataLoader.champion.data) {
		var champ = DataLoader.champion.data[champKey];
		 $('<a />', {
			'class': 'champion-img',
			href: '#'+champKey,
			title: champKey,
			css: {
				backgroundImage: 'url("'+DataLoader.versions.cdn+'/'+DataLoader.versions.n.champion+'/img/sprite/'+champ.image.sprite+'")',
				backgroundPosition: '-'+champ.image.x+'px -'+champ.image.y+'px'
			},
			data: {
				champId: champKey
			}
		}).tooltip().appendTo($championsList);
	}

	$('#current-champion-page')
	.on('click', '#champions-list .champion-img', function (e){
		e.preventDefault();
		var champKey = $(this).data('champId');
		var $selectedChamp = $('#selected-champion');
		LolCalc.getBuild().champion.key = champKey;
		champSkinIndex = 0;
		DataLoader.loadChampionInfo(champKey, function (data){
			$('.champion-largeimg', $selectedChamp).css('background-image', 'url('+DataLoader.getChampionLargeIcon(champKey)+')');
			$('.champion-spash', $selectedChamp).attr('src', DataLoader.getChampionArtwork(champKey, this.champSkinIndex));
			$('.champion-name', $selectedChamp).text(data.name);
			$('.champion-title', $selectedChamp).text(data.title);
			$('.champion-largeimg', $selectedChamp).attr('title', data.blurb).tooltip().attr('data-original-title', data.blurb).attr('title', '');
			console.log(data);
		});
	})
	.on('click', '#selected-champion .champion-largeimg', function (e){
		e.preventDefault();
		DataLoader.loadChampionInfo(LolCalc.getBuild().champion.key, function (data){
			ModalWindow.display(data.name + ' - ' + data.title, data.lore);
		});
	});
};
ChampionsUI.prototype.wakeup = function() {
	// body...
};
ChampionsUI.prototype.sleep = function() {
	// body...
};