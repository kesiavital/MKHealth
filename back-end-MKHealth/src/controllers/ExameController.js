// src/controllers/ExameController.js

const Exame = require("../models/Exame");
const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');
const { uploadDir } = require('../config/upload');

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

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

// ============================================
// CRIAR EXAME (com upload de PDF)
// ============================================
async function criar(req, res) {
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
    }

    if (!validarData(data_exame)) {
      if (req.file) {
        deletarArquivoPdf(req.file.filename);
      }
      return res.status(400).json({
        erro: "Data do exame inválida"
      });
    }

    // Dados do PDF
    let pdfData = {};
    if (req.file) {
      pdfData = {
        pdf_anexo: true,
        pdf_filename: req.file.filename,
        pdf_originalname: req.file.originalname,
        pdf_size: req.file.size,
        pdf_mimetype: req.file.mimetype,
        pdf_path: `/uploads/exams/${req.file.filename}`,
        pdf_nome: req.file.originalname,
        pdf_tamanho: req.file.size,
      };
    }

    // Criar o exame
    const exame = await Exame.create({
      paciente_nome: paciente_nome.trim(),
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
        created_at: exame.createdAt,
        updated_at: exame.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Erro detalhado no cadastro do exame:', error);
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
  }
}

// ============================================
// LISTAR TODOS OS EXAMES
// ============================================
async function listar(req, res) {
  try {
    console.log('🔍 Buscando todos os exames...');

    const exames = await Exame.findAll({
      order: [['data_exame', 'DESC']]
    });

    const examesFormatados = exames.map(e => ({
      id: e.id,
      paciente_nome: e.paciente_nome,
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
      pdf_anexo: e.pdf_anexo || false,
      created_at: e.createdAt,
      updated_at: e.updatedAt
    }));

    console.log(`✅ Encontrados ${examesFormatados.length} exames`);

    return res.json(examesFormatados);
  } catch (error) {
    console.error('❌ Erro ao listar exames:', error);
    return res.status(500).json({ erro: error.message });
  }
}

// ============================================
// BUSCAR EXAME POR ID
// ============================================
async function buscarPorId(req, res) {
  try {
    console.log(`🔍 Buscando exame por ID: ${req.params.id}`);

    const exame = await Exame.findByPk(req.params.id);

    if (!exame) {
      return res.status(404).json({ erro: "Exame não encontrado" });
    }

    return res.json({
      id: exame.id,
      paciente_nome: exame.paciente_nome,
      tipo_exame: exame.tipo_exame,
      data_exame: formatarData(exame.data_exame),
      medico_solicitante: exame.medico_solicitante,
      laboratorio: exame.laboratorio,
      resultados: exame.resultados,
      observacoes: exame.observacoes,
      possui_pdf: !!exame.pdf_filename && verificarPdfExiste(exame.pdf_filename),
      pdf_nome: exame.pdf_originalname,
      pdf_tamanho: exame.pdf_size,
      pdf_path: exame.pdf_path,
      pdf_anexo: exame.pdf_anexo || false,
      created_at: exame.createdAt,
      updated_at: exame.updatedAt
    });
  } catch (error) {
    console.error('❌ Erro ao buscar exame por ID:', error);
    return res.status(500).json({ erro: error.message });
  }
}

