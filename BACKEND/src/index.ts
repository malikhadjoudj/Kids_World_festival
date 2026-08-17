import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Set up multer for basic file upload (to memory for now, to be integrated with Supabase storage later)
const upload = multer({ storage: multer.memoryStorage() });

// --- PACKS ROUTES ---

app.get('/api/packs', async (req, res) => {
  try {
    const packs = await prisma.pack.findMany();
    res.json(packs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch packs' });
  }
});

app.post('/api/packs', async (req, res) => {
  try {
    const { id, name, description, price, perSquareMeter, surface, icon } = req.body;
    const pack = await prisma.pack.create({
      data: { id, name, description, price, perSquareMeter, surface, icon },
    });
    res.json(pack);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create pack' });
  }
});

// --- STANDS ROUTES ---

app.get('/api/stands', async (req, res) => {
  try {
    const stands = await prisma.stand.findMany();
    res.json(
      stands.sort((a, b) =>
        a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' })
      )
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stands' });
  }
});

// --- EXPOSANTS ROUTES ---

app.get('/api/exposants', async (req, res) => {
  try {
    const exposants = await prisma.exposant.findMany({
      include: {
        pack: true,
        stand: true
      }
    });
    res.json(exposants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exposants' });
  }
});

app.post('/api/exposants', async (req, res) => {
  try {
    const data = req.body;
    const exposant = await prisma.exposant.create({
      data: {
        nomPrenom: data.nomPrenom,
        fonction: data.fonction,
        raisonSociale: data.raisonSociale,
        adresse: data.adresse,
        tel: data.tel,
        contact: data.contact,
        email: data.email,
        rc: data.rc,
        nif: data.nif,
        art: data.art,
        nis: data.nis,
        activite: data.activite,
        packId: data.packId,
         selectedPackIds: Array.isArray(data.selectedPackIds)
          ? data.selectedPackIds.join(',')
          : data.selectedPackIds || data.packId || '',
          // Surface de chaque pack
        // Exemple :
        // {"discover-fun":16,"sell-win":24}
        packSurfaces:
          typeof data.packSurfaces === 'string'
            ? data.packSurfaces
            : JSON.stringify(data.packSurfaces || {}),

        // Ancienne valeur conservée pour compatibilité
        surface: data.surface
          ? parseInt(data.surface, 10)
          : null,
        
        totalHT: data.totalHT,
        tva: data.tva,
        totalTTC: data.totalTTC,
      },
    });
    res.json(exposant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create exposant' });
  }
});

app.patch('/api/exposants/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const exposant = await prisma.exposant.update({
      where: { id },
      data: {
        nomPrenom: data.nomPrenom,
        fonction: data.fonction,
        raisonSociale: data.raisonSociale,
        adresse: data.adresse,
        tel: data.tel,
        contact: data.contact,
        email: data.email,
        rc: data.rc,
        nif: data.nif,
        art: data.art,
        nis: data.nis,
        activite: data.activite,
        packId: data.packId,

selectedPackIds:
  data.selectedPackIds !== undefined
    ? Array.isArray(data.selectedPackIds)
      ? data.selectedPackIds.join(',')
      : data.selectedPackIds
    : undefined,

packSurfaces:
  data.packSurfaces !== undefined
    ? typeof data.packSurfaces === 'string'
      ? data.packSurfaces
      : JSON.stringify(data.packSurfaces || {})
    : undefined,

surface:
  data.surface !== undefined && data.surface !== null
    ? parseInt(data.surface, 10)
    : undefined,

totalHT:
  data.totalHT !== undefined
    ? parseFloat(data.totalHT)
    : undefined,

tva:
  data.tva !== undefined
    ? parseFloat(data.tva)
    : undefined,

totalTTC:
  data.totalTTC !== undefined
    ? parseFloat(data.totalTTC)
    : undefined,
        documentTarificationNomPrenom: data.documentTarificationNomPrenom,
        documentTarificationFonction: data.documentTarificationFonction,
        documentTarificationRaisonSociale: data.documentTarificationRaisonSociale,
        documentTarificationAdresse: data.documentTarificationAdresse,
        documentTarificationTel: data.documentTarificationTel,
        documentTarificationContact: data.documentTarificationContact,
        documentTarificationEmail: data.documentTarificationEmail,
        documentTarificationRc: data.documentTarificationRc,
        documentTarificationNif: data.documentTarificationNif,
        documentTarificationArt: data.documentTarificationArt,
        documentTarificationNis: data.documentTarificationNis,
        documentTarificationActivite: data.documentTarificationActivite,
        documentParticipationNomPrenom: data.documentParticipationNomPrenom,
        documentParticipationEntreprise: data.documentParticipationEntreprise,
      },
    });
    res.json(exposant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update exposant' });
  }
});

app.patch('/api/exposants/:id/stand', async (req, res) => {
  const { id } = req.params;
  const { standId } = req.body;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const currentExposant = await tx.exposant.findUnique({
        where: { id },
        select: { id: true, standId: true },
      });

      if (!currentExposant) {
        const error = new Error('Exposant introuvable.');
        (error as Error & { statusCode?: number }).statusCode = 404;
        throw error;
      }

      if (standId) {
        const stand = await tx.stand.findUnique({ where: { id: standId } });
        if (!stand) {
          const error = new Error('Stand introuvable.');
          (error as Error & { statusCode?: number }).statusCode = 404;
          throw error;
        }

        if (stand.status === 'bloque') {
          const error = new Error('Ce stand est bloque.');
          (error as Error & { statusCode?: number }).statusCode = 409;
          throw error;
        }

        const alreadyAssigned = await tx.exposant.findFirst({
          where: {
            standId,
            NOT: { id },
          },
        });

        if (alreadyAssigned) {
          const error = new Error('Ce stand est deja attribue.');
          (error as Error & { statusCode?: number }).statusCode = 409;
          throw error;
        }
      }

      const exposant = await tx.exposant.update({
        where: { id },
        data: {
          standId: standId || null,
        },
        include: { pack: true, stand: true },
      });

      if (currentExposant.standId && currentExposant.standId !== standId) {
        const remainingAssignments = await tx.exposant.count({
          where: { standId: currentExposant.standId },
        });

        if (remainingAssignments === 0) {
          await tx.stand.update({
            where: { id: currentExposant.standId },
            data: { status: 'disponible' },
          });
        }
      }

      if (standId) {
        await tx.stand.update({
          where: { id: standId },
          data: { status: 'reserve' },
        });
      }

      return exposant;
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    const statusCode = (error as { statusCode?: number }).statusCode || 500;
    const message = error instanceof Error ? error.message : 'Failed to assign stand to exposant';
    res.status(statusCode).json({ error: message });
  }
});

