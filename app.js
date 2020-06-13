//加载Express模块
const express = require('express');

//加载cors模块
const cors = require('cors');

//加载MySQL模块
const mysql = require('mysql');

//加载body-parser模块
const bodyParser = require('body-parser');

//创建MySQL连接池
const pool = mysql.createPool({
    //MySQL数据库服务器的地址
    host:'127.0.0.1',
    //MySQL数据库服务器端口号
    port:3306,
    //用户名
    user:'root',
    //密码
    password:'',
    //数据库名称
    database:'idong'
});

//创建Express应用
const server = express();

//使用cors模块
server.use(cors({
  origin:['http://127.0.0.1:8080','http://localhost:8080']
}));

//使用body-parser模块
server.use(bodyParser.urlencoded({
    extended:false
}));

//获取文章分类信息的API
server.get('/category',(req,res)=>{

    //查询ency_category(文章类型)表中所有的记录 
    var sql = 'SELECT ency_category_id,ency_category_name FROM ency_category';

    // MySQL连接池执行查询操作
    pool.query(sql,(err,results)=>{

        //如果发生异常,则直接抛出异常
        if(err) throw err;
        
        //将相关的查询信息返回到客户端
        res.send({message:'查询成功',code:200,category:results});

    });

});

//获取指定分类文章信息的API
server.get('/getArticles',(req,res)=>{
    //获取地址栏请求参数 -- cid(文章分类ID)
    var cid = req.query.cid;
    //获取地址栏请求参数 -- page(当前页码)
    var page = req.query.page;
    //设置每页显示的记录数
    var pagesize = 20;
    //存储计算后的分页总页数
    var pagecount;
    //查询某一文章分类包含的文章总数
    var sql = 'SELECT COUNT(article_id) AS count FROM ency_article WHERE ency_category_id=?';
    pool.query(sql,[cid],(err,results)=>{
        if(err) throw err;
        pagecount = Math.ceil(results[0].count / pagesize);
    });
    //页码应该是滚动触发loadMore()函数时提交给服务器
    var offset = (page - 1) * pagesize;
    //以获取到的cid参数为条件查询该分类下的文章信息
    sql = 'SELECT article_id,article_title,article_image FROM ency_article WHERE ency_category_id=? LIMIT ' + offset + ',' + pagesize;

    //执行SQL查询
    pool.query(sql,[cid],(err,results)=>{

        if(err) throw err;

        res.send({message:'查询成功',code:200,articles:results,pagecount:pagecount});
    });

});

//根据ID获取文章信息的API
server.get('/encyArticle',(req,res)=>{

    //获取URL地址栏的参数
    var id = req.query.id;
    // console.log(id)
    //根据ID查询指定文章的SQL
    var sql = 'SELECT article_title,article_content,article_at FROM ency_article WHERE article_id=?';

    pool.query(sql,[id],(err,results)=>{

        if(err) throw err;
        res.send({message:'查询成功',code:200,encyArticle:results[0]});

    });
     
});

// //用户注册API
// server.post('/register',(req,res)=>{
//     //获取用户的注册信息
//     var username=req.body.username;
//     var password=req.body.password;

//     var sql="insert xzqa_author(username,password) values(?,?)";
//     pool.query(sql,[username,password],(err,results)=>{
//         if(err) throw err;
//         res.send("OK");
//     })
// })

server.listen(9001);

