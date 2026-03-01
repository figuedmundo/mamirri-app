import fs from 'fs/promises';
import path from 'path';

describe('Evaluation Model Schema', () => {
  let schemaContent: string;

  beforeAll(async () => {
    const schemaPath = path.resolve(__dirname, '../../../prisma/schema.prisma');
    schemaContent = await fs.readFile(schemaPath, 'utf-8');
  });

  it('should have optional 1:1 relation to ClinicalCase', () => {
    // ClinicalCase has `evaluation Evaluation?` (not evaluations[])
    const clinicalCaseBlock = schemaContent
      .split('model ClinicalCase {')[1]
      .split('model ')[0];
    expect(clinicalCaseBlock).toMatch(/evaluation\s+Evaluation\?/);
  });

  it('should have a unique constraint on clinicalCaseId for 1:1 relation', () => {
    const evaluationBlock = schemaContent
      .split('model Evaluation {')[1]
      .split('}')[0];

    expect(evaluationBlock).toContain('clinicalCaseId  String');
    expect(evaluationBlock).toMatch(/clinicalCaseId\s+String\s+@unique/);
  });

  it('should have JSON fields for complex clinical data', () => {
    const evaluationBlock = schemaContent
      .split('model Evaluation {')[1]
      .split('}')[0];

    expect(evaluationBlock).toContain('posturogram     Json');
    expect(evaluationBlock).toContain('orthopedicTests Json');
    expect(evaluationBlock).toContain('avdEvaluation   Json');
    expect(evaluationBlock).toContain('painScale       Json');
    expect(evaluationBlock).toContain('diagnosis       Json');
  });
});
