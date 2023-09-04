const mysql = require("mysql2");
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST, // Quando botar para hospedar, colocar aqui o endereço IP
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.cadastro = (req, res) => {
    console.log(req.body);

    const { nome, email, senha, senhaConfirma } = req.body;

    db.query('SELECT email FROM usuarios WHERE email=?', [email], async (err, results) => {
        if(err){
            console.log(err);
        } else if(results.length>0){
            return res.render('cadastro', {
                message: "Email já esta sendo usado! Tente outro."
            })
        } else if(senha!==senhaConfirma){
            return res.render('cadastro', {
                message: "As senhas não conferem!"
            })
        }

        let senhaHashed = await bcrypt.hash(senha, 8);
        console.log(senhaHashed)

        db.query('INSERT INTO usuarios SET ?', {nome:nome, email:email, senha:senhaHashed}, (err ,results) => {
            if(err){
                console.log(err)
            } else {
                return res.render('criacaoEmpresa', {
                    message: "Usuário criado com sucesso!"
                });
            };
        })
    });
}

exports.login = (req, res) => {
    const { email, senha } = req.body;

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.log(err);
        } else if (results.length === 0) {
            return res.render('login', {
                message: "Email não encontrado. Verifique suas credenciais."
            });
        }

        const user = results[0];

        // Verifique a senha usando bcrypt
        const isPasswordValid = await bcrypt.compare(senha, user.senha);

        if (isPasswordValid) {
            // Autenticação bem-sucedida, redirecione o usuário ou retorne uma resposta de sucesso
            // Neste exemplo, estamos apenas enviando uma resposta de sucesso
            res.render('criacaoEmpresa', {
                message: "Login bem-sucedido!"
            });
        } else {
            res.render('login', {
                message: "Senha incorreta. Verifique suas credenciais."
            });
        }
    });
};
