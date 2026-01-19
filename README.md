# 📅 EDT Manager HEP

**EDT Manager** est une application web responsive qui permet aux étudiants des écoles du réseau HEP (EPSI, WIS, etc.) de visualiser leur emploi du temps de manière **claire, moderne et interactive**.

L'application récupère automatiquement les données, les affiche dans une vue grille ou liste adaptée à l'appareil, et enrichit l'expérience avec des couleurs par matière, l'export en image et la **synchronisation avec votre calendrier personnel via un lien d'abonnement iCal**.

[![Build Status](https://github.com/D-Seonay/edt-hep/actions/workflows/ci.yml/badge.svg)](https://github.com/D-Seonay/edt-hep/actions/workflows/ci.yml)
[![All Contributors](https://img.shields.io/github/all-contributors/D-Seonay/edt-hep?color=ee8449&style=flat-square)](#-contributeurs)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## 🖼️ Aperçu

![Aperçu de l'application EDT Manager](public/preview.png)

---


## 🏫 Écoles supportées

| École      | Logo                                                                   | Statut     |
| ---------- | ---------------------------------------------------------------------- | ---------- |
| 3A         | <img alt="3A" src="public/logos/3A.png" height="40" />                 | À tester   |
| IFAG       | <img alt="IFAG" src="public/logos/IFAG.png" height="40" />             | **Validé** |
| IDRAC      | <img alt="IDRAC" src="public/logos/IDRAC.png" height="40" />           | **Validé** |
| EPSI       | <img alt="EPSI" src="public/logos/EPSI.png" height="40" />             | **Validé** |
| WIS        | <img alt="WIS" src="public/logos/WIS.png" height="40" />               | **Validé** |
| SUP'DE COM | <img alt="SUP'DE COM" src="public/logos/SUPDECOM.png" height="40" />   | À tester   |
| IET        | <img alt="IET" src="public/logos/IET.png" height="40" />               | À tester   |
| ICL        | <img alt="ICL" src="public/logos/ICL.png" height="40" />               | À tester   |
| IEFT       | <img alt="IEFT" src="public/logos/IEFT.png" height="40" />             | À tester   |
| IGEFI      | <img alt="IGEFI" src="public/logos/IGEFI.png" height="40" />           | À tester   |
| IHEDREA    | <img alt="IHEDREA" src="public/logos/IHEDREA.png" height="40" />       | À tester   |
| ILERI      | <img alt="ILERI" src="public/logos/ILERI.png" height="40" />           | À tester   |
| VIVA MUNDI | <img alt="VIVA MUNDI" src="public/logos/VIVA_MUNDI.png" height="40" /> | À tester   |
| ESAIL      | <img alt="ESAIL" src="public/logos/ESAIL.png" height="40" />           | À tester   |
| FIGS       | <img alt="FIGS" src="public/logos/FIGS.png" height="40" />             | À tester   |


## ✨ Fonctionnalités

- **Affichage clair :** Vue grille sur bureau et vue liste optimisée pour le mobile.
- **Codes couleur :** Chaque matière a une couleur unique pour une identification visuelle rapide.
- **Détails des cours :** Cliquez sur un cours pour voir les détails (salle, professeur).
- **Mode sombre :** Interface adaptée pour le confort des yeux.
- **Export en image :** Téléchargez une capture d'écran de votre semaine de cours.
- **Synchronisation iCal :** Abonnez-vous à votre emploi du temps directement depuis Google Calendar, Outlook ou Apple Calendar.
- **Personnalisation :** Choisissez les jours de la semaine à afficher et votre couleur préférée pour l'interface.

---

## ⚙️ Stack Technique

- **Framework :** React, TypeScript, Vite
- **Styling :** Tailwind CSS & Radix UI pour les composants
- **Icônes :** Lucide React
- **Déploiement :** Vercel

---

## 🚀 Installation & Lancement

Ce projet utilise [pnpm](https://pnpm.io/) comme gestionnaire de paquets.

### 1. Cloner le projet

```bash
git clone https://github.com/D-Seonay/edt-hep.git
cd edt-hep
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Lancer le serveur de développement

```bash
pnpm run dev
```

### 4. Ouvrir l'application

L'application sera disponible à l'adresse 👉 [http://localhost:8080](http://localhost:8080) (ou un autre port si celui-ci est occupé).

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour commencer, consultez le [**guide de contribution**](CONTRIBUTING.md).

---

## ✨ Contributeurs

Merci à toutes les personnes qui ont contribué à ce projet !

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/D-Seonay"><img src="https://avatars.githubusercontent.com/u/91608025?v=4?s=100" width="100px;" alt="Mathéo DELAUNAY"/><br /><sub><b>Mathéo DELAUNAY</b></sub></a><br /><a href="https://github.com/D-Seonay/edt-hep/commits?author=D-Seonay" title="Code">💻</a> <a href="#maintenance-D-Seonay" title="Maintenance">🚧</a> <a href="https://github.com/D-Seonay/edt-hep/commits?author=D-Seonay" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Many0nne"><img src="https://avatars.githubusercontent.com/u/97261063?v=4?s=100" width="100px;" alt="Terry Barillon"/><br /><sub><b>Terry Barillon</b></sub></a><br /><a href="https://github.com/D-Seonay/edt-hep/commits?author=Many0nne" title="Code">💻</a> <a href="https://github.com/D-Seonay/edt-hep/commits?author=Many0nne" title="Documentation">📖</a> <a href="https://github.com/D-Seonay/edt-hep/issues?q=author%3AMany0nne" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TristanSalinas"><img src="https://avatars.githubusercontent.com/u/152698682?v=4?s=100" width="100px;" alt="Tristan Salinas"/><br /><sub><b>Tristan Salinas</b></sub></a><br /><a href="https://github.com/D-Seonay/edt-hep/commits?author=TristanSalinas" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Th4End"><img src="https://avatars.githubusercontent.com/u/111306334?v=4?s=100" width="100px;" alt="Eliazid"/><br /><sub><b>Eliazid</b></sub></a><br /><a href="https://github.com/D-Seonay/edt-hep/issues?q=author%3ATh4End" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## 📜 Licence

Ce projet est sous licence [MIT](LICENSE).
