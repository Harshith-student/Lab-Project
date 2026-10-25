import jwt from "jsonwebtoken"

export const genToken = (customerId)=>{
    const token = jwt.sign({id : customerId},process.env.JWT_SECRET,{
        expiresIn : "15d"
    })
    return token
}