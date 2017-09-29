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
        addPart(part, 1, '#canvas');
      });
      $.each(design.lines, function(index, link) {
        addLink(link);
      });
      redrawDesign();
    }
  });
});

function addDevice(data) {
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
    });
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
  $('<div></div>')
    .appendTo(device)
    .addClass('bone');
  let index = 0;
  $.each(data.parts, function(_, part) {
    addPart(part, index, device);
    index++;
  });
  data.DOM = device;
}

function addPart(data, index, device) {
  let part =
    $('<div></div>')
    .appendTo(device)
    .addClass('part')
    .attr('partID', data.ID)
    .append('<div class="ui centered fluid image"><img src="/static/img/design/' + data.Type + '.png"></img></div>')
    .append('<p>' + data.Name + '</p>')
    .data('is-subpart', device == '#canvas');
  if (part.data('is-subpart')) {
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
      });
  }
  if (size.unit < 0.75)
    part.children('p').hide();
  data.DOM = part;
}

function addLink(data) {
  jsPlumb.connect({
    source: $('[partID=' + data.source + ']')[0],
    target: $('[partID=' + data.target + ']')[0],
    anchor: ['TopCenter', 'BottomCenter', 'Left', 'Right'],
    endpoint: 'Blank',
    connector: 'Flowchart'
  });
}

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
    if (dragMode == 'canvas' && canvasDragging) {
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
        height: 'calc(' + (size.partSize + size.bonePadding * 3 + 3) + 'px + ' + 1.5 * size.unit + 'em)',
        width: Object.keys(device.parts).length * (size.partSize + size.partPadding) + size.partPadding
      })
      .children('.bone')
      .css({
        left: size.partPadding,
        width: device.DOM.width() - 2 * size.partPadding,
        bottom: size.bonePadding
      });
    let count = 0;
    $.each(device.parts, function(index, part) {
      part.DOM
        .css({
          width: size.partSize,
          height: 'calc(' + size.partSize + 'px + ' + 1.5 * size.unit + 'em)',
          left: count * (size.partSize + size.partPadding) + size.partPadding,
          top: size.bonePadding
        });
      count++;
    });
  });
  $.each(design.parts, function(index, part) {
    part.DOM
      .css({
        left: (canvasPositionX + part.X) * size.unit,
        top: (canvasPositionY + part.Y) * size.unit,
        width: size.partSize,
        height: 'calc(' + size.partSize + 'px + ' + 1.5 * size.unit + 'em)'
      });
  });
  $('.part>p').css({
    fontSize: size.unit + 'em'
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
    .attr('href', 'data:application/json;base64,' + btoa(JSON.stringify(content)));
  console.log(aLink);
  aLink[0].click();
}
$('#export-button')
  .on('click', function() {
    createDownload('design.json', exportDesign());
  });

function highlightDevice(circuit) {
  circuit
    .data('selected', true)
    .css({
      boxShadow: '0 0 5px 3px rgba(53, 188, 243, 0.7)',
    });
}
function unHighlightDevice(circuit) {
  circuit
    .data('selected', false)
    .css({
      boxShadow: '',
      border: ''
    });
}
