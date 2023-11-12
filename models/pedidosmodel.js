const db = require("./db");
const Empresa = require('./empresaModel')
const Usuario = require('./usuarioModel')

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
  estado: {
    type: db.Sequelize.STRING,
    allowNull: false,
    defaultValue: 'Recebimento do pedido',
    validate: {
      isIn: [['Recebimento do pedido', 'Arte feita', 'Materiais recebidos', 'Confecção das sacolas em produção', 'Confecção das sacolas concluídas', 'Em trânsito', 'Pagamento feito']],
    },
  },
});

Pedido.belongsTo(Empresa, { as: 'empresa', foreignKey: 'empresaPedido' });
Pedido.belongsTo(Usuario, { as: 'funcionario', foreignKey: 'funcionarioPedido' });

Pedido.sync().then(() => {
  console.log('Tabela pedido criada com sucesso no MySql!');
}).catch((error) => {
  console.log('Erro: ', error);
});

module.exports = Pedido;
