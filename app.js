const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const dotenv = require('dotenv');
const jwt = require("jsonwebtoken");

dotenv.config({ path: './.env'})

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST, // Quando botar para hospedar, colocar aqui o endereço IP
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

//Analise o bodies codificados (conforme enviados por forms html)
app.use(express.urlencoded({ extended:false}));
//Analise JSON bodies (conforme enviados por clientes API)
app.use(express.json());

app.set("view engine", "hbs");

db.connect( (err) =>{
    if(err) {
        console.log(err);
    }
    else {
        console.log("MySql Contectou-se...");
    }
})

//Defina rotas
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(3000, () =>{
    console.log("Servidor rodando na porta 3000");
})

function verificarToken(req, res, next) {
    const token = req.cookies.token || req.headers['x-access-token'];

    if (!token) {
        return res.redirect('/login'); // Redirecione para a página de login se não houver token
    }

    jwt.verify(token, 'seu_segredo_secreto', (err, decoded) => {
        if (err) {
            return res.redirect('/login'); // Redirecione se o token não for válido
        }

        // O token é válido, você pode armazenar as informações do usuário no `req` se desejar
        req.usuario = decoded.usuario;
        next();
    });
}



// Função para criar e enviar um token após o login
function enviarToken(usuario, res) {
    const token = jwt.sign({ usuario }, 'seu_segredo_secreto', { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/criacaoEmpresa');
}

// Rota de login
app.post('/login', (req, res) => {
    // Lógica de verificação de credenciais
    const usuarioAutenticado = verificarCredenciais(req.body);

    if (usuarioAutenticado) {
        enviarToken(usuarioAutenticado, res);
    } else {
        res.redirect('/login');
    }
});

app.get('/criacaoEmpresa', verificarToken, (req, res) => {
    // Esta rota só será acessível por usuários autenticados
    res.render('criacaoEmpresa');
});