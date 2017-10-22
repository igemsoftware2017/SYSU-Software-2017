'use strict';

/* eslint-disable no-console */
/* global jsPlumbInstance */

// x axis: left->right
// y axis: top->down

/*
 * README of initialization option of a SDinDesign
 *
 * option: {
 *     draggable: true,
 *     highlightable: true,
 *     zoomable: true,
 *     movable: true,
 *     addable: true
 * }
 *
 * draggable: a part/device can be drag or not
 * highlight: highlight a part/device on click or not
 * zoomable: the canvas itself can be zoom or not
 * movable: the canvas itself can be move or not
 * addable: can add new device/part to design or not
 *
 */

class SDinDesign {
    static get partSafetyLevels() {
        return [
            'Low risk',
            'Small risk',
            'Many risk',
            'Bomb'
        ];
    }
    static get partTypes() {
        return [
            'CDS',
            'RBS',
            'promoter',
            'terminator',
            'chemical substance',
            'material',
            'protein',
            'process',
            'RNA',
            'protein-m',
            'protein-l',
            'complex',
            'other_DNA',
            'composite',
            'generator',
            'reporter',
            'inverter',
            'signalling',
            'measurement',
            'unknown'
        ];
    }
    static get standardSize() {
        return {
            deviceHeight: 100,
            partSize: 60,
            partPadding: 30,
            bonePadding: 10,
            addIconSize: 15,
            strokeWidth: 3,
            unit: 1
        };
    }

    static zoom(size, ratio) {
        let newSize = {};
        $.each(size, (key, value) => { newSize[key] = value * ratio; });
        return newSize;
    }

    constructor(canvas, design, option) {
        this._canvas = canvas;
        this._design = design;
        this._option = option;
        this._canvasPositionX = 0;
        this._canvasPositionY = 0;
        this._size = SDinDesign.zoom(SDinDesign.standardSize, 1);
        this._nextPartId = 0;
        this._ready = () => {};
        this._readyFired = false;
        this._jsPlumb = jsPlumb.getInstance();
        this._jsPlumb.ready(() => {
            this._jsPlumb.setContainer($(this._canvas));
            this.design = this._design;
            this._ready();
            this.readyFired = true;
        });
    }
    set ready(f) {
        if (this._readyFired === true)
            f();
        else
            this._ready = f;
    }

    resizeDesign(ratio) {
        this.size = SDinDesign.zoom(SDinDesign.standardSize, ratio);
        this.redrawDesign();
    }

    get canvas() { return $(this._canvas); }
    get design() {
        let data = $.extend(true, {}, this._design);
        delete data.status;
        $.each(data.parts, (index, part) => { delete part.DOM; });
        $.each(data.devices, (index, device) => {
            delete device.DOM;
            $.each(device.parts, (index, part) => { delete part.DOM; });
        });
        $.each(data.lines, (index, line) => { delete line.DOM; });
        return data;
    }
    set design(design) {
        this._jsPlumb.deleteEveryConnection();
        $('.SDinDesign-part, .SDinDesign-device').remove();
        $.each(design.devices, (_, device) => { this.addDevice(device); });
        $.each(design.parts, (_, part) => { this.addPart(part, 1, undefined); });
        $.each(design.lines, (_, link) => { this.addLink(link, false); });
        this.redrawDesign();
    }