// ============================================
// DOWNLOAD DO PDF
// ============================================
async function downloadPdf(req, res) {
  try {
    console.log('📥 ====== DOWNLOAD PDF ======');
    console.log('📌 ID do exame:', req.params.id);

    const exame = await Exame.findByPk(req.params.id);

    if (!exame) {
      console.log('❌ Exame não encontrado');
      return res.status(404).json({ erro: "Exame não encontrado" });
    }

    if (!exame.pdf_filename) {
      console.log('❌ Exame não possui PDF');
      return res.status(404).json({ erro: "PDF não encontrado para este exame" });
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
    return res.status(500).json({ erro: error.message });
  }
}

// ============================================
// VISUALIZAR PDF - SEM AUTENTICAÇÃO
// ============================================
async function visualizarPdf(req, res) {
  try {
    console.log('📄 ====== VISUALIZAR PDF ======');
    console.log('📌 ID do exame:', req.params.id);

    const exame = await Exame.findByPk(req.params.id);

    if (!exame) {
      console.log('❌ Exame não encontrado');
      return res.status(404).json({ erro: "Exame não encontrado" });
    }

    if (!exame.pdf_filename) {
      console.log('❌ Exame não possui PDF');
      return res.status(404).json({ erro: "PDF não encontrado para este exame" });
    }

    const filePath = path.join(uploadDir, exame.pdf_filename);
    console.log('📄 Caminho do PDF:', filePath);

    if (!fs.existsSync(filePath)) {
      console.log('❌ Arquivo PDF não encontrado no servidor');
      return res.status(404).json({
        erro: "Arquivo PDF não encontrado no servidor",
        filename: exame.pdf_filename
      });
    }

    const stat = fs.statSync(filePath);
    console.log('📄 Tamanho do arquivo:', stat.size, 'bytes');

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': stat.size,
      'Content-Disposition': `inline; filename="${exame.pdf_originalname || 'exame.pdf'}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

    console.log('✅ PDF enviado com sucesso:', exame.pdf_originalname);

  } catch (error) {
    console.error('❌ Erro ao visualizar PDF:', error);
    return res.status(500).json({
      erro: "Erro interno ao processar o PDF",
      detalhe: error.message
    });
  }
}

// ============================================
// BUSCAR EXAMES POR PACIENTE
// ============================================
async function buscarPorPaciente(req, res) {
  try {
    const { nome } = req.params;
    console.log(`🔍 Buscando exames do paciente: ${nome}`);

    const exames = await Exame.findAll({
      where: {
        paciente_nome: {
          [Op.like]: `%${nome}%`
        }
      },
      order: [['data_exame', 'DESC']]
    });

    if (exames.length === 0) {
      return res.status(404).json({ erro: "Nenhum exame encontrado para este paciente" });
    }

    const examesFormatados = exames.map(e => ({
      id: e.id,
      paciente_nome: e.paciente_nome,
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

    console.log(`✅ Encontrados ${examesFormatados.length} exames para ${nome}`);

    return res.json({
      sucesso: true,
      paciente: nome,
      total: examesFormatados.length,
      exames: examesFormatados
    });
  } catch (error) {
    console.error('❌ Erro ao buscar exames por paciente:', error);
    return res.status(500).json({ erro: error.message });
  }
}

// ============================================
// BUSCAR EXAMES POR PERÍODO
// ============================================
async function buscarPorPeriodo(req, res) {
  try {
    const { dataInicio, dataFim } = req.query;
    console.log(`🔍 Buscando exames no período: ${dataInicio} até ${dataFim}`);

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ erro: "Datas de início e fim são obrigatórias" });
    }

    if (!validarData(dataInicio) || !validarData(dataFim)) {
      return res.status(400).json({ erro: "Datas inválidas" });
    }

    const exames = await Exame.findAll({
      where: {
        data_exame: {
          [Op.between]: [dataInicio, dataFim]
        }
      },
      order: [['data_exame', 'DESC']]
    });

    const examesFormatados = exames.map(e => ({
      id: e.id,
      paciente_nome: e.paciente_nome,
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

    console.log(`✅ Encontrados ${examesFormatados.length} exames no período`);

    return res.json({
      sucesso: true,
      periodo: { inicio: dataInicio, fim: dataFim },
      total: examesFormatados.length,
      exames: examesFormatados
    });
  } catch (error) {
    console.error('❌ Erro ao buscar exames por período:', error);
    return res.status(500).json({ erro: error.message });
  }
}

// ============================================
// ATUALIZAR EXAME (com opção de atualizar PDF)
// ============================================
async function atualizar(req, res) {
  try {
    console.log(`✏️ Atualizando exame ID: ${req.params.id}`);
    console.log('📝 Body:', req.body);
    console.log('📎 Novo arquivo:', req.file ? req.file.originalname : 'Nenhum');

    const exame = await Exame.findByPk(req.params.id);

    if (!exame) {
      if (req.file) deletarArquivoPdf(req.file.filename);
      return res.status(404).json({ erro: "Exame não encontrado" });
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
      if (req.file) deletarArquivoPdf(req.file.filename);
      return res.status(400).json({ erro: "Data do exame inválida" });
    }

    // Se tiver novo PDF, deletar o antigo
    let pdfData = {};
    if (req.file) {
      if (exame.pdf_filename) {
        deletarArquivoPdf(exame.pdf_filename);
      }
      pdfData = {
        pdf_anexo: true,
        pdf_filename: req.file.filename,
        pdf_originalname: req.file.originalname,
        pdf_size: req.file.size,
        pdf_mimetype: req.file.mimetype,
        pdf_path: `/uploads/exams/${req.file.filename}`,
        pdf_nome: req.file.originalname,
        pdf_tamanho: req.file.size,
      };
    }

    // Se remover_pdf for true, deletar o PDF
    if (req.body.remover_pdf === 'true' && exame.pdf_filename) {
      deletarArquivoPdf(exame.pdf_filename);
      pdfData = {
        pdf_anexo: false,
        pdf_filename: null,
        pdf_originalname: null,
        pdf_size: null,
        pdf_mimetype: null,
        pdf_path: null,
        pdf_nome: null,
        pdf_tamanho: null,
      };
    }

    await exame.update({
      paciente_nome: paciente_nome !== undefined ? paciente_nome.trim() : exame.paciente_nome,
      tipo_exame: tipo_exame !== undefined ? tipo_exame.trim() : exame.tipo_exame,
      data_exame: data_exame !== undefined ? data_exame : exame.data_exame,
      medico_solicitante: medico_solicitante !== undefined ? medico_solicitante.trim() : exame.medico_solicitante,
      laboratorio: laboratorio !== undefined ? laboratorio.trim() : exame.laboratorio,
      resultados: resultados !== undefined ? resultados : exame.resultados,
      observacoes: observacoes !== undefined ? observacoes : exame.observacoes,
      ...pdfData
    });

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
    if (req.file) deletarArquivoPdf(req.file.filename);
    return res.status(500).json({ erro: error.message });
  }
}

// ============================================
// DELETAR EXAME (remove também o arquivo PDF)
// ============================================
async function deletar(req, res) {
  try {
    console.log(`🗑️ Deletando exame ID: ${req.params.id}`);

    const exame = await Exame.findByPk(req.params.id);

    if (!exame) {
      return res.status(404).json({ erro: "Exame não encontrado" });
    }

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
    return res.status(500).json({ erro: error.message });
  }
}

// ============================================
// ESTATÍSTICAS
// ============================================
async function estatisticas(req, res) {
  try {
    console.log('📊 Buscando estatísticas...');

    const totalExames = await Exame.count();
    const totalPacientes = await Exame.count({ 
      distinct: true, 
      col: 'paciente_nome' 
    });
    const totalMedicos = await Exame.count({ 
      distinct: true, 
      col: 'medico_solicitante' 
    });
    const totalLaboratorios = await Exame.count({ 
      distinct: true, 
      col: 'laboratorio' 
    });

    const examesPorTipo = await Exame.findAll({
      attributes: [
        'tipo_exame', 
        [Exame.sequelize.fn('COUNT', Exame.sequelize.col('id')), 'quantidade']
      ],
      group: ['tipo_exame'],
      order: [[Exame.sequelize.literal('quantidade'), 'DESC']]
    });

    // Para PostgreSQL
    const examesPorMes = await Exame.findAll({
      attributes: [
        [Exame.sequelize.fn('DATE_TRUNC', 'month', Exame.sequelize.col('data_exame')), 'mes'],
        [Exame.sequelize.fn('COUNT', Exame.sequelize.col('id')), 'quantidade']
      ],
      group: [Exame.sequelize.fn('DATE_TRUNC', 'month', Exame.sequelize.col('data_exame'))],
      order: [[Exame.sequelize.literal('mes'), 'DESC']],
      limit: 12
    });

    const examesComPdf = await Exame.count({
      where: {
        pdf_filename: {
          [Op.ne]: null
        }
      }
    });

    console.log('✅ Estatísticas obtidas com sucesso');

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
    console.error('❌ Erro ao buscar estatísticas:', error);
    return res.status(500).json({ erro: error.message });
  }
}

// ============================================
// EXPORTAR TODAS AS FUNÇÕES
// ============================================
module.exports = {
  criar,
  listar,
  buscarPorId,
  downloadPdf,
  visualizarPdf,
  buscarPorPaciente,
  buscarPorPeriodo,
  atualizar,
  deletar,
  estatisticas
};