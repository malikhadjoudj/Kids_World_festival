require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendAdminNotification } = require('./mailer');
const { login, requireAdmin } = require('./auth');
const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

const normalizePackIds = (value, fallbackPackId) => {
  const rawIds = Array.isArray(value)
    ? value.flatMap((id) => String(id).split(','))
    : typeof value === 'string'
      ? value.split(',')
      : [];

  const ids = rawIds.map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0 && fallbackPackId) ids.push(fallbackPackId);

  return [...new Set(ids)].join(',');
};

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

const validateExposantData = (data, { requireAll = false } = {}) => {
  const errors = {};
  const requiredFields = ['nomPrenom', 'fonction', 'raisonSociale', 'adresse', 'tel', 'contact', 'email', 'rc', 'nif', 'art', 'nis', 'activite'];

  for (const field of requiredFields) {
    const value = data[field];
    if (requireAll && !hasValue(value)) {
      errors[field] = 'Ce champ est obligatoire.';
      continue;
    }

    if (!hasValue(value)) continue;

    const trimmed = String(value).trim();

    switch (field) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          errors[field] = 'Veuillez saisir une adresse e-mail valide.';
        }
        break;
      case 'tel':
        if (!/^\d{10}$/.test(trimmed)) {
          errors[field] = 'Le téléphone doit contenir exactement 10 chiffres.';
        }
        break;
      case 'rc':
        if (trimmed.length < 16) {
          errors[field] = `Il manque ${16 - trimmed.length} caractère(s).`;
        } else if (trimmed.length > 16) {
          errors[field] = 'Le RC doit contenir exactement 16 caractères.';
        }
        break;
      case 'nif':
        if (!/^\d{20}$/.test(trimmed)) {
          errors[field] = 'Le NIF doit contenir exactement 20 chiffres.';
        }
        break;
      case 'art':
        if (!/^\d{11}$/.test(trimmed)) {
          errors[field] = 'L’ART doit contenir exactement 11 chiffres.';
        }
        break;
      case 'nis':
        if (!/^\d{15}$/.test(trimmed)) {
          errors[field] = 'Le NIS doit contenir exactement 15 chiffres.';
        }
        break;
      default:
        break;
    }
  }

  return errors;
};

app.use(cors());
app.use(express.json());

