import { useState } from 'react';
import PropTypes from 'prop-types';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

function ExportDocument({ 
  dossier, 
  userProfile = {}, 
  onExportStart = () => {},
  onExportEnd = () => {}
}) {
  const [exporting, setExporting] = useState(false);
  const [currentFormat, setCurrentFormat] = useState(null);

  // Helper function to get formatted date
  const getFormattedDate = () => {
    const now = new Date();
    return `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
  };

  // Helper function to get file name
  const getFileName = (extension) => {
    const firstName = userProfile.firstName || 'Utilisateur';
    const lastName = userProfile.lastName || '';
    const date = getFormattedDate();
    
    return `Dossier_VAE_${firstName}_${lastName}_${date}.${extension}`;
  };

  // Export to PDF
  const exportToPdf = async () => {
    try {
      setExporting(true);
      setCurrentFormat('pdf');
      onExportStart('pdf');
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set initial y position
      let y = 20;
      
      // Add title
      doc.setFontSize(20);
      doc.text('DOSSIER DE VALIDATION DES ACQUIS DE L\'EXPÉRIENCE (VAE)', 105, y, { align: 'center' });
      y += 15;
      
      // Add user info if available
      if (userProfile.firstName || userProfile.lastName) {
        doc.setFontSize(14);
        doc.text(`${userProfile.firstName || ''} ${userProfile.lastName || ''}`, 105, y, { align: 'center' });
        y += 10;
      }
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Date: ${getFormattedDate()}`, 105, y, { align: 'center' });
      y += 20;
      
      // Add sections
      if (dossier && dossier.sections) {
        for (const section of dossier.sections) {
          // Check if we need a new page
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          
          // Add section title
          doc.setFontSize(16);
          doc.text(section.title, 20, y);
          y += 10;
          
          // Add section content
          doc.setFontSize(10);
          
          // Split the content into paragraphs and add each paragraph
          const paragraphs = section.content.split('\n').filter(p => p.trim() !== '');
          
          for (const paragraph of paragraphs) {
            // If paragraph is too long, split it into multiple lines
            const textLines = doc.splitTextToSize(paragraph, 170);
            
            // Check if we need a new page
            if (y + (textLines.length * 5) > 280) {
              doc.addPage();
              y = 20;
            }
            
            doc.text(textLines, 20, y);
            y += (textLines.length * 5) + 5;
          }
          
          y += 10;
        }
      }
      
      // Save the PDF
      doc.save(getFileName('pdf'));
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setExporting(false);
      setCurrentFormat(null);
      onExportEnd('pdf');
    }
  };

  // Export to DOCX
  const exportToDocx = async () => {
    try {
      setExporting(true);
      setCurrentFormat('docx');
      onExportStart('docx');
      
      // Create document sections
      const sections = [];
      
      // Add title
      sections.push(
        new Paragraph({
          text: 'DOSSIER DE VALIDATION DES ACQUIS DE L\'EXPÉRIENCE (VAE)',
          heading: HeadingLevel.TITLE,
          alignment: 'center'
        })
      );
      
      // Add user info if available
      if (userProfile.firstName || userProfile.lastName) {
        sections.push(
          new Paragraph({
            text: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`,
            heading: HeadingLevel.HEADING_1,
            alignment: 'center'
          })
        );
      }
      
      // Add date
      sections.push(
        new Paragraph({
          text: `Date: ${getFormattedDate()}`,
          alignment: 'center',
          spacing: {
            after: 400
          }
        })
      );
      
      // Add sections
      if (dossier && dossier.sections) {
        for (const section of dossier.sections) {
          // Add section title
          sections.push(
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200
              }
            })
          );
          
          // Split the content into paragraphs and add each paragraph
          const paragraphs = section.content.split('\n').filter(p => p.trim() !== '');
          
          for (const paragraph of paragraphs) {
            sections.push(
              new Paragraph({
                text: paragraph,
                spacing: {
                  after: 200
                }
              })
            );
          }
        }
      }
      
      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: sections
          }
        ]
      });
      
      // Generate the document
      const buffer = await Packer.toBuffer(doc);
      
      // Save the document
      saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
        getFileName('docx')
      );
      
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
    } finally {
      setExporting(false);
      setCurrentFormat(null);
      onExportEnd('docx');
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={exportToPdf}
        disabled={exporting}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {exporting && currentFormat === 'pdf' ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exportation en PDF...
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            Télécharger en PDF
          </>
        )}
      </button>
      
      <button
        type="button"
        onClick={exportToDocx}
        disabled={exporting}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
      >
        {exporting && currentFormat === 'docx' ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exportation en DOCX...
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 3a1 1 0 011-1h3a1 1 0 110 2H9a1 1 0 01-1-1zm0 3a1 1 0 011-1h3a1 1 0 110 2H9a1 1 0 01-1-1zm8 7a1 1 0 01-1 1H7a1 1 0 110-2h8a1 1 0 011 1zm-1-4a1 1 0 100-2H9a1 1 0 100 2h6z" clipRule="evenodd" />
            </svg>
            Télécharger en DOCX
          </>
        )}
      </button>
    </div>
  );
}

ExportDocument.propTypes = {
  dossier: PropTypes.shape({
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        sectionId: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  userProfile: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string
  }),
  onExportStart: PropTypes.func,
  onExportEnd: PropTypes.func
};

export default ExportDocument; 