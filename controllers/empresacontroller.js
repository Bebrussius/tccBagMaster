//-------------------------------------------------------------------------------------------------
const express = require('express')
const router = express.Router()
const Empresa = require('../models/empresaModel')
const { isAuthenticaded } = require("../helpers/isAuthenticated")
const { isFuncaoEmpresas } = require('../helpers/isFuncaoEmpresas');
const { cnpj } = require('cpf-cnpj-validator');
const { cpf } = require('cpf-cnpj-validator');
const cepPromise = require('cep-promise');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
//-------------------------------------------------------------------------------------------------
router.get('/', isAuthenticaded, isFuncaoEmpresas, (req, res) => {
  console.log('showDesativadas:', req.query.showDesativadas);

  let whereCondition = {
    status: 'ativo',
  };

  if (req.query.showDesativadas) {
    whereCondition = {};
  }

  Empresa.findAll({
    where: whereCondition,
  })
    .then((empresas) => {
      res.render('empresaviews/gerenciaview', {
        empresas: empresas,
        showDesativadas: req.query.showDesativadas ? true : false,
      });
    })
    .catch((erro) => {
      req.flash('erros_msg', 'Houve um erro ao listar empresas!');
      console.log(erro);
      res.redirect('/');
    });
});
//-------------------------------------------------------------------------------------------------
router.get('/exibirinclusaoroute', isAuthenticaded, isFuncaoEmpresas, (req, res) => {
  res.render('empresaviews/inclusaoview')
})
router.get('/exibirinclusaoroute/pessoaFisica', isAuthenticaded, isFuncaoEmpresas, (req, res) => {
  res.render('empresaviews/inclusaoview2')
})
//-------------------------------------------------------------------------------------------------
router.get('/empresaDetalhesRoute/:id', isAuthenticaded, isFuncaoEmpresas, (req, res) => {
  const companyId = req.params.id;

  Empresa.findByPk(companyId)
    .then((empresa) => {
      if (!empresa) {
        req.flash('error_msg', 'Empresao nao encontrada!');
        res.redirect('/empresaroutes');
      } else {
        res.render('empresaviews/detalhesview', { empresa: empresa });
      }
    })
    .catch((err) => {
      req.flash('error_msg', 'Erro ao pegar detalhes da emresa!');
      console.log(err);
      res.redirect('/empresaroutes');
    });
});
//-------------------------------------------------------------------------------------------------
router.post('/incluirroute/empresa', isAuthenticaded, isFuncaoEmpresas, async (req, res) => {
  var erros = []
  const numeroTelefone = parsePhoneNumberFromString(req.body.telefoneEmpresa, 'BR');
  if (!req.body.nomeEmpresa || typeof req.body.nomeEmpresa == undefined || req.body.nomeEmpresa == null) {
    erros.push({ texto: 'Nome da empresa inválido!' })
  }
  if (!req.body.CNPJ || typeof req.body.CNPJ == undefined || req.body.CNPJ == null || !cnpj.isValid(req.body.CNPJ)) {
    erros.push({ texto: 'CNPJ inválido!' })
  }
  try {
    await cepPromise(req.body.CEP);
  } catch (err) {
    erros.push({ texto: 'CEP inválido!' });
  }
  if (!req.body.enderecoEmpresa || typeof req.body.enderecoEmpresa == undefined || req.body.enderecoEmpresa == null) {
    erros.push({ texto: 'Endereço da empresa inválido!' })
  }
  if (!req.body.telefoneEmpresa || typeof req.body.telefoneEmpresa == undefined || req.body.telefoneEmpresa == null || !numeroTelefone.isValid()) {
    erros.push({ texto: 'Telefone da empresa inválido!' })
  }
  if (!req.body.emailEmpresa || typeof req.body.emailEmpresa == undefined || req.body.emailEmpresa == null) {
    erros.push({ texto: 'Email da empresa inválido!' })
  }
  if (!req.body.tipoJuridicoEmpresa || typeof req.body.tipoJuridicoEmpresa == undefined || req.body.tipoJuridicoEmpresa == null) {
    erros.push({ texto: 'Tipo jurídico da empresa inválido!' })
  }
  if (erros.length > 0) {
    res.render('empresaviews/inclusaoview', { erros: erros })
  } else {
    const dadosEmpresa = {
      nomeEmpresa: req.body.nomeEmpresa,
      CNPJ: req.body.CNPJ,
      CEP: req.body.CEP,
      enderecoEmpresa: req.body.enderecoEmpresa,
      telefoneEmpresa: req.body.telefoneEmpresa,
      emailEmpresa: req.body.emailEmpresa,
      tipoJuridicoEmpresa: req.body.tipoJuridicoEmpresa
    };

    req.session.dadosEmpresa = dadosEmpresa;

     res.redirect('/empresaroutes/exibirinclusaoroute/pessoaFisica');
  }
});

