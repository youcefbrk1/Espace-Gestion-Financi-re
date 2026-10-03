# MAT EMBALLAGES - Application de Gestion Financière & Dossiers Clients

Application web moderne, légère et professionnelle dédiée à la gestion des enregistrements financiers, des bons de livraison et des dossiers clients pour la société de fabrication de cartons et caisses d'emballage **MAT EMBALLAGES**.

---

## 🚀 Lancement Rapide (Zéro Dépendance)
Cette application a été développée en **HTML5, CSS3 et JavaScript pur (Vanilla ES6)**, sans aucun framework ni installation préalable requise.

1. Allez dans le dossier `C:\Users\HomePC\Desktop\MAT`.
2. Double-cliquez sur **`index.html`** pour l'ouvrir dans n'importe quel navigateur moderne (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, etc.).

---

## 🔑 Identifiants d'Accès (Écran de Connexion)
- **Nom d'utilisateur** : `rafikgarti`
- **Mot de passe** : `091082`

---

## 📋 Fonctionnalités Clés & Parcours Utilisateur

### 1. Écran 1 : Authentification & Sécurité
- Logo emblématique **MAT EMBALLAGES** avec icône de boîte carton 3D rouge et typographie noire/rouge.
- Formulaire d'authentification professionnel et sécurisé (les identifiants ne sont pas divulgués sur l'écran).
- Bouton œil (👁️) intégré pour afficher ou masquer le mot de passe lors de la saisie.
- Contrôle strict des identifiants avec animation de secousse et message d'erreur en cas de saisie invalide.
- Déconnexion automatique dès la fermeture de la page ou du navigateur (`sessionStorage`), pour une sécurité maximale.
- Toutes les données financières des clients restent sauvegardées et persistées de manière permanente (`localStorage`).

### 2. Écran 2 : Tableau de Bord des Dossiers Clients (Vue Dossiers)
- **En-tête de marque** avec le logo MAT EMBALLAGES, salutation personnalisée (`rafikgarti`) et bouton de déconnexion.
- **Recherche instantanée** : Filtrage en temps réel des dossiers clients par nom de société ou contact.
- **Cartes dossiers avec look cartonné** : Affiche le nom du client, le nombre de bons, la date et le total HT.
- **Bouton "+ Nouveau Dossier Client"** pour créer rapidement un nouveau compte client.

### 3. Écran 3 : Grand Livre Financier (Tableau Dynamique & Réactif)
- **Bouton de retour** vers le tableau de bord des dossiers.
- **En-tête client** avec nom de la société sélectionnée et badge d'état.
- **Colonnes obligatoires par défaut** :
  1. **Date** (Sélecteur de date interactif)
  2. **N° Reçu / Bon** (Numéro de facture ou bon de livraison)
  3. **Produit (Dimensions / Type)** (Dimensions de caisse carton, type de cannelure, etc.)
  4. **Quantité** (Champ numérique)
  5. **Prix Unitaire (HT)** (Prix au format monétaire)
  6. **Prix Total (HT)** (**Calculé automatiquement** en temps réel : `Quantité × Prix Unitaire`)
- **Colonnes dynamiques personnalisées** :
  - Cliquez sur le bouton **"+ Ajouter une colonne"** (ou sur le bouton `+ Colonne` dans l'en-tête du tableau) pour créer une colonne sur mesure (ex: *Remise %*, *Réf Commande*, *Observation*, etc.).
  - Possibilité de supprimer les colonnes personnalisées avec confirmation.
- **Ajout et suppression de lignes dynamiques** : Boutons d'ajout rapide au sommet et au pied du tableau, avec suppression individuelle par ligne.
- **Pied de résumé dynamique** :
  - Calcul automatique de la quantité totale de caisses carton.
  - Calcul automatique et immédiat du **Total Prix (HT)** global pour le client.
- **Exportations professionnelles** :
  - **Exportation CSV (Excel)** : Fichier `.csv` encodé en UTF-8 avec BOM pour une compatibilité parfaite avec Microsoft Excel et les caractères accentués.
  - **Impression / Export PDF** : Feuille de style dédiée avec en-tête d'entreprise MAT EMBALLAGES, nom du client, date d'édition et zone de cachet/signature.

---

## 💾 Persistance des Données
Toutes les données (dossiers clients créés, modifications de cellules, ajouts de lignes et colonnes personnalisées) sont **sauvegardées automatiquement et localement dans le navigateur (`localStorage`)**. Vos données restent intactes après chaque fermeture ou rafraîchissement de page.

---

## 🎨 Charte Graphique & Ergonomie
- **Couleurs principales** : Rouge industriel (`#E53935`) & Anthracite sombre (`#1A1A1A`).
- **Design réactif** : Entièrement adapté aux écrans de bureau et tablettes tactiles.
