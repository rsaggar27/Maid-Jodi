const express = require("express");
const app = express();
const fileuploader = require("express-fileupload");
const mysql2 = require("mysql2");
const nodemailer = require("nodemailer");
const mailgen = require("mailgen");

app.listen(2707, function () {
  console.log("Server Started at 2707 :)");
});

//=================================================
app.use(express.urlencoded({ extended: true }));
app.use(fileuploader());
app.use(express.static("public"));

//=======================================================
//Connecting to mySql and DataBase
const objConfig = {
  host: "127.0.0.1",
  user: "root",
  password: "Admin123",
  database: "projectDatabase",
  dateStrings: true, //isse hum date ko bhi fetch kr paate hain
};

const mysql = mysql2.createConnection(objConfig);

mysql.connect(function (err) {
  if (err == null) console.log("Connected to database");
  else console.log(err.message);
});
//===========================================================
app.get("/", function (req, resp) {
  let filepath = process.cwd() + "/public/index.html";
  resp.sendFile(filepath);
});

//create table users(emailId varchar(100) primary key,pwd varchar(100),userType varchar(10),dos date,userStatus int);
app.get("/sign_up", function (req, resp) {
  const emailId = req.query.kuchEmail;
  const pwd = req.query.kuchPass;
  const uType = req.query.kuchType;

  console.log(req.query);

  mysql.query(
    "select * from users where emailId=?",
    [emailId],
    function (err, resultJsonAry) {
      if (resultJsonAry.length == 1) {
        console.log("Email id already exist");
        resp.send("Email id already exist");
      } else {
        mysql.query(
          "insert into users values(?,?,?,current_date,1)",
          [emailId, pwd, uType],
          function (err) {
            if (err == null) {
              console.log(uType);
              resp.send(uType);
            } else {
              console.log(err.message);
              resp.send(err);
            }
          }
        );
      }
    }
  );
});

app.get("/login", function (req, resp) {
  console.log(req.query);
  //login query
  mysql.query(
    "select * from users where emailId=? and pwd=?",
    [req.query.loginEmail, req.query.loginPwd],
    function (err, resultJsonAry) {
      //console.log(JSON.stringify(resultJsonAry));

      if (err != null) {
        console.log(err);
        resp.send(err);
        return;
      }

      if (resultJsonAry.length == 1) {
        if (resultJsonAry[0].userStatus === 1) {
          console.log("Login successful. UserType:", resultJsonAry[0].userType);
          resp.send(resultJsonAry[0].userType);
        } else {
          console.log("User is blocked.");
          resp.send("User-Blocked");
        }
      } else {
        console.log("Invalid email or password.");
        resp.send("Invalid Email or Password");
      }
    }
  );
});

app.get("/check-email", function (req, resp) {
  const emailId = req.query.kuchEmail;

  mysql.query(
    "select * from users where emailId=?",
    [emailId],
    function (err, resultJsonAry) {
      if (resultJsonAry.length == 1) {
        console.log("Email id already exist");
        resp.send("Email id already exist");
      } else {
        console.log("Email id Available");
        resp.send("Email id Available");
      }
    }
  );
});
//create table customer_info(email varchar(100) primary key,cname varchar(50),cnumber varchar(15),address varchar(100),city varchar(30),state varchar(20),ppic varchar(100));
app.post("/profile-save", function (req, resp) {
  console.log(req.query);
  const email = req.body.txtEmail;
  const name = req.body.txtName;
  const cnumber = req.body.txtNumber;
  const address = req.body.txtAdd;
  const city = req.body.selCity;
  const state = req.body.selState;

  //pic-uploading

  let filename;
  if (req.files == null) filename = "nopic.jpg";
  else {
    filename = req.files.ppic.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.ppic.mv(path);
  }
  req.body.ppic = filename; //why this?

  mysql.query(
    "insert into customer_info values(?,?,?,?,?,?,?)",
    [email, name, cnumber, address, city, state, filename],
    function (err) {
      if (err == null) {
        alert("RECORD SAVED SUCCESSFULLY");
        location.href="/public/customer-profile.html";
      } else {
        console.log(err);
        resp.send(err.message);
      }
    }
  );
});

