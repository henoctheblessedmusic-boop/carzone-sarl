import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedArticlesAndMails() {
  const count = await prisma.article.count();
  if (count === 0) {
    const articles = [
      { name: "Additif lave glace", description: "Bidon additif nettoyant concentré pour essuie-glace", unitPriceXof: 5900, category: "ACCESSOIRE", unit: "1" },
      { name: "BÂCHE & ARCEAU", description: "Bâche étanche renforcée et arceau de benne pick-up", unitPriceXof: 240000, category: "ACCESSOIRE", unit: "1" },
      { name: "BYD ATTO3", description: "SUV 100% électrique confort", unitPriceXof: 15900000, category: "VEHICULE", unit: "1" },
      { name: "BYD ATTO3 EV EXCELLENCE EDITION", description: "SUV électrique édition luxe avec toit ouvrant panoramique", unitPriceXof: 17900000, category: "VEHICULE", unit: "1" },
      { name: "BYD LEOPARD 5 PHEV ULTRA EDITION HYBRIDE", description: "SUV 4x4 tout-terrain hybride rechargeable haute puissance", unitPriceXof: 28900000, category: "VEHICULE", unit: "1" },
      { name: "BYD SEA LION 07 EV", description: "SUV coupé électrique nouvelle génération Blade Battery", unitPriceXof: 23900000, category: "VEHICULE", unit: "1" },
      { name: "BYD SEAGULL EV", description: "Citadine citoyenne électrique économique autonomie 305 km", unitPriceXof: 12900000, category: "VEHICULE", unit: "1" },
      { name: "BYD SEAGULL EV FLYING EDITION", description: "Citadine électrique finition premium 405 km", unitPriceXof: 14900000, category: "VEHICULE", unit: "1" },
      { name: "BYD SONG PLUS EV", description: "SUV électrique familial haut de gamme", unitPriceXof: 20900000, category: "VEHICULE", unit: "1" },
      { name: "BYD SONG PLUS HYBRIDE", description: "SUV hybride rechargeable DM-i très faible consommation", unitPriceXof: 16900000, category: "VEHICULE", unit: "1" },
      { name: "Borne murale Wallbox 7.4 kW", description: "Borne de recharge monophasée intelligente avec câble attaché Type 2", unitPriceXof: 650000, category: "ACCESSOIRE", unit: "1" },
      { name: "Borne murale Wallbox 22 kW", description: "Borne triphasée rapide pour entreprise ou résidence", unitPriceXof: 950000, category: "ACCESSOIRE", unit: "1" },
      { name: "Prise renforcée Green'up 3.7 kW", description: "Prise murale sécurisée Legrand pour recharge quotidienne", unitPriceXof: 120000, category: "ACCESSOIRE", unit: "1" },
      { name: "Câble de recharge Type 2 (5m)", description: "Câble 32A pour bornes publiques et privées", unitPriceXof: 180000, category: "ACCESSOIRE", unit: "1" },
      { name: "Forfait Révision Périodique EV", description: "Contrôle 45 points, liquide de frein, batterie haute tension, filtre habitacle", unitPriceXof: 45000, category: "SERVICE", unit: "forfait" },
      { name: "Diagnostic Électronique & Batterie", description: "Bilan d'état de santé SOH batterie et mise à jour calculateurs", unitPriceXof: 25000, category: "SERVICE", unit: "forfait" },
    ];

    for (const a of articles) {
      await prisma.article.create({ data: a });
    }
    console.log(`Seeded ${articles.length} articles & services.`);
  }

  const mailCount = await prisma.mailMessage.count();
  if (mailCount === 0) {
    const customer = await prisma.customer.findFirst();
    const mails = [
      {
        folder: "INBOX",
        from: "a.johnson@impactplus.bj",
        to: "contact@topcarzone.com",
        subject: "Demande de confirmation proforma BYD Song Plus",
        snippet: "Bonjour équipe CARZONE SARL, suite à notre échange au showroom, nous confirmons le devis...",
        body: "Bonjour équipe CARZONE SARL,\n\nSuite à notre échange au showroom de la Zone Maro-Militaire (Gbèdomidji), nous souhaitons valider la commande ferme pour le BYD Song Plus EV avec la borne 7.4 kW.\n\nMerci de nous transmettre les modalités de règlement.\n\nBien cordialement,\nAugustin JOHNSON",
        customerId: customer?.id,
        isRead: false,
        starred: true,
      },
      {
        folder: "INBOX",
        from: "contact@volthome.bj",
        to: "contact@topcarzone.com",
        subject: "Devis installation borne à domicile — Fidjrossè",
        snippet: "Monsieur le Responsable, nous avons soumis notre chiffrage pour le raccordement...",
        body: "Bonjour,\n\nNous vous confirmons avoir inspecté le site à Fidjrossè et soumis notre devis de 850 000 XOF pour une mise en service sous 7 jours.\n\nCordialement,\nSerge ADJOVI — VoltHome Bénin",
        isRead: true,
      },
      {
        folder: "SENT",
        from: "contact@topcarzone.com",
        to: "a.johnson@impactplus.bj",
        subject: "CARZONE SARL — Votre facture proforma PRO-2026-0001",
        snippet: "Veuillez trouver ci-joint votre proforma pour le véhicule BYD SONG PLUS EV...",
        body: "Cher Monsieur Johnson,\n\nVeuillez trouver le récapitulatif de votre commande.\n\nL'équipe commerciale CARZONE reste à votre disposition.",
        isRead: true,
      },
    ];

    for (const m of mails) {
      await prisma.mailMessage.create({ data: m });
    }
    console.log(`Seeded ${mails.length} initial mail messages.`);
  }
}

seedArticlesAndMails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
