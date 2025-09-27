var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");

const NWController = require("../controllers/NWController");
const NWModel = require("../models/NWModel");

const upload = require("../util/uploader.js");

const { verificarUsuAutenticado, processarLogin, verificarPermissao, logout } = require("../models/autenticador.js");

router.use(verificarUsuAutenticado);

router.use('/buscar', require('../routes/busca.js'));

router.get("/login", NWController.mostrarLogin);

router.post("/entrar", 
    NWController.validacaoLogin,    
    processarLogin,                 
    NWController.processarLogin
);

router.get("/logout", logout);

router.get("/perfilcliente", 
    verificarPermissao(['C']),
    NWController.mostrarPerfilCliente 
);

router.get("/perfilnutri", NWController.mostrarPerfilNutricionista);

router.get("/indexPerfilNutri", 
    verificarPermissao(['N']),
    NWController.redirecionarParaMeuPerfil
);

router.get("/config", async function (req, res) {
    if (!req.session.usuario || !req.session.usuario.id || !req.session.usuario.tipo) {
        return res.redirect('/login');
    }
    
    try {
        const usuarioId = req.session.usuario.id;
        const tipoUsuario = req.session.usuario.UsuarioTipo; // 'N' para nutricionista, 'C' para cliente
        
        let dadosUsuario = {};
        
        if (tipoUsuario === 'N') {
            const perfilNutri = await NWModel.findPerfilNutri(usuarioId);
            if (perfilNutri.nutricionista) {
                dadosUsuario = {
                    nome: perfilNutri.nutricionista.NomeCompleto,
                    email: perfilNutri.nutricionista.Email,
                    telefone: perfilNutri.nutricionista.Telefone.slice(-9),
                    ddd: perfilNutri.nutricionista.Telefone.slice(0, 2),
                    crn: perfilNutri.nutricionista.Crn,
                    area: perfilNutri.nutricionista.Especializacoes ? 
                           perfilNutri.nutricionista.Especializacoes.split(', ') : [],
                    senha: '' // Nunca mostrar senha
                };
            }
        } else {
            const perfilCliente = await NWModel.findPerfilCompleto(usuarioId);
            if (perfilCliente.cliente) {
                dadosUsuario = {
                    nome: perfilCliente.cliente.NomeCompleto,
                    email: perfilCliente.cliente.Email,
                    telefone: perfilCliente.cliente.Telefone.slice(-9),
                    ddd: perfilCliente.cliente.Telefone.slice(0, 2),
                    senha: '' // Nunca mostrar senha
                };
            }
        }
        
        return res.render("pages/indexConfig", {
            tipoUsuario: tipoUsuario,
            valores: dadosUsuario,
            msgErro: {},
            erroValidacao: {},
            listaErros: null
        });
        
    } catch (error) {
        console.error("Erro ao carregar página de configuração:", error.message);
        return res.render("pages/indexConfig", {
            tipoUsuario: req.session.tipoUsuario || 'C',
            valores: {},
            msgErro: { geral: 'Erro ao carregar dados' },
            erroValidacao: {},
            listaErros: null
        });
    }
});

router.post('/atualizar-imagens', 
    upload.uploadImagens,
    NWController.atualizarImagens
);

router.post('/atualizar-dados', NWController.validacaoAtualizarDados, NWController.atualizarDadosPessoais);

router.get("/imagem/perfil/:usuarioId", 
    verificarPermissao(['C', 'N']),
    async (req, res) => {
        try {
            const usuarioId = req.params.usuarioId;
            
            if (req.session.usuario.id !== parseInt(usuarioId) && req.session.usuario.tipo !== 'N') {
                return res.status(403).send('Acesso negado');
            }
            
            const imagem = await NWModel.findImagemPerfil(usuarioId);
            
            if (!imagem) {
                return res.status(404).send('Imagem não encontrada');
            }
            
            res.set({
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=3600',
                'ETag': `perfil-${usuarioId}`
            });
            
            res.send(imagem);
            
        } catch (erro) {
            console.error("Erro ao servir imagem de perfil:", erro);
            res.status(500).send('Erro interno');
        }
    }
);

router.get("/imagem/banner/:usuarioId", 
    async (req, res) => {
        try {
            const usuarioId = req.params.usuarioId;
            
            const imagem = await NWModel.findImagemBanner(usuarioId);
            
            if (!imagem) {
                return res.status(404).send('Banner não encontrado');
            }
            
            res.set({
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=3600',
                'ETag': `banner-${usuarioId}`
            });
            
            res.send(imagem);
            
        } catch (erro) {
            console.error("Erro ao servir imagem de banner:", erro);
            res.status(500).send('Erro interno');
        }
    }
);

