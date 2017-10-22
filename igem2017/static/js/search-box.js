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
$(window)
    .on('keydown', (event) => {
        if (event.key === 'Enter')
            search($('#search-edit').val());
    });
