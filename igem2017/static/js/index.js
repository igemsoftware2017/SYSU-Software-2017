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
function bindHref(id, url) {
    $(`#${id}`).on('click', () => { window.location.href = url; });
}

bindHref('facebook', 'https://www.facebook.com/sysusoftware');
bindHref('googleplus', 'https://plus.google.com/u/0/108675007137699538539');
bindHref('twitter', 'https://twitter.com/SYSU_Software');
bindHref('in', 'https://www.instagram.com/sysusf');

