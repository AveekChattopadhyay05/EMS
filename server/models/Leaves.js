import { resolve } from "path";
import db from "../config/db.js";

class Leaves{
   static getAdminLeaves(){
    return new Promise((resolve,reject)=>{
        const getLeavesSql=`SELECT 
    l.id,
    e.name AS employee_name,
    l.leave_type,
    l.start_date,
    l.end_date,
    l.status
FROM leaves l
JOIN employees e ON l.employee_id = e.id
WHERE l.status IN ('Approved', 'Rejected')
ORDER BY l.id DESC`
   db.query(getLeavesSql,(err,result)=>{
    if(err){
        return reject(err)
    }
    if(result.length===0){
        return reject(new Error('No leave applications right now'))
    }
    resolve(result)
   })
    })
   }
   static getSummary(employeeId) {
    return new Promise((resolve, reject) => {

        const SickSql = `
            SELECT SUM(total_days) AS used
            FROM leaves
            WHERE employee_id = ?
            AND leave_type = 'Sick Leave'
            AND status = 'Approved'
        `;

        const CasSql = `
            SELECT SUM(total_days) AS used
            FROM leaves
            WHERE employee_id = ?
            AND leave_type = 'Casual Leave'
            AND status = 'Approved'
        `;

        const EarnedSql = `
            SELECT SUM(total_days) AS used
            FROM leaves
            WHERE employee_id = ?
            AND leave_type = 'Earned Leave'
            AND status = 'Approved'
        `;

        const TotSql = `
            SELECT sick_total, casual_total, earned_total
            FROM leave_policy
        `;

        db.query(SickSql, [employeeId], (err, SickUsedResult) => {

            if (err) {
                return reject(err);
            }

            const SickUsed = SickUsedResult[0].used || 0;

            db.query(CasSql, [employeeId], (err, CasUsedResult) => {

                if (err) {
                    return reject(err);
                }

                const CasualUsed = CasUsedResult[0].used || 0;

                db.query(EarnedSql, [employeeId], (err, EarnedUsedResult) => {

                    if (err) {
                        return reject(err);
                    }

                    const EarnedUsed = EarnedUsedResult[0].used || 0;

                    db.query(TotSql, (err, TotAvailResult) => {

                        if (err) {
                            return reject(err);
                        }

                        const policy = TotAvailResult[0];

                        resolve({
                            sick: {
                                total: policy.sick_total,
                                used: SickUsed,
                                remaining: policy.sick_total - SickUsed
                            },

                            casual: {
                                total: policy.casual_total,
                                used: CasualUsed,
                                remaining: policy.casual_total - CasualUsed
                            },

                            earned: {
                                total: policy.earned_total,
                                used: EarnedUsed,
                                remaining: policy.earned_total - EarnedUsed
                            }
                        });
                    });
                });
            });
        });
    });
}
static applyLeave(employeeId, type, fromDate, toDate, totDays, reason) {
    return new Promise((resolve, reject) => {

        if (!type || !fromDate || !toDate || !reason) {
            return reject(new Error("All fields are required."));
        }

        const start = new Date(fromDate);
        const end = new Date(toDate);

        if (end < start) {
            return reject(new Error("Invalid date range."));
        }

        const diffTime = end - start;
        const diffDays =
            diffTime / (1000 * 60 * 60 * 24) + 1;

        if (diffDays !== totDays) {
            return reject(
                new Error("Total days mismatch. Invalid request.")
            );
        }

        const insert = `
            INSERT INTO leaves
            (employee_id, leave_type, start_date, end_date, total_days, reason, status)
            VALUES (?, ?, ?, ?, ?, ?, 'Pending')
        `;

        db.query(
            insert,
            [employeeId, type, fromDate, toDate, totDays, reason],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                resolve({
                    success: "Apply successful"
                });
            }
        );
    });
}
static cancelLeave(leaveId, employeeId) {
    return new Promise((resolve, reject) => {

        const deleteQuery = `
            DELETE FROM leaves
            WHERE id = ?
            AND employee_id = ?
            AND status = 'Pending'
        `;

        db.query(
            deleteQuery,
            [leaveId, employeeId],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                if (result.affectedRows === 0) {
                    return reject(
                        new Error("Cannot cancel this leave.")
                    );
                }

                resolve({
                    success: "Leave cancelled successfully"
                });
            }
        );
    });
}
static getHistory(employeeId) {
    return new Promise((resolve, reject) => {

        const history = `
            SELECT 
                id,
                employee_id,
                leave_type,
                start_date,
                end_date,
                total_days,
                reason,
                status
            FROM leaves
            WHERE employee_id = ?
            ORDER BY id DESC
        `;

        db.query(history, [employeeId], (err, result) => {

            if (err) {
                return reject(err);
            }

            const formattedResult = result.map(leave => ({
                id: leave.id,
                employee_id: leave.employee_id,
                type: leave.leave_type,
                startDate: leave.start_date.toISOString().split("T")[0],
                endDate: leave.end_date.toISOString().split("T")[0],
                total: leave.total_days,
                reason: leave.reason,
                status: leave.status
            }));

            resolve(formattedResult);
        });
    });
}
static getPendingApprovals(leadId) {
    return new Promise((resolve, reject) => {

        const toApprove = `
            SELECT 
                l.id,
                l.employee_id,
                e.name,
                l.leave_type,
                l.start_date,
                l.end_date,
                l.total_days,
                l.reason,
                l.status
            FROM leaves l
            JOIN employees e ON l.employee_id = e.id
            WHERE e.lead_id = ?
            AND l.status = 'Pending'
            ORDER BY l.start_date DESC
        `;

        db.query(toApprove, [leadId], (err, result) => {

            if (err) {
                return reject(err);
            }

            const formatResult = result.map(leave => ({
                id: leave.id,
                name: leave.name,
                type: leave.leave_type,
                from: leave.start_date.toISOString().split("T")[0],
                to: leave.end_date.toISOString().split("T")[0],
                total: leave.total_days,
                reason: leave.reason,
                status: leave.status
            }));

            resolve(formatResult);
        });
    });
}
static approveLeave(leaveId, leadId) {
    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE leaves l
            JOIN employees e ON l.employee_id = e.id
            SET l.status = 'Approved'
            WHERE l.id = ?
            AND e.lead_id = ?
        `;

        db.query(sql, [leaveId, leadId], (err, result) => {

            if (err) {
                return reject(err);
            }

            resolve({
                message: "Update Success"
            });
        });
    });
}
static rejectLeave(leaveId) {
    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE leaves
            SET status = 'Rejected'
            WHERE id = ?
        `;

        db.query(sql, [leaveId], (err, result) => {

            if (err) {
                return reject(err);
            }

            resolve({
                message: "Leave Rejected"
            });
        });
    });
}
static getApprovalHistory(leadId) {
    return new Promise((resolve, reject) => {

        const histCheck = `
            SELECT 
                l.id,
                l.employee_id,
                e.name,
                l.leave_type,
                l.start_date,
                l.end_date,
                l.total_days,
                l.reason,
                l.status
            FROM leaves l
            JOIN employees e ON l.employee_id = e.id
            WHERE e.lead_id = ?
            AND l.status IN ('Approved', 'Rejected')
            ORDER BY l.id DESC
        `;

        db.query(histCheck, [leadId], (err, result) => {

            if (err) {
                return reject(err);
            }

            const formatResult = result.map(leave => ({
                id: leave.id,
                name: leave.name,
                type: leave.leave_type,
                from: leave.start_date.toISOString().split("T")[0],
                to: leave.end_date.toISOString().split("T")[0],
                total: leave.total_days,
                reason: leave.reason,
                status: leave.status
            }));

            resolve(formatResult);
        });
    });

}
static getAdminApprovalList() {
    return new Promise((resolve, reject) => {

        const toApprove = `
            SELECT 
                l.id,
                l.employee_id,
                e.name,
                l.leave_type,
                l.start_date,
                l.end_date,
                l.total_days,
                l.reason,
                l.status
            FROM leaves l
            JOIN employees e ON l.employee_id = e.id
            WHERE e.Dept_Lead = ?
            AND l.status = 'Pending'
            ORDER BY l.start_date DESC
        `;

        db.query(toApprove, ['admin'], (err, result) => {

            if (err) {
                return reject(err);
            }

            const formatResult = result.map(leave => ({
                id: leave.id,
                name: leave.name,
                type: leave.leave_type,
                from: leave.start_date.toISOString().split("T")[0],
                to: leave.end_date.toISOString().split("T")[0],
                total: leave.total_days,
                reason: leave.reason,
                status: leave.status
            }));

            resolve(formatResult);
        });
    });
}
static getAdminApprovalHistory() {
    return new Promise((resolve, reject) => {

        const histCheck = `
            SELECT 
                l.id,
                l.employee_id,
                e.name,
                l.leave_type,
                l.start_date,
                l.end_date,
                l.total_days,
                l.reason,
                l.status
            FROM leaves l
            JOIN employees e ON l.employee_id = e.id
            WHERE e.Dept_Lead = ?
            AND l.status IN ('Approved', 'Rejected')
            ORDER BY l.id DESC
        `;

        db.query(histCheck, ['admin'], (err, result) => {

            if (err) {
                return reject(err);
            }

            const formatResult = result.map(leave => ({
                id: leave.id,
                name: leave.name,
                type: leave.leave_type,
                from: leave.start_date.toISOString().split("T")[0],
                to: leave.end_date.toISOString().split("T")[0],
                total: leave.total_days,
                reason: leave.reason,
                status: leave.status
            }));

            resolve(formatResult);
        });
    });
}
static getAdminSummary(){
    return new Promise((resolve,reject)=>{
         const empsql=`SELECT id FROM employees`
  const deptsql=`SELECT dept_id FROM departments`
  const leavesql=`SELECT id FROM leaves`
  const appLeavesql=`SELECT id FROM leaves WHERE status='Approved'`
  const penLeavesql=`SELECT id FROM leaves WHERE status='Pending'`
  const rejLeavesql=`SELECT id FROM leaves WHERE status='Rejected'`
  db.query(empsql,(err,EmpResult)=>{
    if(err){
      return reject(err)
    }
    const EmpID=EmpResult.length
  
  db.query(deptsql,(err,DeptResult)=>{
    if(err){
      return reject(err)
    }
    const DeptId=DeptResult.length
  db.query(leavesql,(err,LeaveResult)=>{
    if(err){
      return reject(err)
    }
    const totLeaves=LeaveResult.length
   db.query(appLeavesql,(err,AppLeaveResult)=>{
    if(err){
      return reject(err)
    }
  const approved=AppLeaveResult.length
  db.query(penLeavesql,(err,PenLeaveResult)=>{
    if(err){
      return reject(err)
    }
  const pending=PenLeaveResult.length
  db.query(rejLeavesql,(err,RejLeaveResult)=>{
    if(err){
      return reject(err)
    }
  const rejected=RejLeaveResult.length
  
  resolve ({
    employees:EmpID,
    department:DeptId,
    total:totLeaves,
    pending:pending,
    approved:approved,
    rejected:rejected

  })
  })
})
  })
})
  })
})
    })

}
}
export default Leaves