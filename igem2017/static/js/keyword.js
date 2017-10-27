'use strict';

/* global d3 */

let svg = d3.select('svg'),
    margin = 20,
    diameter = +svg.attr('width'),
    g = svg.append('g').attr('transform', 'translate(' + diameter / 2 + ',' + diameter / 2 + ')');

let pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

let color = d3.scaleLinear()
    .domain([-1, 5])
    .range(['transparent', 'navy']);

function calcSize(obj) {
    if (obj.children === undefined)
        return obj.size = 10;
    obj.size = obj.children.reduce((s, c) => { return s + calcSize(c); }, 0);
    return obj.size;
}

d3.json('/keywords', function(error, root) {
    if (error) throw error;

    calcSize(root);

    root = d3.hierarchy(root)
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value; });

    let focus = root,
        nodes = pack(root).descendants(),
        view;

    let circle = g.selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('class', function(d) { return d.parent ? d.children ? 'node' : 'node node--leaf' : 'node node--root'; })
        .style('fill', function(d) { return d.children ? color(d.depth) : null; })
        .on('click', function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

    g.selectAll('text')
        .data(nodes)
        .enter().append('text')
        .attr('class', 'label')
        .style('fill-opacity', function(d) { return d.parent === root ? 1 : 0; })
        .style('display', function(d) { return d.parent === root ? 'inline' : 'none'; })
        .text(function(d) { return d.data.name; });

    let node = g.selectAll('circle,text');

    svg
        .style('background', 'transparent')
        .on('click', function() { zoom(root); });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoom(d) {
        focus = d;

        let transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween('zoom', () => {
                let i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                return (t) => { zoomTo(i(t)); };
            })
            .tween('color', () => {

            });

        transition.selectAll('text')
            .filter(function(d) { return d.parent === focus || this.style.display === 'inline'; })
            .style('fill-opacity', function(d) { return d.parent === focus ? 1 : 0; })
            .on('start', function(d) { if (d.parent === focus) this.style.display = 'inline'; })
            .on('end', function(d) { if (d.parent !== focus) this.style.display = 'none'; });
    }

    function zoomTo(v) {
        let k = diameter / v[2]; view = v;
        node.attr('transform', function(d) { return 'translate(' + (d.x - v[0]) * k + ',' + (d.y - v[1]) * k + ')'; });
        circle.attr('r', function(d) { return d.r * k; });
    }
});
