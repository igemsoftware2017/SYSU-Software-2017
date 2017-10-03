'use strict';

const partSafetyLevels = [
  'Low risk',
  'Small risk',
  'Many risk',
  'Bomb'
];
Object.freeze(partSafetyLevels);

const partTypes = [
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
Object.freeze(partTypes);

// x axis: top->down
// y axis: left->right
// init (0, 0) to (200, 200) of canvas
let canvasPositionX = 200;
let canvasPositionY = 200;

let positionToAddPart;
let deviceToAddPart;

const standardSize = {
  deviceHeight: 100,
  partSize: 60,
  partPadding: 30,
  bonePadding: 10,
  addIconSize: 15,
  strokeWidth: 3,
  unit: 1
};
Object.freeze(standardSize);
function zoom(size, ratio) {
  let newSize = {};
  $.each(size, (key, value) => { newSize[key] = value * ratio; });
  return newSize;
}
let size = zoom(standardSize, 1);
function resizeDesign(ratio) {
  size = zoom(standardSize, ratio);
  redrawDesign();
}

let design;
jsPlumb.ready(function () {
  jsPlumb.setContainer($('#canvas'));
  $.get({
    url: '/get_circuit_test',
    success: function(data) {
      design = JSON.parse(data);
      parseDesign(design);
    }
  });
});

function parseDesign(design) {
  $.each(design.devices, function(index, device) {
    addDevice(device);
  });
  $.each(design.parts, function(index, part) {
    addPart(part, 1, undefined);
  });
  $.each(design.lines, function(index, link) {
    addLink(link, false);
  });
  redrawDesign();
}

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
};

function addDevice(data) {
  // Creating device
  let device =
    $('<div></div>')
    .appendTo('#canvas')
    .addClass('device')
    .attr('deviceID', data.deviceID)
    .on('click', preventClickOnDrag)
    .data('selected', false);
  jsPlumb.draggable(device, {
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
      data.X += (event.e.pageX - origin.x) / size.unit;
      data.Y += (event.e.pageY - origin.y) / size.unit;
    }
  });

  // Creating bone
  $('<div></div>')
    .appendTo(device)
    .addClass('bone');

  // Creating subparts
  $.each(data.parts, function(index, part) {
    addPart(part, index, device);
  });
  data.parts[0].DOM.data('leftmost', true);
  data.parts[data.parts.length - 1].DOM.data('rightmost', true);

  data.DOM = device;
}

function addPart(data, index, device) {
  let isSubpart = device !== undefined;
  if (!isSubpart)
    device = $('#canvas');
  let part = $('<div></div>')
    .appendTo(device)
    .addClass('part')
    .attr('partID', data.ID)
    .append('<div class="ui centered fluid image"><img src="/static/img/design/' + data.Type + '.png"></img></div>')
    .append('<p>' + data.Name + '</p>')
    .data('is-subpart', isSubpart)
    .data('index', index);
  if (isSubpart === false) {
    jsPlumb.draggable(part, {
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
        data.X += (event.e.pageX - origin.x) / size.unit;
        data.Y += (event.e.pageY - origin.y) / size.unit;
      }
    });
    part
    .on('click', preventClickOnDrag)
    .data('leftmost', true)
    .data('rightmost', true);
  }
  if (size.unit < 0.75)
    part.children('p').hide();
  data.DOM = part;
}

