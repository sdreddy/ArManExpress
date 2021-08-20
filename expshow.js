var express=require('express');
const app=express();
var cors = require('cors')
var sqlite3=require('sqlite3').verbose();
var md5=require('md5');
var bodyParser = require('body-parser');
app.use(bodyParser.json());                        

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin:"http://localhost:3000"
}))
let db = new sqlite3.Database('idb.db', (err) => {
    if (err) {
        console.log("Failed to load Database -- Contact SD REDDY ")
        console.error(err.message);
    }
    else{
        console.log("DB loaded");
    }


    db.run("CREATE TABLE IF NOT EXISTS products(pid VARCHAR(255) PRIMARY KEY,productname VARCHAR(255),productlotsize VARCHAR(255),productprice VARCHAR(255),productmargin VARCHAR(255));")
    db.run("CREATE TABLE IF NOT EXISTS sale(entryid VARCHAR(255)PRIMARY KEY,pid VARCHAR(255),openstock VARCHAR(255),closestock VARCHAR(255),salevalue VARCHAR(255),returnvalue VARCHAR(255),date DATE,vehicle VARCHAR(255));")
    db.run("CREATE TABLE IF NOT EXISTS closestock(closeid VARCHAR(255)PRIMARY KEY,closedate DATE,closepid VARCHAR(255),stock VARCHAR(255));");
    db.run("CREATE TABLE IF NOT EXISTS stock(entryid VARCHAR(255)PRIMARY KEY,pid VARCHAR(255),openstock VARCHAR(255),closestock VARCHAR(255),entryvalue VARCHAR(255),date DATE);")
    db.run("CREATE TABLE IF NOT EXISTS entry(entryid VARCHAR(255)PRIMARY KEY,entrytype VARCHAR(255),log VARCHAR(255),date VARCHAR(255),vehicle VARCHAR(255));")
    // db.run("CREATE TABLE IF NOT EXISTS livestock(pid VARCHAR(255)PRIMARY KEY,stock VARCHAR(255));");
    console.log("DB done");
});

app.get("/",cors,function(req,res,next){
    res.json("{toki:'NOKI'}");
    res.end();
});






app.get("/products/del",function(req,res){
    dpid=req.query.pid;
    dpname=req.query.pname;
    if(dpid==null){
        var query="DELETE FROM PRODUCTS WHERE pid=NULL";    
    }
    else{
    var query="DELETE FROM PRODUCTS WHERE pid='"+dpid+"'";
    }
    console.log(query);
    var iparm=[];
    var pidprod;
    db.run(query,(err,rows)=>{
        if(err){
            return JSON.parse("{'error':'"+err+"'");
        }
        else{
            res.json(rows);
        }
    });

    // db.all(query,iparm,(err,rows)=>{
    //     if(err){
    //         res.send("Error While fetching data");
    //         res.end();
    //         console.log(err.message);
    //     }
    //     else{
    //     query="DELETE FROM products where pid='"+dpid+"'";
    //     db.all(query,[],(zerr,zrows)=>{
    //         if(zerr){
    //             res.send("Error While fetching data");
    //             res.end();
    //             console.log(zerr.message);
    //         }
    //         else{
    //         console.log(rows);
    //         res.send(this.dpname+" is deleted successfully");
    //         res.end();
    //         }
    //     })
    //     }
    // })
})


function seqquery(dbz,query){
    return new Promise((resolve,reject)=>{
        this.dbz.run(query,(err,rows)=>{
            if(err){
                return reject(err);
            }
            return resolve(rows);
        })
    })
}



app.get("/show",function(req,iresp){
    var query="SELECT * FROM stock";
    var iparm=[];
    new Promise((resolve,reject)=>{
        db.all(query,iparm,(err,rows)=>{
            if(err){
                iresp.send("Error While fetching data");
                iresp.end();
                console.log(err.message);
                return reject(err);
            }
            return resolve(rows);
            console.log(rows);
            
        })
    }).then((resp)=>{
        console.log(resp);
        iresp.json({
            resp
        })
        iresp.end();
    })
    
})

