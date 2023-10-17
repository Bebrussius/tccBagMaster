module.exports = {
    isFuncaoPedidos( req, res, next){
        if(req.user && req.user.funcao === "Pedidos" || req.user && req.user.funcao === "Administrador"){
            return next();
        }

        req.flash("error_msg", "Não tem permissão para ver seção Pedidos, és seção Empresas")
        res.redirect("/")
    }
}