const db = require("./db");
const Empresa = require('../models/empresamodel')
const Usuario = require('../models/usuariomodel')

const Pedido = db.sequelize.define('pedido', {
  nome: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  corSacola: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  corTinta: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  quantidade: {
    type: db.Sequelize.INTEGER,
    allowNull: false
  },
  tamanho: {
    type: db.Sequelize.INTEGER,
    allowNull: false
  },
  tipo: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  impressao: {
    type: db.Sequelize.STRING,
  },
  preco: {
    type: db.Sequelize.INTEGER,
    allowNull: false
  },
  empresaPedido: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  funcionarioPedido: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
});

Pedido.belongsTo(Empresa, { foreignKey: 'empresaPedido' });
Pedido.belongsTo(Usuario, { foreignKey: 'funcionarioPedido' });

Pedido.sync().then(() => {
  console.log('Tabela pedido criada com sucesso no MySql!');
}).catch((error) => {
  console.log('Erro: ', error);
});

module.exports = Pedido;
