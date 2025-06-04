const NWModel = require("../models/NWModel");
const {body, validationResult} = require("express-validator");

const NWController = {

    // validação login
    validacaoLogin : [
        body("email").isEmail().withMessage("Insira um Email válido!"),
            body("senha").isLength({min:5}).withMessage("A senha deve conter 5 ou mais caracteres!"),
    ],

    // validação cadastro cliente
    validacaoCadCliente : [
        body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
        body("email").isEmail().withMessage("Insira um Email válido!"),
        body("senha")
            .isLength({min:5}).withMessage("Insira uma senha válida!")
            .matches(/[A-Z]/).withMessage("Insira uma senha válida!")
            .matches(/[a-z]/).withMessage("Insira uma senha válida!")
            .matches(/\d/).withMessage("Insira uma senha válida!")
            .matches(/[\W_]/).withMessage("Insira uma senha válida!"),
        body("ddd").isLength({min:2}).withMessage("Insira um número de telefone válido!"),
        body("telefone").isMobilePhone().withMessage("Insira um número de telefone válido!")
    ],

    // validação cadastro nutricionista (card 1)
    validacaoCadNutri1 : [
        body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
        body("telefone").isMobilePhone().withMessage("Insira um número de telefone válido!"),
        body("email").isEmail().withMessage("Insira um Email válido!"),
        body("senha")
            .isLength({min:5}).withMessage("Insira uma senha válida!")
            .matches(/[A-Z]/).withMessage("Insira uma senha válida!")
            .matches(/[a-z]/).withMessage("Insira uma senha válida!")
            .matches(/\d/).withMessage("Insira uma senha válida!")
            .matches(/[\W_]/).withMessage("Insira uma senha válida!"),
        body("area")
            .custom((value) => {
              if (!value) return false;
              if (Array.isArray(value)) {
                return value.length >= 1;
              }
              return typeof value === "string" && value.length > 0;
            })
            .withMessage("Selecione no mínimo uma especialização!"),
        body("crn").isLength({min:5}).withMessage("Insira um CRN válido!"),
    ],


    /* --------------------------------------- MÉTODOS ------------------------------------ */

    cadastrarCliente: async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            console.log(errors);
            return res.render('pages/indexCadastroCliente', {
                inputs: req.body,
                listaErros: errors
            })
        }

        var dadosCliente = {
            NomeCompleto: req.body.nome,
            Email:req.body.email,
            Senha:req.body.senha,
            Telefone:req.body.ddd + req.body.telefone
        }

        try {
            const results = await NWModel.create(dadosCliente);
            console.log("Resultado da criação:", results);
            return res.redirect("/");
        } catch (e) {
            console.error("Erro ao cadastrar cliente:", e.message, e);
            return res.status(500).json({ erro: "Falha ao acessar dados" });
        }
    },

    cadastrarNutricionista: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('pages/indexCadastroNutri', {
                inputs: req.body,
                listaErros: errors
            });
        }
    
        const dadosUsuarios = {
            NomeCompleto: req.body.nome,
            Email: req.body.email,
            Senha: req.body.senha,
            Telefone: req.body.ddd + req.body.telefone,
            UsuarioTipo: 'N'
        };
    
        const dadosNutricionistas = {
            Crn: req.body.crn,
            RazaoSocial: req.body.razaoSocial
        };
    
        const especializacoes = Array.isArray(req.body.area) ? req.body.area : [req.body.area];
    
        try {
            const result = await NWModel.createNutricionista(
                dadosUsuarios,
                dadosNutricionistas,
                especializacoes
            );
    
            console.log("Nutricionista criado com sucesso:", result);
            return res.redirect("/");
    
        } catch (err) {
            console.error("Erro ao cadastrar nutricionista:", err.message);
            return res.status(500).json({ erro: "Erro ao cadastrar nutricionista" });
        }
    },

}

module.exports = NWController;