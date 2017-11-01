'use strict';

/* global SDinDesign */

$('#right-panel').css({
    top: $('#detail-container').offset().top,
});
$('.collection').css({
    top: $('.reads').position().top
});

$('.back').add('i.chevron.left.icon')
    .on('click', () => { history.back(); });

let updateSafety = () => {};
let designId = $('#part').attr('circuit-id');
let design;
if (designId != -1) {
    $.get(`/api/circuit?id=${designId}`, (value) => {
        design = new SDinDesign('#part', value, {});
        design.ratio = 0.5;
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

$('div#detail-container > div.images > img')
    .on('click', function() {
        $('div.ui.page.dimmer').children().children().html(this.outerHTML);
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
        $(this).removeClass('loading');
        if (data.success === false)
            return;
        $(this).removeClass('empty').addClass((newVal === 1) ? '' : 'empty');
    });
});

$('td>i').on('click', function() {
    let newVal = $(this).hasClass('empty') ? 1 : 0;
    $(this).addClass('loading');
    let postData = {
        data: JSON.stringify({
            part_id: $(this).attr('bba'),
            tag: newVal
        }),
        csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
    };
    $.post('/api/part_favorite', postData, (data) => {
        $(this).removeClass('loading');
        if (data.success === false)
            return;
        $(this).removeClass('empty').addClass((newVal === 1) ? '' : 'empty');
    });
});
