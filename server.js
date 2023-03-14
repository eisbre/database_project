let express = require('express');//express模块，构成主体
let bodyParser = require('body-parser');
let app = express();//创建主体
let urlencodedParser = bodyParser.urlencoded({ extended: false });//解析
let msdatabase = require('./public/js/msdatabase');//数据库模块

let now_user = "";//当前登录的用户，如果部署在服务器上，同时存在多个登录状态的用户，可以使用数组存储用户对象，使用UUID区分用户
let error_num = 0;//登录时错误的次数
let qst_error_num = 0;//回答问题错误的次数

//数据库配置信息
var config = {
    server: 'server IP',//服务器IP
    authentication: {
        type: 'default',
        options: {
            userName: 'username',//登录用户名
            password: 'password'//密码
        }
    },
    options: {
        encrypt: false,//信息加密
        database: 'database'//数据库名
    }
};

//设置静态文件夹
app.use('/public', express.static('public'));

//路由
app.get('/', function (req, res) {//主页登录界面
    res.sendFile(__dirname + "/" + "index.html");
})

app.get('/register', function (req, res) {//注册界面
    res.sendFile(__dirname + "/" + "register.html");
});

app.get('/success', function (req, res) {//登录成功界面
    res.sendFile(__dirname + "/" + "success.html");
});

app.get('/failure', function (req, res) {//登陆失败界面
    res.sendFile(__dirname + "/" + "failure.html");
});

app.get('/problem', function (req, res) {//回答问题界面
    res.sendFile(__dirname + "/" + "problem.html");
});

app.post('/command', urlencodedParser, function (req, res) {//操作界面提交命令
    let response = {
        "command": req.body.command,
    };
    var conn = new msdatabase.mssql(config);
    let str = response.command;
    conn.query(str, function (err, data) {
        if (!err) {
            console.log(data['0']);
            if (typeof (data['0']) === "undefined") {
                let list = { result: 'success', callback: "success!" };
                res.send(JSON.stringify(list));
            }
            else {
                let list = { result: 'other', callback: data['0'] };
                res.send(JSON.stringify(list));
            }
        }
        else {
            console.log(err);
            let list = { result: 'error', callback: err };
            res.send(JSON.stringify(list));
        }
    });
});

app.post('/logout', urlencodedParser, function (req, res) {//登出，返回登出时间
    var conn = new msdatabase.mssql(config);
    let str = `update user_${now_user} set logouttime=CONVERT (varchar(50), GETDATE()) where usern='${now_user}' select logouttime from user_${now_user} where usern='${now_user}'`;
    conn.query(str, function (err, data) {
        if (!err) {
            console.log(data['0']);
            let list = { result: 'success', logouttime: data['0']['logouttime'] };
            res.send(JSON.stringify(list));
        }
        else {
            console.log(err);
        }
    });
});

app.post('/getlogintime', urlencodedParser, function (req, res) {//获取登录时间
    var conn = new msdatabase.mssql(config);
    let str = `select logintime from userinfo where usern='${now_user}'`;
    conn.query(str, function (err, data) {
        if (!err) {
            console.log(data['0']);
            let list = { result: 'success', logintime: data['0']['logintime'], username: now_user };
            res.send(JSON.stringify(list));
        }
        else {
            console.log(err);
        }
    });
});

app.post('/question', urlencodedParser, function (req, res) {//问题界面操作
    let response = {
        "ans": req.body.ans,
        "reqst": req.body.reqst,
        "qust_num": req.body.qust_num,
    };

    let random_num = Math.floor(Math.random() * 5) + 1;

    if (response.reqst === 'True') {//刷新问题
        var conn = new msdatabase.mssql(config);
        let str = `select qst${random_num} from userinfo where usern='${now_user}'`;
        conn.query(str, function (err, data) {
            if (!err) {
                console.log(data['0']);
                let list = { result: 'success', qust: data['0'], num: random_num};
                res.send(JSON.stringify(list));
            }
            else {
                console.log(err);
            }
        });
    }
    else {//比对答案
        var conn = new msdatabase.mssql(config);
        let str = `select ans${response.qust_num} from userinfo where usern='${now_user}'`;
        conn.query(str, function (err, data) {
            if (!err) {
                console.log(data['0']);
                let ans = data['0'][`ans${response.qust_num}`];
                
                if (ans === response.ans) {//答对返回
                    qst_error_num = 0;
                    //回答正确，更新登录时间
                    var conn = new msdatabase.mssql(config);
                    let str = `update userinfo set logintime=CONVERT (varchar(50), GETDATE()) where usern='${now_user}'`;
                    conn.query(str, function (err, data) {
                        if (!err) {
                            console.log(data['0']);
                        }
                        else {
                            console.log(err);
                        }
                    });
                    var conn = new msdatabase.mssql(config);
                    let str0 = `select exist from userinfo where usern='${now_user}'`;
                    conn.query(str0, function (err, data) {
                        if (!err) {
                            console.log(data['0']);
                            if (data['0']['exist'] === 'false') {
                                var conn = new msdatabase.mssql(config);//创建与该用户相关的新表
                                let str1 = `select usern,logintime into user_${now_user} from userinfo where usern='${now_user}' alter table user_${now_user} add logouttime varchar(50) update userinfo set exist='true' where usern='${now_user}'`;
                                conn.query(str1, function (err, data) {
                                    if (!err) {
                                        console.log(data['0']);
                                    }
                                    else {
                                        console.log(err);
                                    }
                                });
                            }
                            else {
                                var conn = new msdatabase.mssql(config);//创建与该用户相关的新表
                                let str1 = `update user_${now_user} set logintime=CONVERT (varchar(50), GETDATE()) where usern='${now_user}'`;
                                conn.query(str1, function (err, data) {
                                    if (!err) {
                                        console.log(data['0']);
                                    }
                                    else {
                                        console.log(err);
                                    }
                                });
                            }
                        }
                        else {
                            console.log(err);
                        }
                    });
                    
                    let list = { result: 'success' };
                    res.send(JSON.stringify(list));
                }
                else {//答错返回
                    qst_error_num += 1;
                    if (qst_error_num === 3) {//超过三次退出
                        qst_error_num = 0;
                        let list = { result: 'out' };
                        res.send(JSON.stringify(list));
                    }
                    else {
                        let list = { result: 'error', num: `${3 - qst_error_num}` };
                        res.send(JSON.stringify(list));
                    }
                }
            }
            else {
                console.log(err);
            }
        });
    }
});

