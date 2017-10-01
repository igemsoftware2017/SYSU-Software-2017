'use strict';

const PART_TYPES = [
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

// x axis: top->down
// y axis: left->right
// init (0, 0) to (200, 200) of canvas
let canvasPositionX = -200;
let canvasPositionY = -800;

let standardSize = {
  deviceHeight: 100,
  partSize: 75,
  partPadding: 30,
  bonePadding: 10,
  addIconSize: 15,
  unit: 1
};
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
      console.log(design);
      $.each(design.devices, function(index, device) {
        addDevice(device);
      });
      $.each(design.parts, function(index, part) {
        addPart(part, 1, undefined);
      });
      $.each(design.lines, function(index, link) {
        addLink(link);
      });
      redrawDesign();
    }
  });
});

function addDevice(data) {
  // Creating device
  let device =
    $('<div></div>')
    .appendTo('#canvas')
    .addClass('device')
    .attr('deviceID', data.deviceID)
    .on('click', function() {
      if ($(this).hasClass('dragging')) {
        $(this).removeClass('dragging');
        return;
      }
      if ($(this).data('selected')) {
        unHighlightDevice($(this));
      } else {
        unHighlightDevice($('.device, .part'));
        highlightDevice($(this));
      }
    })
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

  // Creating add buttons
  device.leftAddIcon = $('<div><img></img></div>')
    .data('position-offset', 0);
  device.rightAddIcon = $('<div><img></img><div>')
    .data('position-offset', 1);
  device.leftAddIcon.add(device.rightAddIcon)
    .addClass('ui centered fluid image')
    .hide()
    .appendTo(device)
    .on('click', function() {
      console.log($(this));
      $('#add-part-modal')
        .data('destDevice', data)
        .data('destPosition', device.data('addIconIndex') + $(this).data('position-offset'));
      $('#add-part-modal')
        .modal('show');
      device.removeData('addIconIndex');
    })
    .children('img')
    .attr('src', '/static/img/design/plus.png');
  device
    .on('mouseleave', function() {
      device.removeData('addIconIndex');
      device.leftAddIcon.add(device.rightAddIcon)
      .fadeOut(100);
    });

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
  if (isSubpart) {
    part
      .on('mouseenter', function() {
        if (device.data('addIconIndex') === part.data('index')) {
          return;
        } else if (device.data('addIconIndex') !== undefined) {
          device.leftAddIcon.add(device.rightAddIcon)
            .fadeOut({ duration: 100 });
        }
        setTimeout(function() {
          device.leftAddIcon.css({
            left: part.data('index') * (size.partSize + size.partPadding) + (size.partPadding - size.addIconSize) / 2
          });
          device.rightAddIcon.css({
            left: (part.data('index') + 1) * (size.partSize + size.partPadding) + (size.partPadding - size.addIconSize) / 2
          });
          device.leftAddIcon.add(device.rightAddIcon)
            .fadeIn({ duration: 100 });
        }, 100);
        device.data('addIconIndex', part.data('index'));
      })
      .on('mouseleave', function() {
      });
  } else {
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
    .on('click', function() {
      if ($(this).hasClass('dragging')) {
        $(this).removeClass('dragging');
        return;
      }
      if ($(this).data('selected')) {
        unHighlightDevice($(this));
      } else {
        unHighlightDevice($('.device, .part'));
        highlightDevice($(this));
      }
    })
    .data('leftmost', true)
    .data('rightmost', true);
  }
  if (size.unit < 0.75)
    part.children('p').hide();
  data.DOM = part;
}

function addLink(data) {
  let source = $('[partID=' + data.source + ']');
  let target = $('[partID=' + data.target + ']');
  let anchors = [
    ['TopCenter', 'BottomCenter'],
    ['TopCenter', 'BottomCenter']
  ];
  if (source.data('leftmost') === true)
    anchors[0].push('Left');
  if (source.data('rightmost') === true)
    anchors[0].push('Right');
  if (target.data('leftmost') === true)
    anchors[1].push('Left');
  if (target.data('rightmost') === true)
    anchors[1].push('Right');
  jsPlumb.connect({
    source: source,
    target: target,
    anchors: anchors,
    endpoint: 'Blank',
    connector: 'Flowchart'
  });
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
    let new_data = {
      ID: "100",
      LibraryID: "test",
      Name: "test",
      Type: "RBS",
      X: 0,
      Y: 0,
      contain: ""
    };
    let modal = $(this).parent().parent();
    let device = modal.data('destDevice');
    let position = modal.data('destPosition');
    insertPart(device, new_data, position);
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

let canvasDragging = false;
let dragMode = 'item';
let canvasDragOrigin;
$('#drag-item')
.on('click', function() {
  dragMode = 'item';
  $(this).addClass('blue');
  $('#drag-canvas').removeClass('blue');
  $('#canvas').css({ cursor: '' });
  $('.part, .device').css({ pointerEvents: '' });
});
$('#drag-canvas')
.on('click', function() {
  dragMode = 'canvas';
  $(this).addClass('blue');
  $('#drag-item').removeClass('blue');
  $('#canvas').css({ cursor: 'pointer' });
  $('.part, .device').css({ pointerEvents: 'none' });
});
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
  if (dragMode === 'canvas' && canvasDragging) {
    canvasPositionX += (event.offsetX - canvasDragOrigin.x) / size.unit;
    canvasPositionY += (event.offsetY - canvasDragOrigin.y) / size.unit;
    canvasDragOrigin = { x: event.offsetX, y: event.offsetY };
    redrawDesign();
  }
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
    device.DOM.leftAddIcon.add(device.DOM.rightAddIcon)
      .css({
        position: 'absolute',
        top: `calc(${size.partSize / 2 + size.bonePadding}px + ${1.5 / 2 * size.unit}em)`,
        height: size.addIconSize,
        width: size.addIconSize,
        cursor: 'pointer'
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
  $.each(data.parts, function(index, part) {
    delete part.DOM;
  });
  $.each(data.devices, function(index, device) {
    delete device.DOM;
    $.each(device.parts, function(index, part) {
      delete part.DOM;
    });
  });
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

function highlightDevice(device) {
  device
  .data('selected', true)
  .css({
    boxShadow: '0 0 5px 3px rgba(53, 188, 243, 0.7)',
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
