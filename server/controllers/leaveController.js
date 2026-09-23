import Leaves from "../models/Leaves.js"

const getAdminLeaves=async(req,res,next)=>{
    try{
        const result=await  Leaves.getAdminLeaves()
        return res.status(200).json(result)

    }
    catch(err){
        next(err)
    }
}
const getSummary = async (req, res, next) => {
    try {
        const employeeId = req.user.employee_id;

        const result = await Leaves.getSummary(employeeId);

        return res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
}
const applyLeave = async (req, res, next) => {
    try {

        const employeeId = req.user.employee_id;

        const { type, fromDate, toDate, totDays, reason } = req.body;

        const result = await Leaves.applyLeave(
            employeeId,
            type,
            fromDate,
            toDate,
            totDays,
            reason
        );

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}
const cancelLeave = async (req, res, next) => {
    try {

        const leaveId = req.params.id;
        const employeeId = req.user.employee_id;

        const result = await Leaves.cancelLeave(
            leaveId,
            employeeId
        );

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}
const getHistory = async (req, res, next) => {
    try {

        const employeeId = req.user.employee_id;

        const result = await Leaves.getHistory(employeeId);

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}
const getPendingApprovals = async (req, res, next) => {
    try {

        const leadId = req.user.employee_id;

        const result = await Leaves.getPendingApprovals(leadId);

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}
const approveLeave = async (req, res, next) => {
    try {

        const leaveId = req.params.id;
        const leadId = req.user.employee_id;

        const result = await Leaves.approveLeave(
            leaveId,
            leadId
        );

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}
const rejectLeave = async (req, res, next) => {
    try {

        const leaveId = req.params.id;

        const result = await Leaves.rejectLeave(leaveId);

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}
const getApprovalHistory = async (req, res, next) => {
    try {

        const leadId = req.user.employee_id;

        const result = await Leaves.getApprovalHistory(leadId);

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}
const getAdminApprovalList = async (req, res, next) => {
    try {

        const result = await Leaves.getAdminApprovalList();

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}
const getAdminApprovalHistory = async (req, res, next) => {
    try {

        const result = await Leaves.getAdminApprovalHistory();

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}
const getAdminSummary=async(req,res,next)=>{
    try{
        const result=await Leaves.getAdminSummary()
        return res.status(200).json(result)

    }
    catch(err){
        next(err)
    }
}
export {
    getAdminLeaves,
    getSummary,
    applyLeave,
    cancelLeave,
    getHistory,
    getPendingApprovals,
    approveLeave,
    rejectLeave,
    getApprovalHistory,
    getAdminApprovalList,
    getAdminApprovalHistory,
    getAdminSummary
};