app.post("/profile-update", function (req, resp) {
  const email = req.body.txtEmail;
  const name = req.body.txtName;
  const cnumber = req.body.txtNumber;
  const address = req.body.txtAdd;
  const city = req.body.selCity;
  const state = req.body.selState;

  //pic-uploading

  let filename;
  if (req.files == null) {
    filename = "nopic.jpg";

  } else {
    filename = req.files.ppic.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.ppic.mv(path);
  }
  req.body.ppic = filename; //why this?

  mysql.query(
    "update customer_info set cname=?, cnumber=?, address=?, city=?, state=?, ppic=? where email=? ",
    [name, cnumber, address, city, state, filename, email],
    function (err,respJson) {
      if (err == null) {
        console.log(respJson);
        resp.send("RECORD UPDATED SUCCESSFULLY");
      } else {
        resp.send(err.message);
      }
    }
  );
});

app.get("/fetch-one", function (req, resp) {
  // console.log(req.query);
  mysql.query(
    "select * from customer_info where email=?",
    [req.query.kuchEmail],
    function (err, resultJsonAry) {
      if (err != null) {
        alert("Invalid Infomation");
        // console.log(err);
        resp.send(err);
        return;
      }
      // console.log(resultJsonAry);
      resp.send(resultJsonAry);
    }
  );
});

app.get("/pwd-change", function (req, resp) {
  console.log(req.query);
  mysql.query(
    "select * from users where emailId=? and pwd=?",
    [req.query.bssEmail, req.query.kuchOldPwd],
    function (err, respJsonAry) {
      console.log(respJsonAry);

      if (err != null) {
        console.log(err);
        resp.send(err);
        return;
      }

      if (respJsonAry.length >= 1) {
        mysql.query(
          "update users set pwd=? where emailId=?",
          [req.query.kuchNewPwd, req.query.kuchEmail],
          function (err) {
            if (err != null) {
              console.log(err);
              resp.send(err);
              return;
            }
            resp.send("PassWord updated Successfully");
          }
        );
      } else {
        resp.send("Invalid Email Id or PassWord");
      }
    }
  );
});

//create table providers(emailid varchar(100), pname varchar(50), pnumber varchar(15),gender varchar(20), faddress varchar(100), haddress varchar(100),city varchar(40),state varchar(20),category varchar(100),firm varchar(100), website varchar(100), since int , idproof varchar(100), otherinfo varchar(1000));

app.post("/profile-provider-save", function (req, resp) {
  const email = req.body.txtEmail;
  const pname = req.body.txtPName;
  const pnumber = req.body.txtNumber;
  const gender = req.body.selGender;
  const category = req.body.selCategory;
  const firm = req.body.txtFirm;
  const web = req.body.txtWeb;
  const fAddress = req.body.txtFAdd;
  const hAddress = req.body.txtHAdd;
  const city = req.body.selCity;
  const state = req.body.selState;
  const since = req.body.dtSince;
  const others = req.body.otherInfo;

  //pic-uploading

  let filename;
  if (req.files == null) filename = "nopic.jpg";
  else {
    filename = req.files.idPic.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.idPic.mv(path);
  }
  req.body.idPic = filename; //why this?

  mysql.query(
    "insert into providers values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      email,
      pname,
      pnumber,
      gender,
      fAddress,
      hAddress,
      city,
      state,
      category,
      firm,
      web,
      since,
      filename,
      others,
    ],
    function (err) {
      if (err == null) {
        resp.send("RECORD SAVED SUCCESSFULLY");
      } else {
        resp.send(err.message);
      }
    }
  );
});

app.post("/profile-provider-update", function (req, resp) {
  console.log(req.body);
  const email = req.body.txtEmail;
  const pname = req.body.txtPName;
  const pnumber = req.body.txtNumber;
  const gender = req.body.selGender;
  const category = req.body.selCategory;
  const firm = req.body.txtFirm;
  const web = req.body.txtWeb;
  const fAddress = req.body.txtFAdd;
  const hAddress = req.body.txtHAdd;
  const city = req.body.selCity;
  const state = req.body.selState;
  const since = req.body.dtSince;
  const others = req.body.otherInfo;

  //pic-uploading

  let filename;
  if (req.files == null) filename = "nopic.jpg";
  else {
    filename = req.files.idPic.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.idPic.mv(path);
  }
  req.body.idPic = filename; //why this?

  mysql.query(
    "update providers set pname=?, pnumber=?,gender=?,faddress=?,haddress=?,city=?,state=?,category=?,firm=?,website=?,since=?,idproof=?,otherinfo=? where emailid=? ",
    [
      pname,
      pnumber,
      gender,
      fAddress,
      hAddress,
      city,
      state,
      category,
      firm,
      web,
      since,
      filename,
      others,
      email,
    ],
    function (err) {
      if (err == null) {
        //console.log(respJsonAry);
        resp.send("RECORD UPDATED SUCCESSFULLY");
      } else {
        resp.send(err.message);
      }
    }
  );
});

