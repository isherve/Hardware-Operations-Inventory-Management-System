import type { TranslationKey } from "./en";

export const fr: TranslationKey = {
  app: {
    name: "Bettina Hardware",
    tagline: "Gestion des opérations et de l'inventaire",
    location: "Kigali, Rwanda",
  },
  nav: {
    dashboard: "Tableau de bord",
    inventory: "Inventaire",
    sales: "Ventes",
    salesHistory: "Historique des ventes",
    newSale: "Nouvelle vente",
    customers: "Clients",
    employees: "Employés",
    reports: "Rapports",
    changePassword: "Changer le mot de passe",
    logout: "Déconnexion",
  },
  auth: {
    adminLogin: "Connexion administrateur",
    staffLogin: "Connexion personnel",
    adminDesc: "Accès complet au système",
    staffDesc: "Caisse, ventes et opérations",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    signIn: "Se connecter",
    signingIn: "Connexion...",
    backHome: "Retour à l'accueil",
    welcome: "Bienvenue, {{name}}",
    loginFailed: "Échec de la connexion",
  },
  settings: {
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    language: "Langue",
    english: "Anglais",
    french: "Français",
  },
  common: {
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    search: "Rechercher",
    actions: "Actions",
  },
  home: {
    chooseLogin: "Choisissez votre type de connexion",
  },
};
