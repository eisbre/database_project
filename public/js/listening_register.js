$('.register-btn').on('click', function () {
    let username = $('.username-input').val();
    let password = $('.password-input').val();
    let repassword = $('.repassword-input').val();

    if (password !== "") {
        password = hex_md5(password);
    }
    if (repassword !== "") {
        repassword = hex_md5(repassword);
    }

    $.ajax({
        url: "/registerin",
        type: "POST",
        data: {
            username: username,
            password: password,
            repassword: repassword,
        },
        success: function (resp) {
            let res = JSON.parse(resp);//resp为JSON字符串，这里转化为js对象
            if (res.result === "success") {
                $('.error-message').empty();
                window.location.href = "/";
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

$('.login-btn').on('click', function () {
    window.location.href = "/";
});