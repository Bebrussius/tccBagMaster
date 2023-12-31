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
const { Sequelize, Op } = require('sequelize');
//-------------------------------------------------------------------------------------------------
router.get('/', isAuthenticaded, isFuncaoEmpresas, async (req, res) => {
  console.log('showDesativadas:', req.query.showDesativadas);

  let whereCondition = {};

  if (req.query.showDesativadas) {
    whereCondition = {};
  } else {
    whereCondition = { status: 'ativo' };
  }

  try {
    let empresas = [];

    if (req.query.search) {
      const searchQuery = req.query.search.trim();

      // Query to find the searched client
      const searchedClient = await Empresa.findOne({
        where: {
          [Op.and]: [
            whereCondition,
            {
              [Op.or]: [
                { id: { [Op.like]: `%${searchQuery}%` } },
                { nomeEmpresa: { [Op.like]: `%${searchQuery}%` } },
                { telefoneEmpresa: { [Op.like]: `%${searchQuery}%` } },
                { nomePessoa: { [Op.like]: `%${searchQuery}%` } },
                { telefonePessoa: { [Op.like]: `%${searchQuery}%` } },
              ],
            },
          ],
        },
      });

      // Query to find the remaining clients based on the status filter
      const statusFilter = req.query.statusFilter || 'todos';

      if (statusFilter === 'todos') {
        empresas = await Empresa.findAll({
          where: {
            ...whereCondition,
            status: {
              [Op.or]: ['ativo', 'desativado', null],
            },
          },
          order: [
            ['status', 'ASC'], // empresas ativas primeiro (ordem ascendente)
          ],
        });
      } else if (statusFilter === 'ativo') {
        empresas = await Empresa.findAll({
          where: {
            ...whereCondition,
            status: 'ativo',
          },
        });
      } else if (statusFilter === 'desativado') {
        empresas = await Empresa.findAll({
          where: {
            ...whereCondition,
            status: 'desativado',
          },
        });
      }

      if (searchedClient) {
        empresas = empresas.filter(
          (client) => client.id !== searchedClient.id
        ); // Remove the searched client if found
        empresas.unshift(searchedClient); // Add the searched client at the beginning
      }
    } else {
      // If no search query, retrieve all clients based on the status filter
      const statusFilter = req.query.statusFilter || 'todos';

      if (statusFilter === 'todos') {
        empresas = await Empresa.findAll({
          where: {
            ...whereCondition,
            status: {
              [Op.or]: ['ativo', 'desativado', null],
            },
          },
          order: [
            ['status', 'ASC'], // empresas ativas primeiro (ordem ascendente)
          ],
        });
      } else if (statusFilter === 'ativo') {
        empresas = await Empresa.findAll({
          where: {
            ...whereCondition,
            status: 'ativo',
          },
        });
      } else if (statusFilter === 'desativado') {
        empresas = await Empresa.findAll({
          where: {
            ...whereCondition,
            status: 'desativado',
          },
        });
      }
    }

    res.render('empresaviews/gerenciaview', {
      empresas: empresas,
      showDesativadas: req.query.showDesativadas ? true : false,
      statusFilter: req.query.statusFilter || 'todos', // Pass the current status filter to the view
    });
  } catch (erro) {
    req.flash('erros_msg', 'Houve um erro ao listar empresas!');
    console.log(erro);
    res.redirect('/');
  }
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
  var erros = [];
  const numeroTelefoneEmpresa = parsePhoneNumberFromString(req.body.telefoneEmpresa, 'BR');
  const numeroTelefonePessoa = parsePhoneNumberFromString(req.body.telefonePessoa, 'BR');

  if (!req.body.nomeEmpresa || typeof req.body.nomeEmpresa == undefined || req.body.nomeEmpresa == null) {
    erros.push({ texto: 'Nome da empresa inválido!' });
  }
  if (!req.body.CNPJ || typeof req.body.CNPJ == undefined || req.body.CNPJ == null || !cnpj.isValid(req.body.CNPJ)) {
    erros.push({ texto: 'CNPJ inválido!' });
  }
  try {
    await cepPromise(req.body.CEP);
  } catch (err) {
    erros.push({ texto: 'CEP inválido!' });
  }
  if (!req.body.enderecoEmpresa || typeof req.body.enderecoEmpresa == undefined || req.body.enderecoEmpresa == null) {
    erros.push({ texto: 'Endereço da empresa inválido!' });
  }
  if (!req.body.telefoneEmpresa || typeof req.body.telefoneEmpresa == undefined || req.body.telefoneEmpresa == null || !numeroTelefoneEmpresa.isValid()) {
    erros.push({ texto: 'Telefone da empresa inválido!' });
  }
  if (!req.body.emailEmpresa || typeof req.body.emailEmpresa == undefined || req.body.emailEmpresa == null) {
    erros.push({ texto: 'Email da empresa inválido!' });
  }
  if (!req.body.tipoJuridicoEmpresa || typeof req.body.tipoJuridicoEmpresa == undefined || req.body.tipoJuridicoEmpresa == null) {
    erros.push({ texto: 'Tipo jurídico da empresa inválido!' });
  }

  if (!req.body.nomePessoa || typeof req.body.nomePessoa == undefined || req.body.nomePessoa == null) {
    erros.push({ texto: 'Nome da pessoa inválido!' });
  }
  if (!req.body.telefonePessoa || typeof req.body.telefonePessoa == undefined || req.body.telefonePessoa == null || !numeroTelefonePessoa.isValid()) {
    erros.push({ texto: 'Telefone da pessoa inválido!' });
  }
  if (!req.body.emailPessoa || typeof req.body.emailPessoa == undefined || req.body.emailPessoa == null) {
    erros.push({ texto: 'Email inválido!' });
  }
  if (!req.body.CPF || typeof req.body.CPF == undefined || req.body.CPF == null || !cpf.isValid(req.body.CPF)) {
    erros.push({ texto: 'CPF inválido!' });
  }
  if (!req.body.RG || typeof req.body.RG == undefined || req.body.RG == null || !/^\d{1,10}$/.test(req.body.RG)) {
    erros.push({ texto: 'RG inválido!' });
  }
  if (!req.body.enderecoPessoa || typeof req.body.enderecoPessoa == undefined || req.body.enderecoPessoa == null) {
    erros.push({ texto: 'Endereço da pessoa inválido!' });
  }

  if (erros.length > 0) {
    res.render('empresaviews/inclusaoview', { erros: erros });
  } else {
    const dadosEmpresa = {
      nomeEmpresa: req.body.nomeEmpresa,
      CNPJ: req.body.CNPJ,
      CEP: req.body.CEP,
      enderecoEmpresa: req.body.enderecoEmpresa,
      telefoneEmpresa: req.body.telefoneEmpresa,
      emailEmpresa: req.body.emailEmpresa,
      tipoJuridicoEmpresa: req.body.tipoJuridicoEmpresa,
      nomePessoa: req.body.nomePessoa,
      telefonePessoa: req.body.telefonePessoa,
      emailPessoa: req.body.emailPessoa,
      CPF: req.body.CPF,
      RG: req.body.RG,
      enderecoPessoa: req.body.enderecoPessoa
    };

    try {
      await Empresa.create(dadosEmpresa);
      req.flash('success_msg', 'Cadastro da empresa concluído com sucesso!');
      res.redirect('/empresaroutes');
    } catch (err) {
      req.flash('erros_msg', 'Não foi possível concluir o cadastro da empresa!');
      console.log(err);
      res.redirect('/empresaroutes');
    }
  }
});
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
      req.flash('success_msg', 'Status do cliente alterado com sucesso!');
      res.redirect('/empresaroutes');
    })
    .catch((erro) => {
      req.flash('error_msg', 'Não foi possível alterar o status do cliente!');
      console.log(erro);
      res.redirect('/empresaroutes');
    });
});
//-------------------------------------------------------------------------------------------------
module.exports = router
//-------------------------------------------------------------------------------------------------