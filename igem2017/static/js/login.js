$('#login-form')
    .form({
        fields: {
            email: ['email', 'empty'],
            password: ['empty']
        }
    });
$('#register-button')
    .on('click', function() {
        window.location.href = '/register';
    });
$('#login-button')
    .on('click', function() {
        $('#login-form')
            .form('submit');
    });
$('#signin-button')
    .on('click', function() {
        $('#signin-modal')
            .modal('show');
    });
