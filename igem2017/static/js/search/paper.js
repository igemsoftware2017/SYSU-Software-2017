'use strict';

// initializing position
let leftBlank = `2em + ${$('#logo').width()}px`;
$('#result-container').css({
    left: `calc(${leftBlank})`
});
$('#right-panel').css({
    left: `calc(2em + ${leftBlank} + 876px + 20px)`,
    top: $('#result-list').offset().top,
    width: 342,
    height: 406
});
