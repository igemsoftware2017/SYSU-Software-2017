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
            'Moderate risk',
            'High risk'
        ];
    }
    static get partTypes() {
        return [
            'CDS',
            'RBS',
            'promoter',
            'terminator',
            'material',
            'light',
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
    static isGene(part) {
        return $.inArray(part, [
            'CDS',
            'RBS',
            'promoter',
            'terminator',
            'other_DNA',
            'composite',
            'generator',
            'reporter',
            'inverter',
            'signalling',
            'measurement'
        ]) !== -1;
    }
    static isMaterial(part) {
        return $.inArray(part, [
            'material',
            'light',
            'protein',
            'RNA',
            'protein-m',
            'protein-l',
            'complex',
            'unknown'
        ]) !== -1;
    }
    static typeVal(type) {
        return type === 'inhibition' ? 1 : 0;
    }
    static typeXor(types) {
        let res = 0;
        types.forEach((v) => {
            res ^= SDinDesign.typeVal(v);
        });
        return res === 0 ? 1 : -1;
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

    constructor(
        canvas,
        design = {
            devices: [],
            lines: [],
            parts: [],
            id: -1
        },
        option = {}
    ) {
        this._canvas = canvas;
        this.parseOption(option);
        this._canvasPositionX = $(canvas).width() / 2;
        this._canvasPositionY = $(canvas).height() / 2;
        this._size = SDinDesign.zoom(SDinDesign.standardSize, 1);
        this._nextPartId = 0;
        this.name = '';
        this.description = '';
        this._nextPartCid = 0;
        this._ready = () => {};
        this._readyFired = false;
        this._history = [];
        this._historyPointer = -1;
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
        let data = {
            id: this._id,
            lines: this._design.lines,
            combines: [],
            devices: this._design.devices.map((v) => ({
                subparts: v.parts.map((p) => p.cid),
                X: v.X,
                Y: v.Y
            })),
            parts: this._design.devices.reduce((t, v) => t.concat(v.parts), this._design.parts)
        };
        data = $.extend(true, {}, data);
        $.each(data.lines, (_, l) => { delete l.DOM; });
        $.each(data.parts, (_, p) => { delete p.DOM; });
        return data;
    }
    set design(design) {
        console.log(design);
        this._jsPlumb.deleteEveryConnection();
        $('.SDinDesign-part, .SDinDesign-device').remove();

        this._id = parseInt(design.id, 10);
        this.name = design.name;
        this.description = design.description;
        this._design = this.convertFormat(design);

        $.each(this._design.devices, (_, device) => { this.addDevice(device); });
        $.each(this._design.parts, (_, part) => { this.addPart(part, 1, undefined); });
        $.each(this._design.lines, (_, link) => { this.addLink(link, false); });

        this.redrawDesign();

        // TODO: fix updateSafety from other file
        this.maxSafety(updateSafety);
    }
    combine(design) {
        this.recordHistory(`Combined design ID=${design.id}.`);

        let design2 = this.convertFormat(design);
        $.each(design2.devices, (_, device) => { this.addDevice(device); });
        $.each(design2.parts, (_, part) => { this.addPart(part, 1, undefined); });
        $.each(design2.lines, (_, link) => { this.addLink(link, false); });

        this._design = {
            devices: this._design.devices.concat(design2.devices),
            lines: this._design.lines.concat(design2.lines),
            parts: this._design.parts.concat(design2.parts)
        };
        this.redrawDesign();

        // TODO: fix updateSafety from other file
        this.maxSafety(updateSafety);
    }
    convertFormat(design) {
        let tmp = design.parts.reduce((t, p) => { t[p.cid] = p; return t; }, {});
        $.each(tmp, (_, v) => {
            if (v.X === undefined)
                v.X = 0;
            if (v.Y === undefined)
                v.Y = 0;
        });
        let newDesign = {
            lines: design.lines,
            devices: design.devices.map((v) => ({
                parts: v.subparts.map((i) => {
                    let t = $.extend(true, {}, tmp[i]);
                    tmp[i].wa = true;
                    return t;
                }),
                X: v.X,
                Y: v.Y
            })),
            parts: Object.keys(tmp).map((k) =>
                (tmp[k].wa === true) ? undefined : tmp[k]
            ).filter((k) => k !== undefined)
        };
        $.each(design.combines, (k, v) => {
            newDesign.lines = newDesign.lines.concat(v.map((s) => ({
                start: parseInt(s, 10),
                end: parseInt(k, 10),
                type: 'combine'
            })));
        });
        return newDesign;
    }

    get canUndo() {
        if (this._historyPointer > -1)
            return this._history[this._historyPointer].comment;
        return false;
    }
    get canRedo() {
        if (this._historyPointer + 1 < this._history.length)
            return this._history[this._historyPointer + 1].comment;
        return false;
    }
    recordHistory(comment) {
        while (this._history.length > this._historyPointer + 1)
            this._history.pop();
        this._history.push({
            data: this.design,
            comment: comment
        });
        this._historyPointer = this._history.length - 1;
    }
    undo() {
        if (this.canUndo === false)
            return false;
        let t = this.design;
        this.design = this._history[this._historyPointer].data;
        this._history[this._historyPointer--].data = t;
    }
    redo() {
        if (this.canRedo === false)
            return false;
        let t = this.design;
        this.design = this._history[++this._historyPointer].data;
        this._history[this._historyPointer].data = t;
    }

    addDevice(data) {
        // Creating device
        let device = $('<div></div>')
            .appendTo(this._canvas)
            .addClass('SDinDesign-device')
            .attr('device-id', data.deviceID)
            .data('selected', false);
        if (this._option.draggable) {
            device.on('click', () => SDinDesign.preventClickOnDrag(this, device));
            this._jsPlumb.draggable(device, {
                drag: () => { device.addClass('dragging'); },
                start: (event) => {
                    device.data('drag-origin', {
                        x: event.e.pageX,
                        y: event.e.pageY
                    });
                },
                stop: (event) => {
                    this.recordHistory('Move device.');
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
                let dropper = this.addSubpartDropper(device, data);
                dropper.attr('dropper-id', i);
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

    addSubpartDropper(device, data) {
        let that = this;
        return $('<div></div>')
            .appendTo(device)
            .addClass('SDinDesign-subpartDropper')
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
                    // TODO: fix selectedPart, updateSafety from other file
                    that.insertPart(data, selectedPart, $(this).attr('dropper-id'));
                    that.maxSafety(updateSafety);
                }
            });
    }

    addPart(data, index, device) {
        let isSubpart = device !== undefined;
        if (!isSubpart)
            device = $(this._canvas);
        let part = $('<div></div>')
            .appendTo(device)
            .addClass('SDinDesign-part')
            .attr('part-cid', data.cid)
            .attr('part-id', data.id)
            .append(`
                <div class="ui centered fluid image">
                    <img src="/static/img/design/${data.type.toLowerCase()}.png"></img>
                </div>
            `)
            .append(`<p>${data.name}</p>`)
            .data('is-subpart', isSubpart)
            .data('index', index);
        this._nextPartId = Math.max(this._nextPartId, parseInt(data.id)) + 1;
        this._nextPartCid = Math.max(this._nextPartCid, parseInt(data.cid)) + 1;
        if (isSubpart === false) {
            if (this._option.draggable) {
                part.on('click', () => SDinDesign.preventClickOnDrag(this, part));
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
                    stop: (event) => {
                        this.recordHistory(`Move part ${part.cid}.`);
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
        let source = $('[part-cid=' + data.start + ']');
        let target = $('[part-cid=' + data.end + ']');

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
        if (data.type === 'promotion' || data.type === 'combine')
            arrowSetting = ['Arrow', { foldback: 0.01, width: 15, location: 1 }];
        else
            arrowSetting = ['Diamond', { foldback: 1, width: 30, length: 1, location: 1 }];
        arrowSetting[1].id = `SDinDesign-arrow-${data.type}-${data.start}-${data.end}`;

        for (let s of source)
            for (let t of target)
                data.DOM = this._jsPlumb.connect({
                    source: s,
                    target: t,
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
        if ($('.SDinDesign-device').length > 0)
            this._jsPlumb.revalidate($('.SDinDesign-device'));
    }

    insertPart(device, data, position) {
        this.recordHistory(`Insert part ${data.name} into device.`);
        data.cid = this._nextPartCid;
        device.parts.splice(position, 0, data);
        this.addPart(data, position, device.DOM);
        // Re-index all parts in device
        $.each(device.parts, (index, part) => {
            part.DOM.data('index', index);
            part.DOM.data('leftmost', index === 0);
            part.DOM.data('rightmost', index === device.parts.length - 1);
        });
        // Add one more subpart dropper
        this.addSubpartDropper(device.DOM, device);
        device.DOM.children('.SDinDesign-subpartDropper').each((i, d) => {
            $(d).attr('dropper-id', i);
        });
        this.redrawDesign();
    }

    clearAll() {
        this.recordHistory('Clear all.');
        this.design = {
            lines: [],
            parts: [],
            devices: []
        };
    }

    getData(DOM) {
        let result;
        this._design.devices.forEach((device) => {
            device.parts.forEach((part) => {
                if (part.DOM[0] === DOM)
                    result = { device: device, part: part };
            });
        });
        this._design.parts.forEach((part) => {
            if (part.DOM[0] === DOM)
                result = { part: part };
        });
        return result;
    }

    deletePart(device, part) {
        this.recordHistory(`Delete part ${part.id}`);
        this._design.lines
            .filter((l) => l.start === part.cid || l.end === part.cid)
            .forEach((l) => {
                this._design.lines.splice(this._design.lines.findIndex((l2) => l === l2), 1);
            });
        this._jsPlumb.remove(part.DOM);
        if (device === undefined) {
            let i = this._design.parts.findIndex((p) => p === part);
            this._design.parts.splice(i, 1);
        } else {
            device.DOM.children(`[dropper-id=${device.parts.length}]`).remove();
            device.parts.splice(device.parts.findIndex((p) => p === part), 1);
            if (device.parts.length === 0)
                this.deleteDevice(device);
        }
        this.redrawDesign();
    }

    deleteDevice(device) {
        this._jsPlumb.remove(device.DOM);
        let i = this._design.devices.findIndex((d) => d === device);
        this._design.devices.splice(i, 1);
    }

    findGenerate(p, lines) {
        // return all material generated by gene promoted by promoter p
        let gen = [];
        this._design.devices.forEach((dev) => {
            // find p
            let i = dev.parts.findIndex((part) => p === part.cid);
            if (i === -1)
                return;
            // find promoter next to p
            let j = dev.parts.findIndex((part, index) =>
                part.type === 'promoter' && index > i
            );
            if (j === -1)
                j = dev.parts.length;
            // forEach line start between i and j
            lines.forEach((l) => {
                let pos = dev.parts.findIndex((part) => part.cid === l.start);
                if (i < pos && pos < j)
                    gen.push({ cid: l.end, type: l.type });
            });
        });
        return gen;
    }

    traceCDS(p, lines, partDic) {
        if (p.type !== 'CDS')
            return [{ cid: p.cid, type: 'promotion' }];
        let ans = lines.reduce((a, l) => {
            if (l.start === p.cid)
                a.push(partDic[l.end]);
            return a;
        }, []);
        return ans.reduce((a, p) => {
            return a.concat(this.traceCDS(p, lines, partDic));
        }, []);
    }

    get matrix() {
        let design = $.extend(true, {}, this._design);
        let parts = design.devices.reduce((t, v) => t.concat(v.parts), design.parts);
        let maxCid = Math.max.apply(this, parts.map((p) => p.cid));
        let partDic = parts.reduce((t, v) => { t[v.cid] = v; return t; }, {});
        // Dealing with CDS
        let newLines = [];
        parts.forEach((p) => {
            if (p.type !== 'CDS')
                return;
            // find a material linked by this CDS
            let found = design.lines.reduce((f, l) =>
                f || (l.start === p.cid && SDinDesign.isMaterial(partDic[l.end].type))
                , false);
            if (found === true)
                return;
            // generate a fake material generated by this CDS
            parts.push({
                cid: ++maxCid,
                type: 'material',
                name: p.name
            });
            newLines.push({
                start: p.cid,
                end: maxCid,
                type: 'promotion'
            });
        });
        design.lines = design.lines.concat(newLines);
        partDic = parts.reduce((t, v) => { t[v.cid] = v; return t; }, {});
        parts = parts.filter((p) => SDinDesign.isMaterial(p.type));
        let materialDic = parts.reduce((t, v) => { t[v.cid] = v; return t; }, {});
        parts.forEach((v, i) => { partDic[v.cid].index = i; });
        let n = parts.length;
        let res = Array(n).fill(0).map(() => Array(n).fill(0));
        let partName = parts.map((p) => p.name);
        design.lines.forEach((v, i) => {
            let type = v.type;
            // Backtrace CDS
            let start = this.traceCDS(partDic[v.start], design.lines, partDic);
            let end = this.traceCDS(partDic[v.end], design.lines, partDic);

            for (let s of start)
                for (let e of end) {
                    if (s.cid === e.cid)
                        return;
                    // Direct communication
                    if (materialDic[s.cid] !== undefined && materialDic[e.cid] !== undefined) {
                        let val = SDinDesign.typeXor([v.type, s.type, e.type]);
                        res[partDic[s.cid].index][partDic[e.cid].index] = val;
                    }

                    // promote/inhibit promoter
                    if (partDic[e.cid].type === 'promoter') {
                        this.findGenerate(e.cid, design.lines).forEach((data) => {
                            let a = partDic[s.cid].index;
                            let b = partDic[data.cid].index;
                            if (b === undefined)
                                return;
                            res[a][b] = SDinDesign.typeXor([s.type, e.type, data.type, v.type]);
                            console.log(a, b, res[a][b], s.type, e.type, data.type, v.type);
                        });
                    }
                }
        });
        return {
            matrix: res,
            partName: partName
        };
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
        $(this._canvas).droppable({
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
                // TODO: fix selectedPart, updateSafety from other file
                $(this).css({ backgroundColor: '' });
                let partData = $.extend(true, {}, selectedPart);
                if (partData.id === undefined)
                    partData.id = that._nextPartId;
                partData.cid = that._nextPartCid;
                let x = event.offsetX / that._size.unit - that._canvasPositionX;
                let y = event.offsetY / that._size.unit - that._canvasPositionY;
                if (SDinDesign.isGene(partData.type)) {
                    that.recordHistory(`Insert ${partData.name} as new device.`);
                    let newDevice = { parts: [], X: x, Y: y };
                    newDevice.parts.push(partData);
                    that._design.devices[Object.keys(that._design.devices).length] = newDevice;
                    that.addDevice(newDevice);
                } else {
                    that.recordHistory(`Insert ${partData.name} as new part.`);
                    partData.X = x;
                    partData.Y = y;
                    that._design.parts.push(partData);
                    that.addPart(partData, 1, this._canvas);
                }
                that.redrawDesign();
                that.maxSafety(updateSafety);
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
        if (item.hasClass('dragging')) {
            item.removeClass('dragging');
            return;
        }
        if (item.data('selected')) {
            design.unHighlightDevice(item);
        } else {
            setPartPanel(item.attr('part-id'));
            design.unHighlightDevice($('.SDinDesign-device, .SDinDesign-part'));
            design.highlightDevice(item, 0.7);
        }
    }

    // get maximum safety
    //   quite a workaround
    //   need restruct
    maxSafety(callback) {
        let getData = {
            ids: JSON.stringify(this.design.parts.map((v) => v.id))
        };
        $.get('/api/max_safety', getData ,(v) => callback(v.max_safety));
    }
}
