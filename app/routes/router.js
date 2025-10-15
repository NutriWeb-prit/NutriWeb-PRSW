var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");

const path = require('path');
const fs = require('fs');

const NWController = require("../controllers/NWController");
const NWModel = require("../models/NWModel");

const PagamentoController = require("../controllers/pagamentoController");

const upload = require("../util/uploader.js");

const { verificarUsuAutenticado, processarLogin, verificarPermissao, logout } = require("../models/autenticador.js");

router.use(verificarUsuAutenticado);

const recuperacaoRouter = require('./recuperacao');
router.use('/', recuperacaoRouter);
router.get('/', NWController.mostrarHome);

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
        const tipoUsuario = req.session.usuario.tipo;
        
        let dadosUsuario = {};
        
        if (tipoUsuario === 'N') {
            const perfilNutri = await NWModel.findPerfilNutri(usuarioId);
            if (perfilNutri.nutricionista) {
                dadosUsuario = {
                    nome: perfilNutri.nutricionista.NomeCompleto,
                    email: perfilNutri.nutricionista.Email,
                    telefone: perfilNutri.nutricionista.Telefone ? perfilNutri.nutricionista.Telefone.slice(-9) : '',
                    ddd: perfilNutri.nutricionista.Telefone ? perfilNutri.nutricionista.Telefone.slice(0, 2) : '',
                    crn: perfilNutri.nutricionista.Crn,
                    sobreMim: perfilNutri.nutricionista.SobreMim || '',
                    area: perfilNutri.nutricionista.Especializacoes ? 
                           perfilNutri.nutricionista.Especializacoes.split(', ') : [],
                    senha: ''
                };
            }
        } else {
            const perfilCliente = await NWModel.findPerfilCompleto(usuarioId);
            if (perfilCliente.cliente) {
                dadosUsuario = {
                    nome: perfilCliente.cliente.NomeCompleto,
                    email: perfilCliente.cliente.Email,
                    telefone: perfilCliente.cliente.Telefone ? perfilCliente.cliente.Telefone.slice(-9) : '',
                    ddd: perfilCliente.cliente.Telefone ? perfilCliente.cliente.Telefone.slice(0, 2) : '',
                    sobreMim: perfilCliente.cliente.SobreMim || '',
                    senha: '' 
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
            tipoUsuario: req.session.usuario.tipo || 'C',
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

router.get("/imagem/perfil/:usuarioId", async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;
        
        const caminho = await NWModel.findImagemPerfil(usuarioId);
        
        // Se não houver imagem, serve imagem padrão ao invés de 404
        if (!caminho) {
            console.log('Foto de perfil não encontrada, servindo padrão');
            const caminhoDefault = path.join(__dirname, '../../app/public/imagens/foto_perfil.jpg');
            return res.set({
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=2592000', // 30 dias
                'ETag': `perfil-default`
            }).sendFile(caminhoDefault);
        }
        
        const caminhoCompleto = path.join(__dirname, '../../app/public', caminho);
        
        if (!fs.existsSync(caminhoCompleto)) {
            console.log('Arquivo não encontrado no disco, servindo padrão');
            const caminhoDefault = path.join(__dirname, '../../app/public/imagens/foto_perfil.jpg');
            return res.set({
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=2592000',
                'ETag': `perfil-default`
            }).sendFile(caminhoDefault);
        }

        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400',
            'ETag': `perfil-${usuarioId}`
        });
        
        res.sendFile(caminhoCompleto);
        
    } catch (erro) {
        console.error("Erro ao servir imagem:", erro);
        const caminhoDefault = path.join(__dirname, '../../app/public/imagens/foto_perfil.jpg');
        res.sendFile(caminhoDefault);
    }
});

router.get("/imagem/banner/:usuarioId", 
    async (req, res) => {
        try {
            const usuarioId = req.params.usuarioId;
            
            const caminho = await NWModel.findImagemBanner(usuarioId);
            
            if (!caminho) {
                console.log('Banner não encontrado para usuário:', usuarioId);
                return res.status(404).send('Banner não encontrado');
            }
            
            const caminhoCompleto = path.join(__dirname, '../../app/public', caminho);
            
            console.log('Servindo banner:', caminhoCompleto);
            
            if (!fs.existsSync(caminhoCompleto)) {
                console.log('Arquivo não encontrado no disco:', caminhoCompleto);
                return res.status(404).send('Arquivo não encontrado');
            }
            
            res.set({
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=86400',
                'ETag': `banner-${usuarioId}-${Date.now()}`
            });
            
            res.sendFile(caminhoCompleto);
            
        } catch (erro) {
            console.error("Erro ao servir imagem de banner:", erro);
            res.status(500).send('Erro interno');
        }
    }
);

router.get("/imagem/publicacao/:publicacaoId", 
    async (req, res) => {
        try {
            const publicacaoId = req.params.publicacaoId;
            
            const caminho = await NWModel.findImagemPublicacao(publicacaoId);
            
            if (!caminho) {
                console.log('Imagem de publicação não encontrada:', publicacaoId);
                return res.status(404).send('Imagem não encontrada');
            }
            
            const caminhoCompleto = path.join(__dirname, '../../app/public', caminho);
            
            console.log('Servindo imagem de publicação:', caminhoCompleto);
            
            if (!fs.existsSync(caminhoCompleto)) {
                console.log('Arquivo não encontrado no disco:', caminhoCompleto);
                return res.status(404).send('Arquivo não encontrado');
            }
            
            res.set({
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=86400',
                'ETag': `pub-${publicacaoId}`
            });
            
            res.sendFile(caminhoCompleto);
            
        } catch (erro) {
            console.error("Erro ao servir imagem de publicação:", erro);
            res.status(500).send('Erro interno');
        }
    }
);

