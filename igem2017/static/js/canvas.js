'use strict';

/* eslint-disable no-console */
/* global jsPlumb */

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

    parseOption(option) {
        // define default
        this._option = {
            draggable: true,
            highlightable: true,
            zoomable: true,
            movable: true,
            addable: true
        };
        let keys = [
            'draggable',
            'highlightable',
            'zoomable',
            'movable',
            'addable'
        ];
        for (let key of keys)
            if (option[key] !== undefined)
                this._option[key] = option[key];
        if (this._option.zoomable)
            this.enableZoom();
        if (this._option.addable)
            this.enableAdd();
    }

    constructor(canvas, design, option) {
        this._canvas = canvas;
        this.parseOption(option);
        this._canvasPositionX = 0;
        this._canvasPositionY = 0;
        this._size = SDinDesign.zoom(SDinDesign.standardSize, 1);
        this._nextPartId = 0;
        this._ready = () => {};
        this._readyFired = false;
        this._jsPlumb = jsPlumb.getInstance();
        this._jsPlumb.ready(() => {
            this._jsPlumb.setContainer($(this._canvas));
            this.design = design;
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

    get ratio() { return this._size.unit; }
    set ratio(ratio) {
        if (this._option.zoomable === false)
            return;
        this._size = SDinDesign.zoom(SDinDesign.standardSize, ratio);
        this.redrawDesign();
    }

    get canvas() { return $(this._canvas); }
    get design() {
        return {
            lines: this._design.lines,
            devices: this._design.devices.map((v) => v.parts.map((p) => p.cid)),
            parts: this._design.devices.reduce((t, v) => t.concat(v.parts), this._design.parts)
        };
    }
    set design(design) {
        this._jsPlumb.deleteEveryConnection();
        $('.SDinDesign-part, .SDinDesign-device').remove();

        let tmp = design.parts.reduce((t, p) => { t[p.cid] = p; return t; }, {});
        $.each(tmp, (_, v) => { v.X = 0; v.Y = 0; });
        this._design = {
            lines: design.lines,
            devices: design.devices.map((v) => ({
                parts: v.map((i) => {
                    let t = tmp[i];
                    delete tmp[i];
                    return t;
                }),
                X: 0,
                Y: 0
            })),
            parts: Object.keys(tmp).map((k) => tmp[k])
        };

        $.each(this._design.devices, (_, device) => { this.addDevice(device); });
        $.each(this._design.parts, (_, part) => { this.addPart(part, 1, undefined); });
        $.each(this._design.lines, (_, link) => { this.addLink(link, false); });
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
            device.on('click', SDinDesign.preventClickOnDrag(this, device));
            this._jsPlumb.draggable(device, {
                drag: () => { device.addClass('dragging'); },
                start: (event) => {
                    device.data('drag-origin', {
                        x: event.e.pageX,
                        y: event.e.pageY
                    });
                },
                stop: (event) => {
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

        let that = this;
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
                            // TODO: fix selectedPart from other file
                            that.insertPart(data, selectedPart, $(this).attr('dropper-id'));
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
            .attr('part-id', data.cid)
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
                part.on('click', SDinDesign.preventClickOnDrag(this, part));
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
        let source = $('[part-id=' + data.start + ']');
        let target = $('[part-id=' + data.end + ']');

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
            device.DOM.css({
                left: (this._canvasPositionX + device.X) * this._size.unit,
                top: (this._canvasPositionY + device.Y) * this._size.unit,
                height: `calc(${this._size.partSize + this._size.bonePadding * 3 + 3}px + ${1.5 * this._size.unit}em)`,
                width: Object.keys(device.parts).length * (this._size.partSize + this._size.partPadding) + this._size.partPadding
            }).children('.bone').css({
                left: this._size.partPadding,
                width: device.DOM.width() - 2 * this._size.partPadding,
                bottom: this._size.bonePadding
            });
            $.each(device.parts, (index, part) => {
                part.DOM.css({
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
            part.DOM.css({
                left: (this._canvasPositionX + part.X) * this._size.unit,
                top: (this._canvasPositionY + part.Y) * this._size.unit,
                width: this._size.partSize,
                height: `calc(${this._size.partSize}px + ${1.5 * this._size.unit}em)`
            });
        });
        $('.SDinDesign-part>p').css({
            fontSize: `${this._size.unit}em`
        });
        if (this._size.unit + 1e-3 < 0.5) // floating point error
            $('.SDinDesign-part>p').hide();
        else
            $('.SDinDesign-part>p').show();
        this._jsPlumb.repaintEverything();
        this._jsPlumb.revalidate($('.SDinDesign-device'));
    }

    insertPart(device, data, position) {
        device.parts.splice(position, 0, data);
        this.addPart(data, position, device.DOM);
        // Re-index all parts in device
        $.each(device.parts, (index, part) => {
            part.DOM.data('index', index);
        });
        this.redrawDesign();
    }

    enableZoom() {
        // Alt + wheel zomming
        let that = this;
        $(this._canvas).on('mousewheel', (event) => {
            if (!event.altKey)
                return;
            let ratio = this.ratio;
            ratio = Math.max(0.25, Math.min(1.5, ratio + event.deltaY * 0.05));
            $('#ratio-dropdown')
                .dropdown('set value', ratio)
                .dropdown('set text', Math.round(ratio * 100) + '%');
            that.ratio = ratio;
        });
    }
    disableZoom() {
        $(this._canvas).off('mousewheel');
    }

    enableDrag() {
        if (this._option.draggable === false)
            return;
        this._dragging = false;
        $(this._canvas)
            .on('mousedown', (event) => {
                this._dragging = true;
                this._dragOrigin = { x: event.offsetX, y: event.offsetY };
            })
            .on('mouseup', () => {
                this._dragging = false;
            })
            .on('mouseleave', () => {
                this._dragging = false;
            })
            .on('mousemove', (event) => {
                if (this._dragging === false)
                    return;
                this._canvasPositionX += (event.offsetX - this._dragOrigin.x) / this.ratio;
                this._canvasPositionY += (event.offsetY - this._dragOrigin.y) / this.ratio;
                this._dragOrigin = { x: event.offsetX, y: event.offsetY };
                this.redrawDesign();
            });
    }
    disableDrag() {
        $(this._canvas)
            .off('mousedown')
            .off('mouseup')
            .off('mouseleave')
            .off('mousemove');
    }

    enableAdd() {
        let that = this;
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
                        X: event.offsetX / that._size.unit - that._canvasPositionX,
                        Y: event.offsetY / that._size.unit - that._canvasPositionY,
                        parts: []
                    };
                    let partData = $.extend(true, {}, selectedPart);
                    partData.ID = that._nextPartId;
                    newDevice.parts.push(partData);
                    that._design.devices[Object.keys(that._design.devices).length] = newDevice;
                    that.addDevice(newDevice);
                    that.redrawDesign();
                }
            });
    }

    highlightDevice(device, transparency) {
        device
            .data('selected', true)
            .css({
                boxShadow: `0 0 5px 3px rgba(53, 188, 243, ${transparency})`,
            });
    }
    unHighlightDevice(device) {
        device
            .data('selected', false)
            .css({
                boxShadow: '',
                border: ''
            });
    }

    // ultity function
    static preventClickOnDrag(design, item) {
        return () => {
            if (item.hasClass('dragging')) {
                item.removeClass('dragging');
                return;
            }
            if (item.data('selected')) {
                design.unHighlightDevice(item);
            } else {
                design.unHighlightDevice($('.SDinDesign-device, .SDinDesign-part'));
                design.highlightDevice(item, 0.7);
            }
        };
    }
}
