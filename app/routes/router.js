var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");

const NWController = require("../controllers/NWController");
const NWModel = require("../models/NWModel");

const upload = require("../util/uploader.js");

const { verificarUsuAutenticado, processarLogin, verificarPermissao, logout } = require("../models/autenticador.js");

router.use(verificarUsuAutenticado);

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

router.get("/config", function (req, res) {
    res.render('pages/indexConfig')
});

router.post('/atualizar-imagens', 
    upload.uploadImagens,
    NWController.atualizarImagens
);

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

router.post(
    "/cadastrarcliente",
    upload,
    NWController.validacaoCadCliente,
    async function (req, res) {
        const etapa = req.body.etapa;
        const listaErros = validationResult(req);

        const dadosCliente = {
            nome: req.body.nome || '',
            email: req.body.email || '',
            senha: req.body.senha || '',
            cpf: req.body.cpf || '',
            ddd: req.body.ddd || '',
            telefone: req.body.telefone || '',
            area: req.body.area || null 
        };

        if (etapa == "1") {
            console.log('Processando ETAPA 1...');
            
            if (!listaErros.isEmpty()) {
                console.log('Erros na etapa 1:', listaErros.array());
                return res.render("pages/indexCadastroCliente", {
                    etapa: "1",
                    cardSucesso: false,
                    valores: dadosCliente,
                    listaErros: listaErros,
                });
            }

            console.log('Etapa 1 validada, passando para etapa 2');
            console.log('Dados preservados:', dadosCliente);
            
            return res.render("pages/indexCadastroCliente", {
                etapa: "2",
                cardSucesso: true,
                valores: dadosCliente,
                listaErros: null,
            });
        }

        if (etapa == "2") {
            console.log('Processando ETAPA 2 - upload de imagens e cadastro final');
            console.log('Dados recebidos na etapa 2:', dadosCliente);
            
            try {
                // Função para validar imagens (igual ao nutricionista)
                const validarImagem = (arquivo, tipo) => {
                    if (!arquivo) return null;
                    
                    console.log(`Validando ${tipo}:`, {
                        nome: arquivo.originalname,
                        tamanho: arquivo.size,
                        tipo: arquivo.mimetype
                    });
                    
                    if (arquivo.size > 5 * 1024 * 1024) {
                        throw new Error(`${tipo} muito grande. Máximo permitido: 5MB`);
                    }
                    
                    if (arquivo.buffer && arquivo.buffer.length > 5 * 1024 * 1024) {
                        throw new Error(`${tipo} muito grande após processamento. Máximo permitido: 5MB`);
                    }
                    
                    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                    if (!tiposPermitidos.includes(arquivo.mimetype)) {
                        throw new Error(`Formato de ${tipo} não suportado. Use: JPEG, PNG, GIF ou WEBP`);
                    }
                    
                    console.log(`${tipo} validada com sucesso:`, arquivo.originalname, `(${arquivo.size} bytes)`);
                    return arquivo;
                };

                const imagemPerfil = validarImagem(
                    req.files && req.files['input-imagem'] ? req.files['input-imagem'][0] : null, 
                    'foto de perfil'
                );
                
                const imagemBanner = validarImagem(
                    req.files && req.files['input-banner'] ? req.files['input-banner'][0] : null, 
                    'banner'
                );

                console.log('Imagens:');
                console.log('- Perfil:', imagemPerfil ? `${imagemPerfil.originalname} (${imagemPerfil.size} bytes)` : 'Não enviada');
                console.log('- Banner:', imagemBanner ? `${imagemBanner.originalname} (${imagemBanner.size} bytes)` : 'Não enviada');

                dadosCliente.imagemPerfil = imagemPerfil;
                dadosCliente.imagemBanner = imagemBanner;

                console.log('INTERESSES FINAIS ANTES DO CONTROLLER:');
                console.log('- req.body.area:', req.body.area);
                console.log('- dadosCliente.area:', dadosCliente.area);

                return await NWController.cadastrarCliente(req, res);

            } catch (error) {
                console.error('Erro na validação de imagens:', error.message);
                
                let mensagemErro = 'Erro no upload das imagens. Tente novamente.';
                
                if (error.message.includes('muito grande')) {
                    mensagemErro = error.message;
                } else if (error.message.includes('não suportado')) {
                    mensagemErro = error.message;
                } else if (error.message.includes('formato') || error.message.includes('inválido')) {
                    mensagemErro = error.message;
                } else if (error.code === 'LIMIT_FILE_SIZE') {
                    mensagemErro = 'Arquivo muito grande. Tamanho máximo permitido: 5MB';
                }
                
                console.log('Retornando erro para etapa 2:', mensagemErro);
                
                return res.render("pages/indexCadastroCliente", {
                    etapa: "2",
                    cardSucesso: true,
                    valores: dadosCliente,
                    listaErros: { 
                        errors: [{ msg: mensagemErro }] 
                    },
                });
            }
        }

        console.log('Etapa inválida:', etapa);
        return res.redirect('/cadastrarcliente');
    }
);