router.get("/certificado/:formacaoId", 
    verificarPermissao(['N', 'C']),
    async (req, res) => {
        try {
            const formacaoId = req.params.formacaoId;
            
            const certificado = await NWModel.findCertificado(formacaoId);
            
            if (!certificado || !certificado.CertificadoArquivo) {
                return res.status(404).send('Certificado não encontrado');
            }
            
            let contentType = 'application/octet-stream';
            if (certificado.CertificadoTipo) {
                contentType = certificado.CertificadoTipo;
            } else {
                const extensao = certificado.CertificadoNome ? 
                    certificado.CertificadoNome.split('.').pop().toLowerCase() : '';
                
                switch (extensao) {
                    case 'pdf':
                        contentType = 'application/pdf';
                        break;
                    case 'jpg':
                    case 'jpeg':
                        contentType = 'image/jpeg';
                        break;
                    case 'png':
                        contentType = 'image/png';
                        break;
                    case 'doc':
                        contentType = 'application/msword';
                        break;
                    case 'docx':
                        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                        break;
                }
            }
        
            res.set({
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${certificado.CertificadoNome || 'certificado'}"`,
                'Cache-Control': 'public, max-age=3600'
            });
            
            res.send(certificado.CertificadoArquivo);
            
        } catch (erro) {
            console.error("Erro ao servir certificado:", erro);
            res.status(500).send('Erro interno');
        }
    }
);