    addDevice(data) {
        // Creating device
        let device = $('<div></div>')
            .appendTo(this._canvas)
            .addClass('SDinDesign-device')
            .attr('device-id', data.deviceID)
            .data('selected', false);
        if (this._option.draggable) {
            device.on('click', preventClickOnDrag);
            this._jsPlumb.draggable(device, {
                drag: function() {
                    device.addClass('dragging');
                },
                start: function(event) {
                    device.data('drag-origin', {
                        x: event.e.pageX,
                        y: event.e.pageY
                    });
                },
                stop: function(event) {
                    let origin = device.data('drag-origin');
                    data.X += (event.e.pageX - origin.x) / this._size.unit;
                    data.Y += (event.e.pageY - origin.y) / this._size.unit;
                }
            });
        }

        // Creating bone
        $('<div></div>')
            .appendTo(device)
            .addClass('bone');

        if (this._option.addable) {
        // Creating dropper for adding subparts
            for (let i = 0; i <= data.parts.length; ++i) {
                $('<div></div>')
                    .appendTo(device)
                    .addClass('SDinDesign-subpartDropper')
                    .attr('dropper-id', i)
                    .droppable({
                        accept: '#part-info-img',
                        greedy: true,
                        tolerance: 'intersect',
                        over: function() {
                            $(this).css({ backgroundColor: 'rgba(255, 0, 0, 0.3)' });
                        },
                        out: function() {
                            $(this).css({ backgroundColor: 'rgba(255, 0, 0, 0.1)' });
                        },
                        drop: function() {
                            insertPart(data, selectedPart, $(this).attr('dropper-id'));
                        }
                    });
            }
            // covering incorrect canvas droppable
            device.droppable({
                accept: '#part-info-img',
                greedy: true
            });
        }

        // Creating subparts
        $.each(data.parts, (index, part) => {
            this.addPart(part, index, device);
        });
        data.parts[0].DOM.data('leftmost', true);
        data.parts[data.parts.length - 1].DOM.data('rightmost', true);

        data.DOM = device;
    }

    addPart(data, index, device) {
        let isSubpart = device !== undefined;
        if (!isSubpart)
            device = $(this._canvas);
        let part = $('<div></div>')
            .appendTo(device)
            .addClass('SDinDesign-part')
            .attr('part-id', data.ID)
            .append(`
                <div class="ui centered fluid image">
                    <img src="/static/img/design/${data.type}.png"></img>
                </div>
            `)
            .append(`<p>${data.name}</p>`)
            .data('is-subpart', isSubpart)
            .data('index', index);
        this._nextPartId = Math.max(this._nextPartId, parseInt(data.ID)) + 1;
        if (isSubpart === false) {
            if (this._option.draggable) {
                part.on('click', preventClickOnDrag);
                this._jsPlumb.draggable(part, {
                    start: function(event) {
                        part.data('drag-origin', {
                            x: event.e.pageX,
                            y: event.e.pageY
                        });
                    },
                    drag: function() {
                        part.addClass('dragging');
                    },
                    stop: function(event) {
                        let origin = part.data('drag-origin');
                        data.X += (event.e.pageX - origin.x) / this._size.unit;
                        data.Y += (event.e.pageY - origin.y) / this._size.unit;
                    }
                });
            }
            part.data({
                leftmost: true,
                rightmost: true
            });
        }
        if (this._size.unit < 0.75)
            part.children('p').hide();
        data.DOM = part;
    }

    addLink(data, isPreview) {
        let source = $('[part-id=' + data.source + ']');
        let target = $('[part-id=' + data.target + ']');

        // Anchors
        let anchors = [
            ['TopCenter', 'BottomCenter'],
            ['TopCenter', 'BottomCenter']
        ];
        if (source.data('leftmost') === true) anchors[0].push('Left');
        if (source.data('rightmost') === true) anchors[0].push('Right');
        if (target.data('leftmost') === true) anchors[1].push('Left');
        if (target.data('rightmost') === true) anchors[1].push('Right');

        // Arrow
        let arrowSetting;
        if (data.type === 'promotion')
            arrowSetting = ['Arrow', { foldback: 0.01, width: 15, location: 1 }];
        else
            arrowSetting = ['Diamond', { foldback: 1, width: 30, length: 1, location: 1 }];
        arrowSetting[1].id = `SDinDesign-arrow-${data.source}-${data.target}`;

        data.DOM = this._jsPlumb.connect({
            source: source,
            target: target,
            anchors: anchors,
            endpoint: 'Blank',
            cssClass: `SDinDesign-connection ${data.type}-connection ${isPreview ? 'preview-connection' : ''}`,
            overlays: [arrowSetting],
            connector: 'Flowchart'
        });
    }
    removeLink(data) {
        if (data.DOM !== undefined) {
            this._jsPlumb.deleteConnection(data.DOM);
        }
    }

