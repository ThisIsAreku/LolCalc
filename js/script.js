"use strict";

String.prototype.endsWithSkeet = function(str) {
	var lastIndex = this.lastIndexOf(str);
	return (lastIndex != -1) && (lastIndex + str.length == this.length);
}

function setRune($el, runeId){
	var rune = DataLoader.rune.data[runeId];
	$el.css({
		backgroundImage: 'url("'+DataLoader.versions.cdn+'/'+DataLoader.versions.n.rune+'/img/sprite/'+rune.image.sprite+'")',
		backgroundPosition: '-'+rune.image.x+'px -'+rune.image.y+'px'
	}).data('runeId', runeId).data('runeType', rune.rune.type);
}
function setFullRune($el, runeId){
	var rune = DataLoader.rune.data[runeId];
	$el.css({
		backgroundImage: 'url("'+DataLoader.versions.cdn+'/'+DataLoader.versions.n.rune+'/img/'+rune.image.group+'/'+rune.image.full+'")',
		//backgroundPosition: '-'+rune.image.x+'px -'+rune.image.y+'px'
	}).data('runeId', runeId).data('runeType', rune.rune.type).addClass('dropped').attr('title', rune.name).tooltip();
}
function clearRune($el){
	$el.css('backgroundImage', '').data('runeId', '').data('runeType', '').removeClass('dropped').removeAttr('title').tooltip('destroy');
}

//ddragon.leagueoflegends.com/cdn/4.2.6/img/sprite/rune0.png