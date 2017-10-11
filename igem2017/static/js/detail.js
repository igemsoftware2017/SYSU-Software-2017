'use strict';

// initializing position
let leftBlank = `2em + ${$('#logo').width()}px`;
$('#search-box-container').css({
    height: $('#logo').height()
});
$('#search-box').css({
    left: `calc(${leftBlank})`,
    top: ($('#search-box-container').height() - $('#search-box').height()) / 2
});
$('#detail-container').css({
    left: `calc(${leftBlank})`
});
$.each($('.item>.image>img'), function() {
    $(this).css({
        marginLeft: ($(this).parent().width() - $(this).width()) / 2
    });
});
$('.collection').css({
    top: $('.reads').position().top + $('.reads').outerHeight() - $('.collection').outerHeight()
});

$('#right-panel').css({
    left: `calc(2em + ${leftBlank} + ${$('#detail-container').outerWidth()}px + 20px)`,
    top: $('#detail-container').offset().top,
    width: 342,
    height: 406
});

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
