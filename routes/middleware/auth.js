//Author: Riff Talsma
//Wil use our jsonwebtoken for authenticating staff, admins, hq, etc.

const jwt = require('jsonwebtoken');

//verify bearer token
function authenticate(req, res, next) {
    const header = req.headers.authorization || '';
    //extract token
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if(!token) {
        return res.status(401).json({success: false, message: 'Requires authentication!'});
    }

    console.log("JWT_SECRET = ", process.env.JWT_SECRET);
    console.log("TOKEN = ", token);

    //verify token and decode
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch(err) {
        res.status(401).json({success: false, message: 'Invalid/expired jwt token'});
    }
}

//to access hq, user needs to be either admin or hq role
//requireRole('admin) or requireRole('admin', 'hq')
function requireRole(...roles) {
    return(req, res, next) => {
        if(!req.user) {
            return res.status(401).json({success: false, message: 'Needs authentication'});
        }
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({success: false, message: 'No permissions'});
        }
        next();
    };
}

module.exports = {authenticate, requireRole};