import jwt from 'jsonwebtoken';

module.exports = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        
        return res.status(403).send({
            message: "No token provided"
        })
    }
    
    jwt.verify(token, process.env.JWT_Pass, (err, decoded) => {
        if (err) {
            console.log(err)
            return res.status(401).send({
                message: "Unauthorized"
            })
        }
        req.decoded = decoded
        next();
    });

}