router.post('/incluirroute/concluir', isAuthenticaded, isFuncaoEmpresas, async(req, res) => {
  var erros = []
  const numeroTelefone = parsePhoneNumberFromString(req.body.telefonePessoa, 'BR');
  if (!req.body.nomePessoa || typeof req.body.nomePessoa == undefined || req.body.nomePessoa == null) {
    erros.push({ texto: 'Nome da pessoa inválido!' })
  }
  if (!req.body.telefonePessoa || typeof req.body.telefonePessoa == undefined || req.body.telefonePessoa == null || !numeroTelefone.isValid()) {
    erros.push({ texto: 'Telefone da empresa inválido!' })
  }
  if (!req.body.emailPessoa || typeof req.body.emailPessoa == undefined || req.body.emailPessoa == null) {
    erros.push({ texto: 'Email inválido!' })
  }
  if (!req.body.CPF || typeof req.body.CPF == undefined || req.body.CPF == null || !cpf.isValid(req.body.CPF)) {
    erros.push({ texto: 'CPF inválido!' })
  }
  if (!req.body.RG || typeof req.body.RG == undefined || req.body.RG == null || !/^\d{1,10}$/.test(req.body.RG)) {
    erros.push({ texto: 'RG inválido!' })
  }
  if (!req.body.enderecoPessoa || typeof req.body.enderecoPessoa == undefined || req.body.enderecoPessoa == null) {
    erros.push({ texto: 'Endereço da pessoa inválido!' })
  }
  if (erros.length > 0) {
    res.render('empresaviews/inclusaoview', { erros: erros })
  } else {
    const dadosEmpresa = req.session.dadosEmpresa;

    const dadosEmpresaCompleto = {
      ...dadosEmpresa,
      nomePessoa: req.body.nomePessoa,
      telefonePessoa: req.body.telefonePessoa,
      emailPessoa: req.body.emailPessoa,
      CPF: req.body.CPF,
      RG: req.body.RG,
      enderecoPessoa: req.body.enderecoPessoa
    }

    Empresa.create(dadosEmpresaCompleto).then(() => {
      req.flash('success_msg', 'Cadastro da empresa concluído com sucesso!');
      res.redirect('/empresaroutes');
    }).catch((err) => {
      req.flash('erros_msg', 'Não foi possível concluir o cadastro da empresa!');
      console.log(err);
      res.redirect('/empresaroutes');
    });
  }
})
//-------------------------------------------------------------------------------------------------
router.get('/alteracaoroute/:id', isAuthenticaded, isFuncaoEmpresas, (req, res) => {
  Empresa.findOne({ where: { id: req.params.id } }).then((empresas) => {
    res.render('empresaviews/alteracaoview', { empresas: empresas })
  }).catch((err) => {
    req.flash('erros_msg', 'Não foi possível encontrar o equipamento!')
    console.log(err)
    res.redirect('/empresaroutes')
  })
})
//-------------------------------------------------------------------------------------------------
router.post('/alterarroute', isAuthenticaded, isFuncaoEmpresas, (req, res) => {
  var erros = []
  if (!req.body.nomeEmpresa || typeof req.body.nomeEmpresa == undefined || req.body.nomeEmpresa == null) {
    erros.push({ texto: 'Nome da empresa inválido!' })
  }
  if (!req.body.CNPJ || typeof req.body.CNPJ == undefined || req.body.CNPJ == null) {
    erros.push({ texto: 'CNPJ inválido!' })
  }
  if (!req.body.CEP || typeof req.body.CEP == undefined || req.body.CEP == null) {
    erros.push({ texto: 'CEP inválido!' })
  }
  if (!req.body.enderecoEmpresa || typeof req.body.enderecoEmpresa == undefined || req.body.enderecoEmpresa == null) {
    erros.push({ texto: 'Endereço da empresa inválido!' })
  }
  if (!req.body.telefoneEmpresa || typeof req.body.telefoneEmpresa == undefined || req.body.telefoneEmpresa == null) {
    erros.push({ texto: 'Telefone da empresa inválido!' })
  }
  if (!req.body.emailEmpresa || typeof req.body.emailEmpresa == undefined || req.body.emailEmpresa == null) {
    erros.push({ texto: 'Email da empresa inválido!' })
  }
  if (!req.body.tipoJuridicoEmpresa || typeof req.body.tipoJuridicoEmpresa == undefined || req.body.tipoJuridicoEmpresa == null) {
    erros.push({ texto: 'Tipo jurídico da empresa inválido!' })
  }
  if (!req.body.nomePessoa || typeof req.body.nomePessoa == undefined || req.body.nomePessoa == null) {
    erros.push({ texto: 'Nome da pessoa inválido!' })
  }
  if (!req.body.telefonePessoa || typeof req.body.telefonePessoa == undefined || req.body.telefonePessoa == null) {
    erros.push({ texto: 'Telefone da pessoa inválido!' })
  }
  if (!req.body.emailPessoa || typeof req.body.emailPessoa == undefined || req.body.emailPessoa == null) {
    erros.push({ texto: 'Email da pessoa inválido!' })
  }
  if (!req.body.CPF || typeof req.body.CPF == undefined || req.body.CPF == null) {
    erros.push({ texto: 'CPF da pessoa inválido!' })
  }
  if (!req.body.RG || typeof req.body.RG == undefined || req.body.RG == null) {
    erros.push({ texto: 'RG da pessoa inválido!' })
  }
  if (!req.body.enderecoPessoa || typeof req.body.enderecoPessoa == undefined || req.body.enderecoPessoa == null) {
    erros.push({ texto: 'Endereco da pessoa inválido!' })
  }
  if (erros.length > 0) {
    res.render('empresaviews/alteracaoview', { erros: erros })
  } else {
    Empresa.findOne({ where: { id: req.body.id } }).then((empresas) => {
      empresas.nomeEmpresa = req.body.nomeEmpresa;
      empresas.CNPJ = req.body.CNPJ;
      empresas.CEP = req.body.CEP;
      empresas.enderecoEmpresa = req.body.enderecoEmpresa;
      empresas.telefoneEmpresa = req.body.telefoneEmpresa;
      empresas.emailEmpresa = req.body.emailEmpresa;
      empresas.tipoJuridicoEmpresa = req.body.tipoJuridicoEmpresa;
      empresas.nomePessoa = req.body.nomePessoa;
      empresas.telefonePessoa = req.body.telefonePessoa;
      empresas.emailPessoa = req.body.emailPessoa;
      empresas.CPF = req.body.CPF;
      empresas.RG = req.body.RG;
      enderecoEmpresa = req.body.enderecoEmpresa;
      empresas.save().then(() => {
        req.flash('success_msg', 'Empresa alterada com sucesso!')
        res.redirect('/empresaroutes')
      }).catch((erro) => {
        req.flash('error_msg', 'Não foi possível alterar a empresa!')
        console.log(erro)
        res.redirect('/empresaroutes')
      })
    }).catch((erro) => {
      req.flash('error_msg', 'Não foi possível encontrar o equipamento!')
      console.log(erro)
      res.redirect('/empresaroutes')
    })
  }
})
//-------------------------------------------------------------------------------------------------
router.post('/togglestatusroute', isAuthenticaded, isFuncaoEmpresas, (req, res) => {
  const companyId = req.body.id;

  Empresa.findByPk(companyId)
    .then((empresa) => {
      if (!empresa) {
        throw new Error('Empresa não encontrada');
      }

      // Alternar entre 'ativo' e 'desativado'
      empresa.status = empresa.status === 'ativo' ? 'desativado' : 'ativo';

      return empresa.save();
    })
    .then(() => {
      req.flash('success_msg', 'Status da empresa alterado com sucesso!');
      res.redirect('/empresaroutes');
    })
    .catch((erro) => {
      req.flash('error_msg', 'Não foi possível alterar o status da empresa!');
      console.log(erro);
      res.redirect('/empresaroutes');
    });
});
//-------------------------------------------------------------------------------------------------
module.exports = router
//-------------------------------------------------------------------------------------------------