const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

// FileFilter original (para cadastros)
const fileFilter = (req, file, cb) => {
    console.log('Validando arquivo:', file.originalname, 'Campo:', file.fieldname);
   
    // Para imagens (perfil e banner) - cadastro
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
   
    // Para certificados
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

// FileFilter para atualização de imagens
const imageFileFilter = (req, file, cb) => {
    console.log('Validando imagem:', file.originalname, 'Campo:', file.fieldname);
    
    // Para as imagens de configuração
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
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 2,
        fields: 10
    },
    fileFilter: imageFileFilter
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
       
        console.log('Upload processado');
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
            
            return res.redirect('/configuracoes?error=' + encodeURIComponent(mensagemErro));
        }
        
        console.log('Upload de imagens processado com sucesso');
        next();
    });
};

module.exports = uploadWithErrorHandling;
module.exports.uploadImagens = uploadImagensWithErrorHandling;