    redrawDesign() {
        $.each(this._design.devices, (index, device) => {
            device.DOM
                .css({
                    left: (this._canvasPositionX + device.X) * this._size.unit,
                    top: (this._canvasPositionY + device.Y) * this._size.unit,
                    height: `calc(${this._size.partSize + this._size.bonePadding * 3 + 3}px + ${1.5 * this._size.unit}em)`,
                    width: Object.keys(device.parts).length * (this._size.partSize + this._size.partPadding) + this._size.partPadding
                })
                .children('.bone')
                .css({
                    left: this._size.partPadding,
                    width: device.DOM.width() - 2 * this._size.partPadding,
                    bottom: this._size.bonePadding
                });
            $.each(device.parts, (index, part) => {
                part.DOM
                    .css({
                        width: this._size.partSize,
                        height: `calc(${this._size.partSize}px + ${1.5 * this._size.unit}em)`,
                        left: index * (this._size.partSize + this._size.partPadding) + this._size.partPadding,
                        top: this._size.bonePadding
                    });
            });
            for (let i = 0; i <= device.parts.length; ++i) {
                let dropper = device.DOM.children(`[dropper-id=${i}]`);
                dropper.css({
                    width: this._size.bonePadding,
                    height: `calc(${this._size.partSize + this._size.bonePadding}px + ${1.5 * this._size.unit}em)`,
                    top: this._size.bonePadding,
                    left: i * (this._size.partSize + this._size.partPadding) + (this._size.partPadding - this._size.bonePadding) / 2
                });
            }
        });
        $.each(this._design.parts, (index, part) => {
            part.DOM
                .css({
                    left: (this._canvasPositionX + part.X) * this._size.unit,
                    top: (this._canvasPositionY + part.Y) * this._size.unit,
                    width: this._size.partSize,
                    height: `calc(${this._size.partSize}px + ${1.5 * this._size.unit}em)`
                });
        });
        $('.part>p').css({
            fontSize: `${this._size.unit}em`
        });
        if (this._size.unit + 1e-3 < 0.5) // floating point error
            $('.part>p').hide();
        else
            $('.part>p').show();
        this._jsPlumb.repaintEverything();
        this._jsPlumb.revalidate($('.SDinDesign-device'));
    }
}

// ultity function
function preventClickOnDrag() {
    if ($(this).hasClass('dragging')) {
        $(this).removeClass('dragging');
        return;
    }
    if ($(this).data('selected')) {
        unHighlightDevice($(this));
    } else {
        unHighlightDevice($('.device, .part'));
        highlightDevice($(this), 0.7);
    }
}

function insertPart(device, data, position) {
    device.parts.splice(position, 0, data);
    addPart(data, position, device.DOM);
    // Re-index all parts in device
    $.each(device.parts, function(index, part) {
        part.DOM.data('index', index);
    });
    redrawDesign();
}
$('#add-part-button')
    .on('click', function() {
        $('#new-part-modal')
            .modal('show');
    });

$('#add-new-part')
    .on('click', function() {
        let data = {
            name: $('#part-name').val(),
            description: $('#part-description').val(),
            type: $('#part-type-dropdown').dropdown('get value'),
            subparts: []
        };
        $('#new-part-modal').modal('hide');
        $('.ui.dimmer:first .loader')
            .text('Requesting server to add the new part, please wait...');
        $('.ui.dimmer:first').dimmer('show');
        $.post('/api/part', {
            data: JSON.stringify(data),
            csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
        }, (data) => {
            if (data.success === true)
                $('.ui.dimmer:first .loader')
                    .text('Success, closing...');
            else
                $('.ui.dimmer:first .loader')
                    .text('Failed, closing...');
            setTimeout(() => {
                $('.ui.dimmer:first').dimmer('hide');
            }, 1000);
        });
    });

// Alt + wheel zomming
$(this._canvas)
    .on('mousewheel', function(event) {
        if (!event.altKey)
            return;
        let ratio = size.unit;
        ratio = Math.max(0.25, Math.min(1.5, ratio + event.deltaY * 0.05));
        $('#ratio-dropdown')
            .dropdown('set value', ratio)
            .dropdown('set text', Math.round(ratio * 100) + '%');
        resizeDesign(ratio);
    });




function createDownload(fileName, content) {
    let aLink = $('<a></a>');
    aLink
        .attr('download', fileName)
        .attr('href', `data:application/json;base64,${btoa(JSON.stringify(content))}`);
    aLink[0].click();
}
$('#export-button')
    .on('click', function() {
        createDownload('design.json', exportDesign());
    });

function highlightDevice(device, transparency) {
    device
        .data('selected', true)
        .css({
            boxShadow: `0 0 5px 3px rgba(53, 188, 243, ${transparency})`,
        });
}
function unHighlightDevice(device) {
    device
        .data('selected', false)
        .css({
            boxShadow: '',
            border: ''
        });
}

