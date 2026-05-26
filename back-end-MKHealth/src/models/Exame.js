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
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  tipo_exame: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  data_exame: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  medico_solicitante: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  laboratorio: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  resultados: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Campos para armazenar informações do PDF
  pdf_filename: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  pdf_originalname: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  pdf_size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pdf_mimetype: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  pdf_path: {
    type: DataTypes.STRING(1000),
    allowNull: true
  }
}, {
  tableName: 'exames',
  timestamps: true,
  underscored: true
});

module.exports = Exame;