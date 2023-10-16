const db = require("./db");

const Usuario = db.sequelize.define('usuario', {
  nome: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  telefone: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  senha: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  funcao: {
    type: db.Sequelize.STRING,
    allowNull: false
  }
});

Usuario.sync().then(() => {
  console.log('Tabela usuario criada com sucesso no MySql!');
}).catch((error) => {
  console.log('Erro: ', error);
});

module.exports = Usuario;
