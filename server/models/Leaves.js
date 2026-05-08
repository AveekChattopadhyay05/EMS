export class Leaves{
    constructor(db){
        this.db = db;
    }
    getAdminLeaves(callback){
        const sql=`SELECT 
    l.id,
    e.name AS employee_name,
    l.leave_type,
    l.start_date,
    l.end_date,
    l.status
FROM leaves l
JOIN employees e ON l.employee_id = e.id
WHERE l.status IN ('Approved', 'Rejected')
ORDER BY l.id DESC`;
this.db.query(sql,(err,res)=>{
    if(err)return callback(err);
    callback(null,res)
})


    }
}
