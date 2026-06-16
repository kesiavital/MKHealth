const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

function validarCPF(cpf) {
  const cpfClean = cpf.replace(/[^\d]/g, '');
  if (cpfClean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfClean)) return false;
  
  let soma = 0;
  let resto;
  
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfClean.charAt(i)) * (10 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfClean.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfClean.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfClean.charAt(10))) return false;
  
  return true;
}

function formatarCPF(cpf) {
  const cpfClean = cpf.replace(/[^\d]/g, '');
  if (cpfClean.length !== 11) return cpf;
  return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9, 11)}`;
}

function limparCPF(cpf) {
  return cpf.replace(/[^\d]/g, '');
}

module.exports = {
  // CADASTRO
  async criar(req, res) {
    try {
      console.log('📝 Iniciando cadastro...');
      console.log('📝 Body recebido:', req.body);
      console.log('📸 Arquivo recebido:', req.file);
      
      const { nome_completo, email, cpf, senha } = req.body;

      // Validação de campos obrigatórios
      if (!nome_completo || !email || !cpf || !senha) {
        // Se erro e tem foto, deletar
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          erro: "Todos os campos são obrigatórios" 
        });
      }

      // Validação do CPF
      if (!validarCPF(cpf)) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          erro: "CPF inválido" 
        });
      }

      const cpfLimpo = limparCPF(cpf);
      console.log('✅ CPF válido:', cpfLimpo);
      
      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);
      console.log('✅ Senha hasheada');

      // Processar foto se foi enviada
      let foto = null;
      if (req.file) {
        foto = `/uploads/foto/${req.file.filename}`;
        console.log('📸 Foto salva:', foto);
      }

      // Criar usuário
      const usuario = await Usuario.create({
        nome_completo: nome_completo.trim(),
        email: email.trim().toLowerCase(),
        cpf: cpfLimpo,
        senha_hash: senhaHash,
        foto: foto
      });

      console.log('✅ Usuário criado com ID:', usuario.id);

      // Resposta de sucesso
      return res.status(201).json({
        sucesso: true,
        mensagem: "Cadastro realizado com sucesso",
        usuario: {
          id: usuario.id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          cpf: formatarCPF(usuario.cpf),
          foto: usuario.foto
        }
      });

    } catch (error) {
      console.error('❌ Erro detalhado no cadastro:', error);
      
      // Se houve erro e uma foto foi enviada, deletar a foto
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Foto deletada devido ao erro');
      }
      
      // Tratamento específico para erro de unicidade (duplicado)
      if (error.name === 'SequelizeUniqueConstraintError') {
        let mensagem = 'Email ou CPF já cadastrado';
        
        if (error.fields) {
          if (error.fields.email) {
            mensagem = 'E-mail já cadastrado';
          } else if (error.fields.cpf) {
            mensagem = 'CPF já cadastrado';
          }
        }
        
        const errorMessage = error.message || '';
        if (errorMessage.includes('email')) {
          mensagem = 'E-mail já cadastrado';
        } else if (errorMessage.includes('cpf')) {
          mensagem = 'CPF já cadastrado';
        }
        
        console.log('❌ Conflito:', mensagem);
        return res.status(409).json({ erro: mensagem });
      }
      
      if (error.name === 'SequelizeValidationError') {
        const mensagens = error.errors.map(err => err.message).join(', ');
        return res.status(400).json({ erro: mensagens });
      }
      
      return res.status(500).json({ 
        erro: "Erro interno do servidor",
        detalhe: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // LOGIN
  async logar(req, res) {
    try {
      console.log('🔐 Tentativa de login...');
      console.log('📝 Body:', req.body);
      
      const { identificador, senha } = req.body;

      if (!identificador || !senha) {
        return res.status(400).json({ 
          erro: "Identificador e senha são obrigatórios" 
        });
      }

      let usuario;
      if (identificador.includes('@')) {
        usuario = await Usuario.findOne({ 
          where: { email: identificador.trim().toLowerCase() } 
        });
      } else {
        const cpfLimpo = limparCPF(identificador);
        usuario = await Usuario.findOne({ 
          where: { cpf: cpfLimpo } 
        });
      }

      if (!usuario) {
        console.log('❌ Usuário não encontrado');
        return res.status(404).json({ 
          erro: "Usuário não encontrado" 
        });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
      if (!senhaValida) {
        console.log('❌ Senha incorreta');
        return res.status(401).json({ 
          erro: "Senha incorreta" 
        });
      }

      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email,
          nome_completo: usuario.nome_completo 
        },
        process.env.JWT_SECRET || "CHAVE_SECRETA_DESENVOLVIMENTO",
        { expiresIn: "7d" }
      );

      console.log('✅ Login realizado com sucesso para:', usuario.email);

      return res.json({
        sucesso: true,
        mensagem: "Login realizado com sucesso",
        usuario: {
          id: usuario.id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          cpf: formatarCPF(usuario.cpf),
          foto: usuario.foto
        },
        token
      });

    } catch (error) {
      console.error('❌ Erro no login:', error);
      return res.status(500).json({ 
        erro: "Erro interno do servidor" 
      });
    }
  },

  // LISTAR TODOS
  async listar(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: { exclude: ["senha_hash"] },
        order: [['id', 'ASC']]
      });
      
      const usuariosFormatados = usuarios.map(u => ({
        id: u.id,
        nome_completo: u.nome_completo,
        email: u.email,
        cpf: formatarCPF(u.cpf),
        foto: u.foto
      }));
      
      return res.json(usuariosFormatados);
    } catch (error) {
      console.error('❌ Erro ao listar:', error);
      return res.status(500).json({ 
        erro: error.message 
      });
    }
  },

  // BUSCAR POR ID
  async buscarPorId(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.params.id, {
        attributes: { exclude: ["senha_hash"] }
      });
      
      if (!usuario) {
        return res.status(404).json({ 
          erro: "Usuário não encontrado" 
        });
      }
      
      return res.json({
        id: usuario.id,
        nome_completo: usuario.nome_completo,
        email: usuario.email,
        cpf: formatarCPF(usuario.cpf),
        foto: usuario.foto
      });
    } catch (error) {
      console.error('❌ Erro ao buscar por ID:', error);
      return res.status(500).json({ 
        erro: error.message 
      });
    }
  },

  // ATUALIZAR FOTO
  async atualizarFoto(req, res) {
    try {
      console.log('📸 Atualizando foto...');
      console.log('📝 ID do usuário:', req.params.id);
      console.log('📸 Arquivo:', req.file);

      const { id } = req.params;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ 
          erro: "Usuário não encontrado" 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          erro: "Nenhuma imagem foi enviada" 
        });
      }

      // Deletar foto antiga se existir
      if (usuario.foto) {
        const oldFotoPath = path.join(__dirname, '..', usuario.foto);
        if (fs.existsSync(oldFotoPath)) {
          fs.unlinkSync(oldFotoPath);
          console.log('🗑️ Foto antiga deletada:', oldFotoPath);
        }
      }

      // Salvar nova foto
      const novaFoto = `/uploads/foto/${req.file.filename}`;
      await usuario.update({ foto: novaFoto });

      console.log('✅ Foto atualizada com sucesso:', novaFoto);

      return res.json({
        sucesso: true,
        mensagem: "Foto atualizada com sucesso",
        usuario: {
          id: usuario.id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          cpf: formatarCPF(usuario.cpf),
          foto: novaFoto
        }
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar foto:', error);
      
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({ 
        erro: "Erro interno do servidor"
      });
    }
  },

  // DELETAR
  async deletar(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.params.id);
      
      if (!usuario) {
        return res.status(404).json({ 
          erro: "Usuário não encontrado" 
        });
      }
      
      // Deletar foto do sistema se existir
      if (usuario.foto) {
        const fotoPath = path.join(__dirname, '..', usuario.foto);
        if (fs.existsSync(fotoPath)) {
          fs.unlinkSync(fotoPath);
          console.log('🗑️ Foto deletada do sistema:', fotoPath);
        }
      }
      
      await usuario.destroy();
      
      return res.json({ 
        sucesso: true, 
        mensagem: "Usuário removido com sucesso" 
      });
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      return res.status(500).json({ 
        erro: error.message 
      });
    }
  }
};