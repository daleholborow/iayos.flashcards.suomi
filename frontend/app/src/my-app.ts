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

	
	$("a.switcher").bind("click", function (e) {
		e.preventDefault();

		var theid = $(this).attr("id");
		var theproducts = $("ul#photoslist");
		var classNames = $(this).attr('class').split(' ');


		if ($(this).hasClass("active")) {
			// if currently clicked button has the active class
			// then we do nothing!
			return false;
		} else {
			// otherwise we are clicking on the inactive button
			// and in the process of switching views!

			if (theid == "view13") {
				$(this).addClass("active");
				$("#view11").removeClass("active");
				$("#view11").children("img").attr("src", "images/switch_11.png");

				$("#view12").removeClass("active");
				$("#view12").children("img").attr("src", "images/switch_12.png");

				var theimg = $(this).children("img");
				theimg.attr("src", "images/switch_13_active.png");

				// remove the list class and change to grid
				theproducts.removeClass("photo_gallery_11");
				theproducts.removeClass("photo_gallery_12");
				theproducts.addClass("photo_gallery_13");

			}

			else if (theid == "view12") {
				$(this).addClass("active");
				$("#view11").removeClass("active");
				$("#view11").children("img").attr("src", "images/switch_11.png");

				$("#view13").removeClass("active");
				$("#view13").children("img").attr("src", "images/switch_13.png");

				var theimg = $(this).children("img");
				theimg.attr("src", "images/switch_12_active.png");

				// remove the list class and change to grid
				theproducts.removeClass("photo_gallery_11");
				theproducts.removeClass("photo_gallery_13");
				theproducts.addClass("photo_gallery_12");

			}
			else if (theid == "view11") {
				$("#view12").removeClass("active");
				$("#view12").children("img").attr("src", "images/switch_12.png");

				$("#view13").removeClass("active");
				$("#view13").children("img").attr("src", "images/switch_13.png");

				var theimg = $(this).children("img");
				theimg.attr("src", "images/switch_11_active.png");

				// remove the list class and change to grid
				theproducts.removeClass("photo_gallery_12");
				theproducts.removeClass("photo_gallery_13");
				theproducts.addClass("photo_gallery_11");

			}

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
		url: "send.php",
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