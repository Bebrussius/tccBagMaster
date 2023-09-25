//-------------------------------------------------------------------------------------------------
const db = require("./db")
//-------------------------------------------------------------------------------------------------
const Usuario = db.sequelize.define('usuario',{
  nome:{
    type:db.Sequelize.STRING,
    require:true
  },
  telefone:{
    type:db.Sequelize.STRING,
    require:true
  },
  email:{
    type:db.Sequelize.STRING,
    require: true
  },
  senha:{
    type:db.Sequelize.STRING,
    require:true
  },
})
//-------------------------------------------------------------------------------------------------
Usuario.sync().then(() => {
  console.log('Tabela usuario criada com sucesso no MySql!');
}).catch((error) => {
  console.log('Erro: ',error);
});
//-------------------------------------------------------------------------------------------------
module.exports = Usuario
//-------------------------------------------------------------------------------------------------