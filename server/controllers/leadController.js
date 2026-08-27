import Lead from "../models/Lead.js";

const addLead = async (req, res, next) => {
    try {

        const { name, email, password, role } = req.body;

       const result = await Lead.addLead(name, email, password, role);

        return res.status(200).json(result);

    } catch (err) {

        next(err);

    }
}
const listLeads = async (req, res, next) => {
    try {

        const result = await Lead.listLeads();

        return res.status(200).json(result);

    } catch (err) {

        next(err);

    }
};
const resetPassword = async (req, res, next) => {
    try {
        const email = req.params.email;
        const { newPassword } = req.body;

        await Lead.resetPassword(email, newPassword);

        return res.status(200).json({
            success: "Password updated successfully"
        });

    } catch (err) {
        next(err);
    }
};
const deleteLead = async (req, res, next) => {
    try {

        const { email } = req.body;

        await Lead.deleteLead(email);

        return res.status(200).json({
            message: "Lead deleted successfully"
        });

    } catch (err) {

        next(err);

    }
}
const getLeadByEmail = async (req, res, next) => {
    try {
        const email = req.params.email;

        const result = await Lead.getLeadByEmail(email);

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
};
const updateLead = async (req, res, next) => {
    try {
        const email = req.params.email;

        const { newName, newEmail, password } = req.body;

        await Lead.updateLead(
            email,
            newName,
            newEmail,
            password
        );

        return res.status(200).json({
            message: "User updated successfully"
        });

    } catch (err) {
        next(err);
    }
};
export { addLead,listLeads,resetPassword,deleteLead,getLeadByEmail,updateLead }