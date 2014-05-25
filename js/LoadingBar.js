var LoadingBar = new function (){
	var hideTimer = 0;
	var bar = $('<div />', {'id': 'loading-bar' });
	var inner = $('<div />', {'class' : 'inner'});
	bar.append(inner).appendTo($(document.body));

	this.setValue = function (v){
		if(v != 100){
			if(hideTimer != 0)
				clearTimeout(hideTimer);
			bar.show();
		}
		inner.css('width', v+'%');
		if(v == 100){
			hideTimer = setTimeout(function (){
				bar.fadeOut();
			}, 1000);
		}
	}

	this.setValue(0);
}