app.get("/fetch-one-provider", function (req, resp) {
  mysql.query(
    "select * from providers where emailid=?",
    [req.query.kuchEmail],
    function (err, resultJsonAry) {
      if (err != null) {
        console.log(err);
        resp.send(err);
        return;
      }
      //console.log(resultJsonAry);
      resp.send(resultJsonAry);
    }
  );
});
//create table tasks(rid int primary key auto_increment , emailid varchar(100),category varchar(100), address varchar(100), city varchar(50),state varchar(50), upto date, otherinfo varchar(1000));

app.get("/post-task", function (req, resp) {
  console.log(req.query);
  mysql.query(
    "insert into tasks values(?,?,?,?,?,?,?,?)",
    [
      0,
      req.query.email,
      req.query.category,
      req.query.address,
      req.query.city,
      req.query.state,
      req.query.upto,
      req.query.info,
    ],
    function (err) {
      if (err != null) {
        console.log(err);
        return;
      }
      //return;
      resp.send("Task-Posted");
    }
  );
});

app.get("/doFetchUsers", function (req, resp) {
  //akela resp nahi chlta kyuki akela resp exist nahi krta...system confuse ho jata ki kyaa yeh req hai yaa resp
  mysql.query("select * from users", function (err, resultJsonAry) {
    if (err != null) {
      console.log(err);
      resp.send(err);
      return;
    }
    //console.log(resultJsonAry);
    resp.send(resultJsonAry);
  });
});

app.get("/do-block-Admin", function (req, resp) {
  mysql.query(
    "select * from users where emailId=?",
    [req.query.kuchEmail],
    function (err, result) {
      if (err != null) {
        console.log(err);
        resp.send(err);
      }
      console.log(result);
      if (result[0].userStatus == 1) {
        mysql.query(
          "update users set userStatus=0 where emailId=?",
          [req.query.kuchEmail],
          function (err) {
            if (err != null) {
              resp.send(err);
            }
            resp.send("User Blocked");
          }
        );
      } else {
        mysql.query(
          "update users set userStatus=1 where emailId=?",
          [req.query.kuchEmail],
          function (err) {
            if (err != null) {
              resp.send(err);
            }
            resp.send("User Unblocked");
          }
        );
      }
    }
  );
});
/*
app.get("/doFetchTask",function(req,resp){ //akela resp nahi chlta kyuki akela resp exist nahi krta...system confuse ho jata ki kyaa yeh req hai yaa resp
    
    var email=req.query.kuchEmail;
    
    mysql.query("select * from tasks where emailid=?",[email],function(err,resultJsonAry){
        if(err!=null){
          console.log(err);
          resp.send(err);
          return;
        }
        //console.log(resultJsonAry);
        resp.send(resultJsonAry);
    })
}) */

app.get("/doFetchTask", function (req, resp) {
  //akela resp nahi chlta kyuki akela resp exist nahi krta...system confuse ho jata ki kyaa yeh req hai yaa resp

  var email=req.query.kuchEmail;

  mysql.query("select * from tasks where emailid=?",[email], function (err, resultJsonAry) {
    if (err != null) {
      console.log(err);
      resp.send(err);
      return;
    }
    //console.log(resultJsonAry);
    resp.send(resultJsonAry);
  });
});

app.get("/doDelete", function (req, resp) {
  //const email=req.query.emailkuch;
  mysql.query(
    "delete from tasks where rid=?",
    [req.query.rid],
    function (err, result) {
      if (err == null) {
        if (result.affectedRows == 1)
          resp.send("Record Deleted Successfullyyy");
        else resp.send("Inavlid ID");
      } else resp.send(err.message);
    }
  );
});

app.get("/doFetchProviders", function (req, resp) {
  mysql.query("select * from providers", function (err, resultJsonAry) {
    if (err != null) {
      console.log(err);
      resp.send(err);
      return;
    }
    //console.log(resultJsonAry);
    resp.send(resultJsonAry);
  });
});

app.get("/doFetchCustomers", function (req, resp) {
  mysql.query("select * from customer_info", function (err, resultJsonAry) {
    if (err != null) {
      console.log(err);
      resp.send(err);
      return;
    }
    //console.log(resultJsonAry);
    resp.send(resultJsonAry);
  });
});

app.get("/doFetchTasks", function (req, resp) {
  mysql.query("select * from tasks", function (err, resultJsonAry) {
    if (err != null) {
      console.log(err);
      resp.send(err);
      return;
    }
    //console.log(resultJsonAry);
    resp.send(resultJsonAry);
  });
});

app.get("/fetch-distinct-cities", function (req, resp) {
  mysql.query("select distinct city from tasks", function (err, resultJsonAry) {
    if (err != null) {
      console.log(err);
      resp.send(err);
      return;
    }
    //console.log(resultJsonAry);
    resp.send(resultJsonAry);
  });
});

app.get("/fetch-distinct-category", function (req, resp) {
  mysql.query(
    "select distinct category from tasks where city=?",
    [req.query.kuchCity],
    function (err, resultJsonAry) {
      if (err != null) {
        console.log(err);
        resp.send(err);
        return;
      }
      //console.log(resultJsonAry);
      resp.send(resultJsonAry);
    }
  );
});

app.get("/search-work", function (req, resp) {
  //console.log(req.query);
  mysql.query(
    "select * from tasks where city=? and category=?",
    [req.query.kuchCity, req.query.kuchCat],
    function (err, resultJsonAry) {
      if (err != null) {
        console.log(err);
        resp.send(err);
        return;
      }
      //console.log(resultJsonAry);
      resp.send(resultJsonAry);
    }
  );
});

app.get("/doFetchUsers", function (req, resp) {
  mysql.query("select * from customer_info", function (err, resultJsonAry) {
    if (err != null) {
      console.log(err);
      resp.send(err);
      return;
    }
    //console.log(resultJsonAry);
    resp.send(resultJsonAry);
  });
});

app.get("/doFetchUsers", function (req, resp) {
  mysql.query("select * from customer_info", function (err, resultJsonAry) {
    if (err != null) {
      console.log(err);
      resp.send(err);
      return;
    }
    //console.log(resultJsonAry);
    resp.send(resultJsonAry);
  });
});

app.get("/forgetPassword", function (req, resp) {
  const email = req.query.loginEmail;
  console.log(req.query);

  mysql.query(
    "select * from users where emailId=?",
    [email],
    function (err, respJsonAry) {
      console.log(respJsonAry[0]);
      if (respJsonAry.length == 1) {
        console.log(respJsonAry[0]);
        const Password = respJsonAry[0].pwd;
        const UserName = respJsonAry[0].emailId;

        console.log("Username:" + UserName);

        let config = {
          service: "gmail",
          auth: {
            user: "rishabhsaggar927@gmail.com",
            pass: "xjiu qwwe mpqs ohej",
          },
        };

        let transporter = nodemailer.createTransport(config);

        let MailGenerator = new mailgen({
          theme: "default",
          product: {
            name: UserName,
            link: "https://mailgen.js/",
          },
        });

        let response = {
          body: {
            name: UserName,
            intro: "Password of your email account",
            table: {
              data: [
                {
                  Email_Id: UserName,
                  Password: Password,
                },
              ],
            },
            outro: "Do change your password from the settings in the dashboard",
          },
        };

        console.log(response);

        let mail = MailGenerator.generate(response);

        let message = {
          from: "rishabhsaggar927@gmail.com",
          to: UserName,
          subject: "Password for your Account",

          html: mail,
        };

        transporter.sendMail(message);

        if (err != null) {
          resp.send(err);
        }

        resp.send("Mail Sent");
      } else {
        resp.send("Invalid EMail");
      }
    }
  );
});

app.get("/fetchAddCust",function(req,resp){
  mysql.query("select * from customer_info where email=?",[req.query.email],function(err,respJsonAry){
    if(err!=null){
      resp.send(err);
    }
    
    console.log(respJsonAry);
    resp.send(respJsonAry);
  })
})
