const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/uploads');
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 10000);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const filename = `${cleanName}-${timestamp}-${randomNum}${ext}`;
        
        console.log(`Arquivo será salvo como: ${filename}`);
        cb(null, filename);
    }
});

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/uploads');
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 10000);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const filename = `${cleanName}-${timestamp}-${randomNum}${ext}`;
        
        console.log(`Imagem será salva como: ${filename}`);
        cb(null, filename);
    }
});

const publicacaoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/uploads/publicacoes');
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('📁 Diretório de publicações criado:', uploadDir);
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 10000);
        const ext = path.extname(file.originalname);
        const filename = `publicacao-${timestamp}-${randomNum}${ext}`;
        
        console.log(`📸 Publicação será salva como: ${filename}`);
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('Validando arquivo:', file.originalname, 'Campo:', file.fieldname);
   
    if (file.fieldname === 'input-imagem' || file.fieldname === 'input-banner') {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            return cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)'));
        }
    }
   
    if (file.fieldname === 'certificadoFaculdade' || file.fieldname === 'certificadoCurso') {
        const allowedTypes = /pdf|jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = /application\/pdf|image\/(jpeg|jpg|png)/.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            return cb(new Error('Certificados devem ser PDF ou imagem (JPEG, PNG)'));
        }
    }
   
    cb(new Error('Campo de arquivo não reconhecido'));
};

const imageFileFilter = (req, file, cb) => {
    console.log('Validando imagem:', file.originalname, 'Campo:', file.fieldname);
    
    if (file.fieldname === 'fotoPerfil' || file.fieldname === 'fotoBanner') {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            return cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)'));
        }
    }
    
    cb(new Error('Campo de arquivo não reconhecido'));
};

const publicacaoFileFilter = (req, file, cb) => {
    console.log('Validando imagem de publicação:', file.originalname);
    
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        return cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)'));
    }
};

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 10 * 1024 * 1024, 
        files: 4,
        fields: 30
    },
    fileFilter: fileFilter
});

const uploadImagens = multer({
    storage: imageStorage, 
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 2,
        fields: 10
    },
    fileFilter: imageFileFilter
});

const uploadPublicacao = multer({
    storage: publicacaoStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: publicacaoFileFilter
});

const uploadWithErrorHandling = (req, res, next) => {
    const uploadMiddleware = upload.fields([
        { name: 'input-imagem', maxCount: 1 },
        { name: 'input-banner', maxCount: 1 },
        { name: 'certificadoFaculdade', maxCount: 1 },
        { name: 'certificadoCurso', maxCount: 1 }
    ]);
    
    uploadMiddleware(req, res, (err) => {
        if (err) {
            console.error('Erro no upload:', err.message);
           
            let mensagemErro = 'Erro no upload dos arquivos';
           
            if (err.code === 'LIMIT_FILE_SIZE') {
                mensagemErro = 'Arquivo muito grande. Máximo: 10MB';
            } else if (err.message.includes('Apenas imagens')) {
                mensagemErro = err.message;
            } else if (err.message.includes('Certificados devem')) {
                mensagemErro = err.message;
            }
           
            return res.render("pages/indexCadastrarNutri", {
                etapa: req.body?.etapa || "1",
                card1: req.body?.etapa === "1" ? "" : "hidden",
                card2: req.body?.etapa === "2" ? "" : "hidden",
                card3: req.body?.etapa === "3" ? "" : "hidden",
                card4: req.body?.etapa === "4" ? "" : "hidden",
                valores: req.body || {},
                listaErros: { errors: [{ msg: mensagemErro }] }
            });
        }
       
        console.log('Upload processado com sucesso');
        console.log('Arquivos recebidos:', req.files ? Object.keys(req.files) : 'nenhum');
        
        next();
    });
};

