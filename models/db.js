//-------------------------------------------------------------------------------------------------
const Sequelize = require("sequelize")
const sequelize = new Sequelize('sql10667970','sql10667970','x5QbskTmAW', {
  host:'sql10.freemysqlhosting.net',
  dialect:'mysql',
  define: {
    freezeTableName:true // evita que o sequelize coloque a tabela no plural
  }
})
//-------------------------------------------------------------------------------------------------
sequelize.authenticate().then(() => {
  console.log('Conectou no MySql!');
}).catch((error) => {
  console.log('Erro: ',error);
});
//-------------------------------------------------------------------------------------------------
module.exports = {
  Sequelize:Sequelize,
  sequelize:sequelize
}
//-------------------------------------------------------------------------------------------------