const errorMiddleware=(err,req,res,next)=>{
    if(err){
        console.log(err)
        return res.status(500).json({
            error: err.message || "Internal Server Error"
        })
    }

}
export default errorMiddleware

