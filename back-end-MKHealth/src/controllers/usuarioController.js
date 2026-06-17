const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

function validarCPF(cpf) {
  console.log('🔍 [VALIDAR CPF] CPF recebido:', cpf);
  console.log('🔍 [VALIDAR CPF] Tipo do CPF:', typeof cpf);
  console.log('🔍 [VALIDAR CPF] Comprimento:', cpf?.length);
  console.log('🔍 [VALIDAR CPF] Caracteres:', cpf?.split('').map(c => ({ char: c, code: c.charCodeAt(0) })));
  
  if (!cpf) {
    console.log('❌ [VALIDAR CPF] CPF é null ou undefined');
    return false;
  }
  
  const cpfClean = cpf.replace(/[^\d]/g, '');
  console.log('🔍 [VALIDAR CPF] CPF limpo:', cpfClean);
  console.log('🔍 [VALIDAR CPF] Tamanho do CPF limpo:', cpfClean.length);
  
  if (cpfClean.length !== 11) {
    console.log('❌ [VALIDAR CPF] Tamanho inválido - esperado 11, recebido:', cpfClean.length);
    return false;
  }
  
  if (/^(\d)\1{10}$/.test(cpfClean)) {
    console.log('❌ [VALIDAR CPF] CPF com todos dígitos iguais');
    return false;
  }
  
  let soma = 0;
  let resto;
  
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfClean.charAt(i)) * (10 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfClean.charAt(9))) {
    console.log('❌ [VALIDAR CPF] Primeiro dígito verificador inválido');
    return false;
  }
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfClean.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfClean.charAt(10))) {
    console.log('❌ [VALIDAR CPF] Segundo dígito verificador inválido');
    return false;
  }
  
  console.log('✅ [VALIDAR CPF] CPF válido!');
  return true;
}

