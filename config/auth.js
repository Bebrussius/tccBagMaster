const localStrategy = require("passport-local").Strategy;
const Usuario = require("../models/usuariomodel");

module.exports = function (passport) {
  passport.use(new localStrategy({ usernameField: 'email', passwordField: 'senha' }, (email, senha, done) => {
    Usuario.findOne({ where: { email: email } }).then((usuario) => {
      if (!usuario) {
        return done(null, false, { message: 'Esta conta não existe' });
      }

      if (senha === usuario.senha) {
        return done(null, usuario);
      } else {
        return done(null, false, { message: 'Senha incorreta' });
      }
    });
  }));

  passport.serializeUser((usuario, done) => {
    done(null, usuario.id);
  });

  passport.deserializeUser((id, done) => {
    Usuario.findByPk(id)
      .then((usuario) => {
        done(null, usuario);
      })
      .catch((erro) => {
        done(erro);
      });
  });
};
