//=require jquery/dist/jquery.min.js
//=require slick-carousel/slick/slick.min.js
//=require bootstrap/dist/js/bootstrap.bundle.min.js
//=require vendor/parallax.min.js

window.vela = window.vela || {};

vela.initializeEvents = function() {
  console.log('Init Events');
};

vela.preLoading = function() {
  var counter = 0,
    preLoading = '.js-preloading',
    preLoadingBar = '.js-preloading .preloading__bar',
    items = new Array();

  if (!$(preLoading).length) {
    $('body').append('<div class="js-preloading preloading"><div class="preloading__bar"></div></div>')
  }

  function getImages(element) {
    $(element).find('*:not(script)').each(function() {
      var url = '';
      if ($(this).css('background-image').indexOf('none') == -1 && $(this).css('background-image').indexOf('-gradient') == -1) {
        url = $(this).css('background-image');
        if(url.indexOf('url') != -1) {
          var temp = url.match(/url\((.*?)\)/);
          url = temp[1].replace(/\"/g, '');
        }
      } else if ($(this).get(0).nodeName.toLowerCase() == 'img' && typeof($(this).attr('src')) != 'undefined') {
        url = $(this).attr('src');
      }
      if (url.length > 0) {
        items.push(url);
      }
    });
  }

  function preLoadingImage(url) {
    var imgPreLoading = new Image();
    $(imgPreLoading).on('load', function() {
      runPreLoading();
    }).on('error', function() {
      runPreLoading();
    });
    $(imgPreLoading).attr('src', url);
  }

  function preLoadingStart() {
    for (var i = 0; i < items.length; i++) {
      if(preLoadingImage(items[i]));
    }
    $('body').removeClass('body-preloading');
  }

  function runPreLoading() {
    counter++;
    var per = Math.round((counter / items.length) * 100);
    $(preLoadingBar).css('width', per + '%');
    if(counter >= items.length) {
      counter = items.length;
      $(preLoading).fadeOut(200, function() {
        //$(preLoading).remove();
      });
    }
  }

  getImages($('body'));
  preLoadingStart();
};

vela.init = function() {
  vela.initializeEvents();
};

$(function() {
  vela.init();
  vela.preLoading();
});
