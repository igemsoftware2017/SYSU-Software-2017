'use strict';

/* global d3 */

// from https://bl.ocks.org/mbostock/4062045

let svg = d3.select('svg'),
    width = +svg.attr('width'),
    height = +svg.attr('height');

let color = d3.scaleOrdinal(d3.schemeCategory20);

let simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(function(d) { return d.id; }))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2));

let graph = {
    nodes: [],
    links: []
};

function process(data, groupId) {
    graph.nodes.push({
        id: data.name,
        group: groupId
    });
    if (data.children === undefined)
        return;
    data.children.forEach((c) => {
        graph.links.push({
            source: data.name,
            target: c.name,
            value: 1
        });
        process(c, groupId + 1);
    });
}

d3.json('/keywords', function(error, data) {
    if (error) throw error;

    process(data, 1);

    let link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(graph.links)
        .enter().append('line')
        .attr('stroke-width', function(d) { return Math.sqrt(d.value); });

    let node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(graph.nodes)
        .enter().append('circle')
        .attr('r', 5)
        .attr('fill', function(d) { return color(d.group); })
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

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
    }

    $('circle').on('click', function() {
        search($(this).children('title').text());
    });
});

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