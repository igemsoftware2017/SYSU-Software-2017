$('.ui.dropdown')
  .dropdown({
    onChange: function() {
      resizeDesign($(this).dropdown('get value'));
    }
  });
$('#zoom-in')
  .on('click', function() {
    let ratio = size.unit;
    ratio = Math.max(0.25, Math.min(1.5, ratio + 0.25));
    $('#ratio-dropdown')
      .dropdown('set value', ratio)
      .dropdown('set text', Math.round(ratio * 100) + '%');
    resizeDesign(ratio);
  });
$('#zoom-out')
  .on('click', function() {
    let ratio = size.unit;
    ratio = Math.max(0.25, Math.min(1.5, ratio - 0.25));
    $('#ratio-dropdown')
      .dropdown('set value', ratio)
      .dropdown('set text', Math.round(ratio * 100) + '%');
    resizeDesign(ratio);
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
var part_panel_sticked_to_right = false;
function stickPartPanel() {
  part_panel_sticked_to_right = true;
  win = $('#part-panel');
  win
    .draggable('option', 'snap', 'body')
    .draggable('option' ,'snapMode', 'inner')
    .draggable('option', 'snapTolerance', 100)
    .draggable('option', 'axis', 'x')
    .on('drag', function(event, ui) {
      if (ui.position.left < ui.originalPosition.left - 100) {
        if (part_panel_sticked_to_right)
          unstickPartPanel();
      }
    })
    .resizable('option', 'handles', 'w');
  win.data('free-state', {
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
}
function unstickPartPanel() {
  part_panel_sticked_to_right = false;
  win = $('#part-panel');
  free_state = win.data('free-state');
  win
    .draggable('option', 'snap', 'false')
    .draggable('option', 'snapTolerance', 0)
    .draggable('option', 'axis', 'false')
    .on('drag', function(event, ui) {
      if (ui.position.left < ui.originalPosition.left - 30) {
        if (part_panel_sticked_to_right)
          unstickPartPanel();
      }
    })
    .resizable('option', 'handles', 'w, s, sw');
  win.css({
    transition: 'all 0.1s ease'
  });
  win.css({
    height: free_state.height,
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
}
$('#part-panel-dropper')
  .droppable({
    accept: '#part-panel',
    tolerance: 'touch',
    over: function(event, ui) {
      $('#part-panel-dropper').css({
        backgroundColor: '#9ec5e6'
      });
    },
    out: function(event, ui) {
      $(this).css({
        backgroundColor: 'transparent'
      });
    },
    drop: function(event, ui) {
      stickPartPanel();
      $(this).css({
        backgroundColor: 'transparent'
      });
    }
  });
$('#part-panel-button');
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
$('#ratio-dropdown')
  .dropdown('set text', '100%');
