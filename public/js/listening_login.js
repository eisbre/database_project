$('.login-btn').on('click', function () {
    let username = $('.username-input').val();
    let password = hex_md5($('.password-input').val());    
    $.ajax({
        url: "/login",
        type: "POST",
        data: {
            username: username,
            password: password,
        },
        success: function (resp) {
            let res = JSON.parse(resp);//resp为JSON字符串，这里转化为js对象
            console.log(res);
            if (res.result === "success") {
                $('.error-message').empty();
                window.location.href = "/problem";
            }
            else if (res.result === "out") {
                $('.error-message').empty();
                window.location.href = "/failure";
            }
            else if (res.result === "error") {
                $('.error-message').html(res.errormessage);
            }
        },
        error: function () {
            alert('error');
        }
    });
});

$('.register-btn').on('click', function () {
    window.location.href = "/register";
});