var canvas = $('#canvas');
var canvas_width = canvas.width();
var canvas_height = canvas.height();
// x axis: top->down
// y axis: left->right
// init (0, 0) to (200, 200) of canvas
var canvas_position_x = -200;
var canvas_position_y = -800;

var standard_size = {
  deviceHeight: 100,
  partSize: 75,
  partPadding: 30,
  bonePadding: 10,
  unit: 1
};
function zoom(size, ratio) {
  let new_size = {}
  $.each(size, (key, value) => { new_size[key] = value * ratio; });
  return new_size;
}
var size = zoom(standard_size, 1);
function resizeDesign(ratio) {
  size = zoom(standard_size, ratio);
  redrawDesign();
}

var design;
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
        jsPlumb.draggable(part.DOM, {
          start: function(event) {
            part.DOM.data('drag-origin', {
              x: event.e.pageX,
              y: event.e.pageY
            });
          },
          drag: function() {
            part.DOM.addClass('dragging');
          },
          stop: function(event) {
            let origin = part.DOM.data('drag-origin');
            part.X += (event.e.pageX - origin.x) / size.unit;
            part.Y += (event.e.pageY - origin.y) / size.unit;
          }
        });
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
  let bone =
    $('<div></div>')
    .appendTo(device)
    .addClass('bone')
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
    .append('<p>' + data.Name + '</p>');
  if (device == '#canvas')
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
  })

var canvas_dragging = false;
var drag_mode = 'item';
var canvas_drag_origin;
$('#drag-item')
  .on('click', function() {
    drag_mode = 'item';
    $(this).addClass('blue')
    $('#drag-canvas').removeClass('blue');
    $('#canvas').css({ cursor: '' });
    $('.part, .device').css({ pointerEvents: '' });
  });
$('#drag-canvas')
  .on('click', function() {
    drag_mode = 'canvas';
    $(this).addClass('blue');
    $('#drag-item').removeClass('blue');
    $('#canvas').css({ cursor: 'pointer' });
    $('.part, .device').css({ pointerEvents: 'none' });
  });
$('#canvas')
  .on('mousedown', function(event) {
    canvas_dragging = true;
    canvas_drag_origin = { x: event.offsetX, y: event.offsetY };
  })
  .on('mouseup', function() {
    canvas_dragging = false;
  })
  .on('mouseleave', function() {
    canvas_dragging = false;
  })
  .on('mousemove', function(event) {
    if (drag_mode == 'canvas' && canvas_dragging) {
      canvas_position_x += (event.offsetX - canvas_drag_origin.x) / size.unit;
      canvas_position_y += (event.offsetY - canvas_drag_origin.y) / size.unit;
      canvas_drag_origin = { x: event.offsetX, y: event.offsetY };
      redrawDesign();
    }
  });

function redrawDesign() {
  $.each(design.devices, function(index, device) {
    device.DOM
      .css({
        left: (canvas_position_x + device.X) * size.unit,
        top: (canvas_position_y + device.Y) * size.unit,
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
        left: (canvas_position_x + part.X) * size.unit,
        top: (canvas_position_y + part.Y) * size.unit,
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
