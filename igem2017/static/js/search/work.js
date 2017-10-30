'use strict';

/* global Chart */

// initializing position
$('#right-panel').css({
    top: $('#result-list').offset().top,
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

$('#tool').popup({
    popup: $('#tool-popup'),
    on: 'click',
    position: 'bottom left'
});

$('.rewards').each((_, v) => {
    let popup = $(`[workid=${$(v).attr('workid')}].popup`);
    if (popup.children('ul').children('li').length === 0)
        popup.html('<p>No awards.</p>');
    $(v).popup({
        popup: popup,
        position: 'right center'
    });
});

let data = JSON.parse($('#chart-data').val());
let labels = Object.keys(data[0]);
let nums = labels.map((k) => data[0][k]);
new Chart($('#chart'), {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: 'Score',
            data: nums,
            backgroundColor: [
                'red', 'orange', 'yellow', 'green' ,'cyan', 'blue', 'purple', 'grey'
            ]
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
