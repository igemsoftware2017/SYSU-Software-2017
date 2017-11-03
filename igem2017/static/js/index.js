$('#search-edit')
    .on('focus', function() {
        $('#search-page-dimmer').css({
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 0
        });
    });
$('#search-edit')
    .blur(function() {
        $('#search-page-dimmer').css({
            background: 'rgba(0, 0, 0, 0)',
            zIndex: -500
        });
    });

$('#no-idea').on('click', () => {
    $('#keyword-modal').modal('show');
})

$('#keyword-modal>.content').on('click', () => { $('#keyword-modal').modal('hide'); });
