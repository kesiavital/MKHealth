const Exame = require("../models/Exame");
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

// Função para deletar arquivo físico
function deletarArquivoPdf(filename) {
  if (!filename) return;
  
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`📄 Arquivo deletado: ${filename}`);
  }
}

module.exports = {
  // CRIAR EXAME (com upload de PDF)
  async criar(req, res) {
    try {
      console.log('📝 Iniciando cadastro de exame...');
      console.log('📝 Body recebido:', req.body);
      console.log('📎 Arquivo recebido:', req.file);
      
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
        // Se tiver arquivo enviado, deletar
        if (req.file) {
          deletarArquivoPdf(req.file.filename);
        }
        return res.status(400).json({ 
          erro: "Todos os campos obrigatórios devem ser preenchidos: paciente_nome, tipo_exame, data_exame, medico_solicitante, laboratorio" 
        });
      }

      // Validação da data
      if (!validarData(data_exame)) {
        if (req.file) {
          deletarArquivoPdf(req.file.filename);
        }
        return res.status(400).json({ 
          erro: "Data do exame inválida" 
        });
      }

      console.log('✅ Validação OK, criando exame...');

      // Preparar dados do PDF se houver
      let pdfData = {};
      if (req.file) {
        pdfData = {
          pdf_filename: req.file.filename,
          pdf_originalname: req.file.originalname,
          pdf_size: req.file.size,
          pdf_mimetype: req.file.mimetype,
          pdf_path: `/uploads/exams/${req.file.filename}`
        };
        console.log('📎 PDF salvo:', pdfData);
      }

      // Criar exame
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

      console.log('✅ Exame criado com ID:', exame.id);

      // Resposta de sucesso
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
      
      // Se tiver arquivo enviado, deletar
      if (req.file) {
        deletarArquivoPdf(req.file.filename);
      }
      
      // Tratamento para erro de validação
      if (error.name === 'SequelizeValidationError') {
        const mensagens = error.errors.map(err => err.message).join(', ');
        return res.status(400).json({ erro: mensagens });
      }
      
      // Outros erros
      return res.status(500).json({ 
        erro: "Erro interno do servidor",
        detalhe: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // LISTAR TODOS OS EXAMES
  async listar(req, res) {
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
        possui_pdf: !!e.pdf_filename,
        pdf_nome: e.pdf_originalname,
        pdf_tamanho: e.pdf_size,
        pdf_path: e.pdf_path,
        created_at: e.createdAt,
        updated_at: e.updatedAt
      }));
      
      console.log(`✅ Encontrados ${examesFormatados.length} exames`);
      
      return res.json(examesFormatados);
    } catch (error) {
      console.error('❌ Erro ao listar exames:', error);
      return res.status(500).json({ 
        erro: error.message 
      });
    }
  },

  // BUSCAR EXAME POR ID
  async buscarPorId(req, res) {
    try {
      console.log(`🔍 Buscando exame por ID: ${req.params.id}`);
      
      const exame = await Exame.findByPk(req.params.id);
      
      if (!exame) {
        return res.status(404).json({ 
          erro: "Exame não encontrado" 
        });
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
        possui_pdf: !!exame.pdf_filename,
        pdf_nome: exame.pdf_originalname,
        pdf_tamanho: exame.pdf_size,
        pdf_path: exame.pdf_path,
        created_at: exame.createdAt,
        updated_at: exame.updatedAt
      });
    } catch (error) {
      console.error('❌ Erro ao buscar exame por ID:', error);
      return res.status(500).json({ 
        erro: error.message 
      });
    }
  },

  // DOWNLOAD DO PDF
  async downloadPdf(req, res) {
    try {
      const exame = await Exame.findByPk(req.params.id);
      
      if (!exame) {
        return res.status(404).json({ 
          erro: "Exame não encontrado" 
        });
      }
      
      if (!exame.pdf_filename) {
        return res.status(404).json({ 
          erro: "PDF não encontrado para este exame" 
        });
      }
      
      const filePath = path.join(uploadDir, exame.pdf_filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          erro: "Arquivo PDF não encontrado no servidor" 
        });
      }
      
      res.download(filePath, exame.pdf_originalname, (err) => {
        if (err) {
          console.error('❌ Erro no download:', err);
          res.status(500).json({ erro: "Erro ao fazer download do PDF" });
        }
      });
    } catch (error) {
      console.error('❌ Erro ao baixar PDF:', error);
      return res.status(500).json({ 
        erro: error.message 
      });
    }
  },

  // VISUALIZAR PDF (abrir no navegador)
  async visualizarPdf(req, res) {
    try {
      const exame = await Exame.findByPk(req.params.id);
      
      if (!exame) {
        return res.status(404).json({ 
          erro: "Exame não encontrado" 
        });
      }
      
      if (!exame.pdf_filename) {
        return res.status(404).json({ 
          erro: "PDF não encontrado para este exame" 
        });
      }
      
      const filePath = path.join(uploadDir, exame.pdf_filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          erro: "Arquivo PDF não encontrado no servidor" 
        });
      }
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      console.error('❌ Erro ao visualizar PDF:', error);
      return res.status(500).json({ 
        erro: error.message 
      });
    }
  },

  // BUSCAR EXAMES POR PACIENTE
  async buscarPorPaciente(req, res) {
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
        return res.status(404).json({ 
          erro: "Nenhum exame encontrado para este paciente" 
        });
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
        possui_pdf: !!e.pdf_filename,
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
      return res.status(500).json({ 
        erro: error.message 
      });
    }
  },

  // BUSCAR EXAMES POR PERÍODO
  async buscarPorPeriodo(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
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
        possui_pdf: !!e.pdf_filename,
        created_at: e.createdAt,
        updated_at: e.updatedAt
      }));
      
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

  // ATUALIZAR EXAME (com opção de atualizar PDF)
  async atualizar(req, res) {
    try {
      console.log(`✏️ Atualizando exame ID: ${req.params.id}`);
      console.log('📝 Body:', req.body);
      console.log('📎 Novo arquivo:', req.file);
      
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
        
        pdfData = {
          pdf_filename: req.file.filename,
          pdf_originalname: req.file.originalname,
          pdf_size: req.file.size,
          pdf_mimetype: req.file.mimetype,
          pdf_path: `/uploads/exams/${req.file.filename}`
        };
        console.log('📎 PDF atualizado:', pdfData);
      }
      
      // Atualizar apenas os campos fornecidos
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
      if (req.file) {
        deletarArquivoPdf(req.file.filename);
      }
      return res.status(500).json({ 
        erro: error.message 
      });
    }
  },

  // DELETAR EXAME (remove também o arquivo PDF)
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
    }
  },

  // ESTATÍSTICAS
  async estatisticas(req, res) {
    try {
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
      const examesPorTipo = await Exame.findAll({
        attributes: [
          'tipo_exame',
          [Exame.sequelize.fn('COUNT', Exame.sequelize.col('id')), 'quantidade']
        ],
        group: ['tipo_exame'],
        order: [[Exame.sequelize.literal('quantidade'), 'DESC']]
      });
      
      // Exames por mês (últimos 12 meses)
      const examesPorMes = await Exame.findAll({
        attributes: [
          [Exame.sequelize.fn('strftime', '%Y-%m', Exame.sequelize.col('data_exame')), 'mes'],
          [Exame.sequelize.fn('COUNT', Exame.sequelize.col('id')), 'quantidade']
        ],
        group: [Exame.sequelize.fn('strftime', '%Y-%m', Exame.sequelize.col('data_exame'))],
        order: [[Exame.sequelize.literal('mes'), 'DESC']],
        limit: 12
      });
      
      // Exames com PDF
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
      return res.status(500).json({ 
        erro: error.message 
      });
    }
  }
};