app.get("/inven/addstock",function (req,res){
    var idate=req.query.date;
    var vehicle=req.query.vehicle;
    var data=req.query.data;
    console.log(data.length);
    
    
    // stock(entryid VARCHAR(255)PRIMARY KEY,pid VARCHAR(255),openstock VARCHAR(255),closestock VARCHAR(255),entryvalue VARCHAR(255),date VARCHAR(255))
    var inscommand='INSERT INTO stock(entryid,pid,openstock,closestock,entryvalue,date) VALUES (?,?,?,?,?,?)';
    data.map((x)=>{
        k=JSON.parse(x);
        // var irand=Math.random();
        // var idt=new Date().getTime();
        // var entryid=md5(idt+";"+irand);
        var entryid=k.pid+";"+idate;
        var dquery="DELETE from stock where entryid='"+entryid+"'";
        console.log(dquery);
        db.run(dquery,err=>{
            if(err){
                console.log("Unable to delete");
                console.log(err);
            }
        });
    });  

    setTimeout(() => {
        let iv=0;

        data.map((x)=>{
            k=JSON.parse(x);
            var entryid=k.pid+";"+idate;
            db.run(inscommand,[entryid,k.pid,k.ostock,k.cstock,k.istock,idate],err=>{
            if(err){
                console.log(err);
                console.log("ERR");
                res.send("Error");
            }
            else{
                console.log("INS DONE "+entryid);
                res.send("Got Add Stock");
            }
            })
            iv=iv+1;
        });
        console.log(iv);
        if(iv===data.length){
            res.end();
        }
    }, 4000);
    

})

app.get("/products/add",function(req,res){
    console.log("ADDED");
    try{
        var prodname=req.query.prodname;
        var prodlot=req.query.prodlot;
        var prodprice=req.query.prodprice;
        var prodprofit=req.query.prodprofit;
        var idt=new Date().getTime();
        var irand=Math.random();
        var pid=md5(idt+";"+irand);
        var inscommand='INSERT INTO products(pid,productname,productlotsize,productprice,productmargin) VALUES (?,?,?,?,?)';
        db.run(inscommand,[pid,prodname,prodlot,prodprice,prodprofit],err=>{
                        if(err){
                        console.log("ERROR");
                        console.log(err.message);
                        // respi.send(err.message);
                        }
        });
        var inscommand='INSERT INTO livestock(pid,stock) VALUES (?,?)';
        db.run(inscommand,[pid,'0'],err=>{
            if(err){
            console.log("ERROR");
            console.log(err.message);
            // respi.send(err.message);
            }
        });
        res.send("Addedd Successfully");
        res.end();

    }
    catch(err){
        console.log(err);
        res.send(err.message);
        res.end();
    }
    
})

// app.get("/products/addproduct",cors,function(reqi,respi,next){
//     console.log("Addstarted");
//     try{
//         var prodname=reqi.query.prodname;
//         var prodlot=reqi.query.prodlot;
//         var prodprice=reqi.query.prodprice;
//         var prodprofit=reqi.query.prodprofit;
//         var idt=new Date().getTime();
//         var irand=Math.random();
//         var pid=md5(idt+";"+irand);
//         var inscommand='INSERT INTO products(pid,productname,productlotsize,productprice,productmargin) VALUES (?,?,?,?,?)';
//         console.log(pid);
//         console.log(prodname);
//         console.log(prodlot);
//         console.log(prodprice);
//         console.log(prodprofit);

//         db.run(inscommand,[pid,prodname,prodlot,prodprice,prodprofit],err=>{
//             if(err){
//             console.log("ERROR");
//             console.log(err.message);
//             // respi.send(err.message);
//             }
//         });
//         respi.send("Addedd Successfully");
//         respi.end();
//     }
//     catch(err){
//         respi.send(err.message);
//         respi.end();
//     }

