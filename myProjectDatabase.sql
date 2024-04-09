create database projectDatabase;
use projectDatabase;

create table users(emailId varchar(100) primary key,pwd varchar(100),userType varchar(20),dos date,userStatus int);
select * from users; 
select * from users where emailId="rishabhsaggar30@gmail.com" and pwd="myAdmin@123";
select userStatus from users where emailId="rishabhsaggar30@gmail.com";

create table customer_info(email varchar(100) primary key,cname varchar(50),cnumber varchar(15),address varchar(100),city varchar(30),state varchar(20),ppic varchar(100));
select* from customer_info;

select * from users where emailId="rishabhsaggar30@gmail.com" and pwd="123";
update users set pwd="123" where emailId="rishabhsaggar30@gmail.com";

alter table users modify userType varchar(50);

create table providers(emailid varchar(100), pname varchar(50), pnumber varchar(15),gender varchar(20), faddress varchar(100), haddress varchar(100),city varchar(40),state varchar(20),category varchar(100),firm varchar(100), website varchar(100), since int , idproof varchar(100), otherinfo varchar(1000)); 
select * from providers;

create table tasks(rid int primary key auto_increment , emailid varchar(100),category varchar(100), address varchar(100), city varchar(50),state varchar(50), upto date, otherinfo varchar(1000));
select * from tasks;

alter table providers modify state varchar(50);
alter table providers modify emailid varchar(100) primary key;
alter table providers modify since date;
alter table customer_info modify state varchar(50);



