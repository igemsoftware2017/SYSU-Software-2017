$(window).scroll( function() {
  if ($(window).scrollTop() > 100) {
    $('#nav').css({
      top: '-100px'
    });
    $('#info-bar').css({
      top: '0px'
    });
  } else {
    $('#nav').css({
      top: '0px'
    });
    $('#info-bar').css({
      top: '-100px'
    });
  }
});
