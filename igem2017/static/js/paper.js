'use strict';

/* global SDinDesign */

// initializing position
$('#right-panel').css({
    top: $('#detail-container').offset().top
});
$('.jif').css({
    top: $('.doi').position().top
});

$('.back').add('i.chevron.left.icon')
    .on('click', () => { history.back(); });

let designId = $('#part').attr('circuit-id');
let design;
if (designId != -1) {
    $.get(`/api/circuit?id=${designId}`, (value) => {
        design = new SDinDesign('#part', value, {});
    });
}
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
        $('div.ui.page.dimmer').dimmer({
            duration: {
                show: 200,
                hide: 200
            }
        });
        $('div.ui.page.dimmer').dimmer('show');
    });
