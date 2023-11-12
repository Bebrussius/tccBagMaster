//-------------------------------------------------------------------------------------------------

const express = require('express')
const router = express.Router()
const Pedido = require('../models/pedidosModel')
const Empresa = require('../models/empresaModel')
const Usuario = require('../models/usuarioModel')
const { isAuthenticaded } = require("../helpers/isAuthenticated")
const { isFuncaoPedidos } = require('../helpers/isFuncaoPedidos');

//-------------------------------------------------------------------------------------------------

router.get('/', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  Pedido.findAll({
    include: [
      {
        model: Empresa,
        as: 'empresa',
      },
      {
        model: Usuario,
        as: 'funcionario',
      }
    ]
  }).then((pedidos) => {
    console.log(pedidos)
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

router.post('/atualizarestado/:id', isAuthenticaded, isFuncaoPedidos, async (req, res) => {

  console.log('Rota de atualização de estado acessada');

  const { id } = req.params;

  console.log('Pedido ID:', id);
  console.log('Dados recebidos:', req.body);

  try {
    const pedido = await Pedido.findByPk(id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const estadosPossiveis = ['Recebimento do pedido', 'Arte feita', 'Materiais recebidos', 'Confecção das sacolas em produção', 'Confecção das sacolas concluídas', 'Em trânsito', 'Pagamento feito'];

    // Encontre o índice atual do estado do pedido
    const indiceAtual = estadosPossiveis.indexOf(pedido.estado);

// Verifique se não é o último estado
if (indiceAtual < estadosPossiveis.length - 1) {
  // Avance para o próximo estado
  pedido.estado = estadosPossiveis[indiceAtual + 1];
  await pedido.save();
  // Adicione aqui a lógica para enviar a mensagem no WhatsApp para o cliente.
  return res.status(200).json({ success: true, message: 'Estado do pedido avançado com sucesso!' });
} else {
  // Se já estiver no último estado, retorne uma mensagem adequada.
  return res.status(400).json({ success: false, error: 'O pedido já está no último estado.' });
}
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao avançar o estado do pedido' });
  }
});

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