'use strict';

/* global SDinDesign */

// initializing position
let leftBlank = `2em + ${$('#logo').width()}px`;
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

$('.back').on('click', () => { history.back(); });

let design;
$.get('/get_circuit_test', (value) => {
    let data = JSON.parse(value);
    design = new SDinDesign('#part', data, {});
});
$(window)
    .on('keydown', (event) => {
        if (event.ctrlKey === true)
            design.enableDrag();
    })
    .on('keyup', () => {
        design.disableDrag();
    });

$('div#detail-container > div.images > div.image > img')
    .on('click', function() {
        $('div.ui.page.dimmer').children().children().html($(this).parent().html());
        $('div.ui.page.dimmer').dimmer('show');
    });
