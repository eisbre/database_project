let qust_num = 0;

$('.sub-btn').on('click', function () {
    let ans = $('.ans').val();
    $.ajax({
        url: "/question",
        type: "POST",
        data: {
            ans: ans,
            reqst: 'False',//是否刷新问题
            qust_num: qust_num,
        },
        success: function (resp) {
            let res = JSON.parse(resp);
            if (res.result === "success") {
                $('.error-message').html("剩余错误次数3");
                window.location.href = "/success";
            }
            else if (res.result === "out") {
                $('.error-message').html("剩余错误次数3");
                window.location.href = "/failure";
            }
            else if (res.result === "error") {
                $('.error-message').html(`剩余错误次数${res.num}`);
            }
        }
    });
});

$('.re-btn').on('click', function () {
    $.ajax({
        url: "/question",
        type: "POST",
        data: {
            ans: "",
            reqst: 'True',
            qust_num: qust_num,
        },
        success: function (resp) {
            let res = JSON.parse(resp);
            if (res.result === "success") {
                $('.question').html(res.qust[`qst${res.num}`]);
                qust_num = res.num;
            }
        }
    });
});

$(".re-btn").trigger("click");