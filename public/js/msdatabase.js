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