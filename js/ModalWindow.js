var ModalWindow = new function (){
	var $modal = $('<div class="modal fade" id="modal-window" tabindex="-1" role="dialog" aria-labelledby="modal-window-label" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title" id="modal-window-label">Modal title</h4></div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>');
	$modal.appendTo(document.body);

	this.display = function (title, text){
		$('.modal-title', $modal).text(title);
		$('.modal-body', $modal).html(text);
		$modal.modal('show');
	}
}
