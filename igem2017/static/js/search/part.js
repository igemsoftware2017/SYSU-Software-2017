'use strict';

// initializing position
$('#right-panel').css({
    top: $('#result-list').offset().top

});

$('.star.icon').on('click', function() {
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
        console.log(data);
        $(this).removeClass('loading');
        if (data.success === undefined || data.success === false)
            return;
        $(this).removeClass('empty').addClass((newVal === 1) ? '' : 'empty');
    });
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

$('#tool')
    .popup({
        popup: $('#tool-popup'),
        on: 'click',
        position: 'bottom left'
    });

search = (q, type) => realSearch(q, 'part');
$('#search-edit').attr('placeholder', 'Search for parts...');

let searchWord = $('#search-word').val();
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

$('svg').attr({
    width: $('.chart-box').width(),
    height: $('.chart-box').width()
});

/* global d3 */

// Draw keyword graph
//   copied from https://bl.ocks.org/mbostock/4062045
function d3KeywordChart() {
    let svg = d3.select('svg'),
        width = +svg.attr('width'),
        height = +svg.attr('height');

    let simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(function(d) { return d.id; }).distance(() => 150))
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
