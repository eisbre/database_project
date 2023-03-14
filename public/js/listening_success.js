function BrowserInfo() {
    var userAgent = navigator.userAgent;
    var info = "";
    info += "浏览器属性信息： " + userAgent + "<br />";
    return info;
}

function update() {
    $(".systeminfo").html(BrowserInfo());
    $.ajax({
        url: "/getlogintime",
        type: "POST",
        success: function (resp) {
            let res = JSON.parse(resp);
            let str = `登录时间：${res.logintime}`;
            $(".logintime").html(str);
            $(".username").html(res.username);
        }
    });
}

$(".background").hide();

update();

$(".logout").on('click', function () {
    $(".outer").hide();
    $(".background").show();

    $.ajax({
        url: "/logout",
        type: "POST",
        success: function (resp) {
            let res = JSON.parse(resp);
            let str = `登出时间：${res.logouttime}`;
            $(".logouttime").html(str);
        }
    });
});

$(".login-btn").on('click', function () {
    window.location.href = "/";
});

$(".sub-btn").on('click', function () {
    let command = $(".command").val();
    $.ajax({
        url: "/command",
        type: "POST",
        data: {
            command: command,
        },
        success: function (resp) {
            let res = JSON.parse(resp);
            let callback = JSON.stringify(res.callback);
            callback = callback.slice(1);
            callback = callback.slice(0, callback.length - 1);
            $(".callback").html(callback);
        }
    });
});