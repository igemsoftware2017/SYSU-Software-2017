$('.ui.dropdown')
  .dropdown();

$('.window')
  .draggable({
    addClasses: false,
    appendTo: 'body',
    handle: '.nav'
  })
  .resizable({
    handles: 's, w, sw'
  });


// Part panel
$('#part-panel')
  .resizable('option', 'minWidth', 200);
var part_panel_sticked_to_right = false;
$('#part-panel-button')
  .on('click', function() {
    part_panel_sticked_to_right = !part_panel_sticked_to_right;
    if (part_panel_sticked_to_right) {
      $(this).removeClass('right').addClass('left');
      // Stick to right
      win = $(this).parent().parent();
      win
        .draggable('disable')
        .resizable('option', 'handles', 'w');
      win.data('free-state', {
        offset: win.offset(),
        height: win.height()
      });
      to_top = $('.ui.fixed.menu').height();
      win.css({
        transition: 'all 0.2s ease'
      });
      win.css({
        left: $('body').width() - win.width(),
        top: to_top,
        height: 'calc(100% - ' + to_top + 'px)',
        borderRadius: 0,
        border: '',
        borderLeft: '1px solid grey',
        position: 'absolute'
      });
      setTimeout(function() {
        win.css({
          transition: ''
        })}, 200);
      $('#canvas-box').css({
        width: 'calc(100% - ' + win.width() + 'px)'
      });
      win
        .children('.nav')
        .children('.ui.header').hide();
    } else {
      $(this).removeClass('left').addClass('right');
      // Free from the right
      win = $(this).parent().parent();
      free_state = win.data('free-state');
      win
        .draggable('enable')
        .resizable('option', 'handles', 'w, s, sw');
      win.css({
        transition: 'all 0.2s ease'
      });
      win.css({
        left: free_state.offset.left,
        top: free_state.offset.top,
        height: free_state.height,
        borderRadius: '5px',
        border: '1px solid grey',
        position: 'absolute'
      });
      $('#canvas-box').css({
        width: '100%'
      });
      setTimeout(function() {
        win.css({
          transition: ''
        })}, 200);
      win
        .children('.nav')
        .children('.ui.header').show();
    }
  });
$('#part-panel')
  .on('resize', function() {
    des = $('#part-info-des');
    $('#part-panel').css({
      minHeight: 'calc(' + (des.position().top + des.parent().position().top + des.height() + 1) + 'px + 2em)'
    });
    if (part_panel_sticked_to_right) {
      $('#canvas-box').css({
        width: 'calc(100% - ' + win.width() + 'px)'
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
    })
  });

// Toolbox window
$('#toolbox')
  .resizable('disable')
  .children('.ui-resizable-handle')
    .hide();
$('#toolbox>.nav>i.icon')
  .on('click', function() {
    cont = $('#toolbox>.content');
    if ($(this).hasClass('minus')) {
      cont
        .data('height', cont.outerHeight())
        .css({
          height: 0,
          padding: '0 0.5em'
        });
      $(this).removeClass('minus').addClass('plus');
    } else {
      cont
        .css({
          height: cont.data('height'),
          padding: '1em 0.5em'
        });
      $(this).removeClass('plus').addClass('minus');
    }
  });

function initPositionSize() {
  $('#part-panel-button').click();
  $('#fav-win').css({
    height: $(this).height()
  });
  $('#toolbox').css({
    top: 500,
    left: 100,
  });
  $('#toolbox>.content').css({
    height: $('#toolbox>.content').outerHeight() + 1
  });
}
initPositionSize();
$('#ratio-dropdown')
  .dropdown('set text', '100%');


// Canvas aware
var canvas = $('#canvas');
var canvas_width = canvas.width();
var canvas_height = canvas.height();
  // x axis: top->down
  // y axis: left->right
  // init (0, 0) to (200, 200) of canvas
var canvas_position_x = 200;
var canvas_position_y = 200;

function addPart(data) {
  let part = $('<div></div>').appendTo('#canvas');
  console.log(part);
  part.addClass('part');
  part.css({
    top: canvas_position_x + data.X,
    left: canvas_position_y + data.Y
  });
  return part;
}

$.get({
  url: '/get_circuit_test',
  success: function(data) {
    data = JSON.parse(data);
    console.log(data);
    $(data.parts).each(function(index, part) {
      addPart(part);
    });
  }
});

