$('#search-icon')
    .on('click', function() {
        window.location.href = '/search';
    });

$('#search-edit')
    .on('focus', function() {
        $('#dimmer').css({
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 500
        });
    });
$('#search-edit')
    .blur(function() {
        $('#dimmer').css({
            background: 'rgba(0, 0, 0, 0)',
            zIndex: -500
        });
    });
