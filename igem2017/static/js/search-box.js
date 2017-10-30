'use strict';

$('#search-box').css({
    height: $('#logo').height()
});

function realSearch(q, type) {
    if (q !== '')
        window.location.href = `/search/${type}?q=${q}`;
}
let search = (q) => realSearch(q, 'work');
$('#search-icon')
    .on('click', () => { search($('#search-edit').val()); });
$(window)
    .on('keydown', (event) => {
        if (event.key === 'Enter')
            search($('#search-edit').val());
    });
