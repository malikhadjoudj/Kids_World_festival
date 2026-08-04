const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const STATUT_LABELS = {
  en_attente: 'En attente',
  recu: 'Contrat reçu',
  incomplet: 'Incomplet',
};

/**
 * Envoie une notification email à l'admin quand un exposant s'inscrit
 * ou met à jour son dossier (documents envoyés).
 */
async function sendAdminNotification(exposant, event) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY non configuré, notification non envoyée.');
    return;
  }
  if (!adminEmail) {
    console.warn('⚠️  ADMIN_NOTIFICATION_EMAIL non configuré, notification non envoyée.');
    return;
  }

  const statutLabel = STATUT_LABELS[exposant.statutContrat] || exposant.statutContrat;

  const eventLabel = event === 'documents'
    ? 'a envoyé ses documents'
    : 's\'est inscrit';

  const subject = `🔔 Kids World Festival — ${exposant.raisonSociale || exposant.nomPrenom} ${eventLabel}`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #222; max-width: 500px;">
      <h2 style="color: #0B2545;">Nouvelle activité exposant</h2>
      <p><strong>${exposant.raisonSociale || '—'}</strong> (${exposant.nomPrenom}) ${eventLabel} sur la plateforme Kids World Festival.</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 12px;">
        <tr><td style="padding: 4px 8px; color: #666;">Email</td><td style="padding: 4px 8px;">${exposant.email || '—'}</td></tr>
        <tr><td style="padding: 4px 8px; color: #666;">Téléphone</td><td style="padding: 4px 8px;">${exposant.tel || '—'}</td></tr>
        <tr><td style="padding: 4px 8px; color: #666;">Activité</td><td style="padding: 4px 8px;">${exposant.activite || '—'}</td></tr>
        <tr><td style="padding: 4px 8px; color: #666;">Statut du contrat</td><td style="padding: 4px 8px;"><strong>${statutLabel}</strong></td></tr>
      </table>
      <p style="margin-top: 16px;">
        <a href="${process.env.ADMIN_DASHBOARD_URL || '#'}" style="color: #fff; background: #0B2545; padding: 8px 16px; border-radius: 6px; text-decoration: none;">
          Voir dans le tableau de bord
        </a>
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: process.env.MAIL_FROM || 'onboarding@resend.dev',
      to: adminEmail,
      subject,
      html,
    });
    if (error) throw new Error(error.message || JSON.stringify(error));
    console.log(`✅ Notification envoyée à ${adminEmail} (${eventLabel})`);
  } catch (error) {
    // On ne bloque jamais la requête principale si l'email échoue.
    console.error('❌ Erreur lors de l\'envoi de la notification email :', error.message);
  }
}

module.exports = { sendAdminNotification };