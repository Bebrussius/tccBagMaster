//-------------------------------------------------------------------------------------------------
const express = require('express')
const router = express.Router()
const Empresa = require('../models/empresamodel')
const {isAuthenticaded} = require("../helpers/isAuthenticated")
//-------------------------------------------------------------------------------------------------
router.get('/',isAuthenticaded,(req,res) => {
  Empresa.findAll().then((empresas) => {
    res.render('empresaviews/gerenciaview',{empresas:empresas})
  }).catch((erro) => {
    req.flash('erros_msg','Houve ou erro ao listar equipamentos!')
    console.log(erro)
    res.redirect('/')
  })
})
//-------------------------------------------------------------------------------------------------
router.get('/exibirinclusaoroute',isAuthenticaded,(req,res) => {
  res.render('empresaviews/inclusaoview')
})
//-------------------------------------------------------------------------------------------------
router.post('/incluirroute',isAuthenticaded,(req,res) => {
  var erros = []
  if (!req.body.nomeEmpresa || typeof req.body.nomeEmpresa == undefined || req.body.nomeEmpresa == null) {
    erros.push({texto:'Nome da empresa inválido!'})
  }
  if (!req.body.CNPJ || typeof req.body.CNPJ == undefined || req.body.CNPJ == null) {
    erros.push({texto:'CNPJ inválido!'})
  }
  if (!req.body.CEP || typeof req.body.CEP == undefined || req.body.CEP == null) {
    erros.push({texto:'CEP inválido!'})
  }
  if (!req.body.enderecoEmpresa || typeof req.body.enderecoEmpresa == undefined || req.body.enderecoEmpresa == null) {
    erros.push({texto:'Endereço da empresa inválido!'})
  }
  if (!req.body.telefoneEmpresa || typeof req.body.telefoneEmpresa == undefined || req.body.telefoneEmpresa == null) {
    erros.push({texto:'Telefone da empresa inválido!'})
  }
  if (!req.body.emailEmpresa || typeof req.body.emailEmpresa == undefined || req.body.emailEmpresa == null) {
    erros.push({texto:'Email da empresa inválido!'})
  }
  if (!req.body.tipoJuridicoEmpresa || typeof req.body.tipoJuridicoEmpresa == undefined || req.body.tipoJuridicoEmpresa == null) {
    erros.push({texto:'Tipo jurídico da empresa inválido!'})
  }
  if (erros.length > 0) {
    res.render('empresaviews/inclusaoview',{erros:erros})
  } else {
    Empresa.create({
      nomeEmpresa:req.body.nomeEmpresa,
      CNPJ:req.body.CNPJ,
      CEP:req.body.CEP,
      enderecoEmpresa:req.body.enderecoEmpresa,
      telefoneEmpresa:req.body.telefoneEmpresa,
      emailEmpresa:req.body.emailEmpresa,
      tipoJuridicoEmpresa:req.body.tipoJuridicoEmpresa
    }).then(() => {
      req.flash('success_msg','Empresa incluída com sucesso!')
      res.redirect('/empresaroutes')
    }).catch((err) => {
      req.flash('erros_msg','Não foi possível incluir a empresa!')
      console.log(err)
      res.redirect('/empresaroutes')
    })
  }
})
//-------------------------------------------------------------------------------------------------
router.get('/alteracaoroute/:id',isAuthenticaded,(req,res) => {
  Empresa.findOne({where:{id:req.params.id}}).then((empresas) => {    
    res.render('empresaviews/alteracaoview',{empresas:empresas})
  }).catch((err) => {
    req.flash('erros_msg','Não foi possível encontrar o equipamento!')
    console.log(erro)
    res.redirect('/empresaroutes')
  })
})
//-------------------------------------------------------------------------------------------------
router.post('/alterarroute',isAuthenticaded,(req,res) => {
  var erros = []
  if (!req.body.nomeEmpresa || typeof req.body.nomeEmpresa == undefined || req.body.nomeEmpresa == null) {
    erros.push({texto:'Nome da empresa inválido!'})
  }
  if (!req.body.CNPJ || typeof req.body.CNPJ == undefined || req.body.CNPJ == null) {
    erros.push({texto:'CNPJ inválido!'})
  }
  if (!req.body.CEP || typeof req.body.CEP == undefined || req.body.CEP == null) {
    erros.push({texto:'CEP inválido!'})
  }
  if (!req.body.enderecoEmpresa || typeof req.body.enderecoEmpresa == undefined || req.body.enderecoEmpresa == null) {
    erros.push({texto:'Endereço da empresa inválido!'})
  }
  if (!req.body.telefoneEmpresa || typeof req.body.telefoneEmpresa == undefined || req.body.telefoneEmpresa == null) {
    erros.push({texto:'Telefone da empresa inválido!'})
  }
  if (!req.body.emailEmpresa || typeof req.body.emailEmpresa == undefined || req.body.emailEmpresa == null) {
    erros.push({texto:'Email da empresa inválido!'})
  }
  if (!req.body.tipoJuridicoEmpresa || typeof req.body.tipoJuridicoEmpresa == undefined || req.body.tipoJuridicoEmpresa == null) {
    erros.push({texto:'Tipo jurídico da empresa inválido!'})
  }
  if (erros.length > 0) {
    res.render('empresaviews/alteracaoview',{erros:erros})
  } else {
    Empresa.findOne({where:{id:req.body.id}}).then((empresas) => {
      empresas.nome = req.body.nome;
      empresas.CNPJ = req.body.CNPJ;
      empresas.CEP = req.body.CEP;
      empresas.enderecoEmpresa = req.body.enderecoEmpresa;
      empresas.telefoneEmpresa = req.body.telefoneEmpresa;
      empresas.emailEmpresa = req.body.emailEmpresa;
      empresas.tipoJuridicoEmpresa = req.body.tipoJuridicoEmpresa;
      empresas.save().then(() => {
        req.flash('success_msg','Empresa alterada com sucesso!')
        res.redirect('/empresaroutes')
      }).catch((erro) => {
        req.flash('error_msg','Não foi possível alterar a empresa!')
        console.log(erro)
        res.redirect('/empresaroutes')
      })
    }).catch((erro) => {
      req.flash('error_msg','Não foi possível encontrar o equipamento!')
      console.log(erro)
      res.redirect('/empresaroutes')
    })
  }
})
//-------------------------------------------------------------------------------------------------
router.post('/excluirroute',isAuthenticaded,(req,res) => {
  Empresa.destroy({where:{id:req.body.id}}).then(() => {
    req.flash('success_msg','Empresa aqruivada com sucesso!')
    res.redirect('/empresaroutes')
  }).catch((erro) => {
    req.flash('error_msg','Não foi possível arquivar a empresa!')
    console.log(erro)
    res.redirect('/empresaroutes')
  })
})
//-------------------------------------------------------------------------------------------------
module.exports = router
//-------------------------------------------------------------------------------------------------