// })

app.get("/products",function(ireq,iresp,next){
    console.log("getstarted   "+new Date().getUTCMilliseconds());
    var query="SELECT * FROM products";
    var iparm=[];
    db.all(query,iparm,(err,rows)=>{
        if(err){
            iresp.send("Error While fetching data");
            iresp.end();
            console.log(err.message);
        }
        iresp.json({
            rows
        })
        iresp.end();
    })
})


app.get("/products/closestock",function(req,resp,next){
    var date=req.query.date;
    var pid=req.query.pid;
    if(!date || !pid){
            resp.send({'status':'-1'});
            resp.end();
    }
    else{
    var inscommand='select * from closestock where closedate<date("'+date+'") and closepid="'+pid+'" ORDER by closedate desc limit 1';
    console.log(inscommand);
    db.all(inscommand, [], (err, rows) => {
        if (err) {
          throw err;
        }
        numrows=rows.length;
        console.log(numrows+" is num")
        if(numrows>0){
            resp.send(rows);
            resp.end();
        }
        else{
            resp.send({'status':'-1'});
            resp.end();
        }
      });
    }
})

app.get("/inven/sale",function(req,resp,next){
    var date=req.query.date;
    var vehicle=req.query.vehicle;
    var data=JSON.parse(req.query.data);
    console.log(data);
    data.map((x)=>{
        //(entryid VARCHAR(255)PRIMARY KEY,pid VARCHAR(255),openstock VARCHAR(255),closestock VARCHAR(255),salevalue VARCHAR(255),returnvalue VARCHAR(255),date VARCHAR(255),vehicle VARCHAR(255));")
        new Promise((resolve,reject)=>{
            var irand=Math.random();
            var idt=new Date().getTime();
            var entryid=md5(idt+";"+irand);
            var inscommand='INSERT INTO sale(entryid,pid,openstock,closestock,salevalue,returnvalue,date,vehicle) VALUES (?,?,?,?,?,?,?,?)';
            db.run(inscommand,[entryid,x.pid,x.ostock,x.cstock,x.istock,x.rstock,date,vehicle],err=>{
                if(err){
                console.log("ERROR");
                console.log(err.message);
                // respi.send(err.message);
                }
                else{
                    console.log("DONE "+entryid);
                }
            });
            inscommand='INSERT INTO closestock(closeid,closedate,closepid,stock) VALUES (?,?,?,?)';
            db.run(inscommand,[entryid,date,x.pid,x.cstock],err=>{
                if(err){
                console.log("ERROR");
                console.log(err.message);
                // respi.send(err.message);
                }
                else{
                    console.log("DONE "+entryid);
                }
            });
        })
    })



    // console.log(req.query.data);
    // var idate=req.query.date;
    // var vehicle=req.query.vehicle;
    // var data=req.body.data;
    // console.log(data);
    // var idt=JSON.parse(data);
    // console.log(idt.length);
    // (entryid VARCHAR(255)PRIMARY KEY,pid VARCHAR(255),openstock VARCHAR(255),closestock VARCHAR(255),salevalue VARCHAR(255),returnvalue VARCHAR(255),date VARCHAR(255),vehicle VARCHAR(255));")
        
    
    // data.map((res)=>{
    //     new Promise((resolve,reject)=>{
    //         var irand=Math.random();
    //         var idt=new Date().getTime();
    //         var entryid=md5(idt+";"+irand);
    //         db.run(inscommand,[entryid,data.pid,,data.open,prodlot,prodprice,prodprofit],err=>{
    //             if(err){
    //             console.log("ERROR");
    //             console.log(err.message);
    //             // respi.send(err.message);
    //             }
    //         });
    //     })
        
    // }).then((ex)=>{

    // })
    
})


app.listen(9444);

// return new Promise((resolve,reject)=>{
//         this.dbz.run(query,(err,rows)=>{
//             if(err){
//                 return reject(err);
//             }
//             return resolve(rows);
//         })
//     })