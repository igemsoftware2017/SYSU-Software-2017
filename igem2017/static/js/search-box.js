'use strict';

$('#search-box').css({
    height: $('#logo').height()
});

function search(q) {
    if (q !== '')
        window.location.href = `/search/work?q=${q}`;
}
$('#search-icon')
    .on('click', () => { search($('#search-edit').val()); });
$(window)
    .on('keydown', (event) => {
        if (event.key === 'Enter')
            search($('#search-edit').val());
    });