function addLink(data, isPreview) {
  let source = $('[partID=' + data.source + ']');
  let target = $('[partID=' + data.target + ']');

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
  arrowSetting[1].id = `arrow-${data.source}-${data.target}`;

  data.DOM = jsPlumb.connect({
    source: source,
    target: target,
    anchors: anchors,
    endpoint: 'Blank',
    cssClass: `connection ${data.type}-connection ${isPreview ? 'preview-connection' : ''}`,
    overlays: [arrowSetting],
    connector: 'Flowchart'
  });
}
function removeLink(data) {
  if (data.DOM !== undefined) {
    jsPlumb.deleteConnection(data.DOM);
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
$('#add-part-from-new')
  .on('click', function() {
    $('#add-part-modal')
      .modal('hide');
    $('#new-part-modal')
      .modal('show');
  });

$('#add-new-part')
  .on('click', function() {
    $('#new-part-modal')
      .modal('hide');
    let new_data = {
      ID: "100",
      LibraryID: $('#part-name').val(),
      Name: $('#part-name').val(),
      Type: $('#part-type-dropdown').dropdown('get value'),
      X: 0,
      Y: 0,
      contain: ""
    };
    insertPart(deviceToAddPart, new_data, positionToAddPart);
  });

// Alt + wheel zomming
$('#canvas')
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

function redrawDesign() {
  $.each(design.devices, function(index, device) {
    device.DOM
      .css({
        left: (canvasPositionX + device.X) * size.unit,
        top: (canvasPositionY + device.Y) * size.unit,
        height: `calc(${size.partSize + size.bonePadding * 3 + 3}px + ${1.5 * size.unit}em)`,
        width: Object.keys(device.parts).length * (size.partSize + size.partPadding) + size.partPadding
      })
      .children('.bone')
      .css({
        left: size.partPadding,
        width: device.DOM.width() - 2 * size.partPadding,
        bottom: size.bonePadding
      });
    $.each(device.parts, function(index, part) {
      part.DOM
        .css({
          width: size.partSize,
          height: `calc(${size.partSize}px + ${1.5 * size.unit}em)`,
          left: index * (size.partSize + size.partPadding) + size.partPadding,
          top: size.bonePadding
        });
    });
  });
  $.each(design.parts, function(index, part) {
    part.DOM
      .css({
        left: (canvasPositionX + part.X) * size.unit,
        top: (canvasPositionY + part.Y) * size.unit,
        width: size.partSize,
        height: `calc(${size.partSize}px + ${1.5 * size.unit}em)`
      });
  });
  $('.part>p').css({
    fontSize: `${size.unit}em`
  });
  if (size.unit + 1e-3 < 0.5) // floating point error
    $('.part>p').hide();
  else
    $('.part>p').show();
  jsPlumb.repaintEverything();
  jsPlumb.revalidate($('.device'));
}

function exportDesign() {
  let data = $.extend(true, {}, design);
  delete data.status;
  $.each(data.parts, (index, part) => { delete part.DOM; });
  $.each(data.devices, (index, device) => {
    delete device.DOM;
    $.each(device.parts, (index, part) => { delete part.DOM; });
  });
  $.each(data.lines, (index, line) => { delete line.DOM; });
  return data;
}
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

$('#part-type-dropdown')
  .dropdown({
    values: partTypes.map((x, i) => ({ name: x, value: x, selected: i === 0 }))
  });
$('#part-safety-dropdown')
  .dropdown({
    values: partSafetyLevels.map((x, i) => ({ name: `${i} - ${x}`, value: i, selected: i === 0  }))
  });

$('#search-parts-dropdown')
  .dropdown({
    apiSettings: {
      url: '/api/search_parts?name={query}',
      cache: false,
      beforeSend: (settings) => settings.urlData.query.length < 3 ? false : settings,
      onResponse: (response) => ({
        success: response.status === 1,
        results:  response.parts.map((x) => ({
          name: x.Name,
          value: x.id
        }))
      })
    },
    onChange: (value) => { setPartPanel(value); }
  });

function setPartPanel(id) {
  $.get(`/api/get_part?id=${id}`, (data) => {
    data = JSON.parse(data);
    if (data.status !== 1) {
      console.error(`Get part information failed. ID: ${value}, response: ${data}`);
      return;
    }
    $('#part-info-img')
    .attr('src', `/static/img/design/${data.part.Type}.png`);
    $('#part-info-name')
    .text(data.part.Name);
    $('#part-info-des>p')
    .text(data.part.Description);
  });
}

let canvasDragging = false;
let canvasDragOrigin;
let currentMode = 'modifyItem';
let modeButtons = $('#drag-item')
  .add($('#drag-canvas'))
  .add($('#connection-dropdown-button'));
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
    $('#canvas').css({ cursor: 'pointer' });
    $('.part, .device').css({ pointerEvents: 'none' });
  })
  .on('deselect', () => {
    $('#canvas').css({ cursor: '' });
    $('.part, .device').css({ pointerEvents: '' });
  });
$('#connection-dropdown')
  .dropdown({
    onChange: (value) => { newConnectionType = value; }
  });
$('#connection-dropdown-button')
  .on('click', () => { selectMode('addConnection'); })
  .on('select', () => {
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
            newConnectionStep = 'chooseTarget';
          } else {
            newConnectionTarget = $(this).attr('partID');
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
      .off('mouseleave');
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

$('#canvas')
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
