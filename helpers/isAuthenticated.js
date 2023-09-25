module.exports = {
    isAuthenticaded( req, res, next){
        if(req.isAuthenticated()){
            return next();
        }

        req.flash("error_msg", "Você deve estar logado para usar o sistema!")
        res.redirect("/")
    }
}