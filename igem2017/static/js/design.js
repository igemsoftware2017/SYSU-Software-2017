'use strict';

/* eslint-disable no-console */
/* global SDinDesign */

let design;
$.get('/api/get_circuit?id=610', (value) => {
    design = new SDinDesign('#canvas', value, {});
});

let fileReader = new FileReader();
fileReader.onload = () => { design.design = JSON.parse(fileReader.result); };

$('#upload-button')
    .on('click', function() {
        $('#fileupload').trigger('click');
    });
$('#fileupload')
    .on('change', function() {
        fileReader.readAsText($('#fileupload')[0].files[0]);
    });

$('#zoom-in')
    .on('click', function() {
        let ratio = design.ratio;
        ratio = Math.max(0.25, Math.min(1.5, ratio + 0.25));
        $('#ratio-dropdown')
            .dropdown('set value', ratio)
            .dropdown('set text', Math.round(ratio * 100) + '%');
        design.ratio = ratio;
    });
$('#zoom-out')
    .on('click', function() {
        let ratio = design.ratio;
        ratio = Math.max(0.25, Math.min(1.5, ratio - 0.25));
        $('#ratio-dropdown')
            .dropdown('set value', ratio)
            .dropdown('set text', Math.round(ratio * 100) + '%');
        design.ratio = ratio;
    });
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
            design.resizeDesign(value);
        }
    });

$('#part-type-dropdown')
    .dropdown({
        values: SDinDesign.partTypes.map((x, i) => ({ name: x, value: x, selected: i === 0 }))
    });
$('#part-safety-dropdown')
    .dropdown({
        values: SDinDesign.partSafetyLevels.map((x, i) => ({ name: `${i} - ${x}`, value: i, selected: i === 0  }))
    });

$('.tabular.menu>.item')
    .tab({
        context: 'parent'
    });

$('.window')
    .draggable({
        appendTo: 'body',
        handle: '.nav',
        scroll: false,
        stack: '.window'
    })
    .resizable({
        handles: 's, w, sw'
    });

// Part panel
$('#part-panel')
    .resizable('option', 'minWidth', 200);
$('#part-panel-button')
    .on('click', function() {
        if (partPanelCollapsed) {
            uncollapsed();
            $(this).removeClass('left').addClass('right');
        } else {
            if (!partPanelStickedToRight)
                return;
            collapse();
            $(this).removeClass('right').addClass('left');
        }
    });
