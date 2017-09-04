/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../typings_app/app.d.ts" />


// Initialize your app
let myApp = new Framework7({
	animateNavBackIcon: true,
	// Enable templates auto precompilation
	precompileTemplates: true,
	// Enabled pages rendering using Template7
	swipeBackPage: false,
	swipeBackPageThreshold: 1,
	swipePanel: "left",
	swipePanelCloseOpposite: true,
	pushState: true,
	pushStateRoot: undefined,
	pushStateNoAnimation: false,
	pushStateSeparator: '#!/',
	template7Pages: true
});


// Export selectors engine
var $$ = Dom7;

// Add main View
var mainView = myApp.addView('.view-main', {
	// Enable dynamic Navbar
	dynamicNavbar: false
});


$$(document).on('ajaxStart', function (e) { myApp.showIndicator(); });
$$(document).on('ajaxComplete', function () { myApp.hideIndicator(); });

$$(document).on('pageInit', function (e) {

	$(".swipebox").swipebox();
	$("#ContactForm").validate({
		submitHandler: function (form) {
			ajaxContact(form);
			return false;
		}
	});

	$("#RegisterForm").validate();
	$("#LoginForm").validate();
	$("#ForgotForm").validate();

	$('a.backbutton').click(function () {
		parent.history.back();
		return false;
	});


	$(".posts li").hide();
	let size_li = $(".posts li").size();
	let x = 4;
	$('.posts li:lt(' + x + ')').show();
	$('#loadMore').click(function () {
		x = (x + 1 <= size_li) ? x + 1 : size_li;
		$('.posts li:lt(' + x + ')').show();
		if (x == size_li) {
			$('#loadMore').hide();
			$('#showLess').show();
		}
	});

});



function ajaxContact(theForm) {
	var $ = jQuery;
	$('#loader').fadeIn();
	var formData = $(theForm).serialize(),
		note = $('#Note');
	$.ajax({
		type: "POST",
		url: $(theForm).attr("action"),
		data: formData,
		success: function (response) {
			if (note.height()) {
				note.fadeIn('fast', function () { $(this).hide(); });
			} else {
				note.hide();
			}
			$('#LoadingGraphic').fadeOut('fast', function () {
				if (response === 'success') {

					$('.page_subtitle').hide();

				}
				// Message Sent? Show the 'Thank You' message and hide the form
				var result = '';
				var c = '';
				if (response === 'success') {
					myApp.alert('Thank you for getting in touch.', 'Message sent!');
					c = 'success';
				} else {
					result = response;
					c = 'error';
				}
				note.removeClass('success').removeClass('error').text('');
				var i = setInterval(function () {
					if (!note.is(':visible')) {
						note.html(result).addClass(c).slideDown('fast');
						clearInterval(i);
					}
				}, 40);
			}); // end loading image fadeOut
		}
	});
	return false;
}