router.post("/cadastrarcliente", upload, (req, res, next) => {
    const etapa = req.body.etapa;
    
    const dadosCliente = {
        nome: req.body.nome || '',
        email: req.body.email || '',
        senha: req.body.senha || '',
        cpf: req.body.cpf || '',
        ddd: req.body.ddd || '',
        telefone: req.body.telefone || '',
        area: req.body.area || null 
    };

    if (etapa === "1") {
        // **USAR O MIDDLEWARE DE VALIDAÇÃO COMPLETO**
        return async function aplicarValidacoes(req, res) {
            // Aplicar todas as validações sequencialmente
            for (let i = 0; i < NWController.validacaoCadCliente.length; i++) {
                try {
                    await new Promise((resolve, reject) => {
                        NWController.validacaoCadCliente[i](req, res, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                } catch (error) {
                    console.error(`Erro na validação ${i}:`, error);
                }
            }
            
            const errors = validationResult(req);
            
            if (!errors.isEmpty()) {
                return res.render("pages/indexCadastroCliente", {
                    etapa: "1",
                    cardSucesso: false,
                    valores: dadosCliente,
                    listaErros: errors,
                });
            }

            return res.render("pages/indexCadastroCliente", {
                etapa: "2",
                cardSucesso: true,
                valores: dadosCliente,
                listaErros: null,
            });
        }(req, res);
    }

    if (etapa === "2") {
        // **ETAPA FINAL - CHAMAR CONTROLLER**
        return NWController.cadastrarCliente(req, res);
    }

    return res.redirect('/cadastrarcliente');
});

// **CADASTRO DE NUTRICIONISTA - SIMPLIFICADO**
router.post("/cadastrarnutricionista", upload, (req, res, next) => {
    const etapa = req.body.etapa;
    
    const dadosNutri = {
        nome: req.body.nome || '',
        telefone: req.body.telefone || '',
        ddd: req.body.ddd || '',
        email: req.body.email || '',
        senha: req.body.senha || '',
        area: req.body.area || [],
        crn: req.body.crn || '',
        sobreMim: req.body.sobreMim || '',
        faculdade: req.body.faculdade || '',
        faculdadeOrg: req.body.faculdadeOrg || '',
        curso: req.body.curso || '',
        cursoOrg: req.body.cursoOrg || '',
        razaoSocial: req.body.razaoSocial || ''
    };

    if (etapa === "1") {
        return async function aplicarValidacoes(req, res) {
            for (let i = 0; i < NWController.validacaoCadNutri1.length; i++) {
                try {
                    await new Promise((resolve, reject) => {
                        NWController.validacaoCadNutri1[i](req, res, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                } catch (error) {
                    console.error(`Erro na validação ${i}:`, error);
                }
            }
            
            const errors = validationResult(req);
            
            if (!errors.isEmpty()) {
                return res.render("pages/indexCadastrarNutri", {
                    etapa: "1", 
                    card1: "", 
                    card2: "hidden", 
                    card3: "hidden", 
                    card4: "hidden",
                    cardSucesso: false,
                    valores: dadosNutri, 
                    listaErros: errors
                });
            }
            
            return res.render("pages/indexCadastrarNutri", {
                etapa: "2", 
                card1: "hidden", 
                card2: "", 
                card3: "hidden", 
                card4: "hidden",
                cardSucesso: true,
                valores: dadosNutri, 
                listaErros: null
            });
        }(req, res);
    }

    if (etapa === "2") {
        try {
            const imagens = validarImagensEtapa2(req.files);
            
            if (imagens.imagemPerfil) {
                dadosNutri.imagemPerfil = {
                    originalname: imagens.imagemPerfil.originalname,
                    mimetype: imagens.imagemPerfil.mimetype,
                    size: imagens.imagemPerfil.size,
                    buffer: imagens.imagemPerfil.buffer.toString('base64')
                };
            }
            
            if (imagens.imagemBanner) {
                dadosNutri.imagemBanner = {
                    originalname: imagens.imagemBanner.originalname,
                    mimetype: imagens.imagemBanner.mimetype,
                    size: imagens.imagemBanner.size,
                    buffer: imagens.imagemBanner.buffer.toString('base64')
                };
            }
            
            return res.render("pages/indexCadastrarNutri", {
                etapa: "3", 
                card1: "hidden", 
                card2: "hidden", 
                card3: "", 
                card4: "hidden",
                cardSucesso: true,
                valores: dadosNutri, 
                listaErros: null
            });

        } catch (error) {
            return res.render("pages/indexCadastrarNutri", {
                etapa: "2", 
                card1: "hidden", 
                card2: "", 
                card3: "hidden", 
                card4: "hidden",
                cardSucesso: true,
                valores: dadosNutri,
                listaErros: { errors: [{ msg: error.message }] }
            });
        }
    }

    if (etapa === "3") {
        if (req.body.imagemPerfilData) {
            dadosNutri.imagemPerfil = JSON.parse(req.body.imagemPerfilData);
        }
        if (req.body.imagemBannerData) {
            dadosNutri.imagemBanner = JSON.parse(req.body.imagemBannerData);
        }
        
        return res.render("pages/indexCadastrarNutri", {
            etapa: "4", 
            card1: "hidden", 
            card2: "hidden", 
            card3: "hidden", 
            card4: "",
            cardSucesso: true,
            valores: dadosNutri, 
            listaErros: null
        });
    }

    if (etapa === "4") {
        return NWController.cadastrarNutricionista(req, res);
    }

    return res.redirect('/cadastrarnutricionista');
});

router.get("/cadastrocliente", function (req, res) {
    res.render('pages/indexCadastroCliente', { retorno: null, etapa:"1", valores: {nome:"", email:"", cpf:"", senha:"", telefone:"", ddd:""}, listaErros: null});
});

router.get("/cadastronutri", function (req, res) {
    res.render('pages/indexCadastrarNutri', { retorno: null, etapa:"1", valores: {nome:"", telefone:"", email:"", senha:"", area:"", crn:""}, listaErros: null});
});

router.get("/", function (req, res) {
    res.render('pages/indexHome')
});

router.get("/cadastro", function (req, res) {
    res.render('pages/indexCadastrar')
});

router.get("/profissionais", function (req, res) {
    res.render('pages/indexProfissionais')
});

router.get("/ranking", function (req, res) {
    res.render('pages/indexRanking')
});

router.get("/premium", function (req, res) {
    res.render('pages/indexPremium')
});

router.get("/tiponutri", function (req, res) {
    res.render('pages/indexTipoNutri')
});

router.get("/publicar", function (req, res) {
    res.render('pages/indexPublicar')
});

router.get("/assinatura", function (req, res) {
    res.render('pages/indexAssinatura')
});

function validarImagensEtapa2(files) {
    const validarImagem = (arquivo, tipo) => {
        if (!arquivo) return null;
        
        if (arquivo.size > 5 * 1024 * 1024) {
            throw new Error(`${tipo} muito grande. Máximo permitido: 5MB`);
        }
        
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(arquivo.mimetype)) {
            throw new Error(`Formato de ${tipo} não suportado. Use: JPEG, PNG, GIF ou WEBP`);
        }
        
        return arquivo;
    };

    return {
        imagemPerfil: validarImagem(
            files && files['input-imagem'] ? files['input-imagem'][0] : null, 
            'foto de perfil'
        ),
        imagemBanner: validarImagem(
            files && files['input-banner'] ? files['input-banner'][0] : null, 
            'banner'
        )
    };
}

module.exports = router;