"use strict";

var currentStat = null;

/*
var heightDiff = ($('#runes-list').offset().top - $('#runes-selector').offset().top);
var marginDiff = parseInt($('#runes-list').parent().css('paddingBottom')) + parseInt($('#runes-list').parent().css('paddingTop'))
var height = $('#current-runes-page').height() - (heightDiff + marginDiff*1.5);

$('#runes-list').css('height', height+'px').overscroll({
	hoverThumbs: true,
	direction: 'vertical',
	cancelOn: '.draggable'
});*/

/*
$(document).on('contextmenu', function(e){
	e.preventDefault();
})*/

$(DataLoader).on('loadProgress', function (e, current, max){
	var percent = current * 100 / max;
	console.log(percent);
	LoadingBar.setValue(percent);
	if(percent == 100){
		$('#build-configuration .mask-overlay').fadeOut();
		$('#build-tabs a:first').click();
	}
})


$('#build-tabs a').click(function (e) {
	e.preventDefault();
	var $this = $(this);
	var $target = $($this.data('target'));
	if($target.data('loaded') !== true){
		var source = $this.attr('href');
		$target.load(source, function(){
			$target.data('loaded', true);
			DataLoader.update($this.data('category'));
		});
	}
});

$('#page-selector .add-page').click(function(e){
	e.preventDefault();
	var maxPages = $('#page-selector .btn-group input').length;
	if(maxPages >= 20)
		return;
	var maxNum = parseInt($('#page-selector .btn-group input:last').val());
	var $elemInput = $('<input type="radio" name="page-select" value="'+(maxNum+1)+'" />');
	$('<label class="btn btn-primary" />').append($elemInput).append(maxNum+2).appendTo($('#page-selector .btn-group'));
	$elemInput.click();
});
$('#page-selector .rm-page').click(function(e){
	e.preventDefault();
	delete LolCalc.runePages[LolCalc.currentRunePage]
	delete LolCalc.runePageValues[LolCalc.currentRunePage]
	$('#page-selector .btn-group input[value="'+LolCalc.currentRunePage+'"]').parent().remove()
	$('#page-selector .btn-group input:first').click()
});

$('#page-selector').on('change', 'input[name="page-select"]', function(e){
	switchRunePage($(this).val());
});


/*****************/
/***** RUNES *****/
/*****************/
$('#current-runes-page')
.on('click contextmenu', '.draggable', function(e){
	e.preventDefault();
	console.log('f');
	var $this = $(this), $parent = $this.parent();

	var $target = $('#current-runes-page .rune-type-'+$this.data('runeType')+' .droppable:not(.dropped):first');
	if($target.length == 0)
		return;

	setFullRune($target, $this.data('runeId'));
	updateCurrentRunePage();
})
.on('dblclick contextmenu', '.droppable', function(e){
	e.preventDefault();
	clearRune($(this));
	updateCurrentRunePage();
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
		LolCalc.currentTier = newTier;
		$('#runes-search').val('').change();
		console.log("Switched to Tier#"+newTier);
		DataLoader.currentTier = newTier;
		DataLoader.updateRunesList();
	}
});


/*****************/
/***** CHAMP *****/
/*****************/
$('#current-champion-page')
.on('click', '#champions-list .champion-img', function (e){
	e.preventDefault();
	var champKey = $(this).data('champId');
	var $selectedChamp = $('#selected-champion');
	LolCalc.getBuild().champion.key = champKey;
	$('.champion-largeimg', $selectedChamp).css('background-image', 'url('+DataLoader.getChampionLargeIcon(champKey)+')');
	$('.champion-spash', $selectedChamp).attr('src', DataLoader.getChampionArtwork(champKey, 0));
	DataLoader.loadChampionInfo(champKey, function (data){
		$('.champion-name', $selectedChamp).text(data.name);
		$('.champion-title', $selectedChamp).text(data.title);
		$('.champion-largeimg', $selectedChamp).attr('title', data.blurb).tooltip().attr('data-original-title', data.blurb);
		console.log(data);
	});
})
.on('click', '#selected-champion .champion-largeimg', function (e){
	e.preventDefault();
	DataLoader.loadChampionInfo(LolCalc.getBuild().champion.key, function (data){
		ModalWindow.display(data.name + ' - ' + data.title, data.lore);
	});
});







