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
