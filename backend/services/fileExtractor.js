const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

/**
 * Service d'extraction de texte depuis différents formats de fichiers
 */
class FileExtractor {
  /**
   * Extrait le texte d'un fichier PDF
   * @param {string} filePath - Chemin du fichier PDF
   * @returns {Promise<string>} - Texte extrait
   */
  static async extractFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('Erreur lors de l\'extraction du PDF:', error);
      throw new Error('Impossible d\'extraire le texte du fichier PDF');
    }
  }

  /**
   * Extrait le texte d'un fichier DOCX
   * @param {string} filePath - Chemin du fichier DOCX
   * @returns {Promise<string>} - Texte extrait
   */
  static async extractFromDOCX(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return result.value;
    } catch (error) {
      console.error('Erreur lors de l\'extraction du DOCX:', error);
      throw new Error('Impossible d\'extraire le texte du fichier DOCX');
    }
  }

  /**
   * Extrait le texte d'un fichier en fonction de son extension
   * @param {string} filePath - Chemin du fichier
   * @returns {Promise<string>} - Texte extrait
   */
  static async extractTextFromFile(filePath) {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
      case '.pdf':
        return await this.extractFromPDF(filePath);
      case '.docx':
        return await this.extractFromDOCX(filePath);
      default:
        throw new Error(`Format de fichier non supporté: ${extension}`);
    }
  }
}

module.exports = FileExtractor; 