$('#detail .list-group').on('click', '.stat', function(e){
	e.preventDefault();
	$('#detail .list-group .stat').removeClass('active');
	$(this).addClass('active');
	var opStat = getOppositStat($(this).data('statName'));
	$('#detail .list-group .stat.'+opStat).addClass('active');
	currentStat = $(this).data('statName');
	doGraph($(this).data('statName'));
})

/*
$('.droppable').droppable({
	accept: function(target){
		var $this = $(this), $parent = $this.parent();
		$parent.data('runeType', $parent.attr('data-runeType'));
		$this.data('runeType', $this.attr('data-runeType'));

		return target.hasClass('draggable') && 
		(
			($parent.data('runeType') ==  target.data('runeType')) ||
			($this.data('runeType') ==  target.data('runeType'))
		);
	},
	hoverClass: 'drop-hover',
	drop: function(event, ui){
		var runeId = ui.draggable.data('runeId');

		console.log("Dropped Rune#"+runeId);
		setFullRune($(this), runeId);
		updateCurrentRunePage();
	}
});
*/
var updateLegendTimeout = null;
var latestPosition = null;
var legends;
var plot;
var currentGraphStat = null;
$('#graph').on('plothover',  function (event, pos, item) {
	latestPosition = pos;
	if (!updateLegendTimeout) {
		updateLegendTimeout = setTimeout(updateLegend, 50);
	}
});

function updateCurrentRunePage(){
	LolCalc.runePages[LolCalc.currentRunePage] = [];
	var runeType;
	$('#current-runes-page .rune-drop.dropped').each(function(){
		runeType = $(this).parent().data('runeType');
		if(typeof LolCalc.runePages[LolCalc.currentRunePage][runeType] == 'undefined')
			LolCalc.runePages[LolCalc.currentRunePage][runeType] = [];
		LolCalc.runePages[LolCalc.currentRunePage][runeType].push($(this).data('runeId'));
	});
	localStorage
	updateCurrentRunePageValue();
}

function updateCurrentRunePageValue(){
	console.log("Updating Rune stats value");
	if(typeof LolCalc.runePages[LolCalc.currentRunePage] == 'undefined'){
		console.log("Unknown runePages");
		updateRuneStatsDisplay();
		return;
	}
	LolCalc.runePageValues[LolCalc.currentRunePage] = jQuery.extend({}, DataLoader.rune.basic.stats);
	var runeGroup;
	var runeId;
	var rune;
	for(var runeType in LolCalc.runePages[LolCalc.currentRunePage]){
		runeGroup = LolCalc.runePages[LolCalc.currentRunePage][runeType];
		for (var i = runeGroup.length - 1; i >= 0; i--) {
			runeId = runeGroup[i];
			rune = DataLoader.rune.data[runeId];
			for(var statName in rune.stats)
			{
				LolCalc.runePageValues[LolCalc.currentRunePage][statName] += rune.stats[statName];
			}
		}
	}
	updateRuneStatsDisplay();
}

function updateDraggable(){
	$('.draggable').draggable({
		appendTo: "body",
		helper: "clone",
		revert: "invalid",
		start: function( event, ui ) { console.log(ui); }
	}).on('drag', function(){
		console.log(ui);
	});
}

function updateRuneStatsDisplay(){
	console.log("Updating Rune stats display");
	var $detailList = $('#detail .list-group');
	$detailList.empty();
	if(typeof(LolCalc.runePageValues[LolCalc.currentRunePage]) == 'undefined'){
		console.log("Unknown runePages");
		return;
	}
	var opcurrentStatName = getOppositStat(currentStat);
	for(var statName in LolCalc.runePageValues[LolCalc.currentRunePage])
	{
		if(LolCalc.runePageValues[LolCalc.currentRunePage][statName] != 0)
		{
			var stat = $('<a href="#" class="list-group-item stat '+statName+'" title="'+statName+'" data-statName="'+statName+'"><span class="badge">' + LolCalc.runePageValues[LolCalc.currentRunePage][statName] + '</span>' + DataLoader.language.data[statName] + '</a>')
				.data('statName', statName);
			if(currentStat != null && (statName == currentStat || statName == opcurrentStatName)){
				stat.addClass('active');
				doGraph(currentGraphStat);
			}
			stat.appendTo($detailList);

		}
	}
	$('a.stat', $detailList).tooltip();
	$('#detail').overscroll({
		hoverThumbs: true,
		direction: 'vertical'
	});
}


