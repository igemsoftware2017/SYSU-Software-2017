'use strict';

// initializing position
$('#right-panel').css({
    top: $('#result-list').offset().top

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

search = (q, type) => realSearch(q, 'part');
$('#search-edit').attr('placeholder', 'Search for parts...');