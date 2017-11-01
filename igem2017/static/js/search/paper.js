'use strict';

// initializing position
$('#right-panel').css({
    top: $('#result-list').offset().top
});

$('.item')
    .on('mouseenter', function() {
        $(this)
            .css({
                maxHeight: ''
            })
            .children('.content')
            .children('.ui.header')
            .css({
                whiteSpace: 'normal'
            });
    }).on('mouseleave', function() {
        $(this)
            .css({
                maxHeight: '10rem'
            })
            .children('.content')
            .children('.ui.header')
            .css({
                whiteSpace: 'nowrap'
            });
    });
    
search = (q, type) => realSearch(q, 'paper');
$('#search-edit').attr('placeholder', 'Search for paper...');

let searchWord = $('#search-word').val();
$('#search-edit').val(searchWord);