// ─── ADMIN LOGIN ──────────────────────────────────────────
 
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  try {
    const token = login(username, password);
    if (!token) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Erreur serveur.' });
  }
});
// ─── Static uploads (local for now) ───────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const exposantDir = path.join(uploadsDir, req.params.id);
    if (!fs.existsSync(exposantDir)) fs.mkdirSync(exposantDir, { recursive: true });
    cb(null, exposantDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}.pdf`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Seuls les fichiers PDF sont acceptés.'));
  }
});

// ─── PACKS ────────────────────────────────────────────────

app.get('/api/packs', async (req, res) => {
  try {
    const packs = await prisma.pack.findMany();
    res.json(packs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de récupérer les packs.' });
  }
});

// ─── STANDS ───────────────────────────────────────────────

app.get('/api/stands',requireAdmin, async (req, res) => {
  try {
    const stands = await prisma.stand.findMany();
    res.json(
      stands.sort((a, b) =>
        a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' })
      )
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de récupérer les stands.' });
  }
});

app.patch('/api/stands/:id',requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { x, y, surface, status, packCompatible } = req.body;
  const data = {};

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
    const stand = await prisma.stand.update({ where: { id }, data });
    res.json(stand);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de modifier le stand.' });
  }
});

// POST create stand
app.post('/api/stands', requireAdmin, async (req, res) => {
  const { id, surface, x, y, packCompatible } = req.body;
  if (!id) return res.status(400).json({ error: 'ID du stand obligatoire.' });
  const surfaceVal = Number(surface) || 12;
  const xVal = Number(x) || 100;
  const yVal = Number(y) || 100;

  try {
    const existing = await prisma.stand.findUnique({ where: { id } });
    if (existing) return res.status(400).json({ error: 'Ce stand existe déjà.' });

    const stand = await prisma.stand.create({
      data: {
        id,
        surface: surfaceVal,
        x: xVal,
        y: yVal,
        packCompatible: packCompatible || 'all'
      }
    });
    res.json(stand);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de créer le stand.' });
  }
});

// DELETE stand
app.delete('/api/stands/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const exposant = await prisma.exposant.findFirst({ where: { standId: id } });
    if (exposant) {
      await prisma.exposant.update({
        where: { id: exposant.id },
        data: { standId: null }
      });
    }

    await prisma.stand.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de supprimer le stand.' });
  }
});

// ─── EXPOSANTS ────────────────────────────────────────────

// GET all exposants
app.get('/api/exposants',requireAdmin, async (req, res) => {
  try {
    const exposants = await prisma.exposant.findMany({
      include: { pack: true, stand: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(exposants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de récupérer les exposants.' });
  }
});

// GET single exposant
app.get('/api/exposants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const exposant = await prisma.exposant.findUnique({
      where: { id },
      include: { pack: true, stand: true }
    });
    if (!exposant) return res.status(404).json({ error: 'Exposant introuvable.' });
    res.json(exposant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de récupérer l\'exposant.' });
  }
});

// POST create exposant (soumission du bon de commande)
app.post('/api/exposants', async (req, res) => {
  try {
    const data = req.body;
    const validationErrors = validateExposantData(data, { requireAll: true });

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: 'Données invalides.', details: validationErrors });
    }
    
    // Fetch the pack to get its price
    const pack = await prisma.pack.findUnique({
      where: { id: data.packId }
    });

    if (!pack) {
      return res.status(400).json({ error: 'Pack invalide.' });
    }

    // Logic for calculating the price
    let packPrice = pack.price;
    const DROITS_INTERVENTION = 15000;
    
    // If the pack is 'espace-nu', the price might depend on surface. 
    // Currently the DB sets price = 0 for espace-nu (based on mock data). If it's 12000 DA / m2:
    if (pack.id === 'espace-nu' && data.surface) {
      packPrice = parseInt(data.surface) * 12000;
    }
    // PACK DISCOVER & FUN / PACK SELL & WIN : prix par palier de surface (12m² ou 24m²).
    if ((pack.id === 'discover-fun' || pack.id === 'sell-win') && data.surface) {
      const sqMeters = parseInt(data.surface);
      packPrice = sqMeters === 24 ? 380000 : 220000;
    }
    const fallbackTotalHT = packPrice + DROITS_INTERVENTION;
    const fallbackTva = fallbackTotalHT * 0.19;
    const fallbackTotalTTC = fallbackTotalHT + fallbackTva;

    const submittedTotalHT = Number.parseFloat(data.totalHT);
    const submittedTva = Number.parseFloat(data.tva);
    const submittedTotalTTC = Number.parseFloat(data.totalTTC);
    const totalHT = Number.isFinite(submittedTotalHT) ? submittedTotalHT : fallbackTotalHT;
    const tva = Number.isFinite(submittedTva) ? submittedTva : fallbackTva;
    const totalTTC = Number.isFinite(submittedTotalTTC) ? submittedTotalTTC : fallbackTotalTTC;
    const selectedPackIds = normalizePackIds(data.selectedPackIds || data.packIds, data.packId);

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
        selectedPackIds,
        surface: data.surface ? parseInt(data.surface) : null,
        totalHT: totalHT,
        tva: tva,
        totalTTC: totalTTC,
      },
    });
    sendAdminNotification(exposant, 'inscription');
    res.status(201).json(exposant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de créer l\'exposant.' });
  }
});

// PATCH update exposant (save document steps)
app.patch('/api/exposants/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const validationErrors = validateExposantData(data, { requireAll: false });

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: 'Données invalides.', details: validationErrors });
    }

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
          data.selectedPackIds !== undefined || data.packIds !== undefined
            ? normalizePackIds(data.selectedPackIds || data.packIds, data.packId)
            : undefined,
        surface: data.surface !== undefined && data.surface !== null ? parseInt(data.surface) : undefined,
        totalHT: data.totalHT !== undefined ? parseFloat(data.totalHT) : undefined,
        tva: data.tva !== undefined ? parseFloat(data.tva) : undefined,
        totalTTC: data.totalTTC !== undefined ? parseFloat(data.totalTTC) : undefined,
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
      }
    });
    res.json(exposant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de mettre à jour l\'exposant.' });
  }
});

// PATCH update statut contrat (admin)
app.patch('/api/exposants/:id/statut', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { statutContrat } = req.body;
  try {
    const exposant = await prisma.exposant.update({
      where: { id },
      data: { statutContrat }
    });
    res.json(exposant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de modifier le statut.' });
  }
});

// PATCH assign stand (admin)
app.patch('/api/exposants/:id/stand', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { standId } = req.body;
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const currentExposant = await tx.exposant.findUnique({
        where: { id },
        select: { id: true, standId: true }
      });

      if (!currentExposant) {
        const error = new Error('Exposant introuvable.');
        error.statusCode = 404;
        throw error;
      }

      if (standId) {
        const stand = await tx.stand.findUnique({ where: { id: standId } });
        if (!stand) {
          const error = new Error('Stand introuvable.');
          error.statusCode = 404;
          throw error;
        }

        if (stand.status === 'bloque') {
          const error = new Error('Ce stand est bloque.');
          error.statusCode = 409;
          throw error;
        }

        const alreadyAssigned = await tx.exposant.findFirst({
          where: {
            standId,
            NOT: { id }
          }
        });

        if (alreadyAssigned) {
          const error = new Error('Ce stand est deja attribue.');
          error.statusCode = 409;
          throw error;
        }
      }

      const exposant = await tx.exposant.update({
        where: { id },
        data: { standId: standId || null },
        include: { pack: true, stand: true }
      });

      if (currentExposant.standId && currentExposant.standId !== standId) {
        const remainingAssignments = await tx.exposant.count({
          where: { standId: currentExposant.standId }
        });
        if (remainingAssignments === 0) {
          await tx.stand.update({
            where: { id: currentExposant.standId },
            data: { status: 'disponible' }
          });
        }
      }

      if (standId) {
        await tx.stand.update({
          where: { id: standId },
          data: { status: 'reserve' }
        });
      }

      return exposant;
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Impossible d\'assigner le stand.' });
  }
});

// ─── UPLOAD DOCUMENT SIGNÉ ────────────────────────────────

app.post(
  '/api/exposants/:id/documents',
  upload.fields([
    { name: 'documentTarification', maxCount: 1 },
    { name: 'documentParticipation', maxCount: 1 },
  ]),
  async (req, res) => {
    const { id } = req.params;
    const files = req.files || {};
    const tarificationFile = files.documentTarification?.[0];
    const participationFile = files.documentParticipation?.[0];

    if (!tarificationFile || !participationFile) {
      return res.status(400).json({ error: 'Les deux documents (tarification et participation) sont requis.' });
    }

    try {
      const documentTarificationSigneUrl = `/uploads/${id}/${tarificationFile.filename}`;
      const documentParticipationSigneUrl = `/uploads/${id}/${participationFile.filename}`;
      const exposant = await prisma.exposant.update({
        where: { id },
        data: {
          hasUploadedDocuments: true,
          documentTarificationSigneUrl,
          documentParticipationSigneUrl,
          statutContrat: 'recu'
        }
      });
      sendAdminNotification(exposant, 'documents');
      res.json(exposant);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Impossible d\'enregistrer le document.' });
    }
  }
);

// ─── SERVER ────────────────────────────────────────────────

app.listen(port, () => {
  console.log(`✅ Backend API running on http://localhost:${port}`);
});
