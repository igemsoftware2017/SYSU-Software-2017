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

$('#part-panel-button')
  .on('click', function() {
    if ($(this).hasClass('right')) {
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
        border: 'none',
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
  });

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

$('#fav-win').css({
  height: $(this).height()
});
