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
    res.json(stands);
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
        surface: data.surface,
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
        surface: data.surface,
        totalHT: data.totalHT,
        tva: data.tva,
        totalTTC: data.totalTTC,
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

// --- DOCUMENTS UPLOAD ---

app.post('/api/exposants/:id/documents', upload.single('document'), async (req, res) => {
  const { id } = req.params;
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
