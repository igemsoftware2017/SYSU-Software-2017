$('#search-edit')
    .on('focus', function() {
        $('#search-page-dimmer').css({
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1
        });
    });
$('#search-edit')
    .blur(function() {
        $('#search-page-dimmer').css({
            background: 'rgba(0, 0, 0, 0)',
            zIndex: -500
        });
    });
