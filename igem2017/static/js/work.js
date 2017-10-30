'use strict';

/* global SDinDesign */

$('#right-panel').css({
    top: $('#detail-container').offset().top,
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

$('#collect-circuit').on('click', function() {
    let newVal = $(this).hasClass('empty') ? 1 : 0;
    $(this).addClass('loading');
    let postData = {
        data: JSON.stringify({
            circuit_id: $('#part').attr('circuit-id'),
            tag: newVal
        }),
        csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
    };
    $.post('/api/tag_favorite', postData, (data) => {
        console.log(data, data.status);
        $(this).removeClass('empty star icon loading');
        let val = (data.status === true) ? newVal : 1 - newVal;
        let cls = (val === 1) ? 'star icon' : 'empty star icon';
        console.log(newVal, val, cls);
        $(this).addClass(cls);
    });
});
