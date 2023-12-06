//-------------------------------------------------------------------------------------------------

// Módulos {{{
  const express = require('express');
  const session = require('express-session');
  const flash = require('connect-flash');
  const handlebars = require('express-handlebars');
  const bodyParser = require('body-parser');
  const path = require('path');
  const usuario = require('./controllers/usuariocontroller');
  const empresa = require('./controllers/empresacontroller');
  const pedido = require('./controllers/pedidocontroller');
  require("./models/usuarioModel");
  const passport = require('passport');
  require('./config/auth')(passport);
  const app = express();
// }}}

//-------------------------------------------------------------------------------------------------
  const qrcode = require('qrcode-terminal');
  const { Client, LocalAuth } = require('whatsapp-web.js');
  const client = new Client({ authStrategy: new LocalAuth() });
  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
  });
  client.on('ready', () => {
    console.log('Client is ready!');
  });
  client.initialize();
  pedido.setClient(client);
//-------------------------------------------------------------------------------------------------

// Sessão {{{
app.use(session({
  secret: 'crudapp',
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session());

app.use(flash())
// }}}

//-------------------------------------------------------------------------------------------------  

//middleware {{{
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash("error")
  res.locals.user = req.user || null;
  next()
})
app.use(express.json());
// Body Parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//}}}

//-------------------------------------------------------------------------------------------------  

// Handlebars {{{
const hbs = handlebars.create({
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: {
    eq: function (a, b) {
      return a === b;
    },
    not: function (value) {
      return !value;
    },
  },
  partialsDir: [
    'views/layouts/'
  ]
});

hbs.handlebars.registerHelper('and', function () {
  const args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
  for (let i = 0; i < args.length; i++) {
    if (!args[i]) return false;
  }
  return true;
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
//}}}

//-------------------------------------------------------------------------------------------------  

// Caminho bootstrap {{{
app.use(express.static(path.join(__dirname, 'views/layouts/bootstrap')))
app.use(express.static(path.join(__dirname, 'public')));
// }}}

//-------------------------------------------------------------------------------------------------

// Rotas {{{
app.get('/', (req, res) => {
  res.render('home')
})
app.get('/cadastro', (req, res) => {
  res.render('cadastro')
})
app.get('/login', (req, res) => {
  res.render('login')
})
// 

app.use('/usuarioroutes', usuario), // prefixo para rotas de usuario
app.use('/empresaroutes', empresa) // prefixo para rotas de equipamento
app.use('/pedidoroutes', pedido)
//}}}

//-------------------------------------------------------------------------------------------------

// Servidor {{{
const PORT = 3000
app.listen(PORT, () => {
  console.log('Servidor rodando! Porta 3000')
});
//}}}

//-------------------------------------------------------------------------------------------------
