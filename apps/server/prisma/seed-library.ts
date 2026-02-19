import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes('${')) {
  connectionString = connectionString
    .replace('${POSTGRES_USER}', process.env.POSTGRES_USER || 'postgres')
    .replace(
      '${POSTGRES_PASSWORD}',
      process.env.POSTGRES_PASSWORD || 'postgres',
    )
    .replace('${POSTGRES_PORT}', process.env.POSTGRES_PORT || '5432')
    .replace('${POSTGRES_DB}', process.env.POSTGRES_DB || 'mamirri');
}

const poolConfig: any = {
  connectionString,
};

if (process.env.POSTGRES_USER) poolConfig.user = process.env.POSTGRES_USER;
if (process.env.POSTGRES_PASSWORD)
  poolConfig.password = process.env.POSTGRES_PASSWORD;
if (process.env.POSTGRES_DB) poolConfig.database = process.env.POSTGRES_DB;

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🏥 Seeding Biblioteca Médica...');

  const categories = [
    {
      name: 'Osteologia y Artrologia',
      description: 'Estructura osea y articulaciones',
      icon: 'bone',
    },
    {
      name: 'Miologia',
      description: 'Musculos y cadenas musculares',
      icon: 'muscle',
    },
    {
      name: 'Test de Elasticidad',
      description: 'Evaluacion de flexibilidad y retracciones',
      icon: 'activity',
    },
    {
      name: 'Test Funcionales',
      description: 'Pruebas de movilidad y funcion',
      icon: 'move',
    },
    {
      name: 'Protocolos de Tratamiento',
      description: 'Tecnicas de intervencion (McKenzie, RPG, etc.)',
      icon: 'clipboard',
    },
  ];

  const categoryIdByName = new Map<string, string>();
  for (const cat of categories) {
    const existing = await prisma.clinicalCategory.findFirst({
      where: { name: { equals: cat.name, mode: 'insensitive' } },
      select: { id: true },
    });

    if (existing) {
      categoryIdByName.set(cat.name, existing.id);
      continue;
    }

    const created = await prisma.clinicalCategory.create({
      data: cat,
      select: { id: true },
    });
    categoryIdByName.set(cat.name, created.id);
  }

  console.log(`  ✓ ${categories.length} clinical categories`);

  const references = [
    {
      id: 'ref-001',
      author: 'Latarjet, M. & Ruiz Liard, A.',
      year: 2019,
      title: 'Anatomía Humana',
      source: 'Editorial Médica Panamericana',
      originalLanguage: 'es',
      summaryEs:
        'Texto clásico de referencia para la anatomía descriptiva, topográfica y funcional del cuerpo humano.',
      originalText: null,
    },
    {
      id: 'ref-002',
      author: 'McKenzie, R.A.',
      year: 1981,
      title: 'The Lumbar Spine: Mechanical Diagnosis and Therapy',
      source: 'Spinal Publications',
      originalLanguage: 'en',
      summaryEs:
        'Método de diagnóstico y terapia mecánica para el dolor lumbar, enfatizando la centralización del dolor mediante movimientos repetidos.',
      originalText:
        'The centralization phenomenon describes the movement of pain from a distal to a more central location...',
    },
    {
      id: 'ref-003',
      author: 'Kendall, F.P.',
      year: 2005,
      title: 'Muscles: Testing and Function, with Posture and Pain',
      source: 'Lippincott Williams & Wilkins',
      originalLanguage: 'en',
      summaryEs:
        'Guía definitiva para pruebas musculares manuales y evaluación postural.',
      originalText:
        'Muscle testing procedures allowing for precise evaluation of strength and length...',
    },
    {
      id: 'ref-004',
      author: 'Anderson, B.',
      year: 1980,
      title: 'Stretching',
      source: 'Shelter Publications',
      originalLanguage: 'en',
      summaryEs:
        'Fundamentos del estiramiento estático para evitar el reflejo miotático.',
      originalText:
        'Static stretching involves holding a position tailored to a specific muscle group...',
    },
  ];

  for (const ref of references) {
    await prisma.bibliographicReference.upsert({
      where: { id: ref.id },
      update: ref,
      create: ref,
    });
  }
  console.log(`  ✓ ${references.length} bibliographic references`);

  const protocols = [
    {
      id: 'prot-001',
      title: 'Posición de la Esfinge',
      categoryName: 'Protocolos de Tratamiento',
      definition: 'Ejercicio de extensión pasiva en decúbito prono.',
      rationale:
        'Indicado para rectificación lumbar y hernias discales posteriores. Busca centralizar el dolor y restaurar la lordosis fisiológica.',
      procedure: [
        'Paciente en decúbito prono.',
        'Apoyar los antebrazos en el suelo manteniendo los codos debajo de los hombros.',
        'Relajar la musculatura glútea y lumbar.',
        'Mantener la posición durante 15 segundos a 3 minutos según tolerancia.',
      ],
      tags: ['Lumbar', 'Hernia', 'Extensión', 'McKenzie'],
      referenceIds: ['ref-002'],
    },
    {
      id: 'prot-002',
      title: 'Test de Thomas',
      categoryName: 'Test de Elasticidad',
      definition:
        'Prueba para evaluar la flexibilidad de los flexores de cadera (Psoas e Ilíaco).',
      rationale:
        'Diferencia entre acortamiento del iliopsoas y del recto femoral.',
      procedure: [
        'Paciente en decúbito supino al borde de la camilla.',
        'Flexionar una cadera y rodilla hacia el pecho para aplanar la lordosis lumbar.',
        'Observar si la pierna opuesta se levanta de la camilla.',
        'Si se levanta, indica acortamiento del psoas.',
      ],
      tags: ['Cadera', 'Flexibilidad', 'Psoas', 'Evaluación'],
      referenceIds: ['ref-003'],
    },
    {
      id: 'prot-003',
      title: 'Reeducación Postural Global (RPG) - Rana al suelo',
      categoryName: 'Protocolos de Tratamiento',
      definition: 'Postura de estiramiento global de la cadena anterior.',
      rationale:
        'Eficaz para corregir hipercifosis, hombros enrollados y rectificación cervical.',
      procedure: [
        'Paciente en decúbito supino, plantas de los pies juntas.',
        'Brazos abiertos a 45 grados, palmas hacia arriba.',
        'Exhalación prolongada descendiendo el tórax.',
        'Mantener la tensión suave y constante por 15-20 minutos.',
      ],
      tags: ['Postura', 'Cadena Anterior', 'Global', 'Souchard'],
      referenceIds: ['ref-001'],
    },
    {
      id: 'prot-004',
      title: 'Stretching Estático de Isquiotibiales',
      categoryName: 'Protocolos de Tratamiento',
      definition: 'Estiramiento analítico mantenido sin rebote.',
      rationale:
        'Mejora la flexibilidad sin activar el reflejo miotático, reduciendo riesgo de lesión.',
      procedure: [
        'Elevar la pierna extendida hasta el punto de tensión moderada.',
        'Mantener la posición fija durante 30 segundos.',
        'Respirar profundamente y relajar.',
        'No realizar movimientos balísticos.',
      ],
      tags: ['Isquiotibiales', 'Estiramiento', 'Flexibilidad'],
      referenceIds: ['ref-004'],
    },
  ];

  for (const { referenceIds, categoryName, ...protocolData } of protocols) {
    const categoryId = categoryIdByName.get(categoryName);
    if (!categoryId) {
      throw new Error(`Missing categoryId for category: ${categoryName}`);
    }

    await prisma.protocol.upsert({
      where: { id: protocolData.id },
      update: { ...protocolData, categoryId },
      create: { ...protocolData, categoryId },
    });

    for (const referenceId of referenceIds) {
      await prisma.protocolReference.upsert({
        where: {
          protocolId_referenceId: {
            protocolId: protocolData.id,
            referenceId,
          },
        },
        update: {},
        create: {
          protocolId: protocolData.id,
          referenceId,
        },
      });
    }
  }
  console.log(`  ✓ ${protocols.length} protocols with references`);

  const diagrams = [
    {
      id: 'diag-001',
      title: 'Osteología de la Pelvis',
      url: '/placeholder/pelvis-anatomy.png',
      description: 'Vista anterior y posterior del hueso coxal y sacro.',
    },
    {
      id: 'diag-002',
      title: 'Músculos Profundos del Dorso',
      url: '/placeholder/back-muscles.png',
      description: 'Multífidos, rotadores y erectores de la columna.',
    },
  ];

  for (const diag of diagrams) {
    await prisma.anatomicalDiagram.upsert({
      where: { id: diag.id },
      update: diag,
      create: diag,
    });
  }
  console.log(`  ✓ ${diagrams.length} anatomical diagrams`);

  console.log('✅ Biblioteca Médica seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
