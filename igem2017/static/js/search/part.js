'use strict';

// initializing position
let leftBlank = `2em + ${$('#logo').width()}px`;
$('#result-container').css({
    left: `calc(${leftBlank})`
});
$.each($('.item>.image>img'), function() {
    $(this).css({
        marginLeft: ($(this).parent().width() - $(this).width()) / 2
    });
});
$('#right-panel').css({
    left: `calc(2em + ${leftBlank} + 876px + 20px)`,
    top: $('#result-list').offset().top,
    width: 342,
    height: 406
});

$('.star.icon')
    .on('click', function() {
        if ($(this).hasClass('empty'))
            $(this).removeClass('empty');
        else
            $(this).removeClass('star icon').addClass('empty star icon');
    });

$('.labels>.label')
    .on('click', function() {
        if ($(this).hasClass('basic'))
            $(this).removeClass('basic');
        else
            $(this).removeClass('label').addClass('basic label');
    });

$('.ui.text.menu')
    .on('click', '.item', function() {
        let i = $(this).children('i');
        if (i.hasClass('up'))
            i.removeClass('up icon').addClass('down icon');
        else
            i.removeClass('down icon').addClass('up icon');
    });

$('#tool')
    .popup({
        popup: $('#tool-popup'),
        on: 'click',
        position: 'bottom left'
    });

$('.rewards').each((_, v) => {
    let popup = $(`[workid=${$(v).attr('workid')}].popup`);
    if (popup.children('ul').children('li').length === 0)
        popup.html('<p>No awards.</p>');
    $(v).popup({
        popup: popup,
        position: 'right center'
    });
});