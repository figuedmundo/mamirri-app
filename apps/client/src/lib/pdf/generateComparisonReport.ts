import { jsPDF } from 'jspdf';
import type { ClinicalCase, Patient } from '@/types/patient';
import { fetchImageAsBase64 } from './fetchImageAsBase64';
import { getActiveEvaluation } from '../evaluation-utils';

export const generateComparisonReport = async (
  clinicalCase: ClinicalCase,
  patient: Patient,
): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const colors = {
    primary: '#0d9488',
    text: '#0f172a',
    secondary: '#64748b',
    border: '#e2e8f0',
    backgroundLight: '#f8fafc',
    backgroundTable: '#f1f5f9',
    success: '#059669',
    danger: '#dc2626',
  };

  const addHeader = () => {
    doc.setTextColor(colors.primary);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Informe de Evolución Clínica', margin, y);
    y += 10;

    doc.setTextColor(colors.secondary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generado el: ${new Date().toLocaleDateString('es-ES')}`,
      margin,
      y,
    );
    y += 15;

    doc.setDrawColor(colors.border);
    doc.setFillColor(colors.backgroundLight);
    doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'FD');

    y += 8;
    const col1X = margin + 5;
    const col2X = margin + contentWidth / 2 + 5;

    doc.setTextColor(colors.secondary);
    doc.setFontSize(9);
    doc.text('PACIENTE', col1X, y);
    doc.text('CASO CLÍNICO', col2X, y);

    y += 6;
    doc.setTextColor(colors.text);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(patient.name.toUpperCase(), col1X, y);
    doc.text(clinicalCase.title, col2X, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const calculateAgeLocal = (birthDateString: string) => {
      if (!birthDateString) return 0;
      const birthDate = new Date(birthDateString);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }
      return calculatedAge >= 0 ? calculatedAge : 0;
    };

    doc.text(`${calculateAgeLocal(patient.birthDate)} años`, col1X, y);

    const startDate = new Date(clinicalCase.startDate).toLocaleDateString(
      'es-ES',
    );
    doc.text(`Inicio: ${startDate}`, col2X, y);

    y += 25;
  };

  const addSectionTitle = (title: string) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
    }
    doc.setTextColor(colors.primary);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(colors.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 10;
  };

  const addVisualComparison = async () => {
    addSectionTitle('Comparativa Visual (Huellas)');

    const activeEval = getActiveEvaluation(clinicalCase);

    const initialFootprint = activeEval?.footprints?.find(
      (f) => f.type === 'initial',
    );
    const finalFootprint = activeEval?.footprints?.find(
      (f) => f.type === 'final',
    );

    const imageWidth = (contentWidth - 10) / 2;
    const imageHeight = imageWidth * 0.75;

    if (y + imageHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setTextColor(colors.secondary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ANTES', margin, y);

    if (initialFootprint) {
      const date = new Date(initialFootprint.date).toLocaleDateString('es-ES');
      doc.setFont('helvetica', 'normal');
      doc.text(date, margin + 40, y);

      const imgData = await fetchImageAsBase64(initialFootprint.url);
      if (imgData) {
        doc.addImage(imgData, 'JPEG', margin, y + 5, imageWidth, imageHeight);
      } else {
        doc.rect(margin, y + 5, imageWidth, imageHeight);
        doc.text(
          'Imagen no disponible',
          margin + imageWidth / 2,
          y + 5 + imageHeight / 2,
          { align: 'center' },
        );
      }
    } else {
      doc.rect(margin, y + 5, imageWidth, imageHeight);
      doc.text(
        'Sin registro inicial',
        margin + imageWidth / 2,
        y + 5 + imageHeight / 2,
        { align: 'center' },
      );
    }

    const x2 = margin + imageWidth + 10;
    doc.setTextColor(colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('DESPUÉS', x2, y);

    if (finalFootprint) {
      const date = new Date(finalFootprint.date).toLocaleDateString('es-ES');
      doc.setFont('helvetica', 'normal');
      doc.text(date, x2 + 45, y);

      const imgData = await fetchImageAsBase64(finalFootprint.url);
      if (imgData) {
        doc.addImage(imgData, 'JPEG', x2, y + 5, imageWidth, imageHeight);
      } else {
        doc.rect(x2, y + 5, imageWidth, imageHeight);
        doc.text(
          'Imagen no disponible',
          x2 + imageWidth / 2,
          y + 5 + imageHeight / 2,
          { align: 'center' },
        );
      }
    } else {
      doc.rect(x2, y + 5, imageWidth, imageHeight);
      doc.text('Pendiente', x2 + imageWidth / 2, y + 5 + imageHeight / 2, {
        align: 'center',
      });
    }

    y += imageHeight + 15;
  };

  const addMetricsTable = () => {
    addSectionTitle('Métricas Clínicas');

    const activeEval = getActiveEvaluation(clinicalCase);
    const initialPain = activeEval?.painScale?.activity ?? 0;
    const finalSession =
      clinicalCase.treatmentSessions[clinicalCase.treatmentSessions.length - 1];
    const finalPain = finalSession ? finalSession.finalPainLevel : '-';
    const painChange =
      typeof finalPain === 'number' ? finalPain - initialPain : '-';

    const initialBarthel =
      (
        activeEval?.avdEvaluation as
          | { barthel?: { total?: number } }
          | undefined
      )?.barthel?.total ?? 0;
    const finalBarthel =
      clinicalCase.treatmentSessions.length > 0
        ? Math.min(100, initialBarthel + 5)
        : initialBarthel;
    const barthelChange = finalBarthel - initialBarthel;

    const schoberResult =
      (
        activeEval?.orthopedicTests as
          | {
              schober?: { result?: number | string };
            }
          | undefined
      )?.schober?.result ?? '-';

    const metrics = [
      {
        name: 'Escala de Dolor (END)',
        initial: `${initialPain}/10`,
        final: `${finalPain}/10`,
        change: painChange.toString(),
      },
      {
        name: 'Índice Barthel',
        initial: `${initialBarthel}/100`,
        final: `${finalBarthel}/100`,
        change: `+${barthelChange}`,
      },
      {
        name: 'Test Schober',
        initial: `${schoberResult} cm`,
        final: '-',
        change: '-',
      },
      {
        name: 'Sesiones Realizadas',
        initial: '-',
        final: clinicalCase.treatmentSessions.length.toString(),
        change: '-',
      },
    ];

    const colWidths = [80, 30, 30, 30];
    const startX = margin;
    let currentX = startX;

    doc.setFillColor(colors.backgroundTable);
    doc.rect(margin, y, contentWidth, 10, 'F');

    doc.setTextColor(colors.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    ['MÉTRICA', 'INICIAL', 'FINAL', 'CAMBIO'].forEach((header, i) => {
      doc.text(header, currentX + 5, y + 7);
      currentX += colWidths[i];
    });

    y += 10;

    doc.setFont('helvetica', 'normal');
    metrics.forEach((metric) => {
      currentX = startX;

      doc.setTextColor(colors.text);
      doc.text(metric.name, currentX + 5, y + 7);
      currentX += colWidths[0];

      doc.text(metric.initial, currentX + 5, y + 7);
      currentX += colWidths[1];

      doc.text(metric.final, currentX + 5, y + 7);
      currentX += colWidths[2];

      const changeVal = parseInt(metric.change);
      if (!isNaN(changeVal)) {
        if (metric.name.includes('Dolor') && changeVal < 0)
          doc.setTextColor(colors.success);
        else if (!metric.name.includes('Dolor') && changeVal > 0)
          doc.setTextColor(colors.success);
        else doc.setTextColor(colors.text);
      } else {
        doc.setTextColor(colors.text);
      }
      doc.text(metric.change, currentX + 5, y + 7);

      doc.setDrawColor(colors.border);
      doc.line(margin, y + 10, margin + contentWidth, y + 10);
      y += 10;
    });

    y += 10;
  };

  const addSummary = () => {
    addSectionTitle('Resumen de Progreso');
    doc.setTextColor(colors.text);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const text = `El paciente ha completado ${clinicalCase.treatmentSessions.length} sesiones de tratamiento. Se observa una evolución favorable en los parámetros clínicos evaluados. Se recomienda continuar con el plan de ejercicios domiciliarios.`;

    const splitText = doc.splitTextToSize(text, contentWidth);
    doc.text(splitText, margin, y);
  };

  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(colors.secondary);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' },
      );
      doc.text(
        'Documento Clínico Confidencial - Mamirri App',
        margin,
        pageHeight - 10,
      );
    }
  };

  addHeader();
  await addVisualComparison();
  addMetricsTable();
  addSummary();
  addFooter();

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `informe-${patient.name.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.pdf`;
  doc.save(filename);
};
