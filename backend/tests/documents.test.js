const { expect } = require('chai');
const fs = require('fs').promises;
const path = require('path');
const documentGenerator = require('../services/documentGenerator');

describe('Document Generator Service', () => {
  // Dossier de test
  const mockDossier = {
    _id: 'test-dossier-123',
    user: {
      firstName: 'Jean',
      lastName: 'Dupont'
    },
    targetCertification: 'Certification Test',
    content: {
      analysis: {
        summary: 'Résumé de l\'analyse',
        strengths: ['Point fort 1', 'Point fort 2'],
        improvements: ['Amélioration 1', 'Amélioration 2']
      },
      recommendations: [
        { text: 'Recommandation 1' },
        { text: 'Recommandation 2' }
      ],
      actionPlan: [
        { text: 'Action 1' },
        { text: 'Action 2' }
      ]
    },
    answers: {
      'question-1': 'Réponse à la question 1',
      'question-2': 'Réponse à la question 2'
    }
  };

  // Nettoyage après les tests
  afterEach(async () => {
    try {
      const files = await fs.readdir(documentGenerator.exportsDir);
      await Promise.all(
        files.map(file => 
          fs.unlink(path.join(documentGenerator.exportsDir, file))
        )
      );
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  });

  describe('generateDocument', () => {
    it('devrait générer un document PDF valide', async () => {
      const result = await documentGenerator.generateDocument(mockDossier, 'pdf');
      
      // Vérifier que le fichier existe
      const stats = await fs.stat(result.filePath);
      expect(stats.isFile()).to.be.true;
      
      // Vérifier la taille minimale (un PDF vide fait environ 1KB)
      expect(stats.size).to.be.greaterThan(1024);
      
      // Vérifier la signature PDF (%PDF-)
      const buffer = await fs.readFile(result.filePath);
      expect(buffer.toString('ascii', 0, 5)).to.equal('%PDF-');
      
      // Vérifier le nom du fichier
      expect(result.fileName).to.match(/^dossier-test-dossier-123\.pdf$/);
      
      // Vérifier le type MIME
      expect(result.mimeType).to.equal('application/pdf');
    });

    it('devrait générer un document DOCX valide', async () => {
      const result = await documentGenerator.generateDocument(mockDossier, 'docx');
      
      // Vérifier que le fichier existe
      const stats = await fs.stat(result.filePath);
      expect(stats.isFile()).to.be.true;
      
      // Vérifier la taille minimale (un DOCX vide fait environ 10KB)
      expect(stats.size).to.be.greaterThan(10240);
      
      // Vérifier la signature DOCX (PK\x03\x04)
      const buffer = await fs.readFile(result.filePath);
      expect(buffer.toString('hex', 0, 4)).to.equal('504b0304');
      
      // Vérifier le nom du fichier
      expect(result.fileName).to.match(/^dossier-test-dossier-123\.docx$/);
      
      // Vérifier le type MIME
      expect(result.mimeType).to.equal('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it('devrait gérer les erreurs de génération', async () => {
      // Tester avec un dossier invalide
      const invalidDossier = { ...mockDossier, content: null };
      
      try {
        await documentGenerator.generateDocument(invalidDossier, 'pdf');
        expect.fail('Devrait lever une erreur');
      } catch (error) {
        expect(error.message).to.include('Erreur lors de la génération du document');
      }
    });

    it('devrait rejeter les formats invalides', async () => {
      try {
        await documentGenerator.generateDocument(mockDossier, 'invalid');
        expect.fail('Devrait lever une erreur');
      } catch (error) {
        expect(error.message).to.include('Format de document invalide');
      }
    });
  });
});

/*
TODO: Tests d'intégration à implémenter

1. Test complet du flux d'export :
   - Créer un dossier complet via l'API
   - Générer le document via l'API
   - Vérifier le téléchargement
   - Vérifier le contenu du document

2. Test des permissions :
   - Vérifier qu'un utilisateur non autorisé ne peut pas exporter
   - Vérifier qu'un admin peut exporter n'importe quel dossier

3. Test de performance :
   - Mesurer le temps de génération
   - Vérifier la taille des fichiers générés
   - Tester avec des dossiers volumineux

4. Test de la mise en page :
   - Vérifier la structure du document
   - Vérifier les styles et la mise en forme
   - Vérifier l'encodage des caractères spéciaux

5. Test de la gestion des erreurs :
   - Simuler des erreurs réseau
   - Tester la récupération après erreur
   - Vérifier les messages d'erreur
*/ 