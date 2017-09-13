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

function initPositionSize() {
  $('#fav-win').css({
    height: $(this).height()
  });
  $('#toolbox').css({
    top: 500,
    left: 100
  });
}
initPositionSize();