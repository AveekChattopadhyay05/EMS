export class Department{
    constructor(db){
        this.db = db;
    }
    addDepartment(deptName,description,callback){
        const sql = "INSERT INTO departments (dept_name, description) VALUES (?, ?)";
        this.db.query(sql, [deptName, description], (err, result) => {
            if(err) return callback(err);
            callback(null, result);
        });
    }
    updateDepartment(oldName, newName, description, callback){
        const sql = "UPDATE departments SET dept_name = ?, description = ? WHERE dept_name = ?";
        this.db.query(sql, [newName, description, oldName], (err, result) => {
            if(err) return callback(err);
            callback(null, result);
        });
    }
    deleteDepartment(id, callback) {
  const sql = "DELETE FROM departments WHERE dept_id = ?";
  this.db.query(sql, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
}

    listDepartments(callback){
        const sql = "SELECT * FROM departments";
        this.db.query(sql, (err, results) => {
            if(err) return callback(err);
            callback(null, results);
        });
    }
}