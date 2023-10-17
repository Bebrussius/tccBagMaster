module.exports = {
    isFuncaoAdministrador( req, res, next){
        if(req.user && req.user.funcao === "Administrador"){
            return next();
        }

        req.flash("error_msg", "Não tem permissão para ver. Apenas administrador")
        res.redirect("/")
    }
}