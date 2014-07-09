"use strict";

$.fn.tooltip.Constructor.DEFAULTS.container = 'body';
var currentStat = null;

$(document).ready(function(){
	UI.initialize();
})

var UI = new function(){
	var it = this;

	var managers = {
		'runes': new RunesUI(),
		'champions': new ChampionsUI()
	};
	var currentManager = null;
	this.getManager = function () {
		return managers[currentManager];
	}
	this.initialize = function (){
		$(DataLoader).on('loadComplete', function (e){	
			LolCalc.load(function (){
				console.log('Data loaded');
			})
		})
		$(DataLoader).on('loadProgress', function (e, current, max){
			var percent = current * 100 / max;
			LoadingBar.setValue(percent, 'Chargement de ' + current + ' sur ' + max);
			if(percent == 100){
				$('#build-configuration .mask-overlay').fadeOut();
				if(window.location.hash == '')
					$('#build-tabs a:first').click();
				else
					$('#build-tabs a[data-category="'+window.location.hash.substr(1)+'"]').click();
			}
		})


		$('#build-tabs a').click(function (e) {
			//e.preventDefault();
			var $this = $(this);
			var $target = $($this.data('target'));
			var category = $this.data('category');
			window.location.hash = category;
			if('undefined' !== typeof it.getManager()){
				console.log('UI: sleep [' + currentManager + ']');
				it.getManager().sleep();
			}
			currentManager = category;
			if($target.data('loaded') !== true){
				var source = $this.attr('href');
				$target.load(source, function(){
					$target.data('loaded', true);
					console.log('UI: initialize [' + currentManager + ']');
					it.getManager().initialize();
					console.log('UI: wakeup [' + currentManager + ']');
					it.getManager().wakeup();
				});
			}else{
				console.log('UI: wakeup [' + currentManager + ']');
				it.getManager().wakeup();
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


		$('#detail .list-group').on('click', '.stat', function(e){
			e.preventDefault();
			$('#detail .list-group .stat').removeClass('active');
			$(this).addClass('active');
			var opStat = getOppositStat($(this).data('statName'));
			$('#detail .list-group .stat.'+opStat).addClass('active');
			currentStat = $(this).data('statName');
			doGraph($(this).data('statName'));
		})

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
	}
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

	var stats = LolCalc.getBuild().compiledStats;

	var opcurrentStatName = getOppositStat(currentStat);
	for(var statName in stats)
	{
		if(stats[statName] != 0)
		{
			var stat = $('<a href="#" class="list-group-item stat '+statName+'" title="'+statName+'" data-statName="'+statName+'"><span class="badge">' + stats[statName] + '</span>' + DataLoader.language.data[statName] + '</a>')
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
	for (var i = 0; i < LolCalc.getBuildCount(); i++) {
		var stats = LolCalc.getBuild(i).compiledStats;
		console.log("Page #"+i);
		var runePageGraph = [];
		var opStatName = getOppositStat(statName);
		console.log("opStatName: " + opStatName);
		var statValue,perLevelStatValue;
		if(typeof(stats[statName]) == 'undefined')
			statValue = 0;
		else
			statValue = stats[statName];

		if(typeof(stats[opStatName]) == 'undefined')
			perLevelStatValue = 0;
		else
			perLevelStatValue = stats[opStatName];

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