const NWModel = require("../models/NWModel");
const { validationResult } = require("express-validator");

const ADMController = {

  verificarAdmin: (req, res, next) => {
    if (!req.session || !req.session.usuario || !req.session.usuario.logado) {
      console.log("Usuário não logado. Redirecionando para login ADM");
      return res.redirect('/login?erro=acesso_negado');
    }

    if (req.session.usuario.tipo !== 'A') {
      console.log("Usuário não é administrador. Tipo:", req.session.usuario.tipo);
      return res.redirect('/login?erro=acesso_negado');
    }

    console.log("Usuário admin verificado:", req.session.usuario.nome);
    next();
  },

  mostrarLoginADM: (req, res) => {
    if (req.session && req.session.usuario && req.session.usuario.tipo === 'A') {
      return res.redirect('/adm');
    }

    let retorno = null;

    if (req.query.erro === 'acesso_negado') {
      retorno = { 
        tipo: 'erro', 
        mensagem: 'Você precisa estar logado como administrador para acessar esta página.' 
      };
    } else if (req.query.erro === 'sem_permissao') {
      retorno = { 
        tipo: 'erro', 
        mensagem: 'Você não tem permissão de administrador para acessar esta área.' 
      };
    } else if (req.query.erro === 'credenciais_invalidas') {
      retorno = { 
        tipo: 'erro', 
        mensagem: 'Email ou senha incorretos.' 
      };
    }

    res.render('pages/adm-login', {
      retorno: retorno,
      valores: { email: '', senha: '' },
      listaErros: null
    });
  },

  dashboard: (req, res) => {
    try {
      res.render("pages/adm-index", {
        titulo: "Painel Administrativo",
        usuario: req.session.usuario
      });
    } catch (erro) {
      console.error("Erro ao carregar dashboard:", erro);
      res.render("pages/adm-index", {
        titulo: "Painel Administrativo",
        usuario: req.session.usuario
      });
    }
  },

  obterEstatisticas: async (req, res) => {
    try {
      const totalUsuarios = await NWModel.contarUsuarios();
      const totalClientes = await NWModel.contarClientes();
      const totalNutricionistas = await NWModel.contarNutricionistas();

      console.log("Estatísticas obtidas:", {
        totalUsuarios,
        totalClientes,
        totalNutricionistas
      });

      res.json({
        totalUsuarios: totalUsuarios,
        totalClientes: totalClientes,
        totalNutricionistas: totalNutricionistas
      });

    } catch (erro) {
      console.error("Erro ao obter estatísticas:", erro);
      res.status(500).json({
        erro: "Erro ao carregar estatísticas",
        totalUsuarios: 0,
        totalClientes: 0,
        totalNutricionistas: 0
      });
    }
  },

  listarUsuarios: async (req, res) => {
    try {
      const usuarios = await NWModel.findAll();
      
      res.render("pages/adm-usuarios", {
        usuarios: usuarios,
        erro: null,
        usuario: req.session.usuario
      });
    } catch (erro) {
      console.error("Erro ao listar usuários:", erro);
      res.render("pages/adm-usuarios", {
        usuarios: [],
        erro: "Erro ao carregar usuários",
        usuario: req.session.usuario
      });
    }
  },

  exibirDetalhes: async (req, res) => {
    try {
        const { id } = req.query;
        
        if (!id || isNaN(id)) {
            return res.redirect("/adm/usuarios?erro=id_invalido");
        }

        const usuario = await NWModel.findId(id);
        
        if (!usuario) {
            return res.redirect("/adm/usuarios?erro=usuario_nao_encontrado");
        }

        const timestamp = Date.now();

        res.render("pages/adm-usuarios-detalhes", {
            usuario: usuario,
            erro: null,
            usuarioLogado: req.session.usuario,
            timestamp: timestamp
        });
    } catch (erro) {
        console.error("Erro ao buscar detalhes:", erro);
        res.redirect("/adm/usuarios?erro=erro_interno");
    }
},

  exibirEdicao: async (req, res) => {
    try {
      const { id } = req.query;
      
      if (!id || isNaN(id)) {
        return res.redirect("/adm/usuarios?erro=id_invalido");
      }

      const usuario = await NWModel.findId(id);
      
      if (!usuario) {
        return res.redirect("/adm/usuarios?erro=usuario_nao_encontrado");
      }

      const timestamp = Date.now();

      res.render("pages/adm-usuarios-editar", {
        usuario: usuario,
        valores: usuario,
        listaErros: null,
        usuarioLogado: req.session.usuario,
        timestamp: timestamp
      });
    } catch (erro) {
      console.error("Erro ao exibir edição:", erro);
      res.redirect("/adm/usuarios?erro=erro_interno");
    }
  },

  atualizarUsuario: async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const usuario = await NWModel.findId(req.body.id);
            return res.render("pages/adm-usuarios-editar", {
                usuario: usuario,
                valores: req.body,
                listaErros: errors,
                usuarioLogado: req.session.usuario
            });
        }

        const { 
            id, 
            nome, 
            email, 
            telefone, 
            ddd, 
            status,
            dataNascimento,
            cep,
            crn,
            razaoSocial,
            sobreMim
        } = req.body;

        if (!id || isNaN(id)) {
            return res.redirect("/adm/usuarios?erro=id_invalido");
        }

        const usuarioAtual = await NWModel.findId(id);
        if (!usuarioAtual) {
            return res.redirect("/adm/usuarios?erro=usuario_nao_encontrado");
        }

        console.log("Iniciando atualização do usuário ID:", id);

        let fotoPerfil = null;
        
        if (req.files && req.files['input-imagem']) {
            const arquivo = req.files['input-imagem'][0];
            
            console.log("Arquivo enviado:", {
                nome: arquivo.originalname,
                tipo: arquivo.mimetype,
                tamanho: arquivo.size
            });

            if (arquivo.size > 5 * 1024 * 1024) {
                const usuario = await NWModel.findId(id);
                const errors = {
                    array: () => [{ 
                        param: 'fotoPerfil', 
                        msg: 'Arquivo muito grande! Máximo: 5MB' 
                    }],
                    isEmpty: () => false
                };
                return res.render("pages/adm-usuarios-editar", {
                    usuario: usuario,
                    valores: req.body,
                    listaErros: errors,
                    usuarioLogado: req.session.usuario
                });
            }

            const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!tiposPermitidos.includes(arquivo.mimetype)) {
                const usuario = await NWModel.findId(id);
                const errors = {
                    array: () => [{ 
                        param: 'fotoPerfil', 
                        msg: 'Tipo de arquivo não suportado! Use: JPG, PNG, GIF ou WEBP' 
                    }],
                    isEmpty: () => false
                };
                return res.render("pages/adm-usuarios-editar", {
                    usuario: usuario,
                    valores: req.body,
                    listaErros: errors,
                    usuarioLogado: req.session.usuario
                });
            }

            fotoPerfil = arquivo.buffer;
            console.log("✓ Avatar validado com sucesso");
        }

        const dadosAtualizacao = {
            NomeCompleto: nome,
            Email: email,
            Telefone: ddd + telefone,
            UsuarioStatus: status,
            DataNascimento: dataNascimento || null,
            CEP: cep || null
        };

        let dadosEspecificos = {
            fotoPerfil: fotoPerfil
        };

        if (usuarioAtual.UsuarioTipo === 'N') {
            dadosEspecificos.Crn = crn || null;
            dadosEspecificos.RazaoSocial = razaoSocial || null;
            dadosEspecificos.SobreMim = sobreMim || null;
            console.log("Atualizando nutricionista com CRN:", crn);
        } else if (usuarioAtual.UsuarioTipo === 'C') {
            console.log("Atualizando cliente (CPF não é alterável)");
        }

        await NWModel.atualizarUsuarioCompletoADM(id, dadosAtualizacao, dadosEspecificos, usuarioAtual.UsuarioTipo);

        console.log("Usuário atualizado com sucesso pela admin:", req.session.usuario.nome);
        
        const timestamp = Date.now();
        res.redirect(`/adm/usuarios-detalhes?id=${id}&updated=${timestamp}`);

    } catch (erro) {
        console.error("Erro ao atualizar usuário:", erro);
        res.redirect("/adm/usuarios?erro=erro_atualizacao");
    }
},

  exibirExclusao: async (req, res) => {
    try {
      const { id } = req.query;
      
      console.log("Exibir exclusão - ID recebido:", id);

      if (!id || isNaN(id)) {
        console.log("Erro: ID inválido");
        return res.redirect("/adm/usuarios?erro=id_invalido");
      }

      const usuario = await NWModel.findId(id);
      
      if (!usuario) {
        console.log("Erro: Usuário não encontrado");
        return res.redirect("/adm/usuarios?erro=usuario_nao_encontrado");
      }

      console.log("Exibindo página de exclusão para usuário:", usuario.NomeCompleto);

      const timestamp = Date.now();

      res.render("pages/adm-usuarios-excluir", {
        usuario: usuario,
        usuarioLogado: req.session.usuario,
        timestamp: timestamp
      });
    } catch (erro) {
      console.error("Erro ao exibir exclusão:", erro);
      res.redirect("/adm/usuarios?erro=erro_interno");
    }
  },

  excluirUsuario: async (req, res) => {
    try {
      const id = req.query.id || req.body.id;

      console.log("Exclusão - ID query:", req.query.id);
      console.log("Exclusão - ID body:", req.body.id);
      console.log("Exclusão - ID final:", id);

      if (!id || isNaN(id)) {
        console.log("Erro: ID inválido na exclusão");
        return res.redirect("/adm/usuarios?erro=id_invalido");
      }

      await NWModel.delete(id);

      console.log("Usuário inativado pela admin:", req.session.usuario.nome, "- Usuário ID:", id);
      res.redirect("/adm/usuarios?sucesso=usuario_excluido");
    } catch (erro) {
      console.error("Erro ao excluir usuário:", erro);
      res.redirect("/adm/usuarios?erro=erro_exclusao");
    }
  }
};

module.exports = ADMController;