app.patch('/api/stands/:id', async (req, res) => {
  const { id } = req.params;
  const { x, y, surface, status, packCompatible } = req.body;
  const data: {
    x?: number;
    y?: number;
    surface?: number;
    status?: string;
    packCompatible?: string;
  } = {};

  if (x !== undefined) {
    const parsedX = Number(x);
    if (!Number.isFinite(parsedX)) {
      return res.status(400).json({ error: 'Position X invalide.' });
    }
    data.x = parsedX;
  }

  if (y !== undefined) {
    const parsedY = Number(y);
    if (!Number.isFinite(parsedY)) {
      return res.status(400).json({ error: 'Position Y invalide.' });
    }
    data.y = parsedY;
  }

  if (surface !== undefined) {
    const parsedSurface = Number(surface);
    if (!Number.isFinite(parsedSurface) || parsedSurface <= 0) {
      return res.status(400).json({ error: 'Surface invalide.' });
    }
    data.surface = parsedSurface;
  }

  if (status !== undefined) data.status = status;
  if (packCompatible !== undefined) data.packCompatible = packCompatible;

  try {
    const stand = await prisma.stand.update({
      where: { id },
      data,
    });
    res.json(stand);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update stand' });
  }
});

// --- DOCUMENTS UPLOAD ---

app.post('/api/exposants/:id/documents', upload.single('document'), async (req, res) => {
  const id = String(req.params.id);
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // TODO: Upload file to Supabase Storage and get the public URL
    // For now, we simulate success and set a mock URL
    const mockUrl = `/uploads/${id}/${file.originalname}`;

    const exposant = await prisma.exposant.update({
      where: { id },
      data: {
        hasUploadedDocuments: true,
        documentUrl: mockUrl
      }
    });

    res.json(exposant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
