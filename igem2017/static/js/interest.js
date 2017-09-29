let chosenInterest = new Set();
let options = [
  { text: 'water', top: 250, left: 300 },
  { text: 'cancer', top: 300, left: 450 },
  { text: 'cell', top: 250, left: 600 },
  { text: 'superman', top: 300, left: 750 }
]
options.forEach(function (o, i) {
  let id = 'interest-' + i;
  $('.interests').append('<div class="interest" id="' + id + '">' + o.text + '</div>');
  o.item = $('#' + id);
  let item = o.item;
  item
    .css({
      top: o.top,
      left: o.left
    })
    .data('origin', { top: o.top, left: o.left })
    .data('id', id)
    .data('chosen', false)
    .data('hover', false)
    .data('option', o.text)
    .data('timerId', setInterval(function() {
      if (!item.data('chosen') && !item.data('hover')) {
        let newTop = 0, newLeft = 0;
        let oTop = item.data('origin').top, oLeft = item.data('origin').left;
        do {
          newTop = item.position().top + Math.random() * 10 - 5;
          newLeft = item.position().left + Math.random() * 10 - 5;
        } while (Math.abs(newTop - oTop) > 20 || Math.abs(newLeft - oLeft) > 20);
        item.css({
          top: newTop,
          left: newLeft
        });
      }
    }, 1000))
    .on('mouseenter', function() {
      if (!item.data('chosen'))
        item
          .css({
            transform: 'scale(1.2, 1.2)'
          })
          .data('hover', true)
          .stop();
    })
    .on('mouseleave', function() {
      if (!item.data('chosen'))
        item
          .css({
            transform: 'scale(1, 1)'
          })
          .data('hover', false);
    })
    .on('click', function() {
      if (!item.data('chosen')) {
        item.data('chosen', true);
        item.css({
          boxShadow: '0 0 2em 0 rgba(0, 0, 0, 0.7)'
        });
        chosenInterest.add(item.data('option'));
      } else {
        item.data('chosen', false);
        item.css({
          boxShadow: '0 0 1em 0 rgba(0, 0, 0, 0.7)'
        });
        chosenInterest.delete(item.data('option'));
      }
    });
});

$('#reset')
  .on('click', function() {
    options.forEach(function(o, i) {
      if (o.item.data('chosen')) {
        o.item
          .data('chosen', false)
          .data('hover', false)
          .css({
            boxShadow: '0 0 1em 0 rgba(0, 0, 0, 0.7)',
            transform: 'scale(1.0, 1.0)'
          });
        chosenInterest.delete(o.item.data('option'));
      }
    });
  });
