function insertInterest(x, y) {
    let a = $('<div class="interest"></div>').appendTo('.interests');
    a.css({
        top: `calc(${y}px + 0.5rem)`,
        left: `calc(${x}px + 0.5rem)`,
        position: 'absolute'
    });
}
let positions = [];
let sqr = (x) => x * x;
let distance = (a, b) => Math.sqrt(sqr(a.x - b.x) + sqr(a.y - b.y));
let valid = (p, t) => positions.reduce((r, v) => r && distance(p, v) > t, true);
let chosenInterest = new Set();
let options = [
    { text: 'Environment', option: 'environment'},
    { text: 'Disease', option: 'disease'},
    { text: 'Food', option: 'food'},
    { text: 'Energy', option: 'energy'},
    { text: 'Hardware', option: 'hardware'},
    { text: 'Software', option: 'software'},
    { text: 'Industry', option: 'industry'},
    { text: 'Pollution', option: 'pollution'},
    { text: 'Agriculture', option: 'agriculture'},
    { text: 'Art', option: 'art'},
    { text: 'Heavy metal', option: 'heavy metal'}
];
let width = $('.interests').width();
let height = $('.interests').height();
let em = ($('.container').offset().top - $('.container').position().top) / 6;
console.log(width, height);
options.forEach((o, i) => {
    let id = 'interest-' + i, text = o.text;
    $('.interests').append(`<div class="interest" id="${id}">${text}</div>`);
    o.item = $('#' + id);
    let item = o.item;
    let p = { x: 0, y: 0 };
    do {
        p.x = Math.ceil(Math.random() * width);
        p.y = Math.ceil(Math.random() * height);
    } while (valid(p, 6.5 * em) === false);
    positions.push(p);
    item
        .css({
            top: p.y,
            left: p.x
        })
        .data('origin', { top: o.top, left: o.left })
        .data('id', id)
        .data('chosen', false)
        .data('hover', false)
        .data('option', o.option)
        .data('timerId', setInterval(function() {
            if (!item.data('chosen') && !item.data('hover')) {
                let newTop = 0, newLeft = 0;
                let oTop = item.data('origin').top, oLeft = item.data('origin').left;
                do {
                    newTop = item.position().top + Math.random() * 10 - 5;
                    newLeft = item.position().left + Math.random() * 10 - 5;
                } while (Math.abs(newTop - oTop) > 20 || Math.abs(newLeft - oLeft) > 20);
                item.css({
                    top: newTop,
                    left: newLeft
                });
            }
        }, 1100))
        .on('mouseenter', function() {
            if (!item.data('chosen'))
                item
                    .addClass('interest-hover')
                    .data('hover', true)
                    .stop();
        })
        .on('mouseleave', function() {
            if (!item.data('chosen'))
                item
                    .removeClass('interest-hover')
                    .data('hover', false);
        })
        .on('click', function() {
            if (!item.data('chosen')) {
                item.data('chosen', true);
                item.addClass('interest-chosen');
                chosenInterest.add(item.data('option'));
            } else {
                item.data('chosen', false);
                item.removeClass('interest-chosen');
                chosenInterest.delete(item.data('option'));
            }
        });
});

$('#reset')
    .on('click', function() {
        options.forEach(function(o) {
            if (o.item.data('chosen')) {
                o.item
                    .data('chosen', false)
                    .data('hover', false)
                    .removeClass('interest-chosen interest-hover');
                chosenInterest.delete(o.item.data('option'));
            }
        });
    });

$('#finish')
    .on('click', () => {
        let data = [];
        chosenInterest.forEach((v) => { data.push(v); });
        let postData = {
            csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val(),
            data: JSON.stringify({ interest: data })
        };
        console.log(postData);
        $.post('/api/interest', postData, (r) => {
            if (r.success === true)
                window.location.href = '/';
        });
    });
