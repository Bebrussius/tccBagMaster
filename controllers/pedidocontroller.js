//-------------------------------------------------------------------------------------------------

const client = require('../app')

const express = require('express')
const router = express.Router()
let clientInstance = null; // Initialize the client instance

router.setClient = function (client) {
  clientInstance = client;
};

const Pedido = require('../models/pedidosModel')
const Empresa = require('../models/empresaModel')
const Usuario = require('../models/usuarioModel')
const { isAuthenticaded } = require("../helpers/isAuthenticated")
const { isFuncaoPedidos } = require('../helpers/isFuncaoPedidos');
router.client = null;

const { Sequelize, Op } = require('sequelize');
//-------------------------------------------------------------------------------------------------

router.get('/', isAuthenticaded, isFuncaoPedidos, async (req, res) => {
  let whereCondition = {
    status: 'em andamento',
  };

  if (req.query.showDesativadas) {
    whereCondition = {};
  }

  let pedidos = [];
  
  if (req.query.search) {
    // Se houver um parâmetro de pesquisa, busque todos os pedidos e ordene-os
    // para que o pedido correspondente à pesquisa seja exibido primeiro.
    pedidos = await Pedido.findAll({
      include: [
        {
          model: Empresa,
          as: 'empresa',
        },
        {
          model: Usuario,
          as: 'funcionario',
        },
      ],
      where: whereCondition,
    });

    // Filtrar o pedido correspondente à pesquisa.
    const searchTerm = req.query.search.toLowerCase();
    const matchingPedido = pedidos.find(pedido =>
      pedido.nome.toLowerCase().includes(searchTerm) ||
      pedido.id.toString() === searchTerm ||
      (pedido.funcionario && pedido.funcionario.nome.toLowerCase().includes(searchTerm)) ||
      (pedido.empresa && pedido.empresa.nomeEmpresa.toLowerCase().includes(searchTerm))
    );

    if (matchingPedido) {
      // Mover o pedido correspondente à pesquisa para o topo.
      pedidos = [matchingPedido, ...pedidos.filter(pedido => pedido !== matchingPedido)];
    }
  } else {
    // Se não houver um parâmetro de pesquisa, apenas busque todos os pedidos.
    pedidos = await Pedido.findAll({
      include: [
        {
          model: Empresa,
          as: 'empresa',
        },
        {
          model: Usuario,
          as: 'funcionario',
        },
      ],
      where: whereCondition,
    });
  }

  res.render('pedidosviews/gerenciaview', {
    pedidos: pedidos,
    showDesativadas: req.query.showDesativadas ? true : false,
  });
});

router.get('/search', isAuthenticaded, isFuncaoPedidos, async (req, res) => {
  try {
    let whereCondition = {
      status: 'em andamento',
    };

    if (req.query.showDesativadas) {
      whereCondition = {};
    }

    const searchTerm = req.query.search.toLowerCase();

    whereCondition[Op.or] = [
      { nome: { [Op.like]: `%${searchTerm}%` } },
      { '$funcionario.nome$': { [Op.like]: `%${searchTerm}%` } },
      { '$empresa.telefoneEmpresa$': { [Op.like]: `%${searchTerm}%` } },
      { '$empresa.nomeEmpresa$': { [Op.like]: `%${searchTerm}%` } },
      { id: { [Op.eq]: searchTerm } },
    ];

    const pedidos = await Pedido.findAll({
      include: [
        {
          model: Empresa,
          as: 'empresa',
        },
        {
          model: Usuario,
          as: 'funcionario',
        },
      ],
      where: whereCondition,
    });

    // Identificar o pedido pesquisado
    const pedidoPesquisadoIndex = pedidos.findIndex(pedido => pedido.id.toString() === searchTerm);

    res.render('pedidosviews/gerenciaview', {
      pedidos: pedidos,
      pedidoPesquisadoIndex: pedidoPesquisadoIndex,
      showDesativadas: req.query.showDesativadas ? true : false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erro ao buscar pedidos' });
  }
});
//-------------------------------------------------------------------------------------------------

router.get('/pedidoDetalhesRoute/:id', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  const companyId = req.params.id;

  Pedido.findByPk(companyId, {
    include: [
      {
        model: Empresa,
        as: 'empresa',
      },
      {
        model: Usuario,
        as: 'funcionario',
      },
    ],
  })
    .then((pedido) => {
      if (!pedido) {
        req.flash('error_msg', 'Pedido não encontrado!');
        res.redirect('/pedidoroutes');
      } else {
        res.render('pedidosviews/detalhesview', { pedido: pedido });
      }
    })
    .catch((err) => {
      req.flash('error_msg', 'Erro ao pegar detalhes do pedido!');
      console.log(err);
      res.redirect('/pedidoroutes');
    });
});
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
    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: Empresa,
          as: 'empresa',
        },
      ],
    });

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

      // Enviar mensagem no WhatsApp
      if (pedido.empresa && pedido.empresa.telefonePessoa) {
        const clienteTelefone = pedido.empresa.telefonePessoa
        const mensagem = `O estado do seu pedido foi atualizado para: ${pedido.estado}`;
        enviarMensagemWhatsApp(client, clienteTelefone, mensagem);
      } else {
        console.error('Erro: Número de telefone da empresa não encontrado.');
      }

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

// Função para enviar mensagem no WhatsApp
function enviarMensagemWhatsApp(client, clienteTelefone, mensagem) {

  console.log('Debug: Verificando client antes de enviar mensagem', client);

  if (clientInstance && clientInstance.sendMessage) {
    let formattedNumber = clienteTelefone.startsWith('55') ? clienteTelefone : '55' + clienteTelefone;
    formattedNumber = formattedNumber.replace(/\D/g, '');
    formattedNumber = formattedNumber.replace(/^0+/, '');

    const chatId = formattedNumber + '@c.us';

    clientInstance.sendMessage(chatId, mensagem).then(() => {
      console.log('Mensagem enviada com sucesso para', chatId);
    }).catch((error) => {
      console.error('Erro ao enviar mensagem para', chatId, error.message);
    });
  } else {
    console.error('Erro: client não está definido ou não possui o método sendMessage');
  }
}

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

router.post('/togglestatusroute', isAuthenticaded, isFuncaoPedidos, (req, res) => {
  const companyId = req.body.id;

  Pedido.findByPk(companyId)
    .then((pedido) => {
      if (!pedido) {
        throw new Error('Pedido não encontrado');
      }

      // Alternar entre 'Em andamento' e 'Concluído'
      pedido.status = pedido.status === 'em andamento' ? 'desativado' : 'em andamento';

      return pedido.save();
    })
    .then(() => {
      req.flash('success_msg', 'Status do pedido alterado com sucesso!');
      res.redirect('/pedidoroutes');
    })
    .catch((erro) => {
      req.flash('error_msg', 'Não foi possível alterar o status do pedido!');
      console.log(erro);
      res.redirect('/pedidoroutes');
    });
});

//-------------------------------------------------------------------------------------------------
module.exports = router

//-------------------------------------------------------------------------------------------------