router.get("/certificado/:formacaoId", 
    async (req, res) => {
        try {
            const formacaoId = req.params.formacaoId;
            
            const certificado = await NWModel.findCertificado(formacaoId);
            
            if (!certificado || !certificado.CaminhoArquivo) {
                console.log('Certificado não encontrado:', formacaoId);
                return res.status(404).send('Certificado não encontrado');
            }
            
            const caminhoCompleto = path.join(__dirname, '../../app/public', certificado.CaminhoArquivo);
            
            console.log('Servindo certificado:', caminhoCompleto);
            
            if (!fs.existsSync(caminhoCompleto)) {
                console.log('Arquivo de certificado não encontrado no disco:', caminhoCompleto);
                return res.status(404).send('Arquivo não encontrado');
            }
            
            let contentType = 'application/octet-stream';
            if (certificado.TipoArquivo) {
                contentType = certificado.TipoArquivo;
            } else {
                const extensao = certificado.NomeArquivo ? 
                    certificado.NomeArquivo.split('.').pop().toLowerCase() : '';
                
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
                    case 'gif':
                        contentType = 'image/gif';
                        break;
                    case 'webp':
                        contentType = 'image/webp';
                        break;
                }
            }
            
            res.set({
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${certificado.NomeArquivo || 'certificado'}"`,
                'Cache-Control': 'public, max-age=86400'
            });
            
            res.sendFile(caminhoCompleto);
            
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
        return async function aplicarValidacoes(req, res) {
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
        return NWController.cadastrarCliente(req, res);
    }

    return res.redirect('/cadastrarcliente');
});

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
        razaoSocial: req.body.razaoSocial || '',
        caminhoFotoPerfil: req.body.caminhoFotoPerfil || '',
        caminhoFotoBanner: req.body.caminhoFotoBanner || ''
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
            console.log('=== ETAPA 2: VALIDANDO IMAGENS ===');
            console.log('Arquivos recebidos:', req.files ? Object.keys(req.files) : 'nenhum');
            
            const imagens = validarImagensEtapa2(req.files);
            
            console.log('Imagens validadas:', {
                temPerfil: !!imagens.imagemPerfil,
                temBanner: !!imagens.imagemBanner
            });
            
            if (imagens.imagemPerfil) {
                dadosNutri.caminhoFotoPerfil = imagens.imagemPerfil;
                console.log('✅ Foto de perfil salva em dadosNutri:', imagens.imagemPerfil);
            }
            
            if (imagens.imagemBanner) {
                dadosNutri.caminhoFotoBanner = imagens.imagemBanner;
                console.log('✅ Foto de banner salva em dadosNutri:', imagens.imagemBanner);
            }
            
            console.log('Prosseguindo para etapa 3...');
            
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
            console.error('ERRO na etapa 2:', error.message);
            
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
    if (!req.session.usuario || !req.session.usuario.id) {
        return res.redirect('/login?redirect=/assinatura');
    }
    if (req.session.usuario.tipo !== 'N') {
        return res.redirect('/premium?erro=apenas_nutricionistas');
    }
    res.render('pages/indexAssinatura', {
        valores: {
            nome: req.session.usuario.nome || '',
            email: req.session.usuario.email || '',
            telefone: '',
            cpf: '',
            tipoPlano: 'mensal' // ← Adicionar
        },
        listaErros: null, // ← Adicionar
        mensagemErro: req.query.erro || null,
        mensagemSucesso: req.query.sucesso || null
    });
});

router.post("/assinatura/criar-preferencia", 
    verificarPermissao(['N']),
    PagamentoController.validacaoAssinatura,
    PagamentoController.criarPreferencia
);

router.get("/assinatura/feedback", 
    PagamentoController.processarFeedback
);

router.post("/webhook/mercadopago", 
    PagamentoController.receberWebhook
);

router.get("/quiz", function (req, res) {
    res.render('pages/indexQuiz')
});

function validarImagensEtapa2(files) {
    const validarImagem = (arquivo, tipo) => {
        if (!arquivo) {
            console.log(`${tipo}: nenhum arquivo enviado`);
            return null;
        }
        
        console.log(`Validando ${tipo}:`, {
            originalname: arquivo.originalname,
            filename: arquivo.filename,
            size: arquivo.size,
            mimetype: arquivo.mimetype,
            path: arquivo.path
        });
        
        if (arquivo.size > 5 * 1024 * 1024) {
            throw new Error(`${tipo} muito grande. Máximo permitido: 5MB`);
        }
        
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(arquivo.mimetype)) {
            throw new Error(`Formato de ${tipo} não suportado. Use: JPEG, PNG, GIF ou WEBP`);
        }
        
        const caminhoRelativo = arquivo.path
            .replace(/\\/g, '/') 
            .split('public/')[1]; 
        
        console.log(`${tipo} será acessado em: ${caminhoRelativo}`);
        return caminhoRelativo;
    };

    const imagemPerfil = validarImagem(
        files && files['input-imagem'] ? files['input-imagem'][0] : null, 
        'foto de perfil'
    );
    
    const imagemBanner = validarImagem(
        files && files['input-banner'] ? files['input-banner'][0] : null, 
        'banner'
    );
    
    return {
        imagemPerfil,
        imagemBanner
    };
}

module.exports = router;