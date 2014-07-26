function RunesUI() {
	
}
RunesUI.prototype.initialize = function() {
	var it = this;
	it.updateRunesList();
	$('#tier-selector input[name="tier-select"]').each(function(){
		$(this).removeAttr('checked');
		$(this).parent().removeClass('active');
	})
	$('#tier-selector input[name="tier-select"][value="'+DataLoader.getRuneTier()+'"]').attr('checked', true).parent().addClass('active');


	$('#runes-list').overscroll({
		hoverThumbs: true,
		direction: 'vertical',
		cancelOn: 'span'
	});


	$('#current-runes-page')
	.on('click contextmenu', '.draggable', function(e){
		e.preventDefault();
		var $this = $(this), $parent = $this.parent();

		if(!~LolCalc.getBuild().runes.appendRune($this.data('runeId')))
			return console.log("entry failed");
		var $target = $('#current-runes-page .rune-type-'+$this.data('runeType')+' .droppable:not(.dropped):first');
		it.setFullRune($target, $this.data('runeId'));

		updateRuneStatsDisplay();
	})
	.on('dblclick contextmenu', '.droppable', function(e){
		e.preventDefault();
		var $this = $(this);
		if(!LolCalc.getBuild().runes.removeRune($this.data('runeId')))
			return;
		it.clearRune($this);
		updateRuneStatsDisplay();
	})
	.on('change keydown keyup', '#runes-search', function (e){
		var filter = $(this).val();
		$('#runes-list .tab-pane.active .list-group-item').each(function(){
			var text = $(this).data('runeName');
			if(text.indexOf(filter) != -1){
				$(this).removeClass('hidden');
			}else{
				$(this).addClass('hidden');
			}
		})
	})
	.on('click', '#runes-tabs a', function (e) {
		e.preventDefault();
		$('#runes-search').val('').change();
		//$(this).tab('show')
	})
	.on('change', '#tier-selector input[name="tier-select"]', function (e){
		var newTier = $(this).val();
		if(newTier >= 1 && newTier <= 3){
			$('#runes-search').val('').change();
			console.log("Switched to Tier#"+newTier);
			DataLoader.setRuneTier(newTier);
			it.updateRunesList();
		}
	});
};
RunesUI.prototype.wakeup = function() {
	console.log("Updating Rune page display");
	for(var runeTypeKey in RuneSet.RUNE_TYPE){
		var runeType = RuneSet.RUNE_TYPE[runeTypeKey];
		var runes = LolCalc.getBuild().runes.getRuneList(runeType);
		for (var i = runes.length - 1; i >= 0; i--) {
			var $target = $('#current-runes-page .rune-type-'+runeType+' .droppable:eq('+i+')');
			this.setFullRune($target, runes[i]);
		};
	}
	updateRuneStatsDisplay();
};
RunesUI.prototype.sleep = function() {
	// body...
};



RunesUI.prototype.updateRunesList = function() {
	var rune, runeId;
	var runeList = DataLoader.getRunesOfTier();
	$('#runes-list ul.list-group').empty();

	for (var i = 0; i < runeList.length; i++) {
		runeId = runeList[i];
		rune = DataLoader.rune.data[runeId];
		//console.log(rune);
		var $li = $('<li class="list-group-item" />').data('runeName', rune.name);
		var $runePict = $('<a href="#" class="rune-img draggable" />');
		this.setRune($runePict, runeId);
		$li.append($runePict).append('<span class="name">'+rune.name + '</span>');
		$('#runes-list-'+rune.rune.type+' ul.list-group').append($li);
	};
}

RunesUI.prototype.setRune = function ($el, runeId){
	var rune = DataLoader.rune.data[runeId];
	$el.css({
		backgroundImage: 'url("'+DataLoader.versions.cdn+'/'+DataLoader.versions.n.rune+'/img/sprite/'+rune.image.sprite+'")',
		backgroundPosition: '-'+rune.image.x+'px -'+rune.image.y+'px'
	}).data('runeId', runeId).data('runeType', rune.rune.type);
}
RunesUI.prototype.setFullRune = function ($el, runeId){
	var rune = DataLoader.rune.data[runeId];
	$el.css({
		backgroundImage: 'url("'+DataLoader.versions.cdn+'/'+DataLoader.versions.n.rune+'/img/'+rune.image.group+'/'+rune.image.full+'")',
		//backgroundPosition: '-'+rune.image.x+'px -'+rune.image.y+'px'
	}).data('runeId', runeId).data('runeType', rune.rune.type).addClass('dropped').attr('title', rune.name).tooltip();
}
RunesUI.prototype.clearRune = function ($el){
	$el.css('backgroundImage', '').data('runeId', '').data('runeType', '').removeClass('dropped').removeAttr('title').tooltip('destroy');
}