const uploadImagensWithErrorHandling = (req, res, next) => {
    const uploadMiddleware = uploadImagens.fields([
        { name: 'fotoPerfil', maxCount: 1 },
        { name: 'fotoBanner', maxCount: 1 }
    ]);
    
    uploadMiddleware(req, res, (err) => {
        if (err) {
            console.error('Erro no upload das imagens:', err.message);
            
            let mensagemErro = 'Erro no upload das imagens';
            
            if (err.code === 'LIMIT_FILE_SIZE') {
                mensagemErro = 'Imagem muito grande. Máximo: 5MB';
            } else if (err.message.includes('Apenas imagens')) {
                mensagemErro = err.message;
            }
            
            return res.redirect('/config?error=' + encodeURIComponent(mensagemErro));
        }
        
        console.log('Upload de imagens processado com sucesso');
        console.log('Arquivos recebidos:', req.files ? Object.keys(req.files) : 'nenhum');
        
        next();
    });
};

const uploadPublicacaoWithErrorHandling = (req, res, next) => {
    const uploadMiddleware = uploadPublicacao.single('imagem');
    
    uploadMiddleware(req, res, (err) => {
        if (err) {
            console.error('❌ Erro no upload da publicação:', err.message);
            
            let parametroErro = 'erro_criar_publicacao';
            
            if (err.code === 'LIMIT_FILE_SIZE') {
                parametroErro = 'imagem_invalida';
            } else if (err.message.includes('Apenas imagens')) {
                parametroErro = 'imagem_invalida';
            }
            
            return res.redirect(`/perfilnutri?erro=${parametroErro}`);
        }
        
        console.log('✅ Upload de publicação processado com sucesso');
        console.log('Arquivo recebido:', req.file ? req.file.filename : 'nenhum');
        
        next();
    });

    const adminStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/uploads');
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('📁 Diretório de uploads criado:', uploadDir);
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 10000);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const filename = `admin-${cleanName}-${timestamp}-${randomNum}${ext}`;
        
        console.log(`📸 Imagem admin será salva como: ${filename}`);
        cb(null, filename);
    }
    });

    const adminFileFilter = (req, file, cb) => {
    console.log('Validando imagem admin:', file.originalname, 'Campo:', file.fieldname);
    
    if (file.fieldname === 'input-imagem') {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            return cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)'));
        }
    }
    
    cb(new Error('Campo de arquivo não reconhecido'));
    };

    const uploadAdminMulter = multer({
        storage: adminStorage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
            files: 1,
            fields: 20
        },
        fileFilter: adminFileFilter
    });

    const uploadAdminWithErrorHandling = (req, res, next) => {
    const uploadMiddleware = uploadAdminMulter.fields([
        { name: 'input-imagem', maxCount: 1 }
    ]);
    
    uploadMiddleware(req, res, async (err) => {
        if (err) {
            console.error('❌ Erro no upload admin:', err.message);
            
            let mensagemErro = 'Erro no upload da imagem';
            
            if (err.code === 'LIMIT_FILE_SIZE') {
                mensagemErro = 'Imagem muito grande. Máximo: 5MB';
            } else if (err.message.includes('Apenas imagens')) {
                mensagemErro = err.message;
            }
            
            // Buscar dados do usuário para reexibir o formulário
            const NWModel = require("../models/NWModel");
            const usuario = await NWModel.findId(req.body.id);
            
            return res.render("pages/adm-usuarios-editar", {
                usuario: usuario,
                valores: req.body,
                listaErros: {
                    array: () => [{ param: 'fotoPerfil', msg: mensagemErro }],
                    isEmpty: () => false
                },
                usuarioLogado: req.session.usuario
            });
        }
        
        console.log('✅ Upload admin processado com sucesso');
        console.log('Arquivos recebidos:', req.files ? Object.keys(req.files) : 'nenhum');
        
        next();
    });
};

};

module.exports = uploadWithErrorHandling;
module.exports.uploadImagens = uploadImagensWithErrorHandling;
module.exports.uploadPublicacao = uploadPublicacaoWithErrorHandling; // NOVO