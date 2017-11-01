'use strict';

/* global Chart */

// initializing position
// $('#right-panel').css({
//     top: $('#result-list').offset().top,
// });

$('.link.item')
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

$('.star.icon')
    .on('click', function() {
        if ($(this).hasClass('empty'))
            $(this).removeClass('empty');
        else
            $(this).removeClass('star icon').addClass('empty star icon');
    });

let searchWord = $('#tool-popup').data('keyword');
let searchData = {
    year: 'any',
    track: 'any',
    medal: 'any',
    q: searchWord
};
$('.labels>.label')
    .on('click', function() {
        $(this).toggleClass('basic').siblings().addClass('basic');
        searchData[$(this).data('type')] = $(this).hasClass('basic') ? 'any' : $(this).data('value');
    });
$('#complex-search')
    .on('click', () => {
        let s = searchData;
        window.location.href = `/search/work?q=${s.q}&year=${s.year}&medal=${s.medal}&track=${s.track}`;
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

$('#search-edit').val(searchWord);

function drawChart(d, chart) {
    d = $(d).val();
    if (d === undefined)
        return;
    let data = JSON.parse(d);
    let labels = Object.keys(data[0]);
    let nums = labels.map((k) => data[0][k]);
    new Chart($(chart), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Score',
                data: nums,
                backgroundColor: '#cccccc'
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'white'
                    }
                }],
                xAxes: [{
                    ticks: {
                        autoSkip: false,
                        fontSize: 10,
                        fontColor: 'white'
                    }
                }]
            },
            legend: { display: false }
        }
    });
}

drawChart('#year-chart-data', '#year-chart');
drawChart('#track-chart-data', '#track-chart');
drawChart('#medal-chart-data', '#medal-chart');

/* global d3 */

// Draw keyword graph
//   copied from https://bl.ocks.org/mbostock/4062045
function d3KeywordChart() {
    let svg = d3.select('svg'),
        width = +svg.attr('width'),
        height = +svg.attr('height');

    let simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(function(d) { return d.id; }).distance(() => 200))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2));

    let data = JSON.parse($('#keyword-data').val().split(`'`).join(`"`));
    if (data[0] !== searchWord)
        data = [searchWord].concat(data);
    let graph = {
        nodes: data.map((k, i) => ({
            id: k,
            group: i
        })),
        links: data.map((k) => ({
            source: searchWord,
            target: k,
            value: 5
        }))
    };
    let link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(graph.links)
        .enter().append('line')
        .attr('stroke-width', function(d) { return Math.sqrt(d.value); });

    let nodes_g = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(graph.nodes)
        .enter().append('g');
    let node = nodes_g.append('circle')
        .attr('r', 50)
        .attr('fill', function(d) { return 'rgba(255, 255, 255, 0.01)'; })
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    let text = nodes_g.append('text')
        .attr('dx', 12)
        .attr('dy', '.35em')
        .text((d) => d.id);

    node.append('title')
        .text(function(d) { return d.id; });

    simulation
        .nodes(graph.nodes)
        .on('tick', ticked);

    simulation.force('link')
        .links(graph.links);

    function ticked() {
        link
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        node
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
        text
            .attr('dx', function(d) { return d.x - 30; })
            .attr('dy', function(d) { return d.y; });
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    $('circle').on('click', function() {
        search($(this).children('title').text());
    });
}
d3KeywordChart();