function formatarCPF(cpf) {
  const cpfClean = cpf.replace(/[^\d]/g, '');
  if (cpfClean.length !== 11) return cpf;
  return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9, 11)}`;
}

function limparCPF(cpf) {
  if (!cpf) return '';
  console.log('🧹 [LIMPAR CPF] Recebido:', cpf);
  console.log('🧹 [LIMPAR CPF] Tipo:', typeof cpf);
  const limpo = cpf.replace(/[^\d]/g, '');
  console.log('🧹 [LIMPAR CPF] Resultado:', limpo);
  console.log('🧹 [LIMPAR CPF] Tamanho:', limpo.length);
  return limpo;
}

module.exports = {
  // CADASTRO - ROTA: /cadastro
  async criar(req, res) {
    try {
      console.log('\n📝 ========== INICIANDO CADASTRO ==========');
      console.log('📝 Body recebido:', req.body);
      console.log('📝 Body keys:', Object.keys(req.body));
      console.log('📝 File recebido:', req.file ? 'SIM - ' + req.file.filename : 'NÃO');
      
      const { nome_completo, email, cpf, senha } = req.body;

      console.log('\n🆔 ====== CPF RECEBIDO ======');
      console.log('🆔 Valor:', cpf);
      console.log('🆔 Tipo:', typeof cpf);
      console.log('🆔 Tamanho:', cpf?.length);
      console.log('🆔 Caracteres (códigos):', cpf?.split('').map(c => c.charCodeAt(0)));
      console.log('🆔 Caracteres (visuais):', cpf?.split('').map(c => `'${c}'`));
      console.log('🆔 ============================\n');

      if (!nome_completo || !email || !cpf || !senha) {
        console.log('❌ Campos obrigatórios faltando');
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
      }

      console.log('🔐 ====== VALIDANDO CPF ======');
      const cpfValido = validarCPF(cpf);
      console.log('🔐 Resultado:', cpfValido);
      console.log('🔐 ============================\n');
      
      if (!cpfValido) {
        console.log('❌ CPF inválido!');
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ erro: "CPF inválido" });
      }

      const cpfLimpo = limparCPF(cpf);
      console.log('✅ CPF limpo final:', cpfLimpo);
      
      const senhaHash = await bcrypt.hash(senha, 10);
      console.log('✅ Senha hasheada');

      let foto = null;
      if (req.file) {
        foto = `/uploads/foto/${req.file.filename}`;
        console.log('📸 Foto salva:', foto);
      }

      console.log('🔍 Verificando se CPF já existe:', cpfLimpo);
      const usuarioExistente = await Usuario.findOne({ where: { cpf: cpfLimpo } });
      if (usuarioExistente) {
        console.log('❌ CPF já cadastrado! ID:', usuarioExistente.id);
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(409).json({ erro: "CPF já cadastrado" });
      }

      console.log('\n💾 ====== CRIANDO USUÁRIO ======');
      console.log('  - nome_completo:', nome_completo.trim());
      console.log('  - email:', email.trim().toLowerCase());
      console.log('  - cpf:', cpfLimpo);
      console.log('  - cpf tamanho:', cpfLimpo.length);

      const usuario = await Usuario.create({
        nome_completo: nome_completo.trim(),
        email: email.trim().toLowerCase(),
        cpf: cpfLimpo,
        senha_hash: senhaHash,
        foto: foto
      });

      console.log('\n✅ Usuário criado com ID:', usuario.id);
      console.log('✅ CPF salvo:', usuario.cpf);
      console.log('📝 ========== FIM CADASTRO ==========\n');

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
      console.error('❌ Erro no cadastro:', error);
      console.error('❌ Stack:', error.stack);
      
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        let mensagem = 'Email ou CPF já cadastrado';
        if (error.fields) {
          if (error.fields.email) mensagem = 'E-mail já cadastrado';
          else if (error.fields.cpf) mensagem = 'CPF já cadastrado';
        }
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

  // LOGIN - ROTA: /login
  async logar(req, res) {
    try {
      console.log('\n🔐 ========== TENTATIVA DE LOGIN ==========');
      console.log('📝 Body recebido:', req.body);
      console.log('📝 Body completo:', JSON.stringify(req.body, null, 2));
      
      const { identificador, senha } = req.body;

      console.log('\n🆔 ====== ANALISANDO IDENTIFICADOR ======');
      console.log('🆔 Valor:', identificador);
      console.log('🆔 Tipo:', typeof identificador);
      console.log('🆔 Tamanho:', identificador?.length);
      console.log('🆔 Caracteres (códigos):', identificador?.split('').map(c => c.charCodeAt(0)));
      console.log('🆔 Caracteres (visuais):', identificador?.split('').map(c => `'${c}'`));
      console.log('🆔 Contém @?', identificador?.includes('@'));
      console.log('🆔 ======================================\n');

      if (!identificador || !senha) {
        console.log('❌ Identificador ou senha vazios');
        return res.status(400).json({ erro: "Identificador e senha são obrigatórios" });
      }

      let usuario;
      
      if (identificador.includes('@')) {
        console.log('📧 Identificador é EMAIL');
        const emailClean = identificador.trim().toLowerCase();
        console.log('📧 Email limpo:', emailClean);
        usuario = await Usuario.findOne({ where: { email: emailClean } });
      } else {
        console.log('🆔 Identificador é CPF');
        const cpfLimpo = limparCPF(identificador);
        console.log('🆔 CPF limpo:', cpfLimpo);
        console.log('🆔 Tamanho do CPF limpo:', cpfLimpo.length);
        
        // Listar todos os usuários
        console.log('\n📋 ====== USUÁRIOS NO BANCO ======');
        const todosUsuarios = await Usuario.findAll({
          attributes: ['id', 'nome_completo', 'email', 'cpf']
        });
        console.log(`📋 Total: ${todosUsuarios.length} usuários`);
        todosUsuarios.forEach(u => {
          console.log(`📋 ID: ${u.id}, Nome: ${u.nome_completo}, CPF: '${u.cpf}' (tamanho: ${u.cpf?.length})`);
        });
        console.log('📋 ================================\n');
        
        console.log(`🔍 Buscando por CPF: '${cpfLimpo}'`);
        usuario = await Usuario.findOne({ where: { cpf: cpfLimpo } });
        
        if (!usuario) {
          console.log('❌ Usuário NÃO encontrado com CPF exato');
          const cpfComMascara = formatarCPF(cpfLimpo);
          console.log(`🔍 Tentando com CPF formatado: '${cpfComMascara}'`);
          usuario = await Usuario.findOne({ where: { cpf: cpfComMascara } });
          
          if (usuario) {
            console.log('✅ ENCONTRADO com CPF formatado!');
          } else {
            console.log('❌ Também não encontrado com CPF formatado');
          }
        }
      }

      if (!usuario) {
        console.log('❌ Usuário NÃO encontrado!');
        return res.status(404).json({ erro: "Usuário não encontrado. Verifique seu CPF/Email" });
      }

      console.log('\n✅ Usuário ENCONTRADO:');
      console.log('  - ID:', usuario.id);
      console.log('  - Nome:', usuario.nome_completo);
      console.log('  - Email:', usuario.email);
      console.log('  - CPF:', usuario.cpf);

      console.log('\n🔐 Verificando senha...');
      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
      console.log('🔐 Senha válida?', senhaValida);
      
      if (!senhaValida) {
        console.log('❌ Senha incorreta');
        return res.status(401).json({ erro: "Senha incorreta" });
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

      console.log('\n✅ Login realizado com sucesso!');
      console.log('✅ Token gerado:', token.substring(0, 30) + '...');
      console.log('🔐 ========== FIM LOGIN ==========\n');

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
      console.error('❌ Stack:', error.stack);
      return res.status(500).json({ 
        erro: "Erro interno do servidor",
        detalhe: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ===== ROTA DE VERIFICAÇÃO =====
  async verificarUsuarios(req, res) {
    try {
      console.log('\n📋 ====== VERIFICANDO USUÁRIOS ======');
      const usuarios = await Usuario.findAll({
        attributes: ['id', 'nome_completo', 'email', 'cpf', 'createdAt']
      });
      
      console.log(`📋 Total: ${usuarios.length} usuários`);
      const usuariosFormatados = usuarios.map(u => ({
        id: u.id,
        nome: u.nome_completo,
        email: u.email,
        cpf: u.cpf,
        cpf_tamanho: u.cpf?.length,
        criado_em: u.createdAt
      }));
      
      usuariosFormatados.forEach(u => {
        console.log(`📋 ID: ${u.id}, Nome: ${u.nome}, CPF: '${u.cpf}' (${u.cpf_tamanho} caracteres)`);
      });
      console.log('📋 ==================================\n');
      
      return res.json({
        total: usuarios.length,
        usuarios: usuariosFormatados
      });
    } catch (error) {
      console.error('❌ Erro ao verificar:', error);
      return res.status(500).json({ erro: error.message });
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
      return res.status(500).json({ erro: error.message });
    }
  },

  // BUSCAR POR ID
  async buscarPorId(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.params.id, {
        attributes: { exclude: ["senha_hash"] }
      });
      
      if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
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
      return res.status(500).json({ erro: error.message });
    }
  },

  // ATUALIZAR FOTO
  async atualizarFoto(req, res) {
    try {
      console.log('📸 Atualizando foto...');
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      if (!req.file) {
        return res.status(400).json({ erro: "Nenhuma imagem foi enviada" });
      }

      if (usuario.foto) {
        const oldFotoPath = path.join(__dirname, '..', usuario.foto);
        if (fs.existsSync(oldFotoPath)) {
          fs.unlinkSync(oldFotoPath);
        }
      }

      const novaFoto = `/uploads/foto/${req.file.filename}`;
      await usuario.update({ foto: novaFoto });

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
      return res.status(500).json({ erro: "Erro interno do servidor" });
    }
  },

  // DELETAR
  async deletar(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.params.id);
      
      if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }
      
      if (usuario.foto) {
        const fotoPath = path.join(__dirname, '..', usuario.foto);
        if (fs.existsSync(fotoPath)) {
          fs.unlinkSync(fotoPath);
        }
      }
      
      await usuario.destroy();
      
      return res.json({ 
        sucesso: true, 
        mensagem: "Usuário removido com sucesso" 
      });
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      return res.status(500).json({ erro: error.message });
    }
  }
};