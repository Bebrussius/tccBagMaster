//-------------------------------------------------------------------------------------------------
const express = require('express')
const router = express.Router()
const Pedido = require('../models/pedidosmodel')
const Empresa = require('../models/empresamodel')
const Usuario = require('../models/usuariomodel')
const { isAuthenticaded } = require("../helpers/isAuthenticated")
const { isFuncaoPedidos } = require('../helpers/isFuncaoPedidos');
//-------------------------------------------------------------------------------------------------
router.get('/', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  Pedido.findAll({
    include: [Empresa, Usuario],
  }).then((pedidos) => {
    res.render('pedidosviews/gerenciaview', { pedidos: pedidos });
  }).catch((erro) => {
    req.flash('erros_msg', 'Houve um erro ao listar os pedidos!');
    console.log(erro);
    res.redirect('/');
  });
})
//-------------------------------------------------------------------------------------------------
router.get('/obterempresas', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  Empresa.findAll().then((empresas) => {
    res.json(empresas);
  }).catch((erro) => {
    console.log(erro);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  });
});
router.get('/obterfuncionarios', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  Usuario.findAll().then((usuarios) => {
    res.json(usuarios);
  }).catch((erro) => {
    console.log(erro);
    res.status(500).json({ error: 'Erro ao buscar funcionários' });
  });
});
//-------------------------------------------------------------------------------------------------
router.get('/exibirinclusaoroute', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  res.render('pedidosviews/inclusaoview')
})
router.get('/exibirinclusaoroute/parteDois', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  res.render('pedidosviews/inclusaoview2')
})
//-------------------------------------------------------------------------------------------------
router.post('/incluirroute/pedido', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  var erros = []
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({ texto: 'Nome do pedido inválido!' })
  }
  if (!req.body.corSacola || typeof req.body.corSacola == undefined || req.body.corSacola == null) {
    erros.push({ texto: 'Cor da sacola inválida!' })
  }
  if (!req.body.corTinta || typeof req.body.corTinta == undefined || req.body.corTinta == null) {
    erros.push({ texto: 'Cor da tinta inválida!' })
  }
  if (!req.body.quantidade || typeof req.body.quantidade == undefined || req.body.quantidade == null) {
    erros.push({ texto: 'Quantidade inválida!' })
  }
  if (!req.body.tamanho || typeof req.body.tamanho == undefined || req.body.tamanho == null) {
    erros.push({ texto: 'Tamanho inválido!' })
  }
  if (!req.body.tipo || typeof req.body.tipo == undefined || req.body.tipo == null) {
    erros.push({ texto: 'Tipo inválido!' })
  }
  if (!req.body.impressao || typeof req.body.impressao == undefined || req.body.impressao == null) {
    erros.push({ texto: 'Impressão inválida!' })
  }
  if (erros.length > 0) {
    res.render('pedidosviews/inclusaoview', { erros: erros })
  } else {
    const dadosPedido = {
      nome: req.body.nome,
      corSacola: req.body.corSacola,
      corTinta: req.body.corTinta,
      quantidade: req.body.quantidade,
      tamanho: req.body.tamanho,
      tipo: req.body.tipo,
      impressao: req.body.impressao,
    }

    req.session.dadosPedido = dadosPedido;

    res.redirect('/pedidoroutes/exibirinclusaoroute/parteDois');
  }
})
router.post('/incluirroute/concluir', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  var erros = []
  if (!req.body.preco || typeof req.body.preco == undefined || req.body.preco == null) {
    erros.push({ texto: 'Preco inválido!' })
  }
  if (!req.body.empresaPedido || typeof req.body.empresaPedido == undefined || req.body.empresaPedido == null) {
    erros.push({ texto: 'Empresa que fez o pedido inválida!' })
  }
  if (!req.body.funcionarioPedido || typeof req.body.funcionarioPedido == undefined || req.body.funcionarioPedido == null) {
    erros.push({ texto: 'Funcionario que adicionou pedido inválido!' })
  }
  if (erros.length > 0) {
    res.render('pedidosviews/inclusaoview', { erros: erros })
  } else {
    const dadosPedido = req.session.dadosPedido;

    const dadosPedidocompleto = {
      ...dadosPedido,
      preco: req.body.preco,
      empresaPedido: req.body.empresaPedido,
      funcionarioPedido: req.body.funcionarioPedido,
    }

    Pedido.create(dadosPedidocompleto).then(() => {
      req.flash('success_msg', 'Cadastro de pedido concluído com sucesso!');
      res.redirect('/pedidoroutes');
    }).catch((err) => {
      req.flash('erros_msg', 'Não foi possível concluir o cadastro do pedido!');
      console.log(err);
      res.redirect('/pedidoroutes');
    });
  }
})
//-------------------------------------------------------------------------------------------------
router.get('/alteracaoroute/:id', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  Pedido.findOne({ where: { id: req.params.id } }).then((pedidos) => {
    res.render('pedidosviews/alteracaoview', { pedidos: pedidos })
  }).catch((err) => {
    req.flash('erros_msg', 'Não foi possível encontrar o pedido!')
    console.log(erro)
    res.redirect('/pedidoroutes')
  })
})
//-------------------------------------------------------------------------------------------------
router.post('/alterarroute', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  var erros = []
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({ texto: 'Nome do pedido inválido!' })
  }
  if (!req.body.corSacola || typeof req.body.corSacola == undefined || req.body.corSacola == null) {
    erros.push({ texto: 'Cor da sacola inválida!' })
  }
  if (!req.body.corTinta || typeof req.body.corTinta == undefined || req.body.corTinta == null) {
    erros.push({ texto: 'Cor da tinta inválida!' })
  }
  if (!req.body.quantidade || typeof req.body.quantidade == undefined || req.body.quantidade == null) {
    erros.push({ texto: 'Quantidade inválida!' })
  }
  if (!req.body.tamanho || typeof req.body.tamanho == undefined || req.body.tamanho == null) {
    erros.push({ texto: 'Tamanho inválido!' })
  }
  if (!req.body.tipo || typeof req.body.tipo == undefined || req.body.tipo == null) {
    erros.push({ texto: 'Tipo inválido!' })
  }
  if (!req.body.preco || typeof req.body.preco == undefined || req.body.preco == null) {
    erros.push({ texto: 'Preco inválido!' })
  }
  if (!req.body.empresaPedido || typeof req.body.empresaPedido == undefined || req.body.empresaPedido == null) {
    erros.push({ texto: 'Empresa que fez o pedido inválida!' })
  }
  if (!req.body.funcionarioPedido || typeof req.body.funcionarioPedido == undefined || req.body.funcionarioPedido == null) {
    erros.push({ texto: 'Funcionario que adicionou pedido inválido!' })
  }
  if (erros.length > 0) {
    res.render('pedidosviews/alteracaoview', { erros: erros })
  } else {
    Pedido.findOne({ where: { id: req.body.id } }).then((pedidos) => {
      pedidos.nome = req.body.nome;
      pedidos.corSacola = req.body.corSacola;
      pedidos.corTinta = req.body.corTinta;
      pedidos.quantidade = req.body.quantidade;
      pedidos.tamanho = req.body.tamanho;
      pedidos.tipo = req.body.tipo;
      pedidos.preco = req.body.preco;
      pedidos.empresaPedido = req.body.empresaPedido;
      pedidos.funcionarioPedido = req.body.funcionarioPedido;
      pedidos.save().then(() => {
        req.flash('success_msg', 'Pedido alterado com sucesso!')
        res.redirect('/pedidoroutes')
      }).catch((erro) => {
        req.flash('error_msg', 'Não foi possível alterar o pedido!')
        console.log(erro)
        res.redirect('/pedidoroutes')
      })
    }).catch((erro) => {
      req.flash('error_msg', 'Não foi possível encontrar o pedido!')
      console.log(erro)
      res.redirect('/pedidoroutes')
    })
  }
})
//-------------------------------------------------------------------------------------------------
router.post('/excluirroute', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  Pedido.destroy({ where: { id: req.body.id } }).then(() => {
    req.flash('success_msg', 'Pedido arquivado com sucesso!')
    res.redirect('/pedidoroutes')
  }).catch((erro) => {
    req.flash('error_msg', 'Não foi possível arquivar o pedido!')
    console.log(erro)
    res.redirect('/pedidoroutes')
  })
})
//-------------------------------------------------------------------------------------------------
module.exports = router
//-------------------------------------------------------------------------------------------------