let partPanelStickedToRight = false;
let partPanelCollapsed = false;
function stickPartPanel() {
    partPanelStickedToRight = true;
    let win = $('#part-panel');
    win
        .resizable('option', 'handles', 'w')
        .draggable('option', 'snap', 'body')
        .draggable('option' ,'snapMode', 'inner')
        .draggable('option', 'snapTolerance', 100)
        .draggable('option', 'axis', 'x')
        .on('drag', function(event, ui) {
            if (ui === undefined || ui.helper[0] !== win[0])
                return;
            if (ui.position.left < ui.originalPosition.left - 100) {
                if (partPanelStickedToRight)
                    unstickPartPanel();
            }
        });
    win.data('free-state', {
        height: win.height()
    });
    let toTop = $('.ui.fixed.menu').height();
    win.css({
        transition: 'all 0.2s ease'
    });
    win.css({
        left: $('body').width() - win.width(),
        top: toTop,
        height: 'calc(100% - ' + toTop + 'px)',
        borderRadius: 0,
        border: '',
        borderLeft: '1px solid grey'
    });
    setTimeout(function() {
        win.css({
            transition: ''
        });
    }, 200);
    $('#canvas-box').css({
        width: 'calc(100% - ' + win.width() + 'px)'
    });
    win
        .children('.nav')
        .children('.ui.header').hide();
    $('#part-panel-button')
        .show({
            duration: 200
        });
}
function unstickPartPanel() {
    partPanelStickedToRight = false;
    let win = $('#part-panel');
    let freeState = win.data('free-state');
    win
        .draggable('option', 'snap', 'false')
        .draggable('option', 'snapTolerance', 0)
        .draggable('option', 'axis', 'false')
        .off('drag')
        .resizable('option', 'handles', 'w, s, sw');
    win.css({
        transition: 'all 0.1s ease'
    });
    win.css({
        height: freeState.height,
        borderRadius: '5px',
        border: '1px solid grey'
    });
    $('#canvas-box').css({
        width: '100%'
    });
    setTimeout(function() {
        win.css({
            transition: ''
        });
    }, 100);
    win
        .children('.nav')
        .children('.ui.header').show();
    $('#part-panel-button')
        .hide({
            duration: 100
        });
}
function collapse() {
    partPanelCollapsed = true;
    let win = $('#part-panel');
    win
        .draggable('disable')
        .resizable('disable')
        .css({
            transition: 'left 0.2s ease',
            left: 'calc(100% - 2em)'
        })
        .children('.content')
        .hide();
    $('#part-panel-button')
        .css({
            right: '',
            left: '0.5em'
        });
}
function uncollapsed() {
    partPanelCollapsed = false;
    let win = $('#part-panel');
    win
        .draggable('enable')
        .resizable('enable')
        .css({
            left: $('body').width() - win.width()
        })
        .children('div')
        .show();
    setTimeout(function() {
        win.css({ transition: '' });
    }, 200);
    $('#part-panel-button')
        .css({
            left: '',
            right: '0.5em'
        });
}
let selectedPart;
let selectedPartHelper = $('<div></div>');
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
        selectedPartHelper
            .children('div')
            .children('img').attr('src', `/static/img/design/${data.type}.png`);
        $('#part-info-des>p')
            .text(data.description);
    });
}
selectedPartHelper
    .addClass('part-helper')
    .append('<b></b>')
    .prepend('<div></div>').children('div')
    .addClass('ui tiny image')
    .append('<img></img>').children('img')
    .attr('src', '/static/img/design/unknown.png');
$('#part-info-img')
    .draggable({
        revert: 'invalid',
        revertDuration: 200,
        helper: () => selectedPartHelper,
        start: () => { $('.SDinDesign-subpartDropper').css({ backgroundColor: 'rgba(255, 0, 0, 0.1)' }); },
        stop: () => { $('.SDinDesign-subpartDropper').css({ backgroundColor: '' }); }
    })
    .draggable('disable');
$('#part-panel-dropper')
    .droppable({
        accept: '#part-panel',
        tolerance: 'touch',
        over: function() {
            $('#part-panel-dropper').css({
                backgroundColor: '#9ec5e6'
            });
        },
        out: function() {
            $(this).css({
                backgroundColor: 'transparent'
            });
        },
        drop: function() {
            stickPartPanel();
            $(this).css({
                backgroundColor: 'transparent'
            });
        }
    });
$('#part-panel')
    .on('resize', function() {
        let des = $('#part-info-des');
        $('#part-panel').css({
            minHeight: 'calc(' + (des.position().top + des.parent().position().top + des.height() + 1) + 'px + 2em)'
        });
        if (partPanelStickedToRight) {
            $('#canvas-box').css({
                width: 'calc(100% - ' + $('#part-panel').width() + 'px)'
            });
        }
    });


// Favourite window
$('#fav-win')
    .resizable('option', 'minWidth', 350);
$('#fav-win-button')
    .on('click', function() {
        $('#fav-win').fadeOut({
            duration: 200
        });
    });
$('#open-fav-win')
    .on('click', function() {
        $('#fav-win').fadeToggle({
            duration: 200
        });
    });

// Toolbox
$('#toolbox')
    .on('mouseenter', function() {
        $(this).css({
            opacity: 0.9
        });
    })
    .on('mouseleave', function() {
        $(this).css({
            opacity: 0.2
        });
    });

$('.ui.dimmer:first').dimmer({
    closable: false
});

function initPositionSize() {
    stickPartPanel();
    $('#fav-win').css({
        height: $(this).height()
    });
    $('#toolbox').css({
        bottom: 100,
        left: ($('#canvas').width() - $('#toolbox').width()) / 2,
    });
    $('#toolbox>.content').css({
        height: $('#toolbox>.content').outerHeight() + 1
    });
}
initPositionSize();

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