router.post(
    "/cadastrarnutricionista",
    upload, // Middleware de upload
    NWController.validacaoCadNutri1,
    async function (req, res) {
        const etapa = req.body.etapa;
        const listaErros = validationResult(req);

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
            cursoOrg: req.body.cursoOrg || ''
        };

        if (etapa === "1") {
            if (!listaErros.isEmpty()) {
                return res.render("pages/indexCadastrarNutri", {
                    etapa: "1", 
                    card1: "", 
                    card2: "hidden", 
                    card3: "hidden", 
                    card4: "hidden",
                    cardSucesso: false,
                    valores: dadosNutri, 
                    listaErros: listaErros
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
        }

        if (etapa === "2") {
            try {
                // Função para validar imagens
                const validarImagem = (arquivo, tipo) => {
                    if (!arquivo) return null;
                    
                    if (arquivo.size > 5 * 1024 * 1024) {
                        throw new Error(`${tipo} muito grande. Máximo permitido: 5MB`);
                    }
                    
                    if (arquivo.buffer && arquivo.buffer.length > 5 * 1024 * 1024) {
                        throw new Error(`${tipo} muito grande após processamento. Máximo permitido: 5MB`);
                    }
                    
                    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                    if (!tiposPermitidos.includes(arquivo.mimetype)) {
                        throw new Error(`Formato de ${tipo} não suportado. Use: JPEG, PNG, GIF ou WEBP`);
                    }
                    
                    return arquivo;
                };

                const imagemPerfil = validarImagem(
                    req.files && req.files['input-imagem'] ? req.files['input-imagem'][0] : null, 
                    'foto de perfil'
                );
                
                const imagemBanner = validarImagem(
                    req.files && req.files['input-banner'] ? req.files['input-banner'][0] : null, 
                    'banner'
                );

                // Converter buffer para Base64 para armazenar no campo hidden
                if (imagemPerfil) {
                    dadosNutri.imagemPerfil = {
                        originalname: imagemPerfil.originalname,
                        mimetype: imagemPerfil.mimetype,
                        size: imagemPerfil.size,
                        buffer: imagemPerfil.buffer.toString('base64')
                    };
                }
                
                if (imagemBanner) {
                    dadosNutri.imagemBanner = {
                        originalname: imagemBanner.originalname,
                        mimetype: imagemBanner.mimetype,
                        size: imagemBanner.size,
                        buffer: imagemBanner.buffer.toString('base64')
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
                let mensagemErro = 'Erro no upload das imagens. Tente novamente.';
                
                if (error.message.includes('muito grande')) {
                    mensagemErro = error.message;
                } else if (error.message.includes('não suportado')) {
                    mensagemErro = error.message;
                } else if (error.code === 'LIMIT_FILE_SIZE') {
                    mensagemErro = 'Arquivo muito grande. Tamanho máximo permitido: 5MB';
                }
                
                return res.render("pages/indexCadastrarNutri", {
                    etapa: "2", 
                    card1: "hidden", 
                    card2: "", 
                    card3: "hidden", 
                    card4: "hidden",
                    cardSucesso: true,
                    valores: dadosNutri,
                    listaErros: { 
                        errors: [{ msg: mensagemErro }] 
                    }
                });
            }
        }

        if (etapa === "3") {
            // Recuperar imagens dos campos hidden
            if (req.body.imagemPerfilData && req.body.imagemBannerData) {
                dadosNutri.imagemPerfil = req.body.imagemPerfilData ? JSON.parse(req.body.imagemPerfilData) : null;
                dadosNutri.imagemBanner = req.body.imagemBannerData ? JSON.parse(req.body.imagemBannerData) : null;
            }
            
            // Preservar dados de formação na etapa 3
            dadosNutri.sobreMim = req.body.sobreMim || '';
            
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
            // Recuperar imagens dos campos hidden
            if (req.body.imagemPerfilData || req.body.imagemBannerData) {
                try {
                    dadosNutri.imagemPerfil = req.body.imagemPerfilData ? JSON.parse(req.body.imagemPerfilData) : null;
                    dadosNutri.imagemBanner = req.body.imagemBannerData ? JSON.parse(req.body.imagemBannerData) : null;
                } catch (error) {
                    console.error('Erro ao recuperar imagens dos campos hidden:', error.message);
                    dadosNutri.imagemPerfil = null;
                    dadosNutri.imagemBanner = null;
                }
            }
            
            try {
                // Função para validar certificados
                const validarCertificado = (arquivo, tipo) => {
                    if (!arquivo) return null;
                    
                    if (arquivo.size > 10 * 1024 * 1024) {
                        throw new Error(`${tipo} muito grande. Máximo permitido: 10MB`);
                    }
                    
                    const tiposPermitidos = [
                        'application/pdf', 
                        'image/jpeg', 
                        'image/jpg', 
                        'image/png', 
                        'image/gif', 
                        'image/webp'
                    ];
                    if (!tiposPermitidos.includes(arquivo.mimetype)) {
                        throw new Error(`Formato de ${tipo} não suportado. Use: PDF, JPEG, PNG, GIF ou WEBP`);
                    }
                    
                    return arquivo;
                };

                const certificadoFaculdade = validarCertificado(
                    req.files && req.files['certificadoFaculdade'] ? req.files['certificadoFaculdade'][0] : null,
                    'certificado de faculdade'
                );
                
                const certificadoCurso = validarCertificado(
                    req.files && req.files['certificadoCurso'] ? req.files['certificadoCurso'][0] : null,
                    'certificado de curso'
                );

                // Preparar dados de formação para o controller
                dadosNutri.certificadoFaculdade = certificadoFaculdade;
                dadosNutri.certificadoCurso = certificadoCurso;
                
                // Preservar dados de formação acadêmica
                dadosNutri.faculdade = req.body.faculdade || '';
                dadosNutri.faculdadeOrg = req.body.faculdadeOrg || '';
                dadosNutri.curso = req.body.curso || '';
                dadosNutri.cursoOrg = req.body.cursoOrg || '';

                return await NWController.cadastrarNutricionista(req, res);

            } catch (error) {
                let mensagemErro = 'Erro no upload dos certificados. Tente novamente.';
                
                if (error.message.includes('muito grande')) {
                    mensagemErro = error.message;
                } else if (error.message.includes('não suportado')) {
                    mensagemErro = error.message;
                } else if (error.code === 'LIMIT_FILE_SIZE') {
                    mensagemErro = 'Arquivo muito grande. Tamanho máximo permitido: 10MB';
                }
                
                return res.render("pages/indexCadastrarNutri", {
                    etapa: "4", 
                    card1: "hidden", 
                    card2: "hidden", 
                    card3: "hidden", 
                    card4: "",
                    cardSucesso: true,
                    valores: dadosNutri,
                    listaErros: { 
                        errors: [{ msg: mensagemErro }] 
                    }
                });
            }
        }

        return res.redirect('/cadastrarnutricionista');
    }
);

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

module.exports = router;