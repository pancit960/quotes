//session auth for EJS vierws

function requireSession(req, res, next) {
    if(!req.session || !req.session.user) {
        return res.redirect('/auth/login');
    }

    //make user available in ejs
    res.locals.user = req.session.user;
    next();
}

function requireSessionRole(...roles) {
    return (req, res, next) => {
        if(!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }

        if(!roles.includes(req.session.user.role)) {
            return res.status(403).senc('Access denied');
        }
        res.locals.user = req.session.user;
        next();
    }
}

module.exports = {requireSession, requireSessionRole};