app.post('/login', urlencodedParser, function (req, res) {//登录操作
    let response = {
        "username": req.body.username,
        "password": req.body.password,
    };
    console.log(response);

    var conn = new msdatabase.mssql(config);
    let str = `select passw from userinfo where usern='${response.username}'`;
    conn.query(str, function (err, data) {
        if (!err) {
            console.log(data['0']);
            if (typeof (data['0']) == "undefined") {//用户不存在
                error_num += 1;
                if (error_num === 6) {//错误六次强制登录失败
                    error_num = 0;
                    let list = { result: 'out' };
                    res.send(JSON.stringify(list));
                }
                else {
                    let list = { result: 'error', errormessage: `用户不存在 请注册后登录 还可以尝试${6-error_num}` };
                    res.send(JSON.stringify(list));
                }
            }
            else if (response.password === data['0'].passw) {//密码核对成功
                error_num = 0;
                qst_error_num = 0;
                now_user = response.username;
                let list = { result: 'success' };
                res.send(JSON.stringify(list));//封装为JSON字符串发送至前端
            }
            else {
                error_num += 1;
                if (error_num === 6) {//错误六次强制登录失败
                    error_num = 0;
                    let list = { result: 'out' };
                    res.send(JSON.stringify(list));
                }
                else {
                    let list = { result: 'error', errormessage: `用户名密码不正确 还可以尝试${6 - error_num}` };
                    res.send(JSON.stringify(list));
                }
            }
        }
        else {
            console.log(err);
        }
    });
});

app.post('/registerin', urlencodedParser, function (req, res) {//注册操作
    let response = {
        "username": req.body.username,
        "password": req.body.password,
        "repassword": req.body.repassword,
    };
    console.log(response);
    if (response.username == "") {
        let list = { result: 'error', errormessage: '用户名不能为空' };
        res.send(JSON.stringify(list));
    }
    else if (response.password == "") {
        let list = { result: 'error', errormessage: '密码不能为空' };
        res.send(JSON.stringify(list));
    }
    else if (response.repassword == "") {
        let list = { result: 'error', errormessage: '确认密码不能为空' };
        res.send(JSON.stringify(list));
    }
    else if (response.password === response.repassword) {
        var conn = new msdatabase.mssql(config);
        let str = `select passw from userinfo where usern='${response.username}'`;
        conn.query(str, function (err, data) {
            if (!err) {
                console.log(data['0']);
                if (typeof (data['0']) == "undefined") {
                    var conn = new msdatabase.mssql(config);
                    let str = `insert into userinfo(usern, passw) values('${response.username}', '${response.password}')`;
                    conn.query(str, function (err, data) {
                        if (!err) {
                            console.log(data['0']);
                            var conn = new msdatabase.mssql(config);
                            let str = `update userinfo set qst1='11+21' update userinfo set ans1='32' update userinfo set qst2='110+21' update userinfo set ans2='131' update userinfo set qst3='1+21' update userinfo set ans3='22' update userinfo set qst4='10+13' update userinfo set ans4='23' update userinfo set qst5='1 or 0' update userinfo set ans5='True' update userinfo set exist='false' where usern='${response.username}'`;
                            conn.query(str, function (err, data) {
                                if (!err) {
                                    console.log(data['0']);
                                }
                                else {
                                    console.log(err);
                                }
                            });
                            let list = { result: 'success' };
                            res.send(JSON.stringify(list));
                        }
                        else {
                            console.log(err);
                        }
                    });
                }
                else {
                    let list = { result: 'error', errormessage: '用户已存在' };
                    res.send(JSON.stringify(list));
                }
            }
            else {
                console.log(err);
            }
        });
    }
    else {
        let list = { result: 'error', errormessage: '两次输入密码不相同' };
        res.send(JSON.stringify(list));
    }
});

//启动服务
let server = app.listen(8080, function() {
    let port = server.address().port;

    console.log("访问地址为 http://127.0.0.1:%s", port);
});