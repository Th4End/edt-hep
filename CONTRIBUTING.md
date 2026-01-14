# Guide de Contribution pour EDT Manager HEP

Merci de l'intérêt que vous portez à ce projet ! Toutes les contributions, qu'il s'agisse de rapports de bugs, de nouvelles fonctionnalités, ou d'améliorations de la documentation, sont les bienvenues.

## 💬 Comment Contribuer

### Signaler un Bug
Si vous rencontrez un bug, merci de créer une [**Issue**](https://github.com/D-Seonay/edt-hep/issues) en décrivant le problème le plus précisément possible :
- **Version** de l'application ou commit concerné.
- **Étapes** pour reproduire le bug.
- **Comportement attendu** vs **comportement réel**.
- Captures d'écran si possible.

### Proposer une Amélioration ou une Fonctionnalité
Ouvrez une [**Issue**](https://github.com/D-Seonay/edt-hep/issues) en expliquant votre idée. Cela permet de discuter de la pertinence et de la manière de l'implémenter avant de commencer le développement.

## 🚀 Processus de Développement

1.  **Forkez** le dépôt sur votre propre compte GitHub.
2.  **Clonez** votre fork en local :
    ```bash
    git clone https://github.com/VOTRE_USERNAME/edt-hep.git
    cd edt-hep
    ```
3.  Créez une nouvelle branche pour vos modifications :
    ```bash
    git checkout -b feature/nom-de-votre-feature
    ```
4.  Installez les dépendances avec `pnpm` :
    ```bash
    pnpm install
    ```
5.  Effectuez vos modifications. Assurez-vous de suivre les conventions de style du projet en utilisant le linter :
    ```bash
    pnpm run lint
    ```
6.  Commitez vos changements en suivant la [convention Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) :
    ```bash
    git commit -m "feat: Ajout d'une fonctionnalité incroyable"
    ```
    *   **feat:** Pour une nouvelle fonctionnalité.
    *   **fix:** Pour une correction de bug.
    *   **chore:** Pour des tâches de maintenance (dépendances, etc.).
    *   **docs:** Pour la documentation.
    *   **style:** Pour des changements de style non fonctionnels.
    *   **refactor:** Pour une refactorisation de code.
7.  Pushez votre branche :
    ```bash
    git push origin feature/nom-de-votre-feature
    ```
8.  Ouvrez une **Pull Request** vers la branche `main` du dépôt original.

## ✨ Reconnaissance des Contributeurs

Ce projet utilise la spécification [**All Contributors**](https://allcontributors.org/). Tous les contributeurs seront reconnus dans le `README.md`. Une fois votre contribution mergée, vous pourrez être ajouté à la liste par un mainteneur du projet.

Merci encore pour votre contribution !
