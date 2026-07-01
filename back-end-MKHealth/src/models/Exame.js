// models/Exame.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exame = sequelize.define('Exame', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  paciente_nome: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  tipo_exame: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  data_exame: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  medico_solicitante: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  laboratorio: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  resultados: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // 🔥 NOME CORRETO DA COLUNA NO BANCO
  pdf_anexo: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  pdf_nome: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  pdf_tamanho: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Campos adicionais que você tem na tabela
  pdf_filename: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  pdf_originalname: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  pdf_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  pdf_mimetype: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  pdf_path: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
}, {
  tableName: 'exames',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Exame;