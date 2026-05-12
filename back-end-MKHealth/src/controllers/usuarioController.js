const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function validarCPF(cpf) {
  const cpfClean = cpf.replace(/[^\d]/g, '');
  if (cpfClean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfClean)) return false;
  return true;
}

function formatarCPF(cpf) {
  const cpfClean = cpf.replace(/[^\d]/g, '');
  return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9)}`;
}

function limparCPF(cpf) {
  return cpf.replace(/[^\d]/g, '');
}

module.exports = {
  // CADASTRO
  async criar(req, res) {
    try {
      const { nome_completo, email, cpf, senha } = req.body;

      if (!nome_completo || !email || !cpf || !senha) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
      }

      if (!validarCPF(cpf)) {
        return res.status(400).json({ erro: "CPF inválido" });
      }

      const cpfLimpo = limparCPF(cpf);
      const senhaHash = await bcrypt.hash(senha, 10);

      const usuario = await Usuario.create({
        nome_completo,
        email,
        cpf: cpfLimpo,
        senha_hash: senhaHash,
      });

      return res.status(201).json({
        sucesso: true,
        mensagem: "Cadastro realizado com sucesso",
        usuario: {
          id: usuario.id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          cpf: formatarCPF(usuario.cpf),
        }
      });

    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ erro: "Email ou CPF já cadastrado" });
      }
      console.error(error);
      return res.status(500).json({ erro: "Erro interno do servidor" });
    }
  },

  // LOGIN
  async logar(req, res) {
    try {
      const { identificador, senha } = req.body;

      if (!identificador || !senha) {
        return res.status(400).json({ erro: "Identificador e senha são obrigatórios" });
      }

      let usuario;
      if (identificador.includes('@')) {
        usuario = await Usuario.findOne({ where: { email: identificador } });
      } else {
        const cpfLimpo = limparCPF(identificador);
        usuario = await Usuario.findOne({ where: { cpf: cpfLimpo } });
      }

      if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
      if (!senhaValida) {
        return res.status(401).json({ erro: "Senha incorreta" });
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET || "CHAVE_SECRETA",
        { expiresIn: "7d" }
      );

      return res.json({
        sucesso: true,
        usuario: {
          id: usuario.id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          cpf: formatarCPF(usuario.cpf),
        },
        token
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro interno do servidor" });
    }
  },

  // LISTAR TODOS
  async listar(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: { exclude: ["senha_hash"] }
      });
      return res.json(usuarios.map(u => ({
        ...u.toJSON(),
        cpf: formatarCPF(u.cpf)
      })));
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // BUSCAR POR ID
  async buscarPorId(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.params.id, {
        attributes: { exclude: ["senha_hash"] }
      });
      if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
      return res.json({
        ...usuario.toJSON(),
        cpf: formatarCPF(usuario.cpf)
      });
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // DELETAR
  async deletar(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.params.id);
      if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
      await usuario.destroy();
      return res.json({ sucesso: true, mensagem: "Usuário removido" });
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }
};