'use strict';

// initializing position
let leftBlank = `2em + ${$('#logo').width()}px`;
$('#search-box-container').css({
  height: $('#logo').height()
});
$('#search-box').css({
  left: `calc(${leftBlank})`,
  top: ($('#search-box-container').height() - $('#search-box').height()) / 2
});
$('#result-container').css({
  left: `calc(${leftBlank})`
});
$.each($('.item>.image>img'), function(index, value) {
  $(this).css({
    marginLeft: ($(this).parent().width() - $(this).width()) / 2
  });
});
$('#right-panel').css({
  left: `calc(2em + ${leftBlank} + 876px + 20px)`,
  top: $('#result-list').offset().top,
  width: 342,
  height: 406
});

$('.star.icon')
  .on('click', function() {
    if ($(this).hasClass('empty'))
      $(this).removeClass('empty');
    else
      $(this).removeClass('star icon').addClass('empty star icon');
  });

$('.labels>.label')
  .on('click', function() {
    if ($(this).hasClass('basic'))
      $(this).removeClass('basic');
    else
      $(this).removeClass('label').addClass('basic label');
  });

$('.column>.ui.menu')
  .on('click', '.item', function() {
    if(!$(this).hasClass('dropdown')) {
      $(this)
        .addClass('active')
        .siblings('.item')
        .removeClass('active');
    }
  });

$('.ui.text.menu')
  .on('click', '.item', function() {
    i = $(this).children('i');
    if (i.hasClass('up'))
      i.removeClass('up icon').addClass('down icon');
    else
      i.removeClass('down icon').addClass('up icon');
  });

$('#tool')
  .popup({
    popup: $('.popup'),
    on: 'click',
    position: 'bottom left'
  });

$('.ui.calendar')
  .calendar({
    type: 'date'
  });
