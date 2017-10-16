'use strict';

$('#search-box-container').css({
    height: $('#logo').height()
});
$('#search-box').css({
    left: `calc(2em + ${$('#logo').width()}px)`,
    top: ($('#search-box-container').height() - $('#search-box').height()) / 2
});

function search(q) {
    window.location.href = `/search?q=${q}`;
}
$('#search-icon')
    .on('click', () => { search($('#search-edit').val()); });
$('#search-edit')
    .on('focus', function() {
        $('#search-page-dimmer').css({
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 500
        });
    });
$('#search-edit')
    .blur(function() {
        $('#search-page-dimmer').css({
            background: 'rgba(0, 0, 0, 0)',
            zIndex: -500
        });
    });
