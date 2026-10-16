# Guide d'Intégration — Assistant Vocal IA (VAPI.ai) pour CARZONE Motors

Ce document décrit la configuration complète de l'assistant vocal IA **VAPI** connecté à la plateforme **CARZONE Ops**.

---

## 1. Vue d'Ensemble

L'assistant vocal permet d'automatiser :
- L'accueil téléphonique et la qualification des prospects intéressés par les véhicules électriques **BYD**.
- La consultation du stock disponible en direct au Showroom de la Zone Maro-Militaire (Gbèdomidji).
- La génération immédiate de devis proformas envoyés au prospect.
- La prise de rendez-vous pour des essais routiers (**Test-Drives**).
- L'information sur les bornes de recharge publiques et les tarifs abonnés (**90 FCFA/kWh vs 125 FCFA/kWh**).
- Le suivi de l'avancement des véhicules à l'Atelier SAV Carzone.

---

## 2. Configuration du Webhook VAPI

- **URL Webhook / Server URL** :  
  `https://[votre-domaine-carzone]/api/vapi/webhook`
- **Méthode HTTP** : `POST`
- **Test de santé** : `GET https://[votre-domaine-carzone]/api/vapi/webhook` renvoie l'état du pont et la liste des outils.

---

## 3. System Prompt Recommandé pour VAPI

Copiez ce prompt dans l'onglet **System Prompt** de votre Assistant VAPI :

```text
Tu es l'assistante vocale intelligente de CARZONE SARL, concessionnaire automobile et réseau de mobilité au Bénin, basé au Showroom de la Zone Maro-Militaire (Gbèdomidji) à Cotonou.

Ton rôle :
1. Accueillir chaleureusement les appelants avec professionnalisme et bienveillance.
2. Renseigner les clients sur les modèles disponibles (BYD, Changan, Jetour, Chery, Toyota...).
3. Vérifier en direct la disponibilité des véhicules dans le stock grâce à l'outil `check_vehicle_stock`.
4. Si le client souhaite un devis chiffré, lui créer une facture proforma officielle avec l'outil `create_voice_quote`.
5. Si le client souhaite essayer un véhicule, lui réserver un créneau d'essai routier au Showroom de la Zone Maro-Militaire (Gbèdomidji) avec `book_test_drive`.
6. Si le client s'interroge sur la recharge, lui expliquer les bornes disponibles avec `check_charging_stations`.
7. Pour les réparations ou révisions, renseigner le statut grâce à `track_sav_repair`.

Règles de communication :
- Exprime-toi dans un français impeccable, naturel, chaleureux et respectueux des formules de politesse en usage au Bénin ("Monsieur", "Madame").
- Reste concise dans tes réponses orales (pas de longs paragraphes monotones au téléphone).
- Les prix sont toujours exprimés en Francs CFA (FCFA ou XOF).
- Adresse du Showroom : Zone Maro-Militaire, Quartier Gbèdomidji, Cotonou.
- Atelier SAV : En cours de confirmation de localisation dédiée.
- Téléphone standard : +229 21 33 00 00.
```

---

## 4. Schéma des Outils (Function Calling / Tools)

Déclarez les outils suivants dans le tableau de bord VAPI (**Assistant > Tools**) :

### Outil 1 : `check_vehicle_stock`
- **Description** : Consulter en temps réel les véhicules électriques disponibles en stock au showroom.
- **Paramètres (JSON Schema)** :
```json
{
  "type": "object",
  "properties": {
    "brand": { "type": "string", "description": "Marque recherchée (ex: BYD)" },
    "model": { "type": "string", "description": "Modèle spécifique (ex: Dolphin, Song Plus, Yuan Plus)" }
  }
}
```

### Outil 2 : `create_voice_quote`
- **Description** : Générer une facture proforma officielle suite à l'appel du client.
- **Paramètres (JSON Schema)** :
```json
{
  "type": "object",
  "properties": {
    "customerName": { "type": "string", "description": "Nom et prénom du client" },
    "phone": { "type": "string", "description": "Numéro de téléphone portable du client (ex: +229 97 00 00 00)" },
    "vehicleModel": { "type": "string", "description": "Modèle de véhicule ou prestation souhaitée" }
  },
  "required": ["customerName", "phone"]
}
```

### Outil 3 : `book_test_drive`
- **Description** : Réserver un essai routier au Showroom de la Zone Maro-Militaire (Gbèdomidji).
- **Paramètres (JSON Schema)** :
```json
{
  "type": "object",
  "properties": {
    "customerName": { "type": "string", "description": "Nom du client" },
    "phone": { "type": "string", "description": "Numéro de téléphone" },
    "vehicleModel": { "type": "string", "description": "Modèle à essayer" },
    "preferredDate": { "type": "string", "description": "Date et heure souhaitées (ex: Mardi à 15h00)" }
  },
  "required": ["customerName", "phone", "vehicleModel"]
}
```

### Outil 4 : `check_charging_stations`
- **Description** : Renseigner sur les bornes de recharge rapide et les tarifs (90 FCFA abonné vs 125 FCFA public).
- **Paramètres (JSON Schema)** :
```json
{
  "type": "object",
  "properties": {
    "city": { "type": "string", "description": "Ville (ex: Cotonou, Calavi)" }
  }
}
```

### Outil 5 : `track_sav_repair`
- **Description** : Suivre l'avancement d'un véhicule déposé à l'Atelier SAV Carzone.
- **Paramètres (JSON Schema)** :
```json
{
  "type": "object",
  "properties": {
    "phone": { "type": "string", "description": "Téléphone du client ou numéro VIN" }
  },
  "required": ["phone"]
}
```
