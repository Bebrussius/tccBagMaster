//-------------------------------------------------------------------------------------------------

const express = require('express')
const router = express.Router()
const Usuario = require('../models/usuarioModel')
const bcrypt = require('bcryptjs')
const { hash } = require('bcryptjs')
const passport = require('passport')
const {isAuthenticaded} = require("../helpers/isAuthenticated")
const {isFuncaoAdministrador} = require("../helpers/isFuncaoAdministrador")

//-------------------------------------------------------------------------------------------------

router.get('/', isAuthenticaded,isFuncaoAdministrador,(req, res) => {
  Usuario.findAll({
    order: [['createdAt', 'DESC']] // Isso classificará por data de criação decrescente (mais recente primeiro)
  }).then((usuarios) => {
    res.render('funcionariosviews/gerenciaview', { usuarios: usuarios });
  }).catch((erro) => {
    req.flash('erros_msg', 'Houve um erro ao listar funcionários!');
    console.log(erro);
    res.redirect('/');
  });
});

//-------------------------------------------------------------------------------------------------

router.get('/exibirinclusaoroute',isAuthenticaded,isFuncaoAdministrador,(req,res) => {
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
  if (!req.body.funcao || typeof req.body.funcao == undefined || req.body.funcao == null) {
    erros.push({texto:'Função inválida!'})
  }
  if (erros.length > 0) {
    res.render('/inclusaoview',{erros:erros})
  } else {
    Usuario.findOne({ where: {email:req.body.email}}).then((usuario) => {
      if(usuario){
        req.flash("error_msg", "Já existe um usuário com esse email no sistema");
        res.redirect("/usuarioroutes");
      } else {
        const novoUsuario = new Usuario({
          nome: req.body.nome,
          telefone: req.body.telefone,
          email: req.body.email,
          senha: req.body.senha,
          funcao: req.body.funcao
        });

        novoUsuario.save().then(() =>{
          req.flash("success_msg", "Usuário criado com sucesso!");
          res.redirect("/");
        }).catch((err) =>{
          req.flash("error_msg", "Houve um erro na criação do usuário!")
          res.redirect("/usuarioroutes");
        });
      }
    });
  }
});

//-------------------------------------------------------------------------------------------------

router.get('/alteracaoroute/:id',isAuthenticaded,isFuncaoAdministrador,(req,res) => {
  Usuario.findOne({where:{id:req.params.id}}).then((usuarios) => {    
    res.render('funcionariosviews/alteracaoview',{usuarios:usuarios})
  }).catch((err) => {
    req.flash('erros_msg','Não foi possível encontrar o equipamento!')
    console.log(erro)
    res.redirect('/usuarioroutes')
  })
})

//-------------------------------------------------------------------------------------------------

router.post('/alterarroute',isAuthenticaded,(req,res) => {
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
  if (!req.body.funcao || typeof req.body.funcao == undefined || req.body.funcao == null) {
    erros.push({texto:'Função inválida!'})
  }
  if (erros.length > 0) {
    res.render('funcionariosviews/alteracaoview',{erros:erros})
  } else {
    Usuario.findOne({where:{id:req.body.id}}).then((usuarios) => {
      usuarios.nome = req.body.nome,
      usuarios.telefone = req.body.telefone,
      usuarios.email = req.body.email,
      usuarios.senha = req.body.senha,
      usuarios.funcao = req.body.funcao;
      usuarios.save().then(() => {
        req.flash('success_msg','Funcionário alterado com sucesso!')
        res.redirect('/usuarioroutes')
      }).catch((erro) => {
        req.flash('error_msg','Não foi possível alterar o funcionário!')
        console.log(erro)
        res.redirect('/usuarioroutes')
      })
    }).catch((erro) => {
      req.flash('error_msg','Não foi possível encontrar o funcionário!')
      console.log(erro)
      res.redirect('/usuarioroutes')
    })
  }
})

//-------------------------------------------------------------------------------------------------

router.post('/excluirroute',isAuthenticaded,isFuncaoAdministrador,(req,res) => {
  Usuario.destroy({where:{id:req.body.id}}).then(() => {
    req.flash('success_msg','Funcionário aqruivada com sucesso!')
    res.redirect('/usuarioroutes')
  }).catch((erro) => {
    req.flash('error_msg','Não foi possível arquivar o funcionário!')
    console.log(erro)
    res.redirect('/usuarioroutes')
  })
})

//-------------------------------------------------------------------------------------------------

router.post('/login', (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })(req, res, next)
})

//-------------------------------------------------------------------------------------------------

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
      if (err) { return next(err) }
      res.redirect('/')
    })
})

//-------------------------------------------------------------------------------------------------
module.exports = router
//-------------------------------------------------------------------------------------------------

