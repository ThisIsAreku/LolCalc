var LoadingBar = new function (){
	var hideTimer = 0;
	var hidden = true;

	var tt_inner = $('<div />', { 'class': 'tooltip-inner' });
	var tt = $('<div />', {
			'class': 'tooltip bottom in',
			css: {
				top: '10px'
			}
		})
		.append($('<div />', {
			'class': 'tooltip-arrow',
			css: {
				left: '50%'
			}
		}))
		.append(tt_inner)
	;

	var inner = $('<div />', {'class' : 'inner'});
	var bar = $('<div />', {'id': 'loading-bar' }).append(inner).append(tt);

	$(document.body).append(bar);

	this.setValue = function (v, e){
		if(v > 100)
			return;
		if(v == 0){
			hidden = true;
			tt_inner.text('');
			bar.hide();
			inner.css('width', '0%');
			tt.css('left', '0%');
			return;
		}
		if(hidden){
			hidden = false;
			if(hideTimer != 0)
				clearTimeout(hideTimer);
			bar.show();
		}
		if('string'===typeof e && e != '')
			tt_inner.text(e);
		else
			tt_inner.text(v.toFixed(2)+'%');

		inner.css('width', v+'%');
		tt.css({
			left: (v/2)+'%',
			marginLeft: -(tt_inner.outerWidth()/2)+'px'
		});


		if(v == 100){
			hideTimer = setTimeout(function (){
				bar.fadeOut(function (){
					tt_inner.text('');
				});
				hidden = true;
			}, 1000);
		}
	}

	this.setValue(0);
}