function createDownload(fileName, content) {
    let aLink = $('<a></a>');
    aLink
        .attr('download', fileName)
        .attr('href', `data:application/json;base64,${btoa(JSON.stringify(content))}`);
    aLink[0].click();
}
$('#export-button')
    .on('click', function() {
        createDownload('design.json', design.design);
    });

$('#save-button')
    .on('click', function() {
        
    });

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
        $('.SDinDesign-part, .SDinDesign-device').css({ pointerEvents: 'none' });
        design.enableDrag();
    })
    .on('deselect', () => {
        $(this._canvas).css({ cursor: '' });
        $('.SDinDesign-part, .SDinDesign-device').css({ pointerEvents: '' });
        design.disableDrag();
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
        design.unHighlightDevice($('.SDinDesign-device, .SDinDesign-part'));
        $('.SDinDesign-device').off('click');
        $('.SDinDesign-part')
            .off('mouseenter')
            .on('mouseenter', function() {
                if ($(this).data('connectionSelected') !== true) {
                    design.highlightDevice($(this), 0.4);
                    if (newConnectionStep === 'chooseTarget' && newConnectionType !== 'delete') {
                        previewConnection = {
                            source: newConnectionSource,
                            target: $(this).attr('part-id'),
                            type: newConnectionType
                        };
                        design.addLink(previewConnection, true);
                        design.redrawDesign();
                    }
                }
            })
            .off('mouseleave')
            .on('mouseleave', function() {
                if ($(this).data('connectionSelected') !== true) {
                    design.unHighlightDevice($(this));
                    if (previewConnection !== undefined) {
                        design.removeLink(previewConnection);
                        previewConnection = undefined;
                    }
                }
            })
            .off('click')
            .on('click', function() {
                if ($(this).data('connectionSelected') !== true) {
                    design.highlightDevice($(this), 0.8);
                    $(this).data('connectionSelected', true);
                    if (newConnectionStep === 'chooseSource') {
                        newConnectionSource = $(this).attr('part-id');
                        console.log(`Choose source: ${newConnectionSource}`);
                        newConnectionStep = 'chooseTarget';
                    } else if (newConnectionStep === 'chooseTarget'){
                        newConnectionTarget = $(this).attr('part-id');
                        console.log(`Choose target: ${newConnectionTarget}`);
                        newConnectionStep = 'finished';
                        finishNewConnection();
                    }
                } else {
                    design.unHighlightDevice($(this));
                    $(this).data('connectionSelected', false);
                    if (newConnectionStep === 'chooseTarget') {
                        newConnectionStep = 'chooseSource';
                        newConnectionSource = undefined;
                    }
                }
            });
    })
    .on('deselect', () => {
        $('.SDinDesign-device, #canvas>.SDinDesign-part')
            .off('click')
            .on('click', SDinDesign.preventClickOnDrag(design, $(this)));
        $('.SDinDesign-part')
            .off('mouseenter')
            .off('mouseleave')
            .off('click')
            .on('click', SDinDesign.preventClickOnDrag(design, $(this)));
        design.unHighlightDevice($('.SDinDesign-part, .SDinDesign-device'));
        $('.SDinDesign-part, .SDinDesign-device').data('connectionSelected', false);
    });
function finishNewConnection() {
    let data = {
        start: newConnectionSource,
        end: newConnectionTarget,
        type: newConnectionType
    };
    if (newConnectionType === 'delete') {
        let removingIndex;
        $.each(design._design.lines, (index, value) => {
            if (value.source === data.source && value.target === data.target)
                removingIndex = index;
        });
        design.removeLink(design.lines[removingIndex]);
        design._design.lines.splice(removingIndex, 1);
    } else {
        design._design.lines.push(data);
        design.addLink(data, false);
    }
    if (previewConnection !== undefined) {
        design.removeLink(previewConnection);
        previewConnection = undefined;
    }
    design.redrawDesign();
    selectMode('modifyItem');
}

$(window)
    .on('keydown', (event) => { if (event.ctrlKey === true) selectMode('dragCanvas'); })
    .on('keyup', () => { selectMode('modifyItem'); });


// TODO: DIRTY OPERATIONS ONLY FOR DEBUGGING
// REMEMBER TO REMOVE!!!
$('#open-fav-win')[0].click();
