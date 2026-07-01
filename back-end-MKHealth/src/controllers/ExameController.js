
const Exame = require("../models/Exame");
const Usuario = require("../models/Usuario");
const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');
const { uploadDir } = require('../config/upload');

// Funções auxiliares
function formatarData(data) {
  if (!data) return null;
  const date = new Date(data);
  return date.toISOString().split('T')[0];
}

function validarData(data) {
  if (!data) return false;
  const date = new Date(data);
  return !isNaN(date.getTime());
}

function deletarArquivoPdf(filename) {
  if (!filename) return;
<<<<<<< HEAD

=======
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`📄 Arquivo deletado: ${filename}`);
    } catch (error) {
      console.error(`❌ Erro ao deletar arquivo ${filename}:`, error);
    }
  }
}

function verificarPdfExiste(filename) {
  if (!filename) return false;
  const filePath = path.join(uploadDir, filename);
  return fs.existsSync(filePath);
}

module.exports = {
<<<<<<< HEAD
  // ============================================
  // CRIAR EXAME (com upload de PDF)
  // ============================================
  async criar(req, res) {
    try {
      console.log('📝 Iniciando cadastro de exame...');
      console.log('📝 Body recebido:', req.body);
      console.log('📎 Arquivo recebido:', req.file ? req.file.originalname : 'Nenhum');

      const {
        paciente_nome,
        tipo_exame,
        data_exame,
        medico_solicitante,
        laboratorio,
        resultados,
        observacoes
      } = req.body;

      // Validação de campos obrigatórios
      if (!paciente_nome || !tipo_exame || !data_exame || !medico_solicitante || !laboratorio) {
        if (req.file) {
          deletarArquivoPdf(req.file.filename);
        }
        return res.status(400).json({
          erro: "Todos os campos obrigatórios devem ser preenchidos: paciente_nome, tipo_exame, data_exame, medico_solicitante, laboratorio"
        });
=======
  // CRIAR EXAME
  async criar(req, res) {
    try {
      console.log('📝 Iniciando cadastro de exame...');
      
      const { paciente_cpf, tipo_exame, data_exame, medico_solicitante, laboratorio, resultados, observacoes } = req.body;

      if (!paciente_cpf || !tipo_exame || !data_exame || !medico_solicitante || !laboratorio) {
        if (req.file) deletarArquivoPdf(req.file.filename);
        return res.status(400).json({ erro: "Todos os campos obrigatórios devem ser preenchidos" });
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      }

      if (!validarData(data_exame)) {
<<<<<<< HEAD
        if (req.file) {
          deletarArquivoPdf(req.file.filename);
        }
        return res.status(400).json({
          erro: "Data do exame inválida"
        });
=======
        if (req.file) deletarArquivoPdf(req.file.filename);
        return res.status(400).json({ erro: "Data do exame inválida" });
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      }

      const cpfLimpo = paciente_cpf.replace(/[^\d]/g, '');

      const paciente = await Usuario.findOne({ where: { cpf: cpfLimpo } });

      if (!paciente) {
        if (req.file) deletarArquivoPdf(req.file.filename);
        return res.status(404).json({ erro: "Paciente não encontrado. Verifique se o CPF foi digitado corretamente." });
      }

      let pdfData = {};
      if (req.file) {
        pdfData = {
          pdf_filename: req.file.filename,
          pdf_originalname: req.file.originalname,
          pdf_size: req.file.size,
          pdf_mimetype: req.file.mimetype,
          pdf_path: `/uploads/exams/${req.file.filename}`
        };
      }

      const exame = await Exame.create({
        paciente_id: paciente.id,
        tipo_exame: tipo_exame.trim(),
        data_exame: data_exame,
        medico_solicitante: medico_solicitante.trim(),
        laboratorio: laboratorio.trim(),
        resultados: resultados || null,
        observacoes: observacoes || null,
        ...pdfData
      });

      return res.status(201).json({
        sucesso: true,
        mensagem: "Exame cadastrado com sucesso",
        exame: {
          id: exame.id,
          paciente_nome: paciente.nome_completo,
          tipo_exame: exame.tipo_exame,
          data_exame: formatarData(exame.data_exame),
          medico_solicitante: exame.medico_solicitante,
          laboratorio: exame.laboratorio,
          resultados: exame.resultados,
          observacoes: exame.observacoes,
          possui_pdf: !!exame.pdf_filename,
          pdf_nome: exame.pdf_originalname,
          pdf_tamanho: exame.pdf_size,
          pdf_path: exame.pdf_path,
          created_at: exame.createdAt,
          updated_at: exame.updatedAt
        }
      });

    } catch (error) {
      console.error('❌ Erro detalhado no cadastro do exame:', error);
<<<<<<< HEAD

      if (req.file) {
        deletarArquivoPdf(req.file.filename);
      }

      if (error.name === 'SequelizeValidationError') {
        const mensagens = error.errors.map(err => err.message).join(', ');
        return res.status(400).json({ erro: mensagens });
      }

      return res.status(500).json({
        erro: "Erro interno do servidor",
        detalhe: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
=======
      if (req.file) deletarArquivoPdf(req.file.filename);
      return res.status(500).json({ erro: "Erro interno do servidor" });
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
    }
  },

  // ============================================
  // LISTAR TODOS OS EXAMES
  // ============================================
  async listar(req, res) {
    try {
      console.log('🔍 Buscando todos os exames...');

      const exames = await Exame.findAll({
        // 👇 AQUI AVISAMOS PARA USAR O APELIDO 'paciente'
        include: [{ model: Usuario, as: 'paciente', attributes: ['nome_completo'] }], 
        order: [['data_exame', 'DESC']]
      });

      const examesFormatados = exames.map(e => ({
        id: e.id,
        // 👇 AQUI BUSCAMOS A PARTIR DO APELIDO e.paciente
        paciente_nome: e.paciente ? e.paciente.nome_completo : 'Paciente Desconhecido', 
        tipo_exame: e.tipo_exame,
        data_exame: formatarData(e.data_exame),
        medico_solicitante: e.medico_solicitante,
        laboratorio: e.laboratorio,
        resultados: e.resultados,
        observacoes: e.observacoes,
        possui_pdf: !!e.pdf_filename && verificarPdfExiste(e.pdf_filename),
        pdf_nome: e.pdf_originalname,
        pdf_tamanho: e.pdf_size,
        pdf_path: e.pdf_path,
        created_at: e.createdAt,
        updated_at: e.updatedAt
      }));
<<<<<<< HEAD

      console.log(`✅ Encontrados ${examesFormatados.length} exames`);

      return res.json(examesFormatados);
    } catch (error) {
      console.error('❌ Erro ao listar exames:', error);
      return res.status(500).json({
        erro: error.message
      });
=======
      
      return res.json(examesFormatados);
    } catch (error) {
      console.error('❌ Erro ao listar exames:', error);
      return res.status(500).json({ erro: error.message });
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
    }
  },

  // ============================================
  // BUSCAR EXAME POR ID
  // ============================================
  async buscarPorId(req, res) {
    try {
<<<<<<< HEAD
      console.log(`🔍 Buscando exame por ID: ${req.params.id}`);

      const exame = await Exame.findByPk(req.params.id);

      if (!exame) {
        return res.status(404).json({
          erro: "Exame não encontrado"
        });
      }

=======
      const exame = await Exame.findByPk(req.params.id, {
        include: [{ model: Usuario, as: 'paciente', attributes: ['nome_completo'] }]
      });
      
      if (!exame) return res.status(404).json({ erro: "Exame não encontrado" });
      
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      return res.json({
        id: exame.id,
        paciente_nome: exame.paciente ? exame.paciente.nome_completo : 'Paciente Desconhecido',
        tipo_exame: exame.tipo_exame,
        data_exame: formatarData(exame.data_exame),
        medico_solicitante: exame.medico_solicitante,
        // ... (mantido os outros campos iguais)
        laboratorio: exame.laboratorio,
        resultados: exame.resultados,
        observacoes: exame.observacoes,
        possui_pdf: !!exame.pdf_filename && verificarPdfExiste(exame.pdf_filename),
        pdf_nome: exame.pdf_originalname,
        pdf_tamanho: exame.pdf_size,
        pdf_path: exame.pdf_path,
        created_at: exame.createdAt,
        updated_at: exame.updatedAt
      });
    } catch (error) {
<<<<<<< HEAD
      console.error('❌ Erro ao buscar exame por ID:', error);
      return res.status(500).json({
        erro: error.message
      });
    }
  },

  // ============================================
  // DOWNLOAD DO PDF (COM VERIFICAÇÃO DE PERMISSÃO)
  // ============================================
=======
      return res.status(500).json({ erro: error.message });
    }
  },

  // DOWNLOAD DO PDF (Mantido intacto)
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
  async downloadPdf(req, res) {
    try {
      console.log('📥 ====== DOWNLOAD PDF ======');
      console.log('👤 Usuário autenticado:', req.user);
      console.log('📌 ID do exame:', req.params.id);

      const exame = await Exame.findByPk(req.params.id);
<<<<<<< HEAD

      if (!exame) {
        console.log('❌ Exame não encontrado');
        return res.status(404).json({
          erro: "Exame não encontrado"
        });
      }

      // ===== VERIFICAR PERMISSÃO =====
      const { id: usuarioId, tipo_usuario, nome_completo, cpf } = req.user;

      if (tipo_usuario !== 1) {
        const pertenceAoPaciente =
          exame.paciente_nome?.toLowerCase() === nome_completo?.toLowerCase() ||
          exame.paciente_cpf === cpf;

        if (!pertenceAoPaciente) {
          console.log('❌ Acesso negado');
          return res.status(403).json({
            erro: "Acesso negado"
          });
        }
      }

      if (!exame.pdf_filename) {
        console.log('❌ Exame não possui PDF');
        return res.status(404).json({
          erro: "PDF não encontrado para este exame"
        });
      }

      const filePath = path.join(uploadDir, exame.pdf_filename);
      console.log('📄 Caminho do PDF:', filePath);

      if (!fs.existsSync(filePath)) {
        console.log('❌ Arquivo não encontrado');
        return res.status(404).json({
          erro: "Arquivo PDF não encontrado no servidor",
          filename: exame.pdf_filename,
          procurado_em: filePath
        });
      }

      // Forçar download
      res.download(filePath, exame.pdf_originalname, (err) => {
        if (err) {
          console.error('❌ Erro no download:', err);
          if (!res.headersSent) {
            res.status(500).json({ erro: "Erro ao fazer download do PDF" });
          }
        }
      });

      console.log('✅ Download iniciado:', exame.pdf_originalname);

    } catch (error) {
      console.error('❌ Erro no download:', error);
      return res.status(500).json({
        erro: error.message
      });
    }
  },

  // ============================================
  // VISUALIZAR PDF - SERVE O PDF DIRETAMENTE (CORRIGIDO)
  // ============================================
  // controllers/exameController.js

  // ============================================
  // 🔥 VISUALIZAR PDF - SEM AUTENTICAÇÃO
  // ============================================
=======
      if (!exame || !exame.pdf_filename) return res.status(404).json({ erro: "PDF não encontrado" });
      
      const filePath = path.join(uploadDir, exame.pdf_filename);
      if (!fs.existsSync(filePath)) return res.status(404).json({ erro: "Arquivo não encontrado no servidor" });
      
      res.download(filePath, exame.pdf_originalname);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // VISUALIZAR PDF (Mantido intacto)
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
  async visualizarPdf(req, res) {
    try {
      console.log('📄 ====== VISUALIZAR PDF ======');
      console.log('📌 ID do exame:', req.params.id);

      const exame = await Exame.findByPk(req.params.id);
<<<<<<< HEAD

      if (!exame) {
        console.log('❌ Exame não encontrado');
        return res.status(404).json({
          erro: "Exame não encontrado"
        });
      }

      // ===== VERIFICAR SE TEM PDF =====
      if (!exame.pdf_filename) {
        console.log('❌ Exame não possui PDF');
        return res.status(404).json({
          erro: "PDF não encontrado para este exame"
        });
      }

      // ===== CONSTRUIR CAMINHO DO ARQUIVO =====
      const path = require('path');
      const fs = require('fs');
      const { uploadDir } = require('../config/upload');

      const filePath = path.join(uploadDir, exame.pdf_filename);
      console.log('📄 Caminho do PDF:', filePath);

      // ===== VERIFICAR SE O ARQUIVO EXISTE =====
      if (!fs.existsSync(filePath)) {
        console.log('❌ Arquivo PDF não encontrado no servidor');
        return res.status(404).json({
          erro: "Arquivo PDF não encontrado no servidor",
          filename: exame.pdf_filename
        });
      }

      // ===== SERVIR O PDF =====
      const stat = fs.statSync(filePath);
      console.log('📄 Tamanho do arquivo:', stat.size, 'bytes');

      // Definir headers para exibir inline
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': stat.size,
        'Content-Disposition': `inline; filename="${exame.pdf_originalname || 'exame.pdf'}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });

      // Criar stream e enviar
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);

      console.log('✅ PDF enviado com sucesso:', exame.pdf_originalname);

    } catch (error) {
      console.error('❌ Erro ao visualizar PDF:', error);
      return res.status(500).json({
        erro: "Erro interno ao processar o PDF",
        detalhe: error.message
      });
=======
      if (!exame || !exame.pdf_filename) return res.status(404).json({ erro: "PDF não encontrado" });
      
      return res.redirect(`/uploads/exams/${exame.pdf_filename}`);
    } catch (error) {
      return res.status(500).json({ erro: "Erro interno" });
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
    }
  },

  // ============================================
  // BUSCAR EXAMES POR PACIENTE
  // ============================================
  async buscarPorPaciente(req, res) {
    try {
      const { nome } = req.params;
<<<<<<< HEAD
      console.log(`🔍 Buscando exames do paciente: ${nome}`);

=======
      
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      const exames = await Exame.findAll({
        include: [{
          model: Usuario,
          as: 'paciente', // 👇 O apelido permite que a busca funcione perfeitamente!
          where: {
            nome_completo: {
              [Op.like]: `%${nome}%`
            }
          }
        }],
        order: [['data_exame', 'DESC']]
      });
<<<<<<< HEAD

      if (exames.length === 0) {
        return res.status(404).json({
          erro: "Nenhum exame encontrado para este paciente"
        });
      }

=======
      
      if (exames.length === 0) return res.status(404).json({ erro: "Nenhum exame encontrado para este paciente" });
      
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      const examesFormatados = exames.map(e => ({
        id: e.id,
        paciente_nome: e.paciente.nome_completo, // Lê a partir do e.paciente
        tipo_exame: e.tipo_exame,
        data_exame: formatarData(e.data_exame),
        medico_solicitante: e.medico_solicitante,
        laboratorio: e.laboratorio,
        resultados: e.resultados,
        observacoes: e.observacoes,
        possui_pdf: !!e.pdf_filename && verificarPdfExiste(e.pdf_filename),
        pdf_nome: e.pdf_originalname,
        pdf_path: e.pdf_path,
        created_at: e.createdAt,
        updated_at: e.updatedAt
      }));
<<<<<<< HEAD

      console.log(`✅ Encontrados ${examesFormatados.length} exames para ${nome}`);

=======
      
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      return res.json({
        sucesso: true,
        paciente: nome,
        total: examesFormatados.length,
        exames: examesFormatados
      });
    } catch (error) {
<<<<<<< HEAD
      console.error('❌ Erro ao buscar exames por paciente:', error);
      return res.status(500).json({
        erro: error.message
      });
=======
      return res.status(500).json({ erro: error.message });
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
    }
  },

  // ============================================
  // BUSCAR EXAMES POR PERÍODO
  // ============================================
  async buscarPorPeriodo(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
<<<<<<< HEAD
      console.log(`🔍 Buscando exames no período: ${dataInicio} até ${dataFim}`);

      if (!dataInicio || !dataFim) {
        return res.status(400).json({
          erro: "Datas de início e fim são obrigatórias"
        });
      }

      if (!validarData(dataInicio) || !validarData(dataFim)) {
        return res.status(400).json({
          erro: "Datas inválidas"
        });
=======
      if (!dataInicio || !dataFim || !validarData(dataInicio) || !validarData(dataFim)) {
        return res.status(400).json({ erro: "Datas inválidas" });
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      }

      const exames = await Exame.findAll({
        include: [{ model: Usuario, as: 'paciente', attributes: ['nome_completo'] }],
        where: { data_exame: { [Op.between]: [dataInicio, dataFim] } },
        order: [['data_exame', 'DESC']]
      });

      const examesFormatados = exames.map(e => ({
        id: e.id,
        paciente_nome: e.paciente ? e.paciente.nome_completo : 'Desconhecido',
        tipo_exame: e.tipo_exame,
        data_exame: formatarData(e.data_exame),
        medico_solicitante: e.medico_solicitante,
        created_at: e.createdAt,
        updated_at: e.updatedAt
      }));
<<<<<<< HEAD

      console.log(`✅ Encontrados ${examesFormatados.length} exames no período`);

      return res.json({
        sucesso: true,
        periodo: {
          inicio: dataInicio,
          fim: dataFim
        },
        total: examesFormatados.length,
        exames: examesFormatados
      });
    } catch (error) {
      console.error('❌ Erro ao buscar exames por período:', error);
      return res.status(500).json({
        erro: error.message
      });
    }
  },

  // ============================================
  // ATUALIZAR EXAME (com opção de atualizar PDF)
  // ============================================
  async atualizar(req, res) {
    try {
      console.log(`✏️ Atualizando exame ID: ${req.params.id}`);
      console.log('📝 Body:', req.body);
      console.log('📎 Novo arquivo:', req.file ? req.file.originalname : 'Nenhum');

      const exame = await Exame.findByPk(req.params.id);

      if (!exame) {
        if (req.file) {
          deletarArquivoPdf(req.file.filename);
        }
        return res.status(404).json({
          erro: "Exame não encontrado"
        });
      }

      const {
        paciente_nome,
        tipo_exame,
        data_exame,
        medico_solicitante,
        laboratorio,
        resultados,
        observacoes
      } = req.body;

      // Validar data se for fornecida
      if (data_exame && !validarData(data_exame)) {
        if (req.file) {
          deletarArquivoPdf(req.file.filename);
        }
        return res.status(400).json({
          erro: "Data do exame inválida"
        });
      }

      // Se tiver novo PDF, deletar o antigo
      let pdfData = {};
      if (req.file) {
        // Deletar PDF antigo se existir
        if (exame.pdf_filename) {
          deletarArquivoPdf(exame.pdf_filename);
        }

=======
      
      return res.json({ sucesso: true, exames: examesFormatados });
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // ATUALIZAR EXAME
  async atualizar(req, res) {
    try {
      const exame = await Exame.findByPk(req.params.id);
      if (!exame) {
        if (req.file) deletarArquivoPdf(req.file.filename);
        return res.status(404).json({ erro: "Exame não encontrado" });
      }
      
      const { paciente_cpf, tipo_exame, data_exame, medico_solicitante, laboratorio, resultados, observacoes } = req.body;
      
      let paciente_id = exame.paciente_id;
      if (paciente_cpf) {
        const cpfLimpo = paciente_cpf.replace(/[^\d]/g, '');
        const paciente = await Usuario.findOne({ where: { cpf: cpfLimpo } });
        if (!paciente) {
          if (req.file) deletarArquivoPdf(req.file.filename);
          return res.status(404).json({ erro: "Paciente não encontrado." });
        }
        paciente_id = paciente.id;
      }
      
      let pdfData = {};
      if (req.file) {
        if (exame.pdf_filename) deletarArquivoPdf(exame.pdf_filename);
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
        pdfData = {
          pdf_filename: req.file.filename,
          pdf_originalname: req.file.originalname,
          pdf_size: req.file.size,
          pdf_mimetype: req.file.mimetype,
          pdf_path: `/uploads/exams/${req.file.filename}`
        };
      }
<<<<<<< HEAD

      // Atualizar apenas os campos fornecidos
=======
      
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      await exame.update({
        paciente_id: paciente_id,
        tipo_exame: tipo_exame !== undefined ? tipo_exame.trim() : exame.tipo_exame,
        data_exame: data_exame !== undefined ? data_exame : exame.data_exame,
        medico_solicitante: medico_solicitante !== undefined ? medico_solicitante.trim() : exame.medico_solicitante,
        laboratorio: laboratorio !== undefined ? laboratorio.trim() : exame.laboratorio,
        resultados: resultados !== undefined ? resultados : exame.resultados,
        observacoes: observacoes !== undefined ? observacoes : exame.observacoes,
        ...pdfData
      });
<<<<<<< HEAD

      console.log('✅ Exame atualizado com sucesso');

      return res.json({
        sucesso: true,
        mensagem: "Exame atualizado com sucesso",
        exame: {
          id: exame.id,
          paciente_nome: exame.paciente_nome,
          tipo_exame: exame.tipo_exame,
          data_exame: formatarData(exame.data_exame),
          medico_solicitante: exame.medico_solicitante,
          laboratorio: exame.laboratorio,
          resultados: exame.resultados,
          observacoes: exame.observacoes,
          possui_pdf: !!exame.pdf_filename,
          pdf_nome: exame.pdf_originalname,
          pdf_tamanho: exame.pdf_size,
          pdf_path: exame.pdf_path,
          updated_at: exame.updatedAt
        }
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar exame:', error);
      if (req.file) {
        deletarArquivoPdf(req.file.filename);
      }
      return res.status(500).json({
        erro: error.message
      });
    }
  },

  // ============================================
  // DELETAR EXAME (remove também o arquivo PDF)
  // ============================================
  async deletar(req, res) {
    try {
      console.log(`🗑️ Deletando exame ID: ${req.params.id}`);

      const exame = await Exame.findByPk(req.params.id);

      if (!exame) {
        return res.status(404).json({
          erro: "Exame não encontrado"
        });
      }

      // Deletar PDF físico se existir
      if (exame.pdf_filename) {
        deletarArquivoPdf(exame.pdf_filename);
      }

      await exame.destroy();

      console.log('✅ Exame deletado com sucesso');

      return res.json({
        sucesso: true,
        mensagem: "Exame removido com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao deletar exame:', error);
      return res.status(500).json({
        erro: error.message
      });
=======
      
      return res.json({ sucesso: true, mensagem: "Exame atualizado com sucesso" });
    } catch (error) {
      if (req.file) deletarArquivoPdf(req.file.filename);
      return res.status(500).json({ erro: error.message });
    }
  },

  // DELETAR EXAME
  async deletar(req, res) {
    try {
      const exame = await Exame.findByPk(req.params.id);
      if (!exame) return res.status(404).json({ erro: "Exame não encontrado" });
      
      if (exame.pdf_filename) deletarArquivoPdf(exame.pdf_filename);
      await exame.destroy();
      
      return res.json({ sucesso: true, mensagem: "Exame removido com sucesso" });
    } catch (error) {
      return res.status(500).json({ erro: error.message });
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
    }
  },

  // ============================================
  // ESTATÍSTICAS
  // ============================================
  async estatisticas(req, res) {
    try {
<<<<<<< HEAD
      console.log('📊 Buscando estatísticas...');

      // Total de exames
      const totalExames = await Exame.count();

      // Total de pacientes distintos
      const totalPacientes = await Exame.count({
        distinct: true,
        col: 'paciente_nome'
      });

      // Total de médicos distintos
      const totalMedicos = await Exame.count({
        distinct: true,
        col: 'medico_solicitante'
      });

      // Total de laboratórios distintos
      const totalLaboratorios = await Exame.count({
        distinct: true,
        col: 'laboratorio'
      });

      // Exames por tipo
=======
      const totalExames = await Exame.count();
      const totalPacientes = await Exame.count({ distinct: true, col: 'paciente_id' });
      const totalMedicos = await Exame.count({ distinct: true, col: 'medico_solicitante' });
      const totalLaboratorios = await Exame.count({ distinct: true, col: 'laboratorio' });
      
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      const examesPorTipo = await Exame.findAll({
        attributes: ['tipo_exame', [Exame.sequelize.fn('COUNT', Exame.sequelize.col('id')), 'quantidade']],
        group: ['tipo_exame'],
        order: [[Exame.sequelize.literal('quantidade'), 'DESC']]
      });
<<<<<<< HEAD

      // Exames por mês (últimos 12 meses)
=======
      
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      const examesPorMes = await Exame.findAll({
        attributes: [
          [Exame.sequelize.fn('strftime', '%Y-%m', Exame.sequelize.col('data_exame')), 'mes'],
          [Exame.sequelize.fn('COUNT', Exame.sequelize.col('id')), 'quantidade']
        ],
        group: [Exame.sequelize.fn('strftime', '%Y-%m', Exame.sequelize.col('data_exame'))],
        order: [[Exame.sequelize.literal('mes'), 'DESC']],
        limit: 12
      });
<<<<<<< HEAD

      // Exames com PDF
      const examesComPdf = await Exame.count({
        where: {
          pdf_filename: {
            [Op.ne]: null
          }
        }
      });

      console.log('✅ Estatísticas obtidas com sucesso');

=======
      
      const examesComPdf = await Exame.count({ where: { pdf_filename: { [Op.ne]: null } } });
      
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      return res.json({
        sucesso: true,
        estatisticas: {
          total_exames: totalExames,
          total_pacientes: totalPacientes,
          total_medicos: totalMedicos,
          total_laboratorios: totalLaboratorios,
          exames_com_pdf: examesComPdf,
          percentual_com_pdf: totalExames > 0 ? ((examesComPdf / totalExames) * 100).toFixed(2) : 0
        },
        exames_por_tipo: examesPorTipo,
        exames_por_mes: examesPorMes
      });
    } catch (error) {
<<<<<<< HEAD
      console.error('❌ Erro ao buscar estatísticas:', error);
      return res.status(500).json({
        erro: error.message
      });
=======
      return res.status(500).json({ erro: error.message });
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
    }
  }
};