function doGraph(statName){
	console.log("Drawing stats of " + statName);
	currentGraphStat = statName;
	var statGraph = [];
	for (var i = 0; i < LolCalc.runePages.length; i++) {
		if(typeof(LolCalc.runePageValues[i]) == 'undefined')
			continue;
		console.log("Page #"+i);
		var runePageGraph = [];
		var opStatName = getOppositStat(statName);
		console.log("opStatName: " + opStatName);
		var statValue,perLevelStatValue;
		if(typeof(LolCalc.runePageValues[i][statName]) == 'undefined')
			statValue = 0;
		else
			statValue = LolCalc.runePageValues[i][statName];

		if(typeof(LolCalc.runePageValues[i][opStatName]) == 'undefined')
			perLevelStatValue = 0;
		else
			perLevelStatValue = LolCalc.runePageValues[i][opStatName];

		if(statValue == 0 && perLevelStatValue == 0)
			continue;

		if(isPerLevelStat(statName))
		{
			var tmp = statValue;
			statValue = perLevelStatValue;
			perLevelStatValue = tmp;
		}
		console.log(statValue,perLevelStatValue);
		for (var lvl = 1; lvl <= 18; lvl++) {
			runePageGraph.push([lvl, statValue + perLevelStatValue*lvl]);
		};
		console.log(runePageGraph);
		statGraph.push({data: runePageGraph, label: 'Page '+(i+1) + " = 0"});
	};
	console.log(statGraph);
	plot = $.plot("#graph", statGraph, {
		legend: {
			container: '#graph-legend',
			noColumns: 10
		},
		xxaxis: {
			tickSize: 1,
			tickFrequency: 1
			//ticks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
		},
		series: {
			lines: { show: true },
			points: { show: true }
		},
		crosshair: {
			mode: "x"
		},
		grid: {
			hoverable: true,
			autoHighlight: false
		},
	});
	legends = $("#graph-legend .legendLabel");
}

function isPerLevelStat(statName){
	return statName.charAt(0) == 'r' && statName.endsWithSkeet('PerLevel');
}

function getPerLevelStat(statName){
	return 'r'+statName+'PerLevel';
}

function getFlatStat(statName){
	return statName.substr(1, statName.length-9);
}

function getOppositStat(statName){
	if(statName == null)
		return null;
	if(isPerLevelStat(statName))
		return getFlatStat(statName);
	else
		return getPerLevelStat(statName);
}




function switchRunePage(newPageId){
	console.log("Switched to Page#"+newPageId);
	$('#page-selector .rm-page').attr('disabled', newPageId == 0);
	LolCalc.currentRunePage = newPageId;
	$('#current-runes-page .rune-drop.dropped').each(function(){
		clearRune($(this));
		$(this).removeClass('.dropped');
	});
	if(typeof LolCalc.runePages[LolCalc.currentRunePage] != 'undefined'){
		var runeGroup;
		var runeType
		for(runeType in LolCalc.runePages[LolCalc.currentRunePage]){
			runeGroup = LolCalc.runePages[LolCalc.currentRunePage][runeType];
			for (var i = runeGroup.length - 1; i >= 0; i--) {
				setFullRune($('#current-runes-page .rune-type-'+runeType+' .droppable:not(.dropped):first'), runeGroup[i]);
			}
		}
	}
	updateCurrentRunePageValue();
}

function updateLegend() {

	updateLegendTimeout = null;

	var pos = latestPosition;

	var axes = plot.getAxes();
	if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
		pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) {
		return;
	}

	var i, j, dataset = plot.getData();
	for (i = 0; i < dataset.length; ++i) {

		var series = dataset[i];

		// Find the nearest points, x-wise

		for (j = 0; j < series.data.length; ++j) {
			if (series.data[j][0] > pos.x) {
				break;
			}
		}

		// Now Interpolate

		var y,
			p1 = series.data[j - 1],
			p2 = series.data[j];

		if (p1 == null) {
			y = p2[1];
		} else if (p2 == null) {
			y = p1[1];
		} else {
			y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
		}

		//console.log(y);

		legends.eq(i).text(series.label.replace(/=.*/, "= " + y.toFixed(2)));
	}
}