$('#ratio-dropdown')
    .dropdown({
        values: (() => {
            let values = [];
            for (let i = 25; i < 150; i += 25)
                values.push({
                    name: `${i}%`,
                    value: i / 100,
                    selected: i === 100
                });
            return values;
        })(),
        onChange: function(value, text) {
            if (text === undefined)
                return;
            if ($(this).data('initialized') === undefined) {
                $(this).data('initialized', true);
                return;
            }
            resizeDesign(value);
        }
    });
/*
$('#part-type-dropdown')
    .dropdown({
        values: partTypes.map((x, i) => ({ name: x, value: x, selected: i === 0 }))
    });
$('#part-safety-dropdown')
    .dropdown({
        values: partSafetyLevels.map((x, i) => ({ name: `${i} - ${x}`, value: i, selected: i === 0  }))
    });
*/
let selectedPart;
$('#search-parts-dropdown')
    .dropdown({
        apiSettings: {
            url: '/api/parts?name={query}',
            cache: false,
            beforeSend: (settings) => settings.urlData.query.length < 3 ? false : settings,
            onResponse: (response) => ({
                success: response.success === true,
                results:  response.parts.map((x) => ({
                    name: x.name,
                    value: x.id
                }))
            })
        },
        onChange: (value) => { setPartPanel(value); }
    });

function setPartPanel(id) {
    $.get(`/api/part?id=${id}`, (data) => {
        if (data.success !== true) {
            console.error(`Get part info failed. ID: ${id}`);
            return;
        }
        selectedPart = data;
        $('#part-info-img')
            .attr('src', `/static/img/design/${data.type}.png`)
            .draggable('enable');
        $('#part-info-name')
            .add(selectedPartHelper.children('b'))
            .text(data.name);
        $('#part-info-des>p')
            .text(data.description);
    });
}

let selectedPartHelper = $('<div></div>');
selectedPartHelper
    .addClass('part-helper')
    .append('<b></b>')
    .prepend('<div></div>').children('div')
    .addClass('ui tiny image')
    .append('<img></img>').children('img')
    .attr('src', '/static/img/design/RBS.png');
$('#part-info-img')
    .draggable({
        revert: 'invalid',
        revertDuration: 200,
        helper: () => selectedPartHelper,
        start: () => { $('.subpart-dropper').css({ backgroundColor: 'rgba(255, 0, 0, 0.1)' }); },
        stop: () => { $('.subpart-dropper').css({ backgroundColor: '' }); }
    })
    .draggable('disable');
$(this._canvas)
    .droppable({
        accept: '#part-info-img',
        greedy: true,
        over: function() {
            $(this).css({
                backgroundColor: 'rgba(0, 0, 255, 0.1)'
            });
        },
        out: function() {
            $(this).css({ backgroundColor: '' });
        },
        drop: function(event) {
            $(this).css({ backgroundColor: '' });
            let newDevice = {
                X: event.offsetX / size.unit - canvasPositionX,
                Y: event.offsetY / size.unit - canvasPositionY,
                parts: []
            };
            let partData = $.extend(true, {}, selectedPart);
            partData.ID = globalNextPartId;
            newDevice.parts.push(partData);
            design.devices[Object.keys(design.devices).length] = newDevice;
            addDevice(newDevice);
            redrawDesign();
        }
    });

let canvasDragging = false;
let canvasDragOrigin;
let currentMode = 'modifyItem';
const modes = {
    modifyItem: $('#drag-item'),
    dragCanvas: $('#drag-canvas'),
    addConnection: $('#connection-dropdown-button')
};
let newConnectionType, newConnectionStep;
let newConnectionSource, newConnectionTarget;
let previewConnection = {};

function selectMode(mode) {
    if (currentMode === mode)
        return;
    let button = modes[currentMode];
    button.trigger('deselect');
    button.removeClass('blue');
    currentMode = mode;
    button = modes[mode];
    button.trigger('select');
    button.addClass('blue');
}

$('#drag-item')
    .on('click', () => { selectMode('modifyItem'); });
$('#drag-canvas')
    .on('click', () => { selectMode('dragCanvas'); })
    .on('select', () => {
        $(this._canvas).css({ cursor: 'pointer' });
        $('.part, .device').css({ pointerEvents: 'none' });
    })
    .on('deselect', () => {
        $(this._canvas).css({ cursor: '' });
        $('.part, .device').css({ pointerEvents: '' });
    });
$('#connection-dropdown')
    .dropdown({
        onChange: (value) => { newConnectionType = value; }
    });
$('#connection-dropdown-button')
    .on('click', () => { selectMode('addConnection'); })
    .on('select', () => {
        console.log('Begin adding new connection.');
        newConnectionStep = 'chooseSource';
        unHighlightDevice($('.device, .part'));
        $('.device').off('click');
        $('.part')
            .off('mouseenter')
            .on('mouseenter', function() {
                if ($(this).data('connectionSelected') !== true) {
                    highlightDevice($(this), 0.4);
                    if (newConnectionStep === 'chooseTarget' && newConnectionType !== 'delete') {
                        previewConnection = {
                            source: newConnectionSource,
                            target: $(this).attr('partID'),
                            type: newConnectionType
                        };
                        addLink(previewConnection, true);
                        redrawDesign();
                    }
                }
            })
            .off('mouseleave')
            .on('mouseleave', function() {
                if ($(this).data('connectionSelected') !== true) {
                    unHighlightDevice($(this));
                    if (previewConnection !== undefined) {
                        removeLink(previewConnection);
                        previewConnection = undefined;
                    }
                }
            })
            .off('click')
            .on('click', function() {
                if ($(this).data('connectionSelected') !== true) {
                    highlightDevice($(this), 0.8);
                    $(this).data('connectionSelected', true);
                    if (newConnectionStep === 'chooseSource') {
                        newConnectionSource = $(this).attr('partID');
                        console.log(`Choose source: ${newConnectionSource}`);
                        newConnectionStep = 'chooseTarget';
                    } else if (newConnectionStep === 'chooseTarget'){
                        newConnectionTarget = $(this).attr('partID');
                        console.log(`Choose target: ${newConnectionTarget}`);
                        newConnectionStep = 'finished';
                        finishNewConnection();
                    }
                } else {
                    unHighlightDevice($(this));
                    $(this).data('connectionSelected', false);
                    if (newConnectionStep === 'chooseTarget') {
                        newConnectionStep = 'chooseSource';
                        newConnectionSource = undefined;
                    }
                }
            });
    })
    .on('deselect', () => {
        $('.device, #canvas>.part')
            .off('click')
            .on('click', preventClickOnDrag);
        $('.part')
            .off('mouseenter')
            .off('mouseleave')
            .off('click')
            .on('click', preventClickOnDrag);
        unHighlightDevice($('.part, .device'));
        $('.part, .device').data('connectionSelected', false);
    });
function finishNewConnection() {
    let data = {
        source: newConnectionSource,
        target: newConnectionTarget,
        type: newConnectionType
    };
    if (newConnectionType === 'delete') {
        let removingIndex;
        $.each(design.lines, (index, value) => {
            if (value.source === data.source && value.target === data.target)
                removingIndex = index;
        });
        removeLink(design.lines[removingIndex]);
        design.lines.splice(removingIndex, 1);
    } else {
        design.lines.push(data);
        addLink(data, false);
    }
    if (previewConnection !== undefined) {
        removeLink(previewConnection);
        previewConnection = undefined;
    }
    redrawDesign();
    selectMode('modifyItem');
}

$(this._canvas)
    .on('mousedown', function(event) {
        canvasDragging = true;
        canvasDragOrigin = { x: event.offsetX, y: event.offsetY };
    })
    .on('mouseup', function() {
        canvasDragging = false;
    })
    .on('mouseleave', function() {
        canvasDragging = false;
    })
    .on('mousemove', function(event) {
        if (currentMode === 'dragCanvas' && canvasDragging) {
            canvasPositionX += (event.offsetX - canvasDragOrigin.x) / size.unit;
            canvasPositionY += (event.offsetY - canvasDragOrigin.y) / size.unit;
            canvasDragOrigin = { x: event.offsetX, y: event.offsetY };
            redrawDesign();
        }
    });

$(window)
    .on('keydown', (event) => { if (event.ctrlKey === true) selectMode('dragCanvas'); })
    .on('keyup', () => { selectMode('modifyItem'); });

