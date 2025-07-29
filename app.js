const express = require("express");
const app = express();
const port = 3000;
const env = require("dotenv").config();

const session = require('express-session');

app.use(session({
    secret: 'sua-chave-super-secreta-aqui', 
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(express.static("app/public"));

app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

var rotas = require("./app/routes/router");
app.use("/", rotas);

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}\nhttp://localhost:${port}`);
});
