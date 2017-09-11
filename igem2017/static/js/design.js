$('.ui.dropdown')
  .dropdown();

$('.window')
  .draggable({
    addClasses: false,
    appendTo: 'body',
    handle: '.nav'
  })
  .resizable();

$('#part-panel-button')
  .on('click', function() {
    if ($(this).hasClass('right')) {
      $(this).removeClass('right').addClass('left');
      // Stick to right
      win = $(this).parent().parent();
      win.draggable('disable').resizable('disable');
      win.data('free-state', {
        offset: win.offset(),
        height: win.height(),
        width: win.width()
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
      $('#canvas-box').css({
        width: 'calc(100% - ' + win.width() + 'px)'
      });
    } else {
      $(this).removeClass('left').addClass('right');
      // Free from the right
      win = $(this).parent().parent();
      free_state = win.data('free-state');
      win.draggable('enable').resizable('enable');
      win.css({
        left: free_state.offset.left,
        top: free_state.offset.top,
        height: free_state.height,
        width: free_state.width,
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

$('#fav-win-button')
  .on('click', function() {
    $('#fav-win').hide({
      duration: 200
    });
  });

$('#open-fav-win')
  .on('click', function() {
    $('#fav-win').toggle({
      duration: 200
    })
  });
