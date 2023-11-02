//-------------------------------------------------------------------------------------------------
const db = require("./db")
//-------------------------------------------------------------------------------------------------
const Empresa = db.sequelize.define('empresa', {
  nomeEmpresa: {
    type: db.Sequelize.STRING,
    require: true
  },
  CNPJ: {
    type: db.Sequelize.STRING,
    require: true
  },
  CEP: {
    type: db.Sequelize.INTEGER,
    require: true
  },
  enderecoEmpresa: {
    type: db.Sequelize.STRING,
    require: true
  },
  telefoneEmpresa: {
    type: db.Sequelize.STRING,
    require: true
  },
  emailEmpresa: {
    type: db.Sequelize.STRING,
    require: true
  },
  tipoJuridicoEmpresa: {
    type: db.Sequelize.STRING,
    require: true
  },
  nomePessoa:{
    type:db.Sequelize.STRING,
    require:true
  },
  telefonePessoa:{
    type:db.Sequelize.STRING,
    require:true
  },
  emailPessoa:{
    type:db.Sequelize.STRING,
    require:true
  },
  CPF:{
    type:db.Sequelize.STRING,
    require:true
  },
  RG:{
    type:db.Sequelize.STRING,
    require:true
  },
  enderecoPessoa:{
    type:db.Sequelize.STRING,
    require:true
  }
})
//-------------------------------------------------------------------------------------------------
Empresa.sync().then(() => {
  console.log('Tabela empresa criada com sucesso no MySql!');
}).catch((error) => {
  console.log('Erro: ', error);
});
//-------------------------------------------------------------------------------------------------
module.exports = Empresa
//-------------------------------------------------------------------------------------------------