module.exports = {
    isFuncaoEmpresas( req, res, next){
        if(req.user && req.user.funcao === "Empresa" || req.user && req.user.funcao === "Administrador"){
            return next();
        }

        req.flash("error_msg", "Não tem permissão para ver seção Empresas, és seção Pedidos")
        res.redirect("/")
    }
}
