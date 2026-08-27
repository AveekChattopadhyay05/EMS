import mysql  from "mysql" 
const db=mysql.createConnection({
    host: "127.0.0.1",
    user: 'root',
    password: 'aveekSql123',
    database: 'ems'
})

db.connect((err)=>{
  if(err){
    console.error("MySQL Connection Failed",err)
    return
  }
  console.log("MySql Connected")
})
export default db;

