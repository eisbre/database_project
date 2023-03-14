## 工程目录

`node_modules`：nodeJS模块存放文件夹

`public`：存放静态文件，包含CSS，JS样式，JS监听页面动作，图片等

`package.json package-lock.json`：nodeJS配置文件

`server.js`：主程序，使用命令`node server.js`启动服务

`html文件`：用于各个构成页面

## 前端

在HTML页面中引入以下内容

```html
<link rel="stylesheet" href="/public/css/style.css">	<!--css样式-->
<script src="https://cdn.acwing.com/static/jquery/js/jquery-3.3.1.min.js"></script>	<!--引入jquery-->
<script src="/public/js/MD5.js"></script>	<!--引入MD5加密-->

<script type="module">
    import { } from "/public/js/mouse.js";//鼠标移动的界面样式
    import { } from "/public/js/listening.js";//监听事件，每个界面对应一个监听文件
</script>
```

### 登录注册界面

登录注册界面基本相同

通过type设置input标签的模式

```html
<input class="username-input" type="text" placeholder="账号">
<input class="password-input" type="password" placeholder="密码">
```

在对应JS文件中绑定按钮点击事件

对应标签使用jQuery标签选择器选出

其中登录跳转到注册界面和注册界面跳转到登录界面使用前端跳转的方式

```js
$('.register-btn').on('click', function () {
    window.location.href = "/register";
});
```

向后端发送数据使用ajax

```javascript
$.ajax({
    url: "/",//触发的路由
    type: "POST" //通信方式还可以使用GET
    data: {//向后端发送的数据
    	em1: data1,
    	em2: data2,
	}
    success: function(resp) {//resp为后端响应的数据
    	let res = JSON.parse(resp);//resp为JSON字符串，这里转化为js对象
	}
});
```

获取输入框信息

```javascript
let username = $('.username-input').val();
let password = hex_md5($('.password-input').val());//对密码进行MD5加密，数据库保存密文，不会显示明文
```

### 操作界面

将登出界面和操作界面整合在一起，使用jQuery的show和hide进行页面的切换。



### 其他界面

原理同上

## 后端

引入模块

```javascript
let express = require('express');//express模块，构成主体
let bodyParser = require('body-parser');//JSON字符串解析
let urlencodedParser = bodyParser.urlencoded({ extended: false });//POST解析
let msdatabase = require('./public/js/msdatabase');//数据库模块
```

数据库配置信息

```javascript
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
```

设置静态文件夹

```javascript
//设置静态文件夹
app.use('/public', express.static('public'));
```

路由，用于返回页面

```javascript
app.get('/', function (req, res) {//主页登录界面
    res.sendFile(__dirname + "/" + "index.html");
})
```

路由，用于返回数据

```javascript
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
```

前端数据接收和处理

```javascript
app.post('/question', urlencodedParser, function (req, res) {
    let response = {
        "ans": req.body.ans,
        "reqst": req.body.reqst,
        "qust_num": req.body.qust_num,
    };
});
```

应答数据

```javascript
app.post('/question', urlencodedParser, function (req, res) {
	let list = { result: 'success', qust: data['0'], num: random_num};
	res.send(JSON.stringify(list));
});
```

连接数据库

```javascript
let conn = new msdatabase.mssql(config);//创建连接
let str = `'${response.username}'`;//使用``拼接字符串，作为执SQL行命令
conn.query(str, function (err, data) {
     if (!err) {
         console.log(data['0']);//返回的数据
      }
      else {
          console.log(err);
      }
});
```



## 数据库

数据库模块，封装后可以在其他js文件中调用

```javascript
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

exports.mssql = function (config) {
    this.connection = new Connection(config);
    this.connection.connect();
    this.query = function (str, callback) {          //执行查询  
        var connection = this.connection;
        var rows = {};
        connection.on('connect', function (err) {                 //连接数据库，执行匿名函数
            if (err) {
                callback({ 'err': err['message'] + '请检查账号、密码是否正确,且数据库存在' });
            } else {
                console.log('Connected');
                var request = new Request(str, function (err, rowCount) {
                    if (err) err = { 'err': err['message'] };
                    callback(err, rows);
                    connection.close();
                });

                var n = 0;
                request.on('row', function (columns) {                            //查询成功数据返回  
                    rows[n] = {};
                    columns.forEach(function (column) {
                        rows[n][column.metadata.colName] = column.value;        //获取数据            
                    });
                    n++;
                });

                connection.execSql(request);                                 //执行sql语句  
            }
        });
    }
} 
```

调用方式

```javascript
let conn = new msdatabase.mssql(config);//创建连接
let str = `'${response.username}'`;//使用``拼接字符串，作为执SQL行命令
conn.query(str, function (err, data) {
     if (!err) {
         console.log(data['0']);//返回的数据
      }
      else {
          console.log(err);
      }
});
```

