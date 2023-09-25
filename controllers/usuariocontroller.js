//-------------------------------------------------------------------------------------------------
const express = require('express')
const router = express.Router()
const Usuario = require('../models/usuariomodel')
const bcrypt = require('bcryptjs')
const { hash } = require('bcryptjs')
const passport = require('passport')
const {isAuthenticaded} = require("../helpers/isAuthenticated")
//-------------------------------------------------------------------------------------------------
router.get('/',(req,res) => {
  Usuario.findAll().then((usuarios) => {
    res.render('funcionariosviews/gerenciaview',{usuarios:usuarios})
  }).catch((erro) => {
    req.flash('erros_msg','Houve ou erro ao listar usuários!')
    console.log(erro)
    res.redirect('/')
  })
})
//-------------------------------------------------------------------------------------------------
router.get('/exibirinclusaoroute',isAuthenticaded,(req,res) => {
  res.render('funcionariosviews/inclusaoview')
})
//-------------------------------------------------------------------------------------------------
router.post('/incluirroute',(req,res) => {
  var erros = []
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({texto:'Nome inválido!'})
  }
  if (!req.body.telefone || typeof req.body.telefone == undefined || req.body.telefone == null) {
    erros.push({texto:'Telefone inválido!'})
  }
  if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
    erros.push({texto:'Email inválido!'})
  }
  if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
    erros.push({texto:'Senha inválida!'})
  }
  if (erros.length > 0) {
    res.render('/inclusaoview',{erros:erros})
  } else {
    Usuario.findOne({ where: {email:req.body.email}}).then((usuario) => {
      if(usuario){
        req.flash("error_msg", "Já existe um usuário com esse email no sistema");
        res.redirect("/cadastro");
      } else {
        const novoUsuario = new Usuario({
          nome: req.body.nome,
          telefone: req.body.telefone,
          email: req.body.email,
          senha: req.body.senha
        })

        bcrypt.genSalt(10, (erro, salt) =>{
          bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
            if(erro){
              req.flash("error_msg", "Houve um erro durante o cadastro do usuário");
              res.redirect("/");
            }

            novoUsuario.senha = hash;

            novoUsuario.save().then(() =>{
              req.flash("succes_msg", "Usuário criado com sucesso!");
              res.redirect("/");
            }).catch((err) =>{
              req.flash("error_msg", "Houve um erro na criação do usuário!")
              res.redirect("/cadastro")
            })
          })
        })
      }
    })
  }
});

router.post('/incluirroutefuncionarios',(req,res) => {
  var erros = []
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({texto:'Nome inválido!'})
  }
  if (!req.body.telefone || typeof req.body.telefone == undefined || req.body.telefone == null) {
    erros.push({texto:'Telefone inválido!'})
  }
  if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
    erros.push({texto:'Email inválido!'})
  }
  if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
    erros.push({texto:'Senha inválida!'})
  }
  if (erros.length > 0) {
    res.render('/inclusaoview',{erros:erros})
  } else {
    Usuario.findOne({ where: {email:req.body.email}}).then((usuario) => {
      if(usuario){
        req.flash("error_msg", "Já existe um usuário com esse email no sistema");
        res.redirect("/cadastro");
      } else {
        const novoUsuario = new Usuario({
          nome: req.body.nome,
          telefone: req.body.telefone,
          email: req.body.email,
          senha: req.body.senha
        })

        bcrypt.genSalt(10, (erro, salt) =>{
          bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
            if(erro){
              req.flash("error_msg", "Houve um erro durante o cadastro do usuário");
              res.redirect("/");
            }

            novoUsuario.senha = hash;

            novoUsuario.save().then(() =>{
              req.flash("succes_msg", "Usuário criado com sucesso!");
              res.redirect("/usuarioroutes");
            }).catch((err) =>{
              req.flash("error_msg", "Houve um erro na criação do usuário!")
              res.redirect("/cadastro")
            })
          })
        })
      }
    })
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/empresaroutes",
    failureRedirect: "/login",
    failureFlash: true
  })(req, res, next)
})

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
      if (err) { return next(err) }
      res.redirect('/')
    })
})

//-------------------------------------------------------------------------------------------------
module.exports = router
//-------------------------------------------------------------------------------------------------

