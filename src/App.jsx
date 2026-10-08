import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";
import { tr, setI18nLang, dateLocale } from "./i18n/index.js";
import { useAutoTranslate } from "./i18n/auto.js";

// tr() for text with bold parts: "Tap <b>Add</b>" → ["Tap ", <strong>Add</strong>]
const trRich = (text, vars) => tr(text, vars).split(/<b>(.*?)<\/b>/).map((part, i) => i % 2 ? <strong key={i}>{part}</strong> : part);

// Logo lives in /public so it is served at the site root
const LOGO_SRC = "/wild-logo.jpg";        // square icon
const WORDMARK_SRC = "/wild-wordmark.jpg"; // wide WiLD wordmark

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const T = {
  en: {
    appName: "WiLD Hub", alliance: "WiLD",
    login: "Sign In", signup: "Create Account", username: "In-Game Username",
    password: "Password", confirmPassword: "Confirm Password",
    securityQuestion: "Security Question", securityAnswer: "Your Answer",
    createAccount: "Create Account", signIn: "Sign In",
    forgotPassword: "Forgot Password?", recover: "Recover Account",
    home: "Home", events: "Events", battlePlans: "Battle Plans",
    profile: "Profile", admin: "Management", suggestions: "Suggestions",
    contests: "Contests", logout: "Sign Out",
    canyonStorm: "Canyon Storm", desertStorm: "Desert Storm",
    signUp: "Sign Up", signedUp: "Signed Up ✓", notSignedUp: "Sign Up Now",
    editSignup: "Edit", revokeSignup: "Revoke",
    squadPower: "Squad Power", squadType: "Squad Type",
    availability: "Availability", timePreference: "Time Preference",
    confirmed: "Yes, I'll be there", sub: "Sign me up as sub",
    cantMake: "Sorry, can't make it",
    eitherTime: "Either time works", time12: "12:00 Server time",
    time23: "23:00 Server time (1hr before reset)",
    submit: "Submit", cancel: "Cancel", save: "Save",
    announcements: "Announcements", more: "See More",
    buddySystem: "Buddy System", myBuddy: "My Buddy",
    noBuddy: "No buddy assigned", requestBuddy: "Request a Buddy",
    engineer: "Engineer", warLeader: "War Leader",
    upcomingEvents: "Upcoming Events", noEvents: "No upcoming events",
    memberSince: "Member Since", role: "Role",
    language: "Language", profession: "Profession",
    editProfile: "Edit Profile", changePassword: "Change Password",
    memberId: "Member ID", powerHistory: "Power History",
    signupFrequency: "Sign-Up Frequency", attendance: "Attendance",
    teamBuilder: "Team Builder", teamA: "Team A", teamB: "Team B",
    starter: "Starter", subRole: "Sub", floater: "Floater",
    exportCSV: "Export CSV", copyClipboard: "Copy to Clipboard",
    approveMembers: "Pending Approvals", approve: "Approve", deny: "Deny",
    makeAnnouncement: "New Announcement", duration: "Duration",
    buddyManagement: "Buddy Management", addBuddy: "Pair Buddies",
    contestManagement: "Contests", newContest: "New Contest",
    contestName: "Contest Name", maxUploads: "Max Uploads / Member",
    maxVotes: "Max Votes / Member", publish: "Publish",
    vote: "Vote", voted: "Voted", upload: "Upload Photo",
    closesIn: "Closes in", anonymous: "Submit Anonymously",
    suggestionPlaceholder: "Share your thoughts, ideas or feedback...",
    birthday: "Birthday", birthdayComingUp: "Birthday Coming Up!",
    pendingApproval: "Your account is pending approval.",
    welcomeBack: "Welcome back",
    airType: "Air", tankType: "Tank", missileType: "Missile",
    resetPassword: "Reset Password", newPassword: "New Password",
    memberManagement: "Member Management",
    dataTracking: "Data & Tracking",
    plans: "Plans",
    stormSignups: "Storm Sign-Ups",
    activeContest: "Active Contest",
    yourAssignment: "Your Assignment",
    battleTime: "Battle Time",
    battlePlanStrategy: "Battle Plan & Strategy",
    battleMap: "Battle Map",
    tapToEnlarge: "tap to enlarge",
    notesReminders: "Notes & Reminders",
    profileInfo: "Profile Info",
    postedBy: "Posted by",
    expires: "Expires",
    pendingApprovals2: "Pending Approval",
    allMembers: "All Members",
    allAnnouncements: "All Announcements",
    postAnnouncement: "Post Announcement",
    buddyRequests: "Buddy Requests",
    allContests: "All Contests",
    allEvents: "All Events",
    memberFeedback: "Member Feedback",
    memberBirthdays: "Member Birthdays",
    battleHistory: "Battle History",
    startsIn: "Starts in",
    serverTime: "server time",
    noAssignment: "No assignment yet. Check back after teams are finalized.",
    upcomingBattles: "Your upcoming battles and alliance events",
    assignmentsStrategy: "Your assignments and battle strategy",
    feedbackDesc: "Share your ideas, feedback, or concerns with leadership.",
    activeContests: "Active alliance contests",
    polls: "Polls",
    activePoll: "Active Poll",
    pollResults: "Poll Results",
    createPoll: "Create Poll",
    pollQuestion: "Question",
    pollOptions: "Options",
    pollExpires: "Expires",
    addOption: "Add Option",
    publishPoll: "Publish Poll",
    castVote: "Cast Vote",
    voteNow: "Vote Now",
    pollClosed: "Poll Closed",
    noPollsYet: "No polls yet",
    pastPolls: "Past Polls",
    pollVotes: "votes",
    pollComments: "Comments",
  },
  de: {
    appName: "WiLD Hub", alliance: "WiLD",
    login: "Anmelden", signup: "Konto erstellen", username: "Spielname",
    password: "Passwort", confirmPassword: "Passwort bestätigen",
    securityQuestion: "Sicherheitsfrage", securityAnswer: "Deine Antwort",
    createAccount: "Konto erstellen", signIn: "Anmelden",
    forgotPassword: "Passwort vergessen?", recover: "Konto wiederherstellen",
    home: "Start", events: "Events", battlePlans: "Schlachtpläne",
    profile: "Profil", admin: "Verwaltung", suggestions: "Vorschläge",
    contests: "Wettbewerbe", logout: "Abmelden",
    canyonStorm: "Canyon Storm", desertStorm: "Desert Storm",
    signUp: "Anmelden", signedUp: "Angemeldet ✓", notSignedUp: "Jetzt anmelden",
    editSignup: "Bearbeiten", revokeSignup: "Zurückziehen",
    squadPower: "Truppenstärke", squadType: "Truppentyp",
    availability: "Verfügbarkeit", timePreference: "Wunschzeit",
    confirmed: "Ja, ich bin dabei", sub: "Als Ersatz anmelden",
    cantMake: "Sorry, ich kann nicht",
    eitherTime: "Beide Zeiten passen", time12: "12:00 Serverzeit",
    time23: "23:00 Serverzeit (1 Std. vor dem Reset)",
    submit: "Senden", cancel: "Abbrechen", save: "Speichern",
    announcements: "Ankündigungen", more: "Mehr anzeigen",
    buddySystem: "Buddy-System", myBuddy: "Mein Buddy",
    noBuddy: "Kein Buddy zugeteilt", requestBuddy: "Buddy anfragen",
    engineer: "Ingenieur", warLeader: "Kriegsführer",
    upcomingEvents: "Anstehende Events", noEvents: "Keine anstehenden Events",
    memberSince: "Mitglied seit", role: "Rolle",
    language: "Sprache", profession: "Beruf",
    editProfile: "Profil bearbeiten", changePassword: "Passwort ändern",
    memberId: "Mitglieds-ID", powerHistory: "Stärkeverlauf",
    signupFrequency: "Anmeldehäufigkeit", attendance: "Teilnahme",
    teamBuilder: "Team-Einteilung", teamA: "Team A", teamB: "Team B",
    starter: "Stammspieler", subRole: "Ersatz", floater: "Floater",
    exportCSV: "CSV exportieren", copyClipboard: "In die Zwischenablage kopieren",
    approveMembers: "Offene Freigaben", approve: "Freigeben", deny: "Ablehnen",
    makeAnnouncement: "Neue Ankündigung", duration: "Dauer",
    buddyManagement: "Buddy-Verwaltung", addBuddy: "Buddys verbinden",
    contestManagement: "Wettbewerbe", newContest: "Neuer Wettbewerb",
    contestName: "Name des Wettbewerbs", maxUploads: "Max. Uploads / Mitglied",
    maxVotes: "Max. Stimmen / Mitglied", publish: "Veröffentlichen",
    vote: "Abstimmen", voted: "Abgestimmt", upload: "Foto hochladen",
    closesIn: "Endet in", anonymous: "Anonym senden",
    suggestionPlaceholder: "Teile deine Gedanken, Ideen oder dein Feedback …",
    birthday: "Geburtstag", birthdayComingUp: "Bald Geburtstag!",
    pendingApproval: "Dein Konto wartet auf Freigabe.",
    welcomeBack: "Willkommen zurück",
    airType: "Luft", tankType: "Panzer", missileType: "Rakete",
    resetPassword: "Passwort zurücksetzen", newPassword: "Neues Passwort",
    memberManagement: "Mitgliederverwaltung",
    dataTracking: "Daten & Auswertung",
    plans: "Pläne",
    stormSignups: "Storm-Anmeldungen",
    activeContest: "Aktiver Wettbewerb",
    yourAssignment: "Deine Einteilung",
    battleTime: "Schlachtzeit",
    battlePlanStrategy: "Schlachtplan & Strategie",
    battleMap: "Schlachtkarte",
    tapToEnlarge: "zum Vergrößern tippen",
    notesReminders: "Hinweise & Erinnerungen",
    profileInfo: "Profilinfos",
    postedBy: "Gepostet von",
    expires: "Läuft ab",
    pendingApprovals2: "Wartet auf Freigabe",
    allMembers: "Alle Mitglieder",
    allAnnouncements: "Alle Ankündigungen",
    postAnnouncement: "Ankündigung posten",
    buddyRequests: "Buddy-Anfragen",
    allContests: "Alle Wettbewerbe",
    allEvents: "Alle Events",
    memberFeedback: "Feedback der Mitglieder",
    memberBirthdays: "Geburtstage der Mitglieder",
    battleHistory: "Schlachtverlauf",
    startsIn: "Beginnt in",
    serverTime: "Serverzeit",
    noAssignment: "Noch keine Einteilung. Schau wieder vorbei, wenn die Teams feststehen.",
    upcomingBattles: "Deine anstehenden Schlachten und Allianz-Events",
    assignmentsStrategy: "Deine Einteilung und Schlachtstrategie",
    feedbackDesc: "Teile deine Ideen, dein Feedback oder deine Bedenken mit der Führung.",
    activeContests: "Aktive Allianz-Wettbewerbe",
    polls: "Umfragen",
    activePoll: "Aktive Umfrage",
    pollResults: "Umfrageergebnisse",
    createPoll: "Umfrage erstellen",
    pollQuestion: "Frage",
    pollOptions: "Optionen",
    pollExpires: "Läuft ab",
    addOption: "Option hinzufügen",
    publishPoll: "Umfrage veröffentlichen",
    castVote: "Stimme abgeben",
    voteNow: "Jetzt abstimmen",
    pollClosed: "Umfrage beendet",
    noPollsYet: "Noch keine Umfragen",
    pastPolls: "Vergangene Umfragen",
    pollVotes: "Stimmen",
    pollComments: "Kommentare",
  },
  it: {
    appName: "WiLD Hub", alliance: "WiLD",
    login: "Accedi", signup: "Crea Account", username: "Nome Utente in Gioco",
    password: "Password", confirmPassword: "Conferma Password",
    securityQuestion: "Domanda di Sicurezza", securityAnswer: "La Tua Risposta",
    createAccount: "Crea Account", signIn: "Accedi",
    forgotPassword: "Password Dimenticata?", recover: "Recupera Account",
    home: "Home", events: "Eventi", battlePlans: "Piani di Battaglia",
    profile: "Profilo", admin: "Gestione", suggestions: "Suggerimenti",
    contests: "Concorsi", logout: "Esci",
    canyonStorm: "Canyon Storm", desertStorm: "Desert Storm",
    signUp: "Iscriviti", signedUp: "Iscritto ✓", notSignedUp: "Iscriviti Ora",
    editSignup: "Modifica", revokeSignup: "Revoca",
    squadPower: "Potere Squadra", squadType: "Tipo Squadra",
    availability: "Disponibilità", timePreference: "Preferenza Orario",
    confirmed: "Sì, ci sarò", sub: "Iscrivimi come riserva",
    cantMake: "Non posso partecipare",
    eitherTime: "Va bene qualsiasi orario", time12: "12:00 Orario Server",
    time23: "23:00 Orario Server",
    submit: "Invia", cancel: "Annulla", save: "Salva",
    announcements: "Annunci", more: "Vedi Altro",
    buddySystem: "Sistema Buddy", myBuddy: "Il Mio Buddy",
    noBuddy: "Nessun buddy assegnato", requestBuddy: "Richiedi un Buddy",
    engineer: "Ingegnere", warLeader: "Leader di Guerra",
    upcomingEvents: "Prossimi Eventi", noEvents: "Nessun evento in programma",
    memberSince: "Membro dal", role: "Ruolo",
    language: "Lingua", profession: "Professione",
    editProfile: "Modifica Profilo", changePassword: "Cambia Password",
    memberId: "ID Membro", powerHistory: "Storico Potere",
    signupFrequency: "Frequenza Iscrizioni", attendance: "Presenze",
    teamBuilder: "Costruttore Team", teamA: "Team A", teamB: "Team B",
    starter: "Titolare", subRole: "Riserva", floater: "Flotante",
    exportCSV: "Esporta CSV", copyClipboard: "Copia negli Appunti",
    approveMembers: "Approvazioni in Attesa", approve: "Approva", deny: "Rifiuta",
    makeAnnouncement: "Nuovo Annuncio", duration: "Durata",
    buddyManagement: "Gestione Buddy", addBuddy: "Abbina Buddy",
    contestManagement: "Concorsi", newContest: "Nuovo Concorso",
    contestName: "Nome Concorso", maxUploads: "Max Caricamenti / Membro",
    maxVotes: "Max Voti / Membro", publish: "Pubblica",
    vote: "Vota", voted: "Votato", upload: "Carica Foto",
    closesIn: "Chiude tra", anonymous: "Invia Anonimamente",
    suggestionPlaceholder: "Condividi i tuoi pensieri...",
    birthday: "Compleanno", birthdayComingUp: "Compleanno in Arrivo!",
    pendingApproval: "Il tuo account è in attesa di approvazione.",
    welcomeBack: "Bentornato",
    airType: "Aria", tankType: "Carro", missileType: "Missile",
    resetPassword: "Reimposta Password", newPassword: "Nuova Password",
    memberManagement: "Gestione Membri", dataTracking: "Dati e Monitoraggio",
    plans: "Piani",
    stormSignups: "Iscrizioni Storm",
    activeContest: "Concorso Attivo",
    yourAssignment: "Il Tuo Incarico",
    battleTime: "Orario Battaglia",
    battlePlanStrategy: "Piano di Battaglia e Strategia",
    battleMap: "Mappa di Battaglia",
    tapToEnlarge: "tocca per ingrandire",
    notesReminders: "Note e Promemoria",
    profileInfo: "Info Profilo",
    postedBy: "Pubblicato da",
    expires: "Scade",
    pendingApprovals2: "In Attesa",
    allMembers: "Tutti i Membri",
    allAnnouncements: "Tutti gli Annunci",
    postAnnouncement: "Pubblica Annuncio",
    buddyRequests: "Richieste Buddy",
    allContests: "Tutti i Concorsi",
    allEvents: "Tutti gli Eventi",
    memberFeedback: "Feedback Membri",
    memberBirthdays: "Compleanni Membri",
    battleHistory: "Storico Battaglie",
    startsIn: "Inizia tra",
    serverTime: "ora server",
    noAssignment: "Nessun incarico ancora. Torna dopo la finalizzazione.",
    upcomingBattles: "Le tue prossime battaglie ed eventi",
    assignmentsStrategy: "I tuoi incarichi e la strategia di battaglia",
    feedbackDesc: "Condividi i tuoi pensieri con la leadership.",
    activeContests: "Concorsi dell'alleanza attivi",
    polls: "Sondaggi",
    activePoll: "Sondaggio Attivo",
    pollResults: "Risultati",
    createPoll: "Crea Sondaggio",
    pollQuestion: "Domanda",
    pollOptions: "Opzioni",
    pollExpires: "Scade",
    addOption: "Aggiungi Opzione",
    publishPoll: "Pubblica Sondaggio",
    castVote: "Vota",
    voteNow: "Vota Ora",
    pollClosed: "Sondaggio Chiuso",
    noPollsYet: "Nessun sondaggio",
    pastPolls: "Sondaggi Passati",
    pollVotes: "voti",
    pollComments: "Commenti",
  },
  fr: {
    appName: "WiLD Hub", alliance: "WiLD",
    login: "Connexion", signup: "Créer un Compte", username: "Pseudo en Jeu",
    password: "Mot de passe", confirmPassword: "Confirmer le mot de passe",
    securityQuestion: "Question de Sécurité", securityAnswer: "Votre Réponse",
    createAccount: "Créer un Compte", signIn: "Se Connecter",
    forgotPassword: "Mot de passe oublié?", recover: "Récupérer le Compte",
    home: "Accueil", events: "Événements", battlePlans: "Plans de Bataille",
    profile: "Profil", admin: "Gestion", suggestions: "Suggestions",
    contests: "Concours", logout: "Déconnexion",
    canyonStorm: "Canyon Storm", desertStorm: "Desert Storm",
    signUp: "S'inscrire", signedUp: "Inscrit ✓", notSignedUp: "S'inscrire",
    editSignup: "Modifier", revokeSignup: "Révoquer",
    squadPower: "Puissance", squadType: "Type d'Escouade",
    availability: "Disponibilité", timePreference: "Préférence Horaire",
    confirmed: "Oui, je serai là", sub: "Me mettre en remplaçant",
    cantMake: "Désolé, je ne peux pas",
    eitherTime: "L'un ou l'autre", time12: "12:00 Heure Serveur",
    time23: "23:00 Heure Serveur",
    submit: "Soumettre", cancel: "Annuler", save: "Sauvegarder",
    announcements: "Annonces", more: "Voir Plus",
    buddySystem: "Système Buddy", myBuddy: "Mon Buddy",
    noBuddy: "Aucun buddy assigné", requestBuddy: "Demander un Buddy",
    engineer: "Ingénieur", warLeader: "Chef de Guerre",
    upcomingEvents: "Événements à Venir", noEvents: "Aucun événement",
    memberSince: "Membre depuis", role: "Rôle",
    language: "Langue", profession: "Profession",
    editProfile: "Modifier le Profil", changePassword: "Changer le Mot de Passe",
    memberId: "ID Membre", powerHistory: "Historique de Puissance",
    signupFrequency: "Fréquence d'Inscription", attendance: "Présence",
    teamBuilder: "Constructeur d'Équipe", teamA: "Équipe A", teamB: "Équipe B",
    starter: "Titulaire", subRole: "Remplaçant", floater: "Flottant",
    exportCSV: "Exporter CSV", copyClipboard: "Copier",
    approveMembers: "Approbations en Attente", approve: "Approuver", deny: "Refuser",
    makeAnnouncement: "Nouvelle Annonce", duration: "Durée",
    buddyManagement: "Gestion Buddy", addBuddy: "Associer Buddies",
    contestManagement: "Concours", newContest: "Nouveau Concours",
    contestName: "Nom du Concours", maxUploads: "Max Uploads / Membre",
    maxVotes: "Max Votes / Membre", publish: "Publier",
    vote: "Voter", voted: "Voté", upload: "Télécharger Photo",
    closesIn: "Ferme dans", anonymous: "Soumettre Anonymement",
    suggestionPlaceholder: "Partagez vos pensées...",
    birthday: "Anniversaire", birthdayComingUp: "Anniversaire Bientôt!",
    pendingApproval: "Votre compte est en attente d'approbation.",
    welcomeBack: "Bon retour",
    airType: "Air", tankType: "Char", missileType: "Missile",
    resetPassword: "Réinitialiser", newPassword: "Nouveau Mot de Passe",
    memberManagement: "Gestion des Membres", dataTracking: "Données",
    plans: "Plans",
    stormSignups: "Inscriptions Storm",
    activeContest: "Concours Actif",
    yourAssignment: "Votre Mission",
    battleTime: "Heure de Bataille",
    battlePlanStrategy: "Plan de Bataille et Stratégie",
    battleMap: "Carte de Bataille",
    tapToEnlarge: "appuyez pour agrandir",
    notesReminders: "Notes et Rappels",
    profileInfo: "Infos Profil",
    postedBy: "Publié par",
    expires: "Expire",
    pendingApprovals2: "En Attente",
    allMembers: "Tous les Membres",
    allAnnouncements: "Toutes les Annonces",
    postAnnouncement: "Publier Annonce",
    buddyRequests: "Demandes Buddy",
    allContests: "Tous les Concours",
    allEvents: "Tous les Événements",
    memberFeedback: "Retours Membres",
    memberBirthdays: "Anniversaires Membres",
    battleHistory: "Historique Batailles",
    startsIn: "Commence dans",
    serverTime: "heure serveur",
    noAssignment: "Pas encore d'affectation. Vérifiez après la finalisation.",
    upcomingBattles: "Vos prochaines batailles et événements",
    assignmentsStrategy: "Vos missions et stratégie de bataille",
    feedbackDesc: "Partagez vos pensées avec les leaders.",
    activeContests: "Concours d'alliance actifs",
    polls: "Sondages",
    activePoll: "Sondage Actif",
    pollResults: "Résultats",
    createPoll: "Créer Sondage",
    pollQuestion: "Question",
    pollOptions: "Options",
    pollExpires: "Expire",
    addOption: "Ajouter Option",
    publishPoll: "Publier Sondage",
    castVote: "Voter",
    voteNow: "Voter Maintenant",
    pollClosed: "Sondage Fermé",
    noPollsYet: "Pas de sondages",
    pastPolls: "Sondages Passés",
    pollVotes: "votes",
    pollComments: "Commentaires",
  },
  sv: {
    appName: "WiLD Hub", alliance: "WiLD",
    login: "Logga in", signup: "Skapa Konto", username: "Spelarnamn",
    password: "Lösenord", confirmPassword: "Bekräfta Lösenord",
    securityQuestion: "Säkerhetsfråga", securityAnswer: "Ditt Svar",
    createAccount: "Skapa Konto", signIn: "Logga In",
    forgotPassword: "Glömt Lösenord?", recover: "Återställ Konto",
    home: "Hem", events: "Evenemang", battlePlans: "Stridplaner",
    profile: "Profil", admin: "Hantering", suggestions: "Förslag",
    contests: "Tävlingar", logout: "Logga Ut",
    canyonStorm: "Canyon Storm", desertStorm: "Desert Storm",
    signUp: "Anmäl dig", signedUp: "Anmäld ✓", notSignedUp: "Anmäl dig Nu",
    editSignup: "Redigera", revokeSignup: "Återkalla",
    squadPower: "Truppstyrka", squadType: "Trupptype",
    availability: "Tillgänglighet", timePreference: "Tidspreferens",
    confirmed: "Ja, jag kommer", sub: "Anmäl mig som ersättare",
    cantMake: "Tyvärr kan jag inte",
    eitherTime: "Båda tiderna fungerar", time12: "12:00 Servertid",
    time23: "23:00 Servertid",
    submit: "Skicka", cancel: "Avbryt", save: "Spara",
    announcements: "Meddelanden", more: "Se Mer",
    buddySystem: "Buddy System", myBuddy: "Min Buddy",
    noBuddy: "Ingen buddy tilldelad", requestBuddy: "Begär en Buddy",
    engineer: "Ingenjör", warLeader: "Krigsledare",
    upcomingEvents: "Kommande Evenemang", noEvents: "Inga kommande evenemang",
    memberSince: "Medlem sedan", role: "Roll",
    language: "Språk", profession: "Yrke",
    editProfile: "Redigera Profil", changePassword: "Byt Lösenord",
    memberId: "Medlems-ID", powerHistory: "Styrkehistorik",
    signupFrequency: "Anmälningsfrekvens", attendance: "Närvaro",
    teamBuilder: "Lagbyggare", teamA: "Lag A", teamB: "Lag B",
    starter: "Starter", subRole: "Ersättare", floater: "Floater",
    exportCSV: "Exportera CSV", copyClipboard: "Kopiera",
    approveMembers: "Väntande Godkännanden", approve: "Godkänn", deny: "Neka",
    makeAnnouncement: "Nytt Meddelande", duration: "Varaktighet",
    buddyManagement: "Buddy Hantering", addBuddy: "Para Ihop Buddies",
    contestManagement: "Tävlingar", newContest: "Ny Tävling",
    contestName: "Tävlingsnamn", maxUploads: "Max Uppladdningar / Medlem",
    maxVotes: "Max Röster / Medlem", publish: "Publicera",
    vote: "Rösta", voted: "Röstat", upload: "Ladda upp Foto",
    closesIn: "Stänger om", anonymous: "Skicka Anonymt",
    suggestionPlaceholder: "Dela dina tankar...",
    birthday: "Födelsedag", birthdayComingUp: "Födelsedag Snart!",
    pendingApproval: "Ditt konto väntar på godkännande.",
    welcomeBack: "Välkommen tillbaka",
    airType: "Luft", tankType: "Stridsvagn", missileType: "Missil",
    resetPassword: "Återställ Lösenord", newPassword: "Nytt Lösenord",
    memberManagement: "Medlemshantering", dataTracking: "Data",
    plans: "Planer",
    stormSignups: "Storm-anmälningar",
    activeContest: "Aktiv Tävling",
    yourAssignment: "Din Uppgift",
    battleTime: "Stridstid",
    battlePlanStrategy: "Stridplan och Strategi",
    battleMap: "Stridskarta",
    tapToEnlarge: "tryck för att förstora",
    notesReminders: "Anteckningar och Påminnelser",
    profileInfo: "Profilinfo",
    postedBy: "Postat av",
    expires: "Upphör",
    pendingApprovals2: "Väntar",
    allMembers: "Alla Medlemmar",
    allAnnouncements: "Alla Meddelanden",
    postAnnouncement: "Posta Meddelande",
    buddyRequests: "Buddy-förfrågningar",
    allContests: "Alla Tävlingar",
    allEvents: "Alla Evenemang",
    memberFeedback: "Medlemsfeedback",
    memberBirthdays: "Medlemsfödelsedagar",
    battleHistory: "Stridhistorik",
    startsIn: "Börjar om",
    serverTime: "servertid",
    noAssignment: "Ingen uppgift ännu. Kom tillbaka efter finalisering.",
    upcomingBattles: "Dina kommande strider och evenemang",
    assignmentsStrategy: "Dina uppdrag och stridsstrategi",
    feedbackDesc: "Dela dina tankar med ledningen.",
    activeContests: "Aktiva alliansens tävlingar",
    polls: "Omröstningar",
    activePoll: "Aktiv Omröstning",
    pollResults: "Resultat",
    createPoll: "Skapa Omröstning",
    pollQuestion: "Fråga",
    pollOptions: "Alternativ",
    pollExpires: "Upphör",
    addOption: "Lägg till Alternativ",
    publishPoll: "Publicera Omröstning",
    castVote: "Rösta",
    voteNow: "Rösta Nu",
    pollClosed: "Omröstning Stängd",
    noPollsYet: "Inga omröstningar",
    pastPolls: "Tidigare Omröstningar",
    pollVotes: "röster",
    pollComments: "Kommentarer",
  },
  tr: {
    appName: "WiLD Hub", alliance: "WiLD",
    login: "Giriş Yap", signup: "Hesap Oluştur", username: "Oyun İçi Kullanıcı Adı",
    password: "Şifre", confirmPassword: "Şifreyi Onayla",
    securityQuestion: "Güvenlik Sorusu", securityAnswer: "Cevabınız",
    createAccount: "Hesap Oluştur", signIn: "Giriş Yap",
    forgotPassword: "Şifremi Unuttum", recover: "Hesabı Kurtar",
    home: "Ana Sayfa", events: "Etkinlikler", battlePlans: "Savaş Planları",
    profile: "Profil", admin: "Yönetim", suggestions: "Öneriler",
    contests: "Yarışmalar", logout: "Çıkış Yap",
    canyonStorm: "Canyon Storm", desertStorm: "Desert Storm",
    signUp: "Kayıt Ol", signedUp: "Kayıt Olundu ✓", notSignedUp: "Şimdi Kayıt Ol",
    editSignup: "Düzenle", revokeSignup: "İptal Et",
    squadPower: "Birlik Gücü", squadType: "Birlik Türü",
    availability: "Müsaitlik", timePreference: "Zaman Tercihi",
    confirmed: "Evet, orada olacağım", sub: "Yedek olarak kaydet",
    cantMake: "Üzgünüm, katılamıyorum",
    eitherTime: "Her iki zaman da uygun", time12: "12:00 Sunucu saati",
    time23: "23:00 Sunucu saati",
    submit: "Gönder", cancel: "İptal", save: "Kaydet",
    announcements: "Duyurular", more: "Daha Fazla",
    buddySystem: "Buddy Sistemi", myBuddy: "Buddy'im",
    noBuddy: "Buddy atanmadı", requestBuddy: "Buddy İste",
    engineer: "Mühendis", warLeader: "Savaş Lideri",
    upcomingEvents: "Yaklaşan Etkinlikler", noEvents: "Etkinlik yok",
    memberSince: "Üyelik Tarihi", role: "Rol",
    language: "Dil", profession: "Meslek",
    editProfile: "Profili Düzenle", changePassword: "Şifre Değiştir",
    memberId: "Üye ID", powerHistory: "Güç Geçmişi",
    signupFrequency: "Kayıt Sıklığı", attendance: "Katılım",
    teamBuilder: "Takım Oluşturucu", teamA: "Takım A", teamB: "Takım B",
    starter: "Başlangıç", subRole: "Yedek", floater: "Floater",
    exportCSV: "CSV Dışa Aktar", copyClipboard: "Panoya Kopyala",
    approveMembers: "Bekleyen Onaylar", approve: "Onayla", deny: "Reddet",
    makeAnnouncement: "Yeni Duyuru", duration: "Süre",
    buddyManagement: "Buddy Yönetimi", addBuddy: "Buddy Eşleştir",
    contestManagement: "Yarışmalar", newContest: "Yeni Yarışma",
    contestName: "Yarışma Adı", maxUploads: "Maks Yükleme / Üye",
    maxVotes: "Maks Oy / Üye", publish: "Yayımla",
    vote: "Oy Ver", voted: "Oylandı", upload: "Fotoğraf Yükle",
    closesIn: "Kapanıyor", anonymous: "Anonim Gönder",
    suggestionPlaceholder: "Düşüncelerinizi paylaşın...",
    birthday: "Doğum Günü", birthdayComingUp: "Doğum Günü Yaklaşıyor!",
    pendingApproval: "Hesabınız onay bekliyor.",
    welcomeBack: "Tekrar hoşgeldiniz",
    airType: "Hava", tankType: "Tank", missileType: "Füze",
    resetPassword: "Şifre Sıfırla", newPassword: "Yeni Şifre",
    memberManagement: "Üye Yönetimi", dataTracking: "Veri",
    plans: "Planlar",
    stormSignups: "Fırtına Kayıtları",
    activeContest: "Aktif Yarışma",
    yourAssignment: "Göreviniz",
    battleTime: "Savaş Saati",
    battlePlanStrategy: "Savaş Planı ve Strateji",
    battleMap: "Savaş Haritası",
    tapToEnlarge: "büyütmek için dokunun",
    notesReminders: "Notlar ve Hatırlatıcılar",
    profileInfo: "Profil Bilgisi",
    postedBy: "Yazan",
    expires: "Son tarihi",
    pendingApprovals2: "Beklemede",
    allMembers: "Tüm Üyeler",
    allAnnouncements: "Tüm Duyurular",
    postAnnouncement: "Duyuru Yayımla",
    buddyRequests: "Buddy İstekleri",
    allContests: "Tüm Yarışmalar",
    allEvents: "Tüm Etkinlikler",
    memberFeedback: "Üye Geri Bildirimleri",
    memberBirthdays: "Üye Doğum Günleri",
    battleHistory: "Savaş Geçmişi",
    startsIn: "Başlıyor",
    serverTime: "sunucu saati",
    noAssignment: "Henüz görev yok. Takımlar belirlendikten sonra kontrol edin.",
    upcomingBattles: "Yaklaşan savaşlarınız ve etkinlikleriniz",
    assignmentsStrategy: "Görevleriniz ve savaş stratejiniz",
    feedbackDesc: "Düşüncelerinizi liderlikle paylaşın.",
    activeContests: "Aktif ittifak yarışmaları",
    polls: "Anketler",
    activePoll: "Aktif Anket",
    pollResults: "Sonuçlar",
    createPoll: "Anket Oluştur",
    pollQuestion: "Soru",
    pollOptions: "Seçenekler",
    pollExpires: "Son Tarih",
    addOption: "Seçenek Ekle",
    publishPoll: "Anketi Yayımla",
    castVote: "Oy Ver",
    voteNow: "Şimdi Oy Ver",
    pollClosed: "Anket Kapalı",
    noPollsYet: "Henüz anket yok",
    pastPolls: "Geçmiş Anketler",
    pollVotes: "oy",
    pollComments: "Yorumlar",
  },
};

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const generateMemberId = () => Math.random().toString(36).substring(2, 10).toUpperCase();

// Only used if Supabase can't be reached at all
const MOCK_MEMBERS = [];

const MOCK_POWER_HISTORY = {};

// Language choices for sign-up and the profile page
const LANGUAGE_OPTIONS = [["en", "English"], ["de", "Deutsch"], ["it", "Italiano"], ["fr", "Français"], ["sv", "Svenska"], ["tr", "Türkçe"]];

// Squad types are saved in English; shown with tr()
const SQUAD_TYPES = ["Air", "Tank", "Missile"];
// Sign-up availability value → label
const availLabel = (v) => ({ confirmed: tr("Confirmed"), sub: tr("Sub"), cantMake: tr("Can't make it") }[v] || v);

// Team role value → label
const slotRoleLabel = (r) => ({ starter: tr("Starter"), sub: tr("Sub") }[r] || r);
// Member role value → label
const roleLabel = (r) => ({ member: tr("Member"), r4: "R4", admin: tr("Admin") }[r] || r);

// Saved in English; shown with tr()
const SECURITY_QUESTIONS = [
  "What was your first unit trained?",
  "What is your favorite hero?",
  "What was the name of your first alliance?",
  "What is your favorite squad type?",
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
// Game server is UTC-2. When user enters "15:00 server time" we store as 17:00 UTC.
const SERVER_UTC_OFFSET_HOURS = 2; // server = UTC - 2
// "Now" on the game server clock. Read it with getUTC*() / toISOString() to get server date & time.
const serverNow = () => new Date(Date.now() - SERVER_UTC_OFFSET_HOURS * 3600000);
// Today's date on the server, "YYYY-MM-DD"
const serverToday = () => serverNow().toISOString().split("T")[0];

// Returns the NEXT upcoming battle date key — always forward-looking.
// Canyon battle = Thursday, Desert battle = Friday.
// On the battle day itself (e.g. Thursday for Canyon), stays on today.
// This is the key used for sign-ups and teams for the current cycle.
// Admin manually clears signups + teams via the Clear button — no automatic rollover.
const getSignupWeek = (type) => {
  const now = serverNow();
  const utcDay = now.getUTCDay();
  if (type === "canyon") {
    // 0 if today is Thursday, otherwise days until next Thursday
    const daysUntil = (4 - utcDay + 7) % 7;
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntil));
    return d.toISOString().split("T")[0];
  } else {
    const daysUntil = (5 - utcDay + 7) % 7;
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntil));
    return d.toISOString().split("T")[0];
  }
};

// Week key for NEW member sign-ups. Same as getSignupWeek until the sign-up cut-off (see SIGNUP_ROLLOVER_DAYS),
// after which sign-ups go to the NEXT battle (the current battle keeps its teams/sign-ups).
// How many days before the battle new sign-ups start going to the FOLLOWING week's battle.
// Canyon teams close Monday, so from Tuesday (2 days before the Thursday battle) sign-ups roll to next week.
// Desert teams close Wednesday, so from Thursday (1 day before the Friday battle) sign-ups roll to next week.
const SIGNUP_ROLLOVER_DAYS = { canyon: 2, desert: 1 };
const getNextSignupWeek = (type) => {
  const now = serverNow();
  const target = type === "canyon" ? 4 : 5;
  let daysUntil = (target - now.getUTCDay() + 7) % 7; // 0 = battle is today
  if (daysUntil <= (SIGNUP_ROLLOVER_DAYS[type] ?? 0)) daysUntil += 7;
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntil));
  return d.toISOString().split("T")[0];
};
// Sign-up rows the app keeps loaded: the current battle, plus next battle on battle day.
const isLiveSignupWeek = (type, wk) => wk === getSignupWeek(type) || wk === getNextSignupWeek(type);
// Normalise any stored week key to its battle date.
const toBattleKey = (dateStr, type) => {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr + "T12:00:00Z");
  if (isNaN(d)) return dateStr;
  const target = type === "canyon" ? 4 : 5;
  const day = d.getUTCDay();
  if (day === target) return dateStr;
  const daysUntil = ((target - day + 7) % 7) || 7;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + daysUntil)).toISOString().split("T")[0];
};

// ─── STORM SETTINGS (shared, saved in app_settings) ───────────────────────────
//   storm_config_canyon / storm_config_desert → { times, slotCaps }
//   battle_plan_canyon / battle_plan_desert   → { same, a, b, map } (existing WiLD battle plan setting)
const DEFAULT_STORM_CONFIG = {
  canyon: { times: ["12:00", "23:00"], slotCaps: {} },
  desert: { times: ["18:00", "23:00"], slotCaps: {} },
};
const StormConfigContext = React.createContext({ config: DEFAULT_STORM_CONFIG, save: async () => false, plans: {}, savePlan: async () => false });
const useStormConfig = () => React.useContext(StormConfigContext);
// Buddy / profession actions shared by Home, Profile, Management → Buddy and the member pop-up
const BuddyActionsContext = React.createContext({ unpairBuddy: async () => false, changeProfession: async () => false, isR4: false });
const useBuddyActions = () => React.useContext(BuddyActionsContext);
const sortTimes = (arr) => [...new Set(arr)].sort();
const LEGACY_TIME = { time12: "12:00", time18: "18:00", time23: "23:00" };
// A member's time preference → list of "HH:MM" they can make. "either"/blank = every offered time.
const parseTimePref = (pref, offered = []) => {
  if (!pref || pref === "either") return [...offered];
  if (LEGACY_TIME[pref]) return [LEGACY_TIME[pref]];
  return sortTimes(String(pref).split(",").map(x => x.trim()).filter(Boolean));
};
const isAnyTime = (pref, offered = []) => {
  const picked = parseTimePref(pref, offered);
  return offered.length > 0 && offered.every(o => picked.includes(o));
};
const timePrefLabel = (pref, offered = [], short = false) => {
  if (isAnyTime(pref, offered)) return short ? tr("Any") : tr("Any time");
  const list = parseTimePref(pref, offered);
  if (!list.length) return "—";
  return short ? list.map(x => x.replace(/:00$/, "")).join("/") : list.join(" / ");
};
// Spots per assignment: R4 setting per team, otherwise 2 (Floater 4)
// slotCaps = { teamA: { "Team 1": 3, ... }, teamB: { ... } }. An older flat { "Team 1": 3 } applies to both teams until changed.
const teamSlotCaps = (slotCaps, teamKey) => {
  const caps = slotCaps || {};
  if (caps[teamKey] && typeof caps[teamKey] === "object") return caps[teamKey];
  const { teamA, teamB, ...flat } = caps;
  return flat;
};
// A saved 0 is a real value ("not used"), only missing/blank falls back to the default
const getSlotCapFor = (caps, slot) => {
  const v = caps?.[slot];
  if (v !== undefined && v !== null && v !== "" && !isNaN(Number(v)) && Number(v) >= 0) return Number(v);
  return slot === "Floater" ? 4 : 2;
};
// This week's battle plan saved on the team data → { same, a, b } (null = original built-in plan)
const normalizeWeekPlan = (plan) => {
  if (!plan || typeof plan.a !== "string") return null;
  return { same: plan.same !== false, a: plan.a, b: typeof plan.b === "string" ? plan.b : plan.a };
};

const formatPower = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

// Dates are shown on the server calendar: "YYYY-MM-DD" keys as-is, timestamps converted to server time
const formatDate = (date) => {
  if (!date) return "—";
  const d = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(date + "T12:00:00Z")
    : new Date(new Date(date).getTime() - SERVER_UTC_OFFSET_HOURS * 3600000);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString(dateLocale(), { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
};

const timeUntil = (date) => {
  const diff = new Date(date) - Date.now();
  if (diff <= 0) return tr("Closed");
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* WiLD palette: burnished gold on black stone. ("gold" variable names are used everywhere.) */
  --gold: #A8761E;
  --gold-light: #D9A441;
  --gold-pale: #F5EAD3;
  --accent-hover: #8A5F14;
  --bg: #F5F2EC;
  --surface: #FFFFFF;
  --surface2: #EEE9DF;
  --border: #E0D7C6;
  --text: #17130D;
  --text-mid: #50473A;
  --text-dim: #8E8473;
  --green: #2E7D4A;
  --purple: #7A4FB8;
  --red: #C0392B;
  --blue: #1F6E9C;
  --radius: 12px;
  --shadow: 0 2px 12px rgba(30,20,5,0.08);
  --shadow-lg: 0 8px 32px rgba(30,20,5,0.16);
  --glow: 0 0 0 rgba(0,0,0,0);
}

body.dark {
  --gold: #E3A94A;
  --gold-light: #F6CF7E;
  --gold-pale: #2B1F0D;
  --accent-hover: #C98F2F;
  --bg: #060504;
  --surface: #120F0B;
  --surface2: #1B1711;
  --border: #33291B;
  --text: #F4EDE0;
  --text-mid: #C2B6A2;
  --text-dim: #7D7262;
  --green: #4CC27E;
  --purple: #B08BE8;
  --red: #FF6A5C;
  --blue: #5FB2E0;
  --shadow: 0 2px 12px rgba(0,0,0,0.6);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.75);
  --glow: 0 0 18px rgba(227,169,74,0.22);
}
html, body { height: 100%; }
body { font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

/* LAYOUT */
.app-shell { display: flex; min-height: 100vh; flex-direction: column; }
.top-bar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 20px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
.top-bar-logo { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 21px; color: var(--text); letter-spacing: 2px; text-transform: uppercase; }
.top-bar-user { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--text-mid); }
.avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--gold-pale); border: 2px solid var(--gold); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: var(--gold); }

.main-content { flex: 1; padding: 20px; max-width: 900px; margin: 0 auto; width: 100%; padding-bottom: 80px; }

/* BOTTOM NAV */
.bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface); border-top: 1px solid var(--border); display: flex; z-index: 100; }
.nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 4px; cursor: pointer; color: var(--text-dim); font-size: 10px; gap: 3px; transition: color 0.2s; border: none; background: none; }
.nav-item.active { color: var(--gold); }
.nav-item svg { width: 22px; height: 22px; }

/* AUTH */
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: var(--bg); }
.auth-card { background: var(--surface); border-radius: 20px; padding: 40px 32px; width: 100%; max-width: 420px; box-shadow: var(--shadow-lg); border: 1px solid var(--border); }
.auth-logo { text-align: center; margin-bottom: 32px; }
.auth-logo { background: #000; border-radius: 16px; padding: 22px 16px 14px; margin: -8px -4px 28px; }
.auth-logo img { width: 100%; max-width: 300px; height: auto; filter: drop-shadow(0 0 14px rgba(227,169,74,0.35)); }
.auth-logo h1 { color: #D9A441 !important; letter-spacing: 8px !important; font-size: 18px !important; margin-top: 6px !important; }
.auth-logo h1 { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 30px; color: var(--text); letter-spacing: 3px; text-transform: uppercase; margin-top: 12px; }
.auth-logo p { font-size: 13px; color: var(--text-dim); margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; }

/* FORMS */
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-mid); margin-bottom: 6px; }
.form-input { width: 100%; padding: 12px 14px; border: 1.5px solid var(--border); border-radius: var(--radius); font-family: 'Outfit', sans-serif; font-size: 15px; background: var(--bg); color: var(--text); transition: border-color 0.2s; outline: none; }
.form-input:focus { border-color: var(--gold); background: var(--surface); }
.form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%239C9088' d='M6 8L0 0h12z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 40px; }
.form-hint { font-size: 12px; color: var(--text-dim); margin-top: 4px; }

/* BUTTONS */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 12px 20px; border-radius: var(--radius); font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; text-decoration: none; }
.btn-primary { background: var(--gold); color: white; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-secondary { background: var(--surface2); color: var(--text-mid); border: 1.5px solid var(--border); }
.btn-secondary:hover { background: var(--border); }
.btn-danger { background: rgba(229,70,60,0.10); color: var(--red); border: 1.5px solid rgba(229,70,60,0.35); }
.btn-ghost { background: transparent; color: var(--gold); padding: 8px 12px; }
.btn-sm { padding: 7px 14px; font-size: 13px; border-radius: 8px; }
.btn-full { width: 100%; }
.btn-green { background: rgba(40,170,100,0.12); color: var(--green); border: 1.5px solid rgba(40,170,100,0.4); }
.btn-purple { background: rgba(120,90,230,0.12); color: var(--purple); border: 1.5px solid rgba(120,90,230,0.4); }

/* CARDS */
.card { background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; }
.card-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.card-title { font-size: 16px; font-weight: 700; color: var(--text); }
.card-body { padding: 20px; }

/* SECTION TITLE */
.section-title { font-family: 'Rajdhani', sans-serif; font-weight: 700; letter-spacing: 0.5px; font-size: 23px; color: var(--text); margin-bottom: 4px; }
.section-sub { font-size: 13px; color: var(--text-dim); margin-bottom: 20px; }

/* ANNOUNCEMENT */
.announcement-card { background: linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%); border: 1.5px solid var(--gold-pale); border-radius: var(--radius); padding: 16px 20px; position: relative; overflow: hidden; margin-bottom: 12px; }
.announcement-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--gold); }
.announcement-title { font-weight: 700; font-size: 15px; color: var(--text); margin-bottom: 4px; }
.announcement-body { font-size: 14px; color: var(--text-mid); line-height: 1.5; }
.announcement-meta { font-size: 11px; color: var(--text-dim); margin-top: 8px; }

/* STATUS BADGE */
.badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge-gold { background: var(--gold-pale); color: var(--gold); }
.badge-green { background: rgba(40,170,100,0.14); color: var(--green); }
.badge-purple { background: rgba(120,90,230,0.14); color: var(--purple); }
.badge-red { background: rgba(229,70,60,0.12); color: var(--red); }
.badge-gray { background: var(--surface2); color: var(--text-dim); }
.badge-blue { background: var(--surface2); color: var(--blue); }

/* SIGNUP STATUS */
.signup-status-card { border-radius: var(--radius); padding: 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.signup-open { background: var(--surface); border: 1.5px solid var(--green); }
.signup-closed { background: var(--surface2); border: 1.5px solid var(--border); }
.signup-registered { background: var(--surface); border: 1.5px solid var(--blue); }

/* EVENT CARD */
.event-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 14px; }
.event-date-box { background: var(--gold-pale); border-radius: 10px; padding: 8px 12px; text-align: center; min-width: 52px; }
.event-date-day { font-size: 20px; font-weight: 700; color: var(--gold); line-height: 1; }
.event-date-mon { font-size: 11px; color: var(--gold); text-transform: uppercase; letter-spacing: 1px; }
.event-info { flex: 1; }
.event-title { font-weight: 700; font-size: 15px; }
.event-detail { font-size: 13px; color: var(--text-mid); margin-top: 2px; }

/* BUDDY */
.buddy-card { background: linear-gradient(135deg, var(--surface2) 0%, var(--surface) 100%); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 16px 20px; display: flex; align-items: center; gap: 14px; }
.buddy-icon { width: 44px; height: 44px; border-radius: 50%; background: var(--purple); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; }

/* TABLE */
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { background: var(--surface2); padding: 10px 14px; text-align: left; font-size: 12px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
.data-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover { background: var(--surface2); }
.storm-assign { table-layout: fixed; width: 100%; font-size: 12px; }
.storm-assign th { padding: 6px 3px; font-size: 10px; letter-spacing: 0; text-transform: none; }
.storm-assign td { padding: 4px 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.storm-assign th:first-child, .storm-assign td:first-child { padding-left: 6px; }
.team-seg { display: flex; gap: 2px; }
.team-seg button { flex: 1; height: 26px; min-width: 0; padding: 0; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text-dim); font-size: 12px; font-weight: 700; cursor: pointer; }
.team-seg button.on-A { background: var(--gold); border-color: var(--gold); color: #fff; }
.team-seg button.on-B { background: var(--blue); border-color: var(--blue); color: #fff; }
.team-seg button.on-U { background: var(--text-dim); border-color: var(--text-dim); color: #fff; }
.team-seg button.on-starter { background: var(--green); border-color: var(--green); color: #fff; }
.team-seg button.on-sub { background: var(--gold); border-color: var(--gold); color: #fff; }
.storm-assign select.slot-pick { width: 100%; height: 26px; border: 1px solid var(--border); border-radius: 6px; padding: 0 2px; font-size: 11px; background: var(--surface); color: var(--text); }

/* TABS */
.tabs { display: flex; background: var(--surface2); border-radius: 10px; padding: 4px; margin-bottom: 20px; gap: 4px; }
.tab { flex: 1; padding: 9px; border-radius: 8px; border: none; background: transparent; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-dim); cursor: pointer; transition: all 0.2s; }
.tab.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow); }

/* RADIO GROUP */
.radio-group { display: flex; flex-direction: column; gap: 8px; }
.radio-option { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1.5px solid var(--border); border-radius: var(--radius); cursor: pointer; transition: all 0.2s; }
.radio-option.selected { border-color: var(--gold); background: var(--gold-pale); }
.radio-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
.radio-option.selected .radio-dot { border-color: var(--gold); background: var(--gold); }
.radio-option.selected .radio-dot::after { content: ''; width: 6px; height: 6px; border-radius: 50%; background: white; }
.check-box { width: 18px; height: 18px; border-radius: 5px; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px; font-weight: 700; color: white; transition: all 0.2s; }
.radio-option.selected .check-box { border-color: var(--gold); background: var(--gold); }
.chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.storm-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.count-pills { display: flex; gap: 5px; margin-bottom: 12px; align-items: center; flex-wrap: nowrap; overflow-x: auto; }
.count-pills .badge { font-size: 11px; padding: 3px 8px; white-space: nowrap; flex-shrink: 0; }
.sticky-counts { position: sticky; top: 60px; z-index: 50; background: var(--bg); margin: 0 -20px 8px; padding: 8px 20px; border-bottom: 1px solid var(--border); }
.storm-actions .btn-sm { padding: 6px 10px; font-size: 12px; gap: 4px; flex-shrink: 0; }
.storm-actions .storm-gear { flex-shrink: 0; font-size: 16px; padding: 4px 10px; }
.storm-actions .storm-search { flex: 1; min-width: 64px; height: 32px; padding: 0 10px; font-size: 13px; border-radius: 8px; }
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; border: 1.5px solid var(--gold); background: var(--gold-pale); color: var(--text); font-size: 13px; font-weight: 600; }
.chip button { background: none; border: none; color: var(--red); font-weight: 700; cursor: pointer; padding: 0; font-size: 13px; line-height: 1; }
@media (min-width: 640px) { .sticky-counts { margin: 0 -32px 8px; padding: 8px 32px; } }

/* POWER CHART */
.power-chart { display: flex; align-items: flex-end; gap: 8px; height: 80px; padding: 4px 0; }
.power-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
.power-bar { width: 100%; background: var(--gold); border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.5s ease; }
.power-bar-label { font-size: 10px; color: var(--text-dim); }

/* PIE CHART */
.pie-wrap { display: flex; align-items: center; gap: 20px; }
.pie-legend { display: flex; flex-direction: column; gap: 6px; }
.pie-legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.pie-dot { width: 10px; height: 10px; border-radius: 50%; }

/* CONTEST GALLERY */
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.gallery-item { border-radius: var(--radius); overflow: hidden; position: relative; cursor: pointer; aspect-ratio: 1; }
.gallery-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
.gallery-item:hover .gallery-img { transform: scale(1.03); }
.gallery-votes { position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.7); color: white; border-radius: 20px; padding: 2px 8px; font-size: 12px; font-weight: 600; }
[contenteditable][data-placeholder]:empty:before { content: attr(data-placeholder); color: var(--text-dim); pointer-events: none; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal { background: var(--surface); border-radius: 20px; width: 100%; max-width: 520px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
.modal-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.modal-title { font-size: 18px; font-weight: 700; }
.modal-body { padding: 20px 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }

/* PROFILE */
.profile-header { display: flex; align-items: center; gap: 16px; padding: 20px; background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); margin-bottom: 20px; }
.profile-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--gold-pale); border: 3px solid var(--gold); display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; color: var(--gold); flex-shrink: 0; }
.profile-name { font-size: 20px; font-weight: 700; }
.profile-role { font-size: 13px; color: var(--text-dim); margin-top: 2px; }

/* MEMBER NAME COLORS */
.name-engineer { color: var(--green); font-weight: 600; }
.name-warleader { color: var(--purple); font-weight: 600; }

/* DIVIDER */
.divider { height: 1px; background: var(--border); margin: 16px 0; }

/* STACK */
.stack { display: flex; flex-direction: column; gap: 12px; }
.row { display: flex; align-items: center; gap: 10px; }
.row-between { display: flex; align-items: center; justify-content: space-between; }
.wrap { flex-wrap: wrap; }

/* PENDING BANNER */
.pending-banner { background: var(--gold-pale); border: 1.5px solid var(--gold); border-radius: var(--radius); padding: 16px 20px; text-align: center; color: var(--text); font-weight: 500; }

/* SCROLL */
::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

/* TOAST */
.toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: var(--text); color: var(--bg); padding: 12px 20px; border-radius: 24px; font-size: 14px; font-weight: 500; z-index: 300; box-shadow: var(--shadow-lg); animation: toastIn 0.3s ease; }
@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

/* RESPONSIVE */
@media (min-width: 640px) {
  .main-content { padding: 28px 32px 80px; }
  .gallery { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
}

/* TEAM SLOT */
.team-slot { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; }
.team-slot-header { font-size: 12px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.player-chip { display: inline-flex; align-items: center; gap: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 4px 10px; font-size: 13px; margin: 2px; }

/* BATTLE WEEK */
.week-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s; margin-bottom: 8px; }
.week-card:hover { border-color: var(--gold); background: var(--gold-pale); }

/* SORT CONTROLS */
.sort-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.sort-chip { padding: 6px 12px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: var(--text-mid); }
.sort-chip.active { border-color: var(--gold); background: var(--gold-pale); color: var(--gold); }

/* LOADING */
.spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 40px auto; }
@keyframes spin { to { transform: rotate(360deg); } }

/* SPLASH */
.splash { position: fixed; inset: 0; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; cursor: pointer; }
.splash-logo-img { width: min(82vw, 420px); height: auto; opacity: 0; animation: splashZoom 1.1s cubic-bezier(.2,.8,.2,1) forwards; animation-delay: 0.15s; filter: drop-shadow(0 0 30px rgba(227,169,74,0.5)); }
.splash-line1 { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; color: #EDF1F7; opacity: 0; animation: splashFadeIn 0.7s ease forwards; animation-delay: 1.1s; letter-spacing: 8px; text-transform: uppercase; margin-top: 18px; }
.splash-bar { width: 80px; height: 2px; background: linear-gradient(90deg, transparent, #D9A441, transparent); margin-top: 28px; opacity: 0; animation: splashFadeIn 0.5s ease forwards; animation-delay: 0.9s; box-shadow: 0 0 12px #D9A441; }
.splash-exit { animation: splashFadeOut 0.6s ease forwards; animation-delay: 0s; }
@keyframes splashZoom { from { opacity: 0; transform: scale(0.82); } to { opacity: 1; transform: scale(1); } }
@keyframes splashFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes splashFadeOut { from { opacity: 1; } to { opacity: 0; pointer-events: none; } }

/* WiLD HOME CARDS */
.vs-card { background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--gold); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--glow); }
.vs-mode { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; color: var(--text); letter-spacing: 1px; line-height: 1.1; }
.train-card { background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--green); border-radius: 12px; padding: 12px 16px; }
.assign-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 14px 18px; display: flex; align-items: center; gap: 14px; cursor: pointer; margin-bottom: 10px; }
.assign-card:hover { border-color: var(--gold); }
.assign-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.assign-mini { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 10px 12px; cursor: pointer; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.assign-mini:hover { border-color: var(--gold); }
.assign-mini-l1 { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--text-dim); }
.assign-mini-l2 { font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.assign-mini-role { font-size: 11px; font-weight: 400; color: var(--text-dim); }
.assign-mini-l3 { display: flex; align-items: center; justify-content: space-between; gap: 4px; font-size: 11px; color: var(--text-mid); white-space: nowrap; }
.assign-mini-l3 > span:first-child { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.assign-mini-view { color: var(--gold); font-weight: 600; flex-shrink: 0; }
.assign-icon { width: 44px; height: 44px; border-radius: 50%; background: var(--gold-pale); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.top-bar { background: #000 !important; border-bottom: 1px solid #3A2C14 !important; box-shadow: 0 2px 14px rgba(0,0,0,0.25); }
.top-bar .top-bar-user { color: #E8DCC4; }
.top-bar .btn-ghost { color: #E3A94A; }
.top-bar .avatar { background: #2B1F0D; border-color: #D9A441; color: #F6CF7E; }
.top-bar .top-bar-name { color: #E3A94A !important; }
.top-bar-logo img.wordmark { height: 30px; width: auto; display: block; }
body.dark .btn-primary { color: #1A1206; }
body.dark .btn-primary:hover { color: #1A1206; }
.top-bar-logo .hub-tag { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 15px; letter-spacing: 3px; color: #D9A441; }
.team-pills { display: flex; flex-wrap: nowrap; gap: 3px; align-items: center; white-space: nowrap; }
.team-pills .badge { font-size: 10.5px; padding: 3px 6px; gap: 2px; flex-shrink: 0; }
.team-pills button.badge { border: 1px solid var(--border); cursor: pointer; font-family: inherit; position: relative; }
.team-pills .same-a { font-size: 7.5px; font-weight: 700; margin-left: 1px; vertical-align: super; line-height: 0; }
@media (max-width: 380px) { .team-sticky { padding-left: 12px !important; padding-right: 12px !important; } }
.next-battle-note { display: flex; align-items: center; justify-content: space-between; gap: 8px; background: var(--gold-pale); border: 1px solid var(--gold); border-radius: 10px; padding: 8px 12px; margin-bottom: 10px; font-size: 12px; color: var(--text); }
.approval-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 7px 10px 7px 12px; margin-bottom: 12px; font-size: 13px; }
.members-tools { display: flex; gap: 6px; align-items: center; margin-bottom: 8px; }
.members-tools .form-input { flex: 1; min-width: 0; height: 34px; padding: 0 10px; font-size: 13px; border-radius: 8px; }
.members-tools .btn-sm { flex-shrink: 0; padding: 6px 9px; font-size: 12px; }
.members-table { table-layout: fixed; width: 100%; font-size: 12px; }
.members-table th { padding: 6px 6px; font-size: 10px; cursor: pointer; user-select: none; white-space: nowrap; }
.members-table th:last-child { cursor: default; }
.members-table td { padding: 3px 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.members-table .member-name { cursor: pointer; display: block; overflow: hidden; text-overflow: ellipsis; }
.members-table .member-off { margin-left: 4px; font-size: 9px; color: var(--text-dim); border: 1px solid var(--border); border-radius: 4px; padding: 0 3px; }
.members-table .member-role { width: 100%; border: 1px solid var(--border); border-radius: 6px; padding: 1px 0 1px 3px; font-size: 11px; background: var(--surface); color: var(--text); }
.members-table .member-more { background: none; border: none; font-size: 16px; line-height: 1; padding: 2px 4px; cursor: pointer; color: var(--text-mid); }
.spots-counter { margin-right: auto; font-size: 12px; font-weight: 700; white-space: nowrap; }
.team-sticky { position: sticky; top: 60px; z-index: 40; background: var(--bg); margin: 0 -20px 8px; padding: 8px 20px; }
@media (min-width: 640px) { .team-sticky { margin: 0 -32px 8px; padding: 8px 32px; } }
.update-banner { position: fixed; left: 12px; right: 12px; bottom: 72px; z-index: 150; background: var(--surface); border: 1.5px solid var(--gold); border-radius: var(--radius); box-shadow: var(--shadow-lg); padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 13px; font-weight: 600; max-width: 520px; margin: 0 auto; }
.install-card { background: var(--surface); border: 1.5px solid var(--gold); border-radius: var(--radius); padding: 14px 16px; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 20px; box-shadow: var(--glow); }
.top-bar-user { gap: 4px; flex-shrink: 0; }
.top-bar-logo { white-space: nowrap; min-width: 0; overflow: hidden; }
.top-bar-logo span { overflow: hidden; text-overflow: ellipsis; }
@media (max-width: 420px) { .top-bar { padding: 0 12px; } }
@media (max-width: 440px) { .top-bar-name { display: none; } }
@media (max-width: 380px) { .top-bar-logo span { font-size: 18px; letter-spacing: 1px; } }

`;

// ─── SPLASH SCREEN ────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 2600);
    const t2 = setTimeout(() => onDone(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className={`splash ${exiting ? "splash-exit" : ""}`} onClick={() => { setExiting(true); setTimeout(onDone, 300); }}>
      <img className="splash-logo-img" src={WORDMARK_SRC} alt="WiLD" />
      <div className="splash-bar" />
      <div className="splash-line1">WiLD Hub</div>
    </div>
  );
}


// ─── DS SQUAD GROWTH CHART ────────────────────────────────────────────────────
function DSGrowthChart({ user, dsSignups }) {
  const canvasRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);
  const myHistory = (dsSignups || [])
    .filter(s => String(s.userId) === String(user.id) && s.power > 0)
    .sort((a, b) => a.week.localeCompare(b.week));

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "WiLD_Growth_" + user.username + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || myHistory.length < 1) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#0A0E1A"); bgGrad.addColorStop(1, "#0D1520");
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#D9A441"; ctx.lineWidth = 2; ctx.strokeRect(1, 1, W-2, H-2);
    [[8,8],[W-8,8],[8,H-8],[W-8,H-8]].forEach(function(pt) {
      ctx.beginPath(); ctx.arc(pt[0],pt[1],4,0,Math.PI*2); ctx.fillStyle="#D9A441"; ctx.fill();
    });
    ctx.font = "bold 13px Arial"; ctx.fillStyle = "#D9A441"; ctx.textAlign = "left";
    ctx.fillText(tr("SQUAD POWER GROWTH"), 20, 28);
    ctx.font = "11px Arial"; ctx.fillStyle = "#7A8A9A"; ctx.fillText(tr("Desert Storm Historical"), 20, 44);
    var PAD_L=64,PAD_R=20,PAD_T=58,PAD_B=52,CW=W-PAD_L-PAD_R,CH=H-PAD_T-PAD_B;
    var powers = myHistory.map(function(h){return h.power;});
    var maxP=Math.max.apply(null,powers), minP=Math.min.apply(null,powers);
    var range=maxP-minP||maxP||1;
    var yMax=maxP+range*0.1, yMin=Math.max(0,minP-range*0.1), yRange=yMax-yMin||1;
    var toX=function(i){return PAD_L+(i/Math.max(myHistory.length-1,1))*CW;};
    var toY=function(p){return PAD_T+CH-((p-yMin)/yRange)*CH;};
    for(var g=0;g<=4;g++){
      var gY=PAD_T+(g/4)*CH, gVal=yMax-(g/4)*yRange;
      ctx.beginPath(); ctx.strokeStyle="rgba(200,146,42,0.12)"; ctx.lineWidth=1; ctx.setLineDash([4,6]);
      ctx.moveTo(PAD_L,gY); ctx.lineTo(W-PAD_R,gY); ctx.stroke(); ctx.setLineDash([]);
      var lbl=gVal>=1000?(gVal/1000).toFixed(1)+"B":gVal.toFixed(1)+"M";
      ctx.font="9px Arial"; ctx.fillStyle="#5A6A7A"; ctx.textAlign="right"; ctx.fillText(lbl,PAD_L-6,gY+3);
    }
    if(myHistory.length>1){
      var ag=ctx.createLinearGradient(0,PAD_T,0,PAD_T+CH);
      ag.addColorStop(0,"rgba(200,146,42,0.25)"); ag.addColorStop(1,"rgba(200,146,42,0.01)");
      ctx.beginPath(); ctx.moveTo(toX(0),PAD_T+CH);
      myHistory.forEach(function(h,i){ctx.lineTo(toX(i),toY(h.power));});
      ctx.lineTo(toX(myHistory.length-1),PAD_T+CH); ctx.closePath(); ctx.fillStyle=ag; ctx.fill();
      ctx.beginPath(); ctx.strokeStyle="#D9A441"; ctx.lineWidth=2.5; ctx.lineJoin="round"; ctx.lineCap="round";
      myHistory.forEach(function(h,i){if(i===0)ctx.moveTo(toX(i),toY(h.power));else ctx.lineTo(toX(i),toY(h.power));});
      ctx.stroke();
    }
    myHistory.forEach(function(h,i){
      var x=toX(i),y=toY(h.power);
      ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fillStyle="rgba(200,146,42,0.3)"; ctx.fill();
      ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2); ctx.fillStyle="#D9A441"; ctx.fill();
      ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fillStyle="#FFFFFF"; ctx.fill();
      var wl="W"+h.week.slice(5,7).replace(/^0/,"")+"/"+h.week.slice(2,4);
      ctx.font="8px Arial"; ctx.fillStyle="#5A6A7A"; ctx.textAlign="center"; ctx.fillText(wl,x,H-PAD_B+14);
    });
    if(myHistory.length>=2){
      var diff=myHistory[myHistory.length-1].power-myHistory[0].power;
      var pct=myHistory[0].power>0?((diff/myHistory[0].power)*100).toFixed(1):"0";
      var dl=diff>=0?"+"+diff.toFixed(2)+"M ("+pct+"%)":diff.toFixed(2)+"M ("+pct+"%)";
      var bc=diff>=0?"#00B050":"#C03530";
      var rx2=PAD_L,ry2=PAD_T-2,rw=170,rh=20,rr=6;
      ctx.beginPath();
      ctx.moveTo(rx2+rr,ry2); ctx.lineTo(rx2+rw-rr,ry2); ctx.quadraticCurveTo(rx2+rw,ry2,rx2+rw,ry2+rr);
      ctx.lineTo(rx2+rw,ry2+rh-rr); ctx.quadraticCurveTo(rx2+rw,ry2+rh,rx2+rw-rr,ry2+rh);
      ctx.lineTo(rx2+rr,ry2+rh); ctx.quadraticCurveTo(rx2,ry2+rh,rx2,ry2+rh-rr);
      ctx.lineTo(rx2,ry2+rr); ctx.quadraticCurveTo(rx2,ry2,rx2+rr,ry2); ctx.closePath();
      ctx.fillStyle=diff>=0?"rgba(0,176,80,0.15)":"rgba(192,53,48,0.15)"; ctx.fill();
      ctx.strokeStyle=bc; ctx.lineWidth=1; ctx.stroke();
      ctx.font="bold 10px Arial"; ctx.fillStyle=bc; ctx.textAlign="left"; ctx.fillText(dl,rx2+6,ry2+13);
    }
    ctx.font="bold 11px Arial"; ctx.fillStyle="#D9A441"; ctx.textAlign="left";
    ctx.fillText(user.username.toUpperCase(),20,H-14);
    ctx.font="bold 10px Arial"; ctx.fillStyle="#3A4A5A"; ctx.textAlign="right";
    ctx.fillText("WiLD | " + tr("GROWTH CHART"),W-20,H-14);
    ctx.beginPath(); ctx.strokeStyle="rgba(200,146,42,0.3)"; ctx.lineWidth=1;
    ctx.moveTo(20,H-24); ctx.lineTo(W-20,H-24); ctx.stroke();
  }, [myHistory.length]);

  if(myHistory.length===0) return (
    <div className="card" style={{marginBottom:16}}>
      <div className="card-header"><div className="card-title">📈 {tr("Squad Growth History")}</div></div>
      <div className="card-body" style={{textAlign:"center",color:"var(--text-dim)",fontSize:13}}>{tr("No sign-up history with power data yet.")}</div>
    </div>
  );

  return (
    <div className="card" style={{marginBottom:16}}>
      <div className="card-header">
        <div className="card-title">📈 {tr("Squad Growth History")}</div>
        <button onClick={download} className="btn btn-sm btn-secondary" style={{fontSize:11,padding:"4px 10px"}}>⬇️ {tr("Save PNG")}</button>
      </div>
      <div className="card-body" style={{padding:"12px"}}>
        <canvas ref={canvasRef} width={600} height={300} style={{width:"100%",borderRadius:8,display:"block"}}/>
        <button
          onClick={() => setShowHistory(v => !v)}
          style={{
            display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%",
            marginTop:10, padding:"8px 12px", background:"var(--surface2)", border:"1px solid var(--border)",
            borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, color:"var(--text-mid)",
          }}
        >
          <span>📋 {myHistory.length === 1 ? tr("1 week logged") : tr("{n} weeks logged", { n: myHistory.length })}</span>
          <span style={{color:"var(--gold)"}}>{showHistory ? "▲ " + tr("Hide") : "▼ " + tr("Show")}</span>
        </button>
        {showHistory && (
          <div style={{marginTop:8, maxHeight:220, overflowY:"auto", border:"1px solid var(--border)", borderRadius:8}}>
            <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
              <thead>
                <tr style={{position:"sticky", top:0, background:"var(--surface2)"}}>
                  <th style={{textAlign:"left", padding:"6px 10px", color:"var(--text-dim)", fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:0.5}}>{tr("Week")}</th>
                  <th style={{textAlign:"right", padding:"6px 10px", color:"var(--text-dim)", fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:0.5}}>{tr("Power")}</th>
                </tr>
              </thead>
              <tbody>
                {[...myHistory].reverse().map(function(h,i){return(
                  <tr key={i} style={{borderTop:"1px solid var(--border)"}}>
                    <td style={{padding:"6px 10px", color:"var(--text-mid)"}}>{h.week}</td>
                    <td style={{padding:"6px 10px", textAlign:"right", fontWeight:700, color:"var(--gold)"}}>{h.power>=1000?(h.power/1000).toFixed(2)+"B":h.power.toFixed(1)+"M"}</td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── MEMBER PROFILE MODAL ─────────────────────────────────────────────────────
function MemberCard({ member: memberProp, members, csTeams, dsTeams, csSignups, dsSignups, allDsHistory, onClose }) {
  const [showGrowth, setShowGrowth] = useState(false);
  const [profOpen, setProfOpen] = useState(false);
  const { isR4 } = useBuddyActions();
  // Always read the live member so profession / buddy changes show immediately
  const member = (members || []).find(m => String(m.id) === String(memberProp?.id)) || memberProp;
  if (!member) return null;
  const stats = computeStormStats(member.id, csTeams || {}, dsTeams || {}, csSignups || [], dsSignups || []);
  const pctColor = stats.pct == null ? "var(--text-dim)" : stats.pct >= 80 ? "var(--green)" : stats.pct >= 50 ? "var(--gold)" : "var(--red)";
  return (
    <>
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 300 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 360, padding: 0, borderRadius: 20, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, var(--gold) 0%, #3A2608 100%)", padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{member.username[0].toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{member.username}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>{member.profession === "engineer" ? "🔧 " + tr("Engineer") : "⚔️ " + tr("War Leader")} · {member.role.toUpperCase()}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[["⚡", tr("Power"), member.power ? (member.power/1000000).toFixed(2)+"M" : "—"],
              ["📅", tr("Joined"), member.joinDate ? new Date(String(member.joinDate).slice(0, 10) + "T12:00:00Z").toLocaleDateString(dateLocale(),{month:"short",year:"2-digit",timeZone:"UTC"}) : "—"]
            ].map(([icon, label, val]) => (
              <div key={label} style={{ background: "var(--bg)", borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 16 }}>{icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{val}</div>
                <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{label}</div>
              </div>
            ))}
          </div>
          {(() => {
            const buddy = member.buddy ? (members || []).find(b => String(b.id) === String(member.buddy)) : null;
            if (!buddy && !isR4) return null;
            return (
              <div style={{ background: "var(--bg)", borderRadius: 10, padding: "8px 12px", marginBottom: 10, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🤝 {buddy ? <>{tr("Buddy")}: <strong>{buddy.username}</strong></> : <span style={{ color: "var(--text-dim)" }}>{tr("No buddy")}</span>}</span>
                {isR4 && <button className="btn btn-sm btn-secondary" style={{ padding: "3px 8px", fontSize: 11, flexShrink: 0 }} onClick={() => setProfOpen(true)}>{tr("Profession / buddy")}</button>}
              </div>
            );
          })()}
          {stats.signedUp > 0 ? (
            <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>⚔️ {tr("Storm Rate")}</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: pctColor }}>{stats.pct}%</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 8 }}>
                {[[tr("Signed Up"), stats.signedUp, "var(--text)"],[tr("Made It"), stats.madeTeam, "var(--green)"],[tr("Waitlist"), stats.waitlisted, "var(--gold)"],[tr("Missed"), stats.missed, "var(--text-dim)"]].map(([l,v,c]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c }}>{v}</div>
                    <div style={{ fontSize: 9, color: "var(--text-dim)" }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--border)", borderRadius: 8, height: 5 }}>
                <div style={{ height: "100%", width: stats.pct+"%", background: pctColor, borderRadius: 8 }} />
              </div>
            </div>
          ) : <div style={{ textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>{tr("No storm history yet.")}</div>}
          <button className="btn btn-secondary" style={{width:"100%",marginTop:10,fontSize:13}} onClick={()=>setShowGrowth(true)}>📈 {tr("View Squad Growth Chart")}</button>
        </div>
      </div>
    </div>
    {profOpen && <ProfessionBuddyModal member={member} members={members} onClose={() => setProfOpen(false)} />}
    {showGrowth && (
      <div className="modal-overlay" onClick={()=>setShowGrowth(false)} style={{zIndex:400}}>
        <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:520,padding:0,borderRadius:20,overflow:"hidden",maxHeight:"90vh",overflowY:"auto"}}>
          <div style={{background:"linear-gradient(135deg,var(--gold) 0%,#3A2608 100%)",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{color:"#fff",fontWeight:800,fontSize:15}}>📈 {member.username} — {tr("Squad Growth")}</div>
            <button onClick={()=>setShowGrowth(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer"}}>✕</button>
          </div>
          <div style={{padding:16}}>
            <DSGrowthChart user={member} dsSignups={allDsHistory||[]} />
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);

  // Restore session from localStorage on first load
  const savedSession = (() => {
    try { return JSON.parse(localStorage.getItem("wild_session")); } catch { return null; }
  })();

  const [lang, setLang] = useState(savedSession?.language || "en");
  const [page, setPage] = useState("home");
  const [viewMember, setViewMember] = useState(null);
  const [darkMode, setDarkMode] = useState(() => { try { const v = localStorage.getItem("wild_dark"); return v === "1"; } catch { return false; } });
  useEffect(() => { document.body.classList.toggle("dark", darkMode); try { localStorage.setItem("wild_dark", darkMode ? "1" : "0"); } catch {} }, [darkMode]);
  const [members, setMembersState] = useState([]);
  const [csSignups, setCsSignupsState] = useState([]);
  const [dsSignups, setDsSignupsState] = useState([]);
  const [csAllSignups, setCsAllSignups] = useState([]);
  const [dsAllSignups, setDsAllSignups] = useState([]);
  const [csTeams, setCsTeamsState] = useState({});
  const [dsTeams, setDsTeamsState] = useState({});
  const [stormSettings, setStormSettings] = useState({ canyon: false, desert: false, canyon_active: true, desert_active: true });
  const [vsMode, setVsModeState] = useState("PUSH");
  const [battlePlans, setBattlePlans] = useState({ canyon: null, desert: null }); // custom plans saved by R4/admin
  const [stormConfig, setStormConfig] = useState(DEFAULT_STORM_CONFIG); // sign-up times + spots per assignment
  const [trains, setTrainsState] = useState([]);
  const [trainGoals, setTrainGoalsState] = useState([]);
  const [buddyRequests, setBuddyRequestsState] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Trains + train goals use a Monday week start
  const getWeekStart = () => {
    const d = serverNow();
    const day = d.getUTCDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setUTCDate(d.getUTCDate() + diff);
    return d.toISOString().split("T")[0];
  };

  const mapBuddyRequest = (r) => ({
    id: r.id, memberId: r.member_id, profession: r.profession,
    needBuddy: r.need_buddy, buddyName: r.buddy_name, submittedAt: new Date(r.created_at),
  });

  const mapMember = (m) => ({
    id: m.id, memberId: m.member_code, username: m.username,
    password: m.password_hash, role: m.role, approved: m.approved,
    profession: m.profession, language: m.language,
    power: m.power || 0, joinDate: m.join_date, securityQ: m.security_question,
    securityA: m.security_answer,
    signupCount: m.signup_count || 0, attendanceCount: m.attendance_count || 0,
    disabled: m.disabled || false,
    buddy: m.buddy_id || null,
  });

  const mapSignup = (s) => ({
    userId: s.member_id, power: s.power, squadType: s.squad_type,
    availability: s.availability, timePreference: s.time_preference, canFlexTime: s.can_flex_time || "", week: s.week_start,
  });

  const mapTrain = (trn) => ({
    id: trn.id, date: trn.train_date, time: trn.train_time,
    conductorId: trn.conductor_id, guardianId: trn.guardian_id, weekStart: trn.week_start,
  });

  // Keeps the current battle's rows, plus next battle's on battle day (one row per member per week)
  const dedupeLiveWeeks = (rows, type) => {
    const seen = new Set();
    return (rows || []).filter(s => isLiveSignupWeek(type, s.week_start))
      .filter(s => { const k = `${s.member_id}:${s.week_start}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .map(mapSignup);
  };

  const loadAll = async (loggedInUser) => {
    try {
      const csBattleWeek = getSignupWeek("canyon");
      const dsBattleWeek = getSignupWeek("desert");
      const [
        { data: membersData, error: membersError },
        { data: csData },
        { data: dsData },
        { data: csAllData },
        { data: dsAllData },
        { data: teamsData },
        { data: trainsData },
        { data: trainGoalsData },
        { data: buddyData },
        { data: stormSettingsData },
        { data: appSettingsData },
      ] = await Promise.all([
        supabase.from("members").select("*"),
        supabase.from("canyon_signups").select("*").in("week_start", [csBattleWeek, getNextSignupWeek("canyon")]).order("updated_at", { ascending: false }),
        supabase.from("desert_signups").select("*").in("week_start", [dsBattleWeek, getNextSignupWeek("desert")]).order("updated_at", { ascending: false }),
        supabase.from("canyon_signups").select("member_id,week_start").order("week_start", { ascending: false }).limit(10000),
        supabase.from("desert_signups").select("member_id,week_start,power,squad_type").order("week_start", { ascending: false }).limit(10000),
        supabase.from("battle_teams").select("*"),
        supabase.from("trains").select("*").order("train_date", { ascending: true }),
        supabase.from("train_goals").select("*").order("week_start", { ascending: false }),
        supabase.from("buddy_requests").select("*").eq("dismissed", false).order("created_at", { ascending: true }),
        supabase.from("storm_settings").select("*"),
        supabase.from("app_settings").select("*"),
      ]);
      if (membersError) throw membersError;

      if (membersData) {
        const seen = new Set();
        const deduped = membersData.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
        setMembersState(deduped.map(mapMember));
      }

      if (csData) setCsSignupsState(dedupeLiveWeeks(csData, "canyon"));
      if (dsData) setDsSignupsState(dedupeLiveWeeks(dsData, "desert"));

      if (csAllData) {
        const seen = new Set();
        setCsAllSignups(csAllData
          .filter(s => { const k = `${s.member_id}:${s.week_start}`; if (seen.has(k)) return false; seen.add(k); return true; })
          .map(s => ({ userId: s.member_id, week: s.week_start })));
      }
      if (dsAllData) {
        const seen = new Set();
        setDsAllSignups(dsAllData
          .filter(s => { const k = `${s.member_id}:${s.week_start}`; if (seen.has(k)) return false; seen.add(k); return true; })
          .map(s => ({ userId: s.member_id, week: s.week_start, power: s.power || 0, squadType: s.squad_type || "" })));
      }

      if (teamsData) {
        const cs = {}; const ds = {};
        teamsData.forEach(t => {
          const key = t.battle_date;
          const val = { timeA: t.time_a, timeB: t.time_b, ...(t.team_data || {}) };
          if (t.type === "canyon") cs[key] = val;
          else ds[key] = val;
        });
        setCsTeamsState(cs); setDsTeamsState(ds);
      }

      if (trainsData) setTrainsState(trainsData.map(mapTrain));
      if (buddyData) setBuddyRequestsState(buddyData.map(mapBuddyRequest));
      if (trainGoalsData) setTrainGoalsState(trainGoalsData.map(g => ({ id: g.id, weekStart: g.week_start, goal: g.goal })));

      if (stormSettingsData) {
        const cs = stormSettingsData.find(r => r.type === "canyon");
        const ds = stormSettingsData.find(r => r.type === "desert");
        setStormSettings({
          canyon: cs?.signups_open ?? false,
          desert: ds?.signups_open ?? false,
          canyon_active: cs?.season_active ?? true,
          desert_active: ds?.season_active ?? true,
        });
      }

      if (appSettingsData) {
        const vs = appSettingsData.find(r => r.key === "vs_mode");
        if (vs?.value) setVsModeState(vs.value);
        const parsePlan = (key) => { const row = appSettingsData.find(r => r.key === key); try { return row?.value ? JSON.parse(row.value) : null; } catch { return null; } };
        setBattlePlans({ canyon: parsePlan("battle_plan_canyon"), desert: parsePlan("battle_plan_desert") });
        setStormConfig({
          canyon: { ...DEFAULT_STORM_CONFIG.canyon, ...(parsePlan("storm_config_canyon") || {}) },
          desert: { ...DEFAULT_STORM_CONFIG.desert, ...(parsePlan("storm_config_desert") || {}) },
        });
      }

      // Restore session
      if (loggedInUser?.userId && membersData) {
        const found = membersData.find(m => String(m.id) === String(loggedInUser.userId));
        if (found) {
          const mapped = mapMember(found);
          setUser(mapped);
          setLang(mapped.language || "en");
        }
      }
    } catch (err) {
      console.error("Supabase load error:", err);
      setMembersState(MOCK_MEMBERS);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll(savedSession);

    // ── Real-time subscriptions ──────────────────────────────────────────
    const subs = [
      supabase.channel("members-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "members" }, (payload) => {
          if (payload.eventType === "INSERT") setMembersState(prev => prev.some(m => String(m.id) === String(payload.new.id)) ? prev : [...prev, mapMember(payload.new)]);
          if (payload.eventType === "UPDATE") {
            const updated = mapMember(payload.new);
            setMembersState(prev => prev.map(m => String(m.id) === String(payload.new.id) ? updated : m));
            setUser(prev => prev && String(prev.id) === String(payload.new.id) ? { ...prev, ...updated } : prev);
          }
          if (payload.eventType === "DELETE") setMembersState(prev => prev.filter(m => String(m.id) !== String(payload.old.id)));
        }).subscribe(),

      supabase.channel("canyon-signups-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "canyon_signups" }, (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const wk = payload.new.week_start;
            if (!isLiveSignupWeek("canyon", wk)) return;
            setCsSignupsState(prev => [...prev.filter(s => !(String(s.userId) === String(payload.new.member_id) && s.week === wk)), mapSignup(payload.new)]);
          }
          if (payload.eventType === "DELETE") setCsSignupsState(prev => prev.filter(s => !(String(s.userId) === String(payload.old.member_id) && s.week === payload.old.week_start)));
        }).subscribe(),

      supabase.channel("desert-signups-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "desert_signups" }, (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const wk = payload.new.week_start;
            if (!isLiveSignupWeek("desert", wk)) return;
            setDsSignupsState(prev => [...prev.filter(s => !(String(s.userId) === String(payload.new.member_id) && s.week === wk)), mapSignup(payload.new)]);
          }
          if (payload.eventType === "DELETE") setDsSignupsState(prev => prev.filter(s => !(String(s.userId) === String(payload.old.member_id) && s.week === payload.old.week_start)));
        }).subscribe(),

      supabase.channel("battle-teams-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "battle_teams" }, () => refreshTeams())
        .subscribe(),

      supabase.channel("buddy-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "buddy_requests" }, (payload) => {
          if (payload.eventType === "INSERT" && !payload.new.dismissed) setBuddyRequestsState(prev => prev.some(r => r.id === payload.new.id) ? prev : [...prev, mapBuddyRequest(payload.new)]);
          if (payload.eventType === "UPDATE" && payload.new.dismissed) setBuddyRequestsState(prev => prev.filter(r => r.id !== payload.new.id));
          if (payload.eventType === "DELETE") setBuddyRequestsState(prev => prev.filter(r => r.id !== payload.old.id));
        }).subscribe(),

      supabase.channel("trains-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "trains" }, (payload) => {
          if (payload.eventType === "INSERT") setTrainsState(prev => [...prev.filter(t => t.id !== payload.new.id), mapTrain(payload.new)].sort((a,b) => a.date.localeCompare(b.date)));
          if (payload.eventType === "UPDATE") setTrainsState(prev => prev.map(t => t.id === payload.new.id ? mapTrain(payload.new) : t));
          if (payload.eventType === "DELETE") setTrainsState(prev => prev.filter(t => t.id !== payload.old.id));
        }).subscribe(),

      supabase.channel("train-goals-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "train_goals" }, (payload) => {
          if (payload.eventType === "INSERT") setTrainGoalsState(prev => [{ id: payload.new.id, weekStart: payload.new.week_start, goal: payload.new.goal }, ...prev.filter(g => g.id !== payload.new.id)]);
          if (payload.eventType === "UPDATE") setTrainGoalsState(prev => prev.map(g => g.id === payload.new.id ? { ...g, goal: payload.new.goal } : g));
        }).subscribe(),

      supabase.channel("storm-settings-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "storm_settings" }, (payload) => {
          if (payload.new) {
            setStormSettings(prev => ({ ...prev, [payload.new.type]: payload.new.signups_open, [`${payload.new.type}_active`]: payload.new.season_active ?? true }));
          }
        }).subscribe(),

      // Weekly VS goal (shared for everyone)
      supabase.channel("app-settings-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, (payload) => {
          if (payload.new?.key === "vs_mode" && payload.new.value) setVsModeState(payload.new.value);
          if (payload.new?.key?.startsWith("battle_plan_")) {
            const type = payload.new.key.replace("battle_plan_", "");
            let plan = null; try { plan = payload.new.value ? JSON.parse(payload.new.value) : null; } catch {}
            setBattlePlans(prev => ({ ...prev, [type]: plan }));
          }
          const cfgMatch = /^storm_config_(canyon|desert)$/.exec(payload.new?.key || "");
          if (cfgMatch) {
            try { const parsed = JSON.parse(payload.new.value); setStormConfig(prev => ({ ...prev, [cfgMatch[1]]: { ...DEFAULT_STORM_CONFIG[cfgMatch[1]], ...parsed } })); } catch {}
          }
        }).subscribe(),
    ];

    return () => { subs.forEach(s => supabase.removeChannel(s)); };
  }, []);

  // ── Re-fetch current-week signups (used when the UTC day changes or the tab regains focus)
  const refreshSignups = async () => {
    const [{ data: csData }, { data: dsData }] = await Promise.all([
      supabase.from("canyon_signups").select("*").in("week_start", [getSignupWeek("canyon"), getNextSignupWeek("canyon")]).order("updated_at", { ascending: false }),
      supabase.from("desert_signups").select("*").in("week_start", [getSignupWeek("desert"), getNextSignupWeek("desert")]).order("updated_at", { ascending: false }),
    ]);
    if (csData) setCsSignupsState(dedupeLiveWeeks(csData, "canyon"));
    if (dsData) setDsSignupsState(dedupeLiveWeeks(dsData, "desert"));
  };

  // ── Re-fetch saved storm teams so members see new assignments without refreshing.
  // Only replaces state when something actually changed (so an R4's unsaved edits aren't disturbed).
  const refreshTeams = async () => {
    const { data } = await supabase.from("battle_teams").select("*");
    if (!data) return;
    const cs = {}; const ds = {};
    data.forEach(t => {
      const val = { timeA: t.time_a, timeB: t.time_b, ...(t.team_data || {}) };
      if (t.type === "canyon") cs[t.battle_date] = val; else ds[t.battle_date] = val;
    });
    setCsTeamsState(prev => JSON.stringify(prev) === JSON.stringify(cs) ? prev : cs);
    setDsTeamsState(prev => JSON.stringify(prev) === JSON.stringify(ds) ? prev : ds);
  };

  useEffect(() => {
    let lastDay = serverNow().getUTCDay();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") refreshTeams();
      const currentDay = serverNow().getUTCDay();
      if (currentDay === lastDay) return;
      lastDay = currentDay;
      refreshSignups();
    }, 60000);
    const onVisible = () => { if (document.visibilityState === "visible") { refreshSignups(); refreshTeams(); } };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  // ── Wrapped setters that sync to Supabase ────────────────────────────────
  const setMembers = async (updater) => {
    setMembersState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      next.forEach(async (m) => {
        const existing = prev.find(p => p.id === m.id);
        if (existing && JSON.stringify(existing) !== JSON.stringify(m)) {
          await supabase.from("members").update({
            username: m.username, password_hash: m.password, role: m.role,
            approved: m.approved, profession: m.profession, language: m.language,
            power: m.power,
            signup_count: m.signupCount, attendance_count: m.attendanceCount,
            disabled: m.disabled || false,
            ...(String(existing.buddy || "") !== String(m.buddy || "") ? { buddy_id: m.buddy || null } : {}),
          }).eq("id", m.id);
        }
      });
      prev.forEach(async (p) => {
        if (!next.find(n => n.id === p.id)) {
          await supabase.from("members").delete().eq("id", p.id);
        }
      });
      return next;
    });
  };

  const setVsMode = async (next) => {
    const prevMode = vsMode;
    setVsModeState(next);
    const { error } = await supabase.from("app_settings").upsert({ key: "vs_mode", value: next, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) { setVsModeState(prevMode); showToast("⚠️ " + tr("Couldn't save the VS goal — try again.")); return false; }
    return true;
  };

  // plan = { phases: [{ time, color, steps: [] }], notes: [], map: dataURL | null } — or null to go back to the default plan
  const saveBattlePlan = async (type, plan) => {
    const { error } = await supabase.from("app_settings").upsert({ key: `battle_plan_${type}`, value: plan ? JSON.stringify(plan) : null, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) { console.error("[battle plan save]", error); showToast("⚠️ " + tr("Couldn't save the battle plan — try again.")); return false; }
    setBattlePlans(prev => ({ ...prev, [type]: plan }));
    return true;
  };

  // Remove a buddy pairing on BOTH members
  const unpairBuddy = async (memberId, { silent = false } = {}) => {
    const m = members.find(x => String(x.id) === String(memberId));
    const buddyId = m?.buddy;
    if (!buddyId) return true;
    const ids = [memberId, buddyId];
    const { error } = await supabase.from("members").update({ buddy_id: null }).in("id", ids);
    if (error) { console.error("[unpair buddy]", error); showToast("⚠️ " + tr("Couldn't remove the buddy pairing — try again.")); return false; }
    const hit = (id) => ids.some(x => String(x) === String(id));
    setMembersState(prev => prev.map(mb => hit(mb.id) ? { ...mb, buddy: null } : mb));
    setUser(prev => prev && hit(prev.id) ? { ...prev, buddy: null } : prev);
    if (!silent) showToast(tr("Buddy pairing removed"));
    return true;
  };

  // Change a member's profession (removes their buddy pairing first, since buddies are Engineer + War Leader)
  const changeProfession = async (memberId, profession) => {
    const m = members.find(x => String(x.id) === String(memberId));
    if (!m || m.profession === profession) return true;
    const hadBuddy = !!m.buddy;
    if (hadBuddy && !(await unpairBuddy(memberId, { silent: true }))) return false;
    const { error } = await supabase.from("members").update({ profession }).eq("id", memberId);
    if (error) { console.error("[change profession]", error); showToast("⚠️ " + tr("Couldn't change profession — try again.")); return false; }
    setMembersState(prev => prev.map(mb => String(mb.id) === String(memberId) ? { ...mb, profession } : mb));
    setUser(prev => prev && String(prev.id) === String(memberId) ? { ...prev, profession } : prev);
    showToast(tr(hadBuddy ? "Profession set to {p} — buddy pairing removed" : "Profession set to {p}", { p: profession === "engineer" ? "🔧 " + tr("Engineer") : "⚔️ " + tr("War Leader") }));
    return true;
  };

  // Buddy requests: removing one from the list marks it dismissed in the database
  const setBuddyRequests = (updater) => {
    setBuddyRequestsState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      prev.forEach(async (r) => {
        if (!next.find(n => n.id === r.id)) await supabase.from("buddy_requests").update({ dismissed: true }).eq("id", r.id);
      });
      return next;
    });
  };

  // Storm settings (sign-up times, spots per assignment) shared through app_settings
  const saveStormConfig = async (type, patch) => {
    const next = { ...stormConfig[type], ...patch };
    setStormConfig(prev => ({ ...prev, [type]: next }));
    const { error } = await supabase.from("app_settings")
      .upsert({ key: `storm_config_${type}`, value: JSON.stringify(next), updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) { console.error("[storm settings save error]", error); showToast("⚠️ " + tr("Settings didn't save — please try again.")); return false; }
    return true;
  };

  // Signup count = number of distinct battles a member signed up for (Canyon + Desert).
  // Recounted from the real rows after every save/cancel, so it can't drift or double-count.
  const recountSignupCount = async (userId) => {
    const [{ data: cs, error: e1 }, { data: ds, error: e2 }] = await Promise.all([
      supabase.from("canyon_signups").select("week_start").eq("member_id", userId),
      supabase.from("desert_signups").select("week_start").eq("member_id", userId),
    ]);
    if (e1 || e2) return;
    const total = new Set((cs || []).map(r => toBattleKey(r.week_start, "canyon"))).size
                + new Set((ds || []).map(r => toBattleKey(r.week_start, "desert"))).size;
    await supabase.from("members").update({ signup_count: total }).eq("id", userId);
    setMembersState(m => m.map(mb => String(mb.id) === String(userId) ? { ...mb, signupCount: total } : mb));
  };

  const makeSignupSetter = (table, setState) => (updater) => {
    setState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      next.forEach(async (s) => {
        const old = prev.find(p => String(p.userId) === String(s.userId) && p.week === s.week);
        const changed = !old || old.power !== s.power || old.squadType !== s.squadType || old.availability !== s.availability || old.timePreference !== s.timePreference || old.canFlexTime !== s.canFlexTime;
        if (!changed) return;
        const { error: upsertErr } = await supabase.from(table).upsert({
          member_id: s.userId, week_start: s.week, battle_date: s.week,
          power: s.power, squad_type: s.squadType, availability: s.availability,
          time_preference: s.timePreference, can_flex_time: s.canFlexTime || null, updated_at: new Date(),
        }, { onConflict: "member_id,week_start" });
        if (upsertErr) { console.error(`[${table} error]`, upsertErr); showToast("⚠️ " + tr("Sign-up failed to save — please try again.")); return; }
        recountSignupCount(s.userId);
        if (s.power) {
          const units = Math.round(parseFloat(s.power) * 1000000);
          if (!isNaN(units)) {
            await supabase.from("members").update({ power: units }).eq("id", s.userId);
            setMembersState(m => m.map(mb => String(mb.id) === String(s.userId) ? { ...mb, power: units } : mb));
          }
        }
      });
      if (next.length < prev.length) {
        prev.forEach(async (p) => {
          if (!next.find(n => String(n.userId) === String(p.userId) && n.week === p.week)) {
            await supabase.from(table).delete().eq("member_id", p.userId).eq("week_start", p.week);
            recountSignupCount(p.userId);
          }
        });
      }
      return next;
    });
  };
  const setCsSignups = makeSignupSetter("canyon_signups", setCsSignupsState);
  const setDsSignups = makeSignupSetter("desert_signups", setDsSignupsState);

  const makeTeamsSetter = (type, setState) => (updater) => {
    setState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      Object.entries(next).forEach(async ([date, data]) => {
        if (prev[date] && JSON.stringify(prev[date]) === JSON.stringify(data)) return;
        const { error } = await supabase.from("battle_teams").upsert({
          type, battle_date: date, week_start: date,
          time_a: data.timeA, time_b: data.timeB, team_data: data, updated_at: new Date(),
        }, { onConflict: "type,battle_date" });
        if (error) { console.error("[battle_teams error]", error); showToast("⚠️ " + tr("Teams failed to save — please try again.")); }
      });
      return next;
    });
  };
  const setCsTeams = makeTeamsSetter("canyon", setCsTeamsState);
  const setDsTeams = makeTeamsSetter("desert", setDsTeamsState);

  // Missing keys fall back to English; tr() reads the same language
  setI18nLang(lang);
  const t = { ...T.en, ...(T[lang] || {}) };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const login = async (username, password) => {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .ilike("username", username)
      .eq("password_hash", password)
      .maybeSingle();
    if (data && !error) {
      const mapped = mapMember(data);
      setLang(mapped.language || "en");
      setUser(mapped);
      try { localStorage.setItem("wild_session", JSON.stringify({ userId: mapped.id, language: mapped.language })); } catch {}
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setPage("home");
    try { localStorage.removeItem("wild_session"); } catch {}
  };

  if (showSplash) return (
    <>
      <style>{css}</style>
      <SplashScreen onDone={() => setShowSplash(false)} />
    </>
  );

  if (loading) return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" />
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--gold)", marginTop: 16, letterSpacing: 2 }}>{tr("Loading WiLD Hub...")}</div>
        </div>
      </div>
    </>
  );

  if (!user) return (
    <>
      <style>{css}</style>
      <AuthPage onLogin={login} members={members} setMembers={setMembers} t={t} setLang={setLang} />
    </>
  );

  const isR4 = user.role === "r4" || user.role === "admin";
  const isAdmin = user.role === "admin";

  // Block unapproved users completely
  if (!user.approved) return (
    <>
      <style>{css}</style>
      <div className="app-shell">
        <TopBar user={user} t={t} onLogout={logout} setPage={setPage} darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="main-content">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>⏳</div>
            <div className="section-title" style={{ fontSize: 26, marginBottom: 12 }}>{tr("Pending Approval")}</div>
            <div style={{ fontSize: 15, color: "var(--text-mid)", marginBottom: 8, lineHeight: 1.6 }}>
              {tr("Your account is waiting for approval from an R4 or Admin.")}
            </div>
            <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 32 }}>
              {tr("You'll have full access once approved. Please check back soon!")}
            </div>
            <button className="btn btn-secondary" onClick={logout}>{t.logout}</button>
          </div>
        </main>
      </div>
    </>
  );

  return (
    <StormConfigContext.Provider value={{ config: stormConfig, save: saveStormConfig, plans: battlePlans, savePlan: saveBattlePlan }}>
    <BuddyActionsContext.Provider value={{ unpairBuddy, changeProfession, isR4 }}>
      <style>{css}</style>
      <div className="app-shell">
        <TopBar user={user} t={t} onLogout={logout} setPage={setPage} darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="main-content">
          {page === "home" && <InstallBanner />}
          {page === "home" && <HomePage user={user} members={members} buddyRequests={buddyRequests} setBuddyRequestsState={setBuddyRequestsState} csSignups={csSignups} dsSignups={dsSignups} csTeams={csTeams} dsTeams={dsTeams} setCsSignups={setCsSignups} setDsSignups={setDsSignups} t={t} showToast={showToast} setPage={setPage} vsMode={vsMode} setVsMode={setVsMode} isR4={isR4} trains={trains} stormSettings={stormSettings} />}
          {page === "trains" && <TrainsPage user={user} trains={trains} trainGoals={trainGoals} members={members} />}
          {page === "battle" && <BattlePlansPage user={user} csTeams={csTeams} dsTeams={dsTeams} t={t} stormSettings={stormSettings} isR4={isR4} battlePlans={battlePlans} saveBattlePlan={saveBattlePlan} showToast={showToast} />}
          {page === "profile" && <ProfilePage user={user} setUser={setUser} members={members} setMembers={setMembers} t={t} setLang={setLang} showToast={showToast} csTeams={csTeams} dsTeams={dsTeams} csSignups={csAllSignups} dsSignups={dsAllSignups} />}
          {page === "admin" && isR4 && <AdminPage buddyRequests={buddyRequests} setBuddyRequests={setBuddyRequests} setViewMember={setViewMember} csAllSignups={csAllSignups} dsAllSignups={dsAllSignups} user={user} members={members} setMembers={setMembers} csSignups={csSignups} dsSignups={dsSignups} setCsSignups={setCsSignups} setDsSignups={setDsSignups} csTeams={csTeams} setCsTeams={setCsTeams} dsTeams={dsTeams} setDsTeams={setDsTeams} trains={trains} trainGoals={trainGoals} t={t} showToast={showToast} isAdmin={isAdmin} stormSettings={stormSettings} setStormSettings={setStormSettings} />}
          {page === "calculators" && <CalculatorsPage />}
        </main>
        <BottomNav page={page} setPage={setPage} t={t} isR4={isR4} members={members} buddyRequests={buddyRequests} />
        {toast && <div className="toast">{toast}</div>}
        <UpdateBanner />
        {viewMember && <MemberCard member={viewMember} members={members} csTeams={csTeams} dsTeams={dsTeams} csSignups={csAllSignups} dsSignups={dsAllSignups} allDsHistory={dsAllSignups} onClose={() => setViewMember(null)} />}
      </div>
    </BuddyActionsContext.Provider>
    </StormConfigContext.Provider>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ onLogin, members, setMembers, t, setLang }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "", confirm: "", secQ: SECURITY_QUESTIONS[0], secA: "", profession: "engineer", language: "en" });
  const [error, setError] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryUser, setRecoveryUser] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!form.username || !form.password) { setError(tr("Please fill all fields.")); return; }
    setError(""); setSubmitting(true);
    try {
      const ok = await onLogin(form.username, form.password);
      if (!ok) setError(tr("Invalid username or password."));
    } catch (err) {
      setError(tr("Connection error. Please check your internet and try again."));
    }
    setSubmitting(false);
  };

  const handleSignup = async () => {
    if (!form.username || !form.password || !form.confirm || !form.secA) { setError(tr("Please fill all fields.")); return; }
    if (form.password !== form.confirm) { setError(tr("Passwords do not match.")); return; }
    setSubmitting(true);
    try {
    const { data: existing } = await supabase.from("members").select("id").ilike("username", form.username).maybeSingle();
    if (existing) { setError(tr("Username already taken.")); setSubmitting(false); return; }
    // Admin switch: when "require_approval" is on, new accounts wait for approval
    const { data: approvalSetting } = await supabase.from("app_settings").select("value").eq("key", "require_approval").maybeSingle();
    const needsApproval = approvalSetting?.value === "true";
    const { error } = await supabase.from("members").insert({
      member_code: generateMemberId(),
      username: form.username,
      password_hash: form.password,
      role: "member",
      approved: !needsApproval,
      profession: form.profession,
      language: form.language,
      power: 0,
      security_question: form.secQ,
      security_answer: form.secA.toLowerCase(),
      signup_count: 0,
      attendance_count: 0,
    });
    if (error) { setError(tr("Error creating account. Please try again.")); setSubmitting(false); return; }
    setError(""); setMode("login");
    setForm(f => ({ ...f, username: form.username, password: "" }));
    } catch (err) {
      setError(tr("Connection error. Please check your internet and try again."));
    }
    setSubmitting(false);
  };

  const handleRecovery = () => {
    const found = members.find(m => m.username.toLowerCase() === form.username.toLowerCase());
    if (!found) { setError(tr("Username not found.")); return; }
    setRecoveryUser(found); setRecoveryStep(2); setError("");
  };

  const handleRecoveryAnswer = () => {
    if (form.secA.toLowerCase() !== recoveryUser.securityA) { setError(tr("Incorrect answer.")); return; }
    setRecoveryStep(3); setError("");
  };

  const handleNewPassword = () => {
    if (!form.password || form.password !== form.confirm) { setError(tr("Passwords do not match.")); return; }
    setMembers(m => m.map(mb => mb.id === recoveryUser.id ? { ...mb, password: form.password } : mb));
    setRecovery(false); setRecoveryStep(1); setMode("login"); setError("");
  };

  if (recovery) return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><img src={WORDMARK_SRC} alt="WiLD" /><h1>HUB</h1></div>
        {recoveryStep === 1 && <>
          <div className="form-group"><label className="form-label">{t.username}</label><input className="form-input" value={form.username} onChange={e => set("username", e.target.value)} placeholder={tr("Your username")} /></div>
          {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary btn-full" onClick={handleRecovery}>{t.recover}</button>
        </>}
        {recoveryStep === 2 && recoveryUser && <>
          <p style={{ marginBottom: 16, fontSize: 14, color: "var(--text-mid)" }}>{tr("Security question")}: <strong>{tr(recoveryUser.securityQ)}</strong></p>
          <div className="form-group"><label className="form-label">{t.securityAnswer}</label><input className="form-input" value={form.secA} onChange={e => set("secA", e.target.value)} /></div>
          {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary btn-full" onClick={handleRecoveryAnswer}>{tr("Verify")}</button>
        </>}
        {recoveryStep === 3 && <>
          <div className="form-group"><label className="form-label">{t.newPassword}</label><input className="form-input" type="password" value={form.password} onChange={e => set("password", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">{t.confirmPassword}</label><input className="form-input" type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} /></div>
          {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary btn-full" onClick={handleNewPassword}>{t.resetPassword}</button>
        </>}
        <button className="btn btn-ghost btn-full" style={{ marginTop: 12 }} onClick={() => { setRecovery(false); setRecoveryStep(1); setError(""); }}>← {tr("Back")}</button>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><img src={WORDMARK_SRC} alt="WiLD" /><h1>HUB</h1></div>
        <div className="tabs" style={{ marginBottom: 24 }}>
          <button className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>{t.signIn}</button>
          <button className={`tab ${mode === "signup" ? "active" : ""}`} onClick={() => { setMode("signup"); setError(""); }}>{t.createAccount}</button>
        </div>
        <div className="form-group"><label className="form-label">{t.username}</label><input className="form-input" value={form.username} onChange={e => set("username", e.target.value)} placeholder={tr("YourGameName")} /></div>
        <div className="form-group"><label className="form-label">{t.password}</label><input className="form-input" type="password" value={form.password} onChange={e => set("password", e.target.value)} /></div>
        {mode === "signup" && <>
          <div className="form-group"><label className="form-label">{t.confirmPassword}</label><input className="form-input" type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">{t.profession}</label><select className="form-input form-select" value={form.profession} onChange={e => set("profession", e.target.value)}><option value="engineer">{t.engineer}</option><option value="warLeader">{t.warLeader}</option></select></div>
          <div className="form-group"><label className="form-label">{t.language}</label><select className="form-input form-select" value={form.language} onChange={e => { set("language", e.target.value); setLang(e.target.value); }}>{LANGUAGE_OPTIONS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">{t.securityQuestion}</label><select className="form-input form-select" value={form.secQ} onChange={e => set("secQ", e.target.value)}>{SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{tr(q)}</option>)}</select></div>
          <div className="form-group"><label className="form-label">{t.securityAnswer}</label><input className="form-input" value={form.secA} onChange={e => set("secA", e.target.value)} /></div>
        </>}
        {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary btn-full" onClick={mode === "login" ? handleLogin : handleSignup} disabled={submitting}>
          {submitting ? tr("Please wait...") : mode === "login" ? t.signIn : t.createAccount}
        </button>
        {mode === "login" && <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => { setRecovery(true); setError(""); }}>{t.forgotPassword}</button>}
      </div>
    </div>
  );
}
// ─── AUTO UPDATE ──────────────────────────────────────────────────────────────
// Every deploy writes /version.json. The app checks it every few minutes and whenever it's reopened.
// When a new version is out: if the app was in the background it reloads straight away when reopened;
// if someone is using it, a banner shows and it refreshes itself after a short countdown —
// but never while they're typing or have a pop-up open.
const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";
const UPDATE_CHECK_MS = 3 * 60 * 1000;
const UPDATE_IDLE_MS = 2 * 60 * 1000; // auto-refresh once nobody has touched the app for this long

function UpdateBanner() {
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    if (APP_VERSION === "dev") return;
    const busy = () => !!document.querySelector(".modal-overlay") ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
    const check = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const { version } = await res.json();
        if (version && version !== APP_VERSION) { readyRef.current = true; setReady(true); }
      } catch {}
    };
    // Coming back to the app/tab — load the new version straight away (unless a form is open)
    const onVisible = async () => {
      if (document.visibilityState !== "visible") return;
      await check();
      if (readyRef.current && !busy()) window.location.reload();
    };
    // Remember the last time someone tapped, typed or scrolled
    const touch = () => { lastActivity.current = Date.now(); };
    const activity = ["pointerdown", "keydown", "scroll", "wheel", "touchstart"];
    activity.forEach(ev => window.addEventListener(ev, touch, { passive: true }));
    // Update waiting + nobody has touched the app for 2 minutes + no pop-up/form open → refresh
    const idle = setInterval(() => {
      if (readyRef.current && Date.now() - lastActivity.current >= UPDATE_IDLE_MS && !busy()) window.location.reload();
    }, 30000);
    check();
    const id = setInterval(check, UPDATE_CHECK_MS);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id); clearInterval(idle);
      activity.forEach(ev => window.removeEventListener(ev, touch));
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!ready) return null;
  return (
    <div className="update-banner" role="status">
      <span>🔄 {tr("WiLD Hub was updated")}</span>
      <button className="btn btn-sm btn-primary" onClick={() => window.location.reload()}>{tr("Update")}</button>
    </div>
  );
}

// ─── ADD TO HOME SCREEN BANNER ────────────────────────────────────────────────
function InstallBanner() {
  const isStandalone = typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  const [canPrompt, setCanPrompt] = useState(() => !!window.__wildInstallPrompt);
  const [dismissed, setDismissed] = useState(() => { try { return localStorage.getItem("wild_install_dismissed") === "1"; } catch { return false; } });
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const onAvail = () => setCanPrompt(true);
    const onInstalled = () => { window.__wildInstallPrompt = null; setCanPrompt(false); setDismissed(true); };
    window.addEventListener("wild-install-available", onAvail);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("wild-install-available", onAvail); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (isStandalone || dismissed) return null;
  if (!canPrompt && !isIOS) return null; // browser can't install (e.g. desktop Firefox) — don't nag

  const dismiss = () => { setDismissed(true); try { localStorage.setItem("wild_install_dismissed", "1"); } catch {} };
  const install = async () => {
    const ev = window.__wildInstallPrompt;
    if (ev) {
      ev.prompt();
      const choice = await ev.userChoice.catch(() => null);
      window.__wildInstallPrompt = null; setCanPrompt(false);
      if (choice?.outcome === "accepted") dismiss();
    } else if (showSteps) {
      dismiss();
    } else {
      setShowSteps(true);
    }
  };

  return (
    <div className="install-card">
      <img src={LOGO_SRC} alt="" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{tr("Add WiLD Hub to your home screen")}</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{tr("Opens full-screen like a real app.")}</div>
        {showSteps && (
          <ol style={{ fontSize: 13, color: "var(--text-mid)", margin: "8px 0 0 18px", lineHeight: 1.6 }}>
            <li>{trRich("Tap the <b>Share</b> button (□↑) in Safari")}</li>
            <li>{trRich("Scroll down and tap <b>Add to Home Screen</b>")}</li>
            <li>{trRich("Tap <b>Add</b>")}</li>
          </ol>
        )}
        <div className="row" style={{ gap: 8, marginTop: 10 }}>
          <button className="btn btn-sm btn-primary" onClick={install}>{canPrompt ? "📲 " + tr("Install") : showSteps ? tr("Got it") : "📲 " + tr("Show me how")}</button>
          <button className="btn btn-sm btn-ghost" onClick={dismiss}>{tr("Not now")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
const isStandaloneApp = () => typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);

function GetAppModal({ onClose }) {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  const [canPrompt, setCanPrompt] = useState(() => !!window.__wildInstallPrompt);
  const install = async () => {
    const ev = window.__wildInstallPrompt;
    if (!ev) return;
    ev.prompt();
    await ev.userChoice.catch(() => null);
    window.__wildInstallPrompt = null; setCanPrompt(false); onClose();
  };
  const steps = isIOS
    ? [trRich("Tap the <b>Share</b> button (□↑) in Safari"), trRich("Scroll down and tap <b>Add to Home Screen</b>"), trRich("Tap <b>Add</b>")]
    : [trRich("Tap Chrome's <b>⋮</b> menu (top right)"), trRich("Tap <b>Install app</b> or <b>Add to Home screen</b>"), trRich("Tap <b>Install</b>")];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div className="modal-title">📲 {tr("Get the WiLD Hub app")}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label={tr("Close")}>✕</button>
        </div>
        <div className="modal-body">
          {canPrompt ? (
            <button className="btn btn-primary btn-full" onClick={install}>📲 {tr("Install WiLD Hub")}</button>
          ) : (<>
            <ol style={{ fontSize: 14, color: "var(--text-mid)", margin: "0 0 0 18px", lineHeight: 1.8 }}>
              {steps.map((st, i) => <li key={i}>{st}</li>)}
            </ol>
            {!isIOS && <div className="form-hint" style={{ marginTop: 10 }}>{tr("If you uninstalled the app recently, Chrome can take a while before it offers Install again — the ⋮ menu option still works.")}</div>}
          </>)}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{tr("Close")}</button>
        </div>
      </div>
    </div>
  );
}

function TopBar({ user, t, onLogout, setPage, darkMode, setDarkMode }) {
  const [getApp, setGetApp] = useState(false);
  const showGetApp = !isStandaloneApp();
  return (
    <div className="top-bar">
      <button className="top-bar-logo" onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 8 }}>
        <img className="wordmark" src={WORDMARK_SRC} alt="WiLD" />
        <span className="hub-tag">HUB</span>
      </button>
      <div className="top-bar-user">
        <button onClick={() => setDarkMode(d => !d)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 4px", fontSize: 18, lineHeight: 1, color: "var(--text-mid)" }} title={darkMode ? tr("Light mode") : tr("Dark mode")}>
          {darkMode ? "☀️" : "🌙"}
        </button>
        <button onClick={() => setPage("profile")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 8 }} title={t.profile}>
          <span className="top-bar-name" style={{ fontSize: 13, color: "var(--gold)", textDecoration: "underline", fontWeight: 600 }}>{user.username}</span>
          <div className="avatar">{user.username[0].toUpperCase()}</div>
        </button>
        {showGetApp && <button onClick={() => setGetApp(true)} title={tr("Get the app")} aria-label={tr("Get the app")} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 4px", fontSize: 18, lineHeight: 1 }}>📲</button>}
        <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ padding: "6px 8px", fontSize: 12, whiteSpace: "nowrap" }}>{t.logout}</button>
      </div>
      {getApp && <GetAppModal onClose={() => setGetApp(false)} />}
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ page, setPage, t, isR4, members, buddyRequests }) {
  const hasAdminAlert = isR4 && (members.some(m => !m.approved) || (buddyRequests || []).length > 0);
  const items = [
    { id: "home", label: t.home, icon: "🏠" },
    { id: "trains", label: tr("Trains"), icon: "🚂" },
    { id: "battle", label: t.plans, icon: "⚔️" },
    { id: "calculators", label: tr("Calculators"), icon: "🖩" },
    ...(isR4 ? [{ id: "admin", label: t.admin, icon: "⚙️", alert: hasAdminAlert }] : []),
  ];
  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)} style={{ position: "relative" }}>
          {item.id === "calculators" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <rect x="7" y="5" width="10" height="4" rx="1" fill="currentColor" stroke="none"/>
              <circle cx="8" cy="13" r="1" fill="currentColor" stroke="none"/>
              <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none"/>
              <circle cx="16" cy="13" r="1" fill="currentColor" stroke="none"/>
              <circle cx="8" cy="17" r="1" fill="currentColor" stroke="none"/>
              <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>
              <circle cx="16" cy="17" r="1" fill="currentColor" stroke="none"/>
            </svg>
          ) : (
            <span style={{ fontSize: 20 }}>{item.icon}</span>
          )}
          {item.alert && <span style={{ position: "absolute", top: 6, right: "calc(50% - 10px)", width: 8, height: 8, borderRadius: "50%", background: "#E53935", border: "1.5px solid var(--surface)" }} />}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ user, members, buddyRequests, setBuddyRequestsState, csSignups, dsSignups, csTeams, dsTeams, setCsSignups, setDsSignups, t, showToast, setPage, vsMode, setVsMode, isR4, trains, stormSettings }) {
  const [signupModal, setSignupModal] = useState(null);
  const [buddyModal, setBuddyModal] = useState(false);
  const [profModal, setProfModal] = useState(false);
  const me = (members || []).find(m => String(m.id) === String(user.id)) || user;
  const buddy = me.buddy ? (members || []).find(m => String(m.id) === String(me.buddy)) : null;
  const buddyPending = (buddyRequests || []).some(r => String(r.memberId) === String(user.memberId));

  // On battle day, new sign-ups go to NEXT battle — today's sign-up stays put for today's teams
  const myCS = csSignups.find(s => String(s.userId) === String(user.id) && s.week === getNextSignupWeek("canyon"));
  const myDS = dsSignups.find(s => String(s.userId) === String(user.id) && s.week === getNextSignupWeek("desert"));

  return (
    <div>
      {/* Weekly VS Goal */}
      <div style={{ marginBottom: 20 }}>
        <div className="vs-card">
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--text-dim)", marginBottom: 2 }}>{tr("Weekly Goal")}</div>
            <div className="vs-mode">
              VS: <span style={{ color: "var(--gold)" }}>{vsMode}</span>
            </div>
          </div>
          {isR4 && (
            <button
              className="btn btn-sm btn-secondary"
              style={{ fontSize: 12 }}
              onClick={async () => {
                const next = vsMode === "PUSH" ? "SAVE" : "PUSH";
                const ok = await setVsMode(next);
                if (ok) showToast(tr("Weekly goal set to VS: {mode}", { mode: next }));
              }}>
              {tr("Switch to {mode}", { mode: vsMode === "PUSH" ? "SAVE" : "PUSH" })}
            </button>
          )}
        </div>
      </div>

      {/* My Train */}
      {(() => {
        const todayStr = serverToday();
        const myTrains = trains.filter(trn => {
          const isUpcoming = trn.date >= todayStr;
          const isMe = String(trn.conductorId) === String(user.id) || String(trn.guardianId) === String(user.id);
          return isUpcoming && isMe;
        }).sort((a,b) => a.date.localeCompare(b.date));
        const next = myTrains[0];
        if (!next) return null;
        const role = String(next.conductorId) === String(user.id) ? tr("Conductor") + " 🚂" : tr("Guardian") + " 🛡️";
        const trainDt = parseTrainTime(next.date, next.time);
        const friendlyDate = next.date ? new Date(next.date + "T12:00:00Z").toLocaleDateString(dateLocale(), { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }) : next.date;
        return (
          <div style={{ marginBottom: 20 }}>
            <div className="train-card" style={{ cursor: "pointer" }} onClick={() => setPage("trains")}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🚂 {tr("Your Next Train")}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>{friendlyDate}{next.time ? <span style={{ color: "var(--text-mid)", fontWeight: 400 }}> — {next.time} {tr("server time")}</span> : ""}</div>
              <div style={{ fontSize: 13, color: "var(--text-mid)", marginTop: 2 }}>{tr("Role")}: <strong style={{ color: "var(--text)" }}>{role}</strong></div>
              {trainDt && <TrainCountdown target={trainDt} />}
            </div>
          </div>
        );
      })()}

      {/* Buddy */}
      <div style={{ marginBottom: 20 }}>
        {buddy ? (
          <div className="buddy-card" role="button" tabIndex={0} style={{ cursor: "pointer" }}
            onClick={() => setProfModal(true)} onKeyDown={e => { if (e.key === "Enter") setProfModal(true); }}>
            <div className="buddy-icon">🤝</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{t.myBuddy}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className={buddy.profession === "engineer" ? "name-engineer" : "name-warleader"}>{buddy.username}</div>
            </div>
            <span style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600, flexShrink: 0 }}>{tr("Manage")} ›</span>
          </div>
        ) : (
          <div className="buddy-card" style={{ background: "var(--surface2)", border: "1.5px dashed var(--border)" }}>
            <div className="buddy-icon" style={{ background: "var(--border)", color: "var(--text-dim)" }}>🤝</div>
            <div>
              {buddyPending ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>⏳ {tr("Request Pending")}</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{tr("Leadership will pair you soon")}</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-mid)" }}>{t.noBuddy}</div>
                  <button className="btn btn-sm btn-purple" style={{ marginTop: 8 }} onClick={() => setBuddyModal(true)}>{t.requestBuddy}</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Battle Assignment Badges */}
      {(() => {
        const getAssignment = (teamsObj, type) => {
          const battleKey = getSignupWeek(type);
          const data = teamsObj[battleKey];
          if (!data) return null;
          for (const teamKey of ["teamA", "teamB"]) {
            const teamArr = data[teamKey] || [];
            if (teamArr.length > 0 && teamArr[0]?.userId !== undefined) {
              const found = teamArr.find(m => String(m.userId) === String(user.id));
              if (found) {
                const sd = (data.slotData || {})[found.userId] || {};
                return {
                  team: teamKey === "teamA" ? "A" : "B",
                  slot: sd.slot || null,
                  role: sd.role || null,
                  time: teamKey === "teamA" ? data.timeA : data.timeB,
                  date: battleKey,
                };
              }
            }
          }
          return null;
        };
        const canyonSeasonActive = stormSettings?.canyon_active ?? true;
        const csAssign = (canyonSeasonActive || isR4) ? getAssignment(csTeams, "canyon") : null;
        const dsAssign = getAssignment(dsTeams, "desert");
        if (!csAssign && !dsAssign) return null;
        const shortSlot = (sl) => !sl ? "" : sl === "Floater" ? "Flt" : sl.replace(/^Team\s*/i, "T");
        const shortDate = (d) => new Date(d + "T12:00:00Z").toLocaleDateString(dateLocale(), { month: "short", day: "numeric", timeZone: "UTC" });
        if (csAssign && dsAssign) return (
          <div style={{ marginBottom: 20 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>{tr("Storm Assignments")}</h2>
            <div className="assign-row">
              {[{ ...csAssign, name: "CANYON", type: "canyon" }, { ...dsAssign, name: "DESERT", type: "desert" }].map(a => (
                <div key={a.type} className="assign-mini" role="button" tabIndex={0} onClick={() => setPage("battle")} onKeyDown={e => { if (e.key === "Enter") setPage("battle"); }}>
                  <div className="assign-mini-l1"><span aria-hidden="true">{a.team === "A" ? "🅰️" : "🅱️"}</span>{a.name}</div>
                  <div className="assign-mini-l2">{tr("Team")} {a.team}{a.slot ? ` • ${shortSlot(a.slot)}` : ""}{a.role ? <span className="assign-mini-role"> ({slotRoleLabel(a.role)})</span> : null}</div>
                  <div className="assign-mini-l3"><span>⏰ {a.time} · {shortDate(a.date)}</span><span className="assign-mini-view">{tr("View")} →</span></div>
                </div>
              ))}
            </div>
          </div>
        );
        return (
          <div style={{ marginBottom: 20 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>{tr("Storm Assignments")}</h2>
            {[csAssign && { ...csAssign, label: "🏔️ Canyon Storm", type: "canyon" }, dsAssign && { ...dsAssign, label: "🏜️ Desert Storm", type: "desert" }]
              .filter(Boolean).map(a => (
              <div key={a.type} className="assign-card" onClick={() => setPage("battle")}>
                <div className="assign-icon">{a.team === "A" ? "🅰️" : "🅱️"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{a.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>
                    {tr("Team")} {a.team}{a.slot ? ` • ${a.slot}` : ""}
                    {a.role && <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 400, marginLeft: 6 }}>({slotRoleLabel(a.role)})</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 2 }}>
                    ⏰ {a.time} {tr("server time")} • {new Date(a.date + "T12:00:00Z").toLocaleDateString(dateLocale(), { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>{tr("View")} →</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Sign-up Status */}
      <div style={{ marginBottom: 20 }}>
        <h2 className="section-title" style={{ marginBottom: 12 }}>{t.stormSignups}</h2>
        <SignupStatusCard type="canyon" label={t.canyonStorm} mySignup={myCS} isR4={isR4} isOpen={stormSettings?.canyon ?? false} isSeasonActive={stormSettings?.canyon_active ?? true} onSignup={() => setSignupModal("canyon")} onRevoke={() => { setCsSignups(s => s.filter(x => !(String(x.userId) === String(user.id) && x.week === myCS?.week))); showToast(tr("Registration revoked.")); }} t={t} />
        <SignupStatusCard type="desert" label={t.desertStorm} mySignup={myDS} isR4={isR4} isOpen={stormSettings?.desert ?? false} isSeasonActive={stormSettings?.desert_active ?? true} onSignup={() => setSignupModal("desert")} onRevoke={() => { setDsSignups(s => s.filter(x => !(String(x.userId) === String(user.id) && x.week === myDS?.week))); showToast(tr("Registration revoked.")); }} t={t} />
      </div>

      {/* Modals */}
      {profModal && <ProfessionBuddyModal member={me} members={members} self onClose={() => setProfModal(false)} />}
      {buddyModal && <BuddyRequestModal user={me} onClose={() => setBuddyModal(false)} showToast={showToast} t={t}
        onSuccess={(saved) => setBuddyRequestsState(prev => prev.some(r => r.id === saved.id) ? prev : [...prev, { id: saved.id, memberId: saved.member_id, profession: saved.profession, needBuddy: saved.need_buddy, buddyName: saved.buddy_name, submittedAt: new Date(saved.created_at) }])} />}
      {signupModal && <SignupModal type={signupModal} user={user} existing={signupModal === "canyon" ? myCS : myDS}
        lastSignup={null}
        onClose={() => setSignupModal(null)} showToast={showToast} onSave={(data) => {
        const weekStart = getNextSignupWeek(signupModal === "canyon" ? "canyon" : "desert");
        const notMine = x => !(String(x.userId) === String(user.id) && x.week === weekStart);
        if (signupModal === "canyon") {
          setCsSignups(s => [...s.filter(notMine), { ...data, userId: user.id, week: weekStart }]);
        } else {
          setDsSignups(s => [...s.filter(notMine), { ...data, userId: user.id, week: weekStart }]);
        }
        setSignupModal(null); showToast(tr("Registration saved! ✓"));
      }} t={t} isCanyon={signupModal === "canyon"} />}
    </div>
  );
}

// ─── PROFESSION / BUDDY POP-UP (shared) ───────────────────────────────────────
// self = the logged-in member managing themselves (wording says "your")
function ProfessionBuddyModal({ member, members, self, onClose }) {
  const { unpairBuddy, changeProfession } = useBuddyActions();
  const [busy, setBusy] = useState(false);
  const live = (members || []).find(m => String(m.id) === String(member?.id)) || member;
  if (!live) return null;
  const buddy = live.buddy ? (members || []).find(m => String(m.id) === String(live.buddy)) : null;
  
  const pick = async (profession) => {
    if (busy || live.profession === profession) return;
    if (buddy && !window.confirm(self ? tr("Changing your profession removes the buddy pairing with {buddy}. Continue?", { buddy: buddy.username }) : tr("Changing {name}'s profession removes the buddy pairing with {buddy}. Continue?", { name: live.username, buddy: buddy.username }))) return;
    setBusy(true); await changeProfession(live.id, profession); setBusy(false);
  };
  const remove = async () => {
    if (!buddy || busy) return;
    if (!window.confirm(tr("Remove the buddy pairing between {a} and {b}?", { a: live.username, b: buddy.username }))) return;
    setBusy(true); await unpairBuddy(live.id); setBusy(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 400 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <div className="modal-title">🤝 {self ? tr("Profession & Buddy") : live.username}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label={tr("Close")}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 14 }}>
            {buddy ? <>{tr("Buddy")}: <strong className={buddy.profession === "engineer" ? "name-engineer" : "name-warleader"}>{buddy.username}</strong></> : <span style={{ color: "var(--text-dim)" }}>{tr("No buddy assigned")}</span>}
          </div>
          <div className="form-label">{tr("Profession")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["engineer", "🔧 " + tr("Engineer")], ["warLeader", "⚔️ " + tr("War Leader")]].map(([val, label]) => (
              <button key={val} type="button" disabled={busy} onClick={() => pick(val)}
                className={`btn ${live.profession === val ? "btn-primary" : "btn-secondary"}`} aria-pressed={live.profession === val}>{label}</button>
            ))}
          </div>
          {buddy && (
            <button type="button" className="btn btn-danger btn-full" style={{ marginTop: 14 }} disabled={busy} onClick={remove}>{tr("Remove buddy")}</button>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>{tr("Done")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── BUDDY REQUEST MODAL ──────────────────────────────────────────────────────
function BuddyRequestModal({ user, onClose, onSuccess, showToast, t }) {
  const [needBuddy, setNeedBuddy] = useState(true);
  const [buddyName, setBuddyName] = useState("");
  const [btnState, setBtnState] = useState("idle"); // idle | loading | done

  const handleSubmit = async () => {
    if (btnState !== "idle") return;
    setBtnState("loading");
    const { data: saved, error } = await supabase.from("buddy_requests").insert({
      member_id: user.memberId,
      profession: user.profession,
      need_buddy: needBuddy,
      buddy_name: buddyName || null,
      dismissed: false,
    }).select().single();
    if (!error && saved) {
      if (onSuccess) onSuccess(saved);
      setBtnState("done");
    } else {
      showToast(tr("Error") + ": " + (error?.message || tr("Could not submit")));
      setBtnState("idle");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><div className="modal-title">🤝 {t.requestBuddy}</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>{tr("Your Profile")}</div>
            <div style={{ fontWeight: 700 }}>{user.username}</div>
            <div style={{ fontSize: 13, color: "var(--text-mid)" }}>{user.profession === "engineer" ? "🔧 " + t.engineer : "⚔️ " + t.warLeader}</div>
          </div>
          <div className="form-group">
            <label className="form-label">{tr("Buddy Status")}</label>
            <div className="radio-group">
              <div className={`radio-option ${needBuddy ? "selected" : ""}`} onClick={() => setNeedBuddy(true)}><div className="radio-dot"></div><span>{tr("I need a buddy")}</span></div>
              <div className={`radio-option ${!needBuddy ? "selected" : ""}`} onClick={() => setNeedBuddy(false)}><div className="radio-dot"></div><span>{tr("I have a buddy")}</span></div>
            </div>
          </div>
          {!needBuddy && <div className="form-group"><label className="form-label">{tr("Buddy's Username")}</label><input className="form-input" value={buddyName} onChange={e => setBuddyName(e.target.value)} placeholder={tr("Enter their in-game name")} /></div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{btnState === "done" ? tr("Close") : t.cancel}</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={btnState !== "idle"} style={btnState === "done" ? {background:"var(--green)",cursor:"default",opacity:1} : {}}>{btnState === "done" ? "✅ " + tr("Submitted!") : btnState === "loading" ? tr("Submitting...") : t.submit}</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN BUDDY ──────────────────────────────────────────────────────────────
function AdminBuddy({ members, setMembers, buddyRequests, setBuddyRequests, t, showToast }) {
  const { unpairBuddy } = useBuddyActions();
  const [profMember, setProfMember] = useState(null);
  const [eng, setEng] = useState("");
  const [wl, setWl] = useState("");
  const nameFor = (r) => members.find(m => String(m.memberId) === String(r.memberId) || String(m.id) === String(r.memberId))?.username || r.memberId;
  const pairedIds = new Set(members.filter(m => m.buddy).map(m => String(m.id)));
  const engineers = members.filter(m => m.approved && !m.disabled && m.profession === "engineer" && !pairedIds.has(String(m.id))).sort((a,b) => a.username.localeCompare(b.username));
  const warLeaders = members.filter(m => m.approved && !m.disabled && m.profession === "warLeader" && !pairedIds.has(String(m.id))).sort((a,b) => a.username.localeCompare(b.username));
  const pairs = members.filter(m => m.buddy && !m.disabled).reduce((acc, m) => {
    const buddy = members.find(b => String(b.id) === String(m.buddy) && !b.disabled);
    if (buddy && !acc.find(p => p.a.id === m.id || p.b.id === m.id)) acc.push({ a: m, b: buddy });
    return acc;
  }, []);

  const pairBuddies = async () => {
    if (!eng || !wl) { showToast(tr("Select both members.")); return; }
    const { error: e1 } = await supabase.from("members").update({ buddy_id: wl }).eq("id", eng);
    const { error: e2 } = await supabase.from("members").update({ buddy_id: eng }).eq("id", wl);
    if (e1 || e2) { showToast("⚠️ " + tr("Couldn't pair — has the buddy database update been run?")); return; }
    setMembers(m => m.map(mb => String(mb.id) === String(eng) ? { ...mb, buddy: wl } : String(mb.id) === String(wl) ? { ...mb, buddy: eng } : mb));
    // Clear any open requests from the two members just paired
    const pairedCodes = members.filter(mb => String(mb.id) === String(eng) || String(mb.id) === String(wl)).map(mb => String(mb.memberId));
    setBuddyRequests(req => req.filter(r => !pairedCodes.includes(String(r.memberId))));
    setEng(""); setWl(""); showToast(tr("Buddies paired! ✓"));
  };

  return (
    <div>
      {buddyRequests.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 10, color: "var(--gold)" }}>⏳ {t.buddyRequests} ({buddyRequests.length})</div>
          {buddyRequests.map(r => (
            <div key={r.id} className="card" style={{ marginBottom: 8 }}>
              <div className="card-body">
                <div style={{ fontWeight: 700 }}>{nameFor(r)}</div>
                <div style={{ fontSize: 13, color: "var(--text-mid)" }}>{r.profession === "engineer" ? "🔧 " + tr("Engineer") : "⚔️ " + tr("War Leader")} • {r.needBuddy ? tr("Needs a buddy") : tr("Has buddy: {name}", { name: r.buddyName })}</div>
                <button className="btn btn-sm btn-danger" style={{ marginTop: 8 }} onClick={() => setBuddyRequests(req => req.filter(x => x.id !== r.id))}>{tr("Dismiss")}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">🤝 {t.addBuddy}</div></div>
        <div className="card-body">
          <div className="form-group"><label className="form-label">{tr("Engineer")}</label><select className="form-input form-select" value={eng} onChange={e => setEng(e.target.value)}><option value="">{tr("Select Engineer")}</option>{engineers.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}</select></div>
          <div className="form-group"><label className="form-label">{tr("War Leader")}</label><select className="form-input form-select" value={wl} onChange={e => setWl(e.target.value)}><option value="">{tr("Select War Leader")}</option>{warLeaders.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}</select></div>
          <button className="btn btn-primary" onClick={pairBuddies}>{tr("Pair Buddies")}</button>
        </div>
      </div>
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: "var(--text-mid)", textTransform: "uppercase", letterSpacing: 0.5 }}>{tr("Current Buddy Pairs")} ({pairs.length})</div>
      {pairs.length === 0 && <div style={{ fontSize: 13, color: "var(--text-dim)", padding: "12px 0" }}>{tr("No pairs yet.")}</div>}
      {/* Unassigned members — tap a name to change their profession */}
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>{tr("Tap a name to change their profession")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">🔧 {tr("Unassigned Engineers")}</div>
            <span className="badge badge-gold">{engineers.length}</span>
          </div>
          <div className="card-body" style={{ padding: engineers.length === 0 ? "12px 16px" : "8px 0" }}>
            {engineers.length === 0
              ? <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{tr("All paired ✓")}</div>
              : engineers.map(m => (
                <div key={m.id} role="button" tabIndex={0} onClick={() => setProfMember(m)} style={{ padding: "7px 16px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "space-between", gap: 6 }} className="name-engineer"><span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{m.username}</span><span style={{ color: "var(--text-dim)", fontWeight: 400, fontSize: 12 }}>⇄</span></div>
              ))
            }
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">⚔️ {tr("Unassigned Leaders")}</div>
            <span className="badge badge-gold">{warLeaders.length}</span>
          </div>
          <div className="card-body" style={{ padding: warLeaders.length === 0 ? "12px 16px" : "8px 0" }}>
            {warLeaders.length === 0
              ? <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{tr("All paired ✓")}</div>
              : warLeaders.map(m => (
                <div key={m.id} role="button" tabIndex={0} onClick={() => setProfMember(m)} style={{ padding: "7px 16px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "space-between", gap: 6 }} className="name-warleader"><span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{m.username}</span><span style={{ color: "var(--text-dim)", fontWeight: 400, fontSize: 12 }}>⇄</span></div>
              ))
            }
          </div>
        </div>
      </div>
      {pairs.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: 8, background: i % 2 === 0 ? "var(--surface)" : "var(--surface2)", border: "1px solid var(--border)", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span className="name-engineer">🔧 {p.a.profession === "engineer" ? p.a.username : p.b.username}</span>
            <span style={{ color: "var(--border)" }}>↔</span>
            <span className="name-warleader">⚔️ {p.a.profession === "warLeader" ? p.a.username : p.b.username}</span>
          </div>
          <button className="btn btn-sm btn-danger" style={{ padding: "3px 10px", fontSize: 12 }} onClick={() => unpairBuddy(p.a.id)}>{tr("Remove")}</button>
        </div>
      ))}
      {profMember && <ProfessionBuddyModal member={profMember} members={members} onClose={() => setProfMember(null)} />}
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ buddyRequests, setBuddyRequests, setViewMember, csAllSignups, dsAllSignups, user, members, setMembers, csSignups, dsSignups, setCsSignups, setDsSignups, csTeams, setCsTeams, dsTeams, setDsTeams, trains, trainGoals, t, showToast, isAdmin, stormSettings, setStormSettings }) {
  const [tab, setTab] = useState("signups");
  const pending = members.filter(m => !m.approved);
  const tabDef = [
    ["signups", "⚔️ " + tr("Storms"), false],
    ["members", "👥 " + tr("Members"), pending.length > 0],
    ["buddy", "🤝 " + tr("Buddy"), (buddyRequests || []).length > 0],
    ["trains", "🚂 " + tr("Trains"), false],
    ...(isAdmin ? [["data", "📊 " + tr("Data"), false]] : []),
  ];
  return (
    <div>
      <h1 className="section-title">{t.admin}</h1>
      <div style={{ overflowX: "auto", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, minWidth: "max-content" }}>
          {tabDef.map(([id, label, hasAlert]) => (
            <button key={id} className={`sort-chip ${tab === id ? "active" : ""}`} onClick={() => setTab(id)} style={{ position: "relative" }}>
              {label}
              {hasAlert && <span style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: "#E53935", border: "1.5px solid var(--surface)" }} />}
            </button>
          ))}
        </div>
      </div>
      {tab === "signups" && <AdminSignups setMembers={setMembers} setViewMember={setViewMember} csAllSignups={csAllSignups} dsAllSignups={dsAllSignups} csSignups={csSignups} dsSignups={dsSignups} members={members} csTeams={csTeams} setCsTeams={setCsTeams} dsTeams={dsTeams} setDsTeams={setDsTeams} t={t} showToast={showToast} isAdmin={isAdmin} setCsSignups={setCsSignups} setDsSignups={setDsSignups} stormSettings={stormSettings} setStormSettings={setStormSettings} />}
      {tab === "members" && <AdminMembers setViewMember={setViewMember} members={members} setMembers={setMembers} t={t} showToast={showToast} isAdmin={isAdmin} user={user} />}
      {tab === "buddy" && <AdminBuddy members={members} setMembers={setMembers} buddyRequests={buddyRequests || []} setBuddyRequests={setBuddyRequests} t={t} showToast={showToast} />}
      {tab === "trains" && <AdminTrains trains={trains} trainGoals={trainGoals} members={members} showToast={showToast} />}
      {tab === "data" && isAdmin && <AdminData members={members} setMembers={setMembers} csSignups={csAllSignups} dsSignups={dsAllSignups} t={t} showToast={showToast} />}
    </div>
  );
}

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) { setTimeLeft(tr("Now")); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 0) setTimeLeft(`${d}d ${h}h`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else setTimeLeft(`${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

// Server time IS UTC. All times stored and displayed in UTC = server time.
const formatServerTime = (date) => {
  const d = new Date(date);
  return `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}`;
};

function SignupStatusCard({ type, label, mySignup, onSignup, onRevoke, t, isR4, isOpen, isSeasonActive }) {
  const icon = type === "canyon" ? "🏔️" : "🏜️";
  // Non-R4 members: hide entirely when season is inactive
  if (!isSeasonActive && !isR4) return null;
  const canInteract = isOpen || isR4;

  if (mySignup) {
    return (
      <div className="signup-status-card signup-registered" style={{ marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700 }}>{icon} {label}</div>
          <div style={{ fontSize: 12, color: "var(--blue)", marginTop: 2 }}>
            {tr("Power")}: {mySignup.power} • {tr(mySignup.squadType)} • {availLabel(mySignup.availability)}
          </div>
          <div style={{ fontSize: 12, color: isOpen ? "var(--green)" : "var(--gold)", marginTop: 2 }}>
            {isOpen ? "✅ " + tr("Sign-ups open — you're registered") : "⚔️ " + tr("Registered — awaiting team assignment")}
          </div>
          {mySignup.week && <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>📅 {tr("For the {date} battle", { date: new Date(mySignup.week + "T12:00:00Z").toLocaleDateString(dateLocale(), { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }) })}</div>}
        </div>
        <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-end" }}>
          {canInteract && <button className="btn btn-sm btn-secondary" onClick={onSignup}>{t.editSignup}</button>}
          {canInteract && <button className="btn btn-sm btn-danger" onClick={onRevoke}>{t.revokeSignup}</button>}
          {!canInteract && <span className="badge badge-blue">{t.signedUp}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={`signup-status-card ${canInteract ? "signup-open" : "signup-closed"}`} style={{ marginBottom: 10, opacity: (!isSeasonActive && isR4) ? 0.6 : 1 }}>
      <div>
        <div style={{ fontWeight: 700 }}>{icon} {label} {!isSeasonActive && isR4 && <span className="badge badge-gray" style={{ fontSize: 10, marginLeft: 6 }}>{tr("Season off")}</span>}</div>
        <div style={{ fontSize: 12, color: canInteract ? "var(--green)" : "var(--text-dim)", marginTop: 2 }}>
          {isOpen ? "✅ " + tr("Sign-ups are open") : isR4 ? "🔒 " + tr("Closed (admin override active)") : "🔒 " + tr("Sign-ups are closed")}
        </div>
      </div>
      {canInteract
        ? <button className="btn btn-sm btn-green" onClick={onSignup}>{t.notSignedUp}</button>
        : <span className="badge badge-gray">{tr("Closed")}</span>}
    </div>
  );
}



function EventCard({ ev, user, t }) {
  const d = ev.date instanceof Date && !isNaN(ev.date) ? ev.date : (ev.date ? new Date(ev.date) : null);
  if (!d || isNaN(d.getTime())) return null;
  const day = d.getUTCDate();
  const mon = d.toLocaleDateString(dateLocale(), { timeZone: "UTC", month: "short" });
  const serverD = new Date(d.getTime() - SERVER_UTC_OFFSET_HOURS * 3600000);
  const h = String(serverD.getUTCHours()).padStart(2, "0");
  const m = String(serverD.getUTCMinutes()).padStart(2, "0");
  const serverTime = `${h}:${m}`;
  const countdown = useCountdown(d);
  const isPast = d < new Date();
  const typeColor = ev.type === "canyon" ? "var(--gold)" : ev.type === "desert" ? "#C0392B" : "var(--blue)";
  return (
    <div className="event-card">
      <div className="event-date-box">
        <div className="event-date-day" style={{ color: typeColor }}>{day}</div>
        <div className="event-date-mon" style={{ color: typeColor }}>{mon}</div>
      </div>
      <div className="event-info">
        <div className="event-title" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {ev.title}
          {ev.recurring && <span style={{ fontSize: 10, background: "rgba(201,140,40,0.12)", color: "var(--gold)", border: "1px solid var(--gold)", borderRadius: 20, padding: "1px 7px", fontWeight: 700 }}>🔁 {tr("every {n}d", { n: ev.recurringDays })}</span>}
        </div>
        {ev.myTeam && <div className="event-detail">{tr("Team")} {ev.myTeam} • {ev.myAssignment} • {ev.myTeam === "A" ? ev.teamA : ev.teamB} {t.serverTime}</div>}
        {ev.description && <div className="event-detail">{ev.description}</div>}
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{serverTime} {t.serverTime}</div>
        {!isPast && <div style={{ fontSize: 12, color: typeColor, fontWeight: 600, marginTop: 3 }}>⏱ {t.startsIn} {countdown}</div>}
      </div>
    </div>
  );
}

function SignupModal({ type, user, existing, lastSignup, onClose, onSave, t, isCanyon, showToast }) {
  // Use existing (current week) first, then lastSignup (any previous week) for power+squadType
  const prevPower = existing?.power || lastSignup?.power || "";
  const prevSquadType = existing?.squadType || lastSignup?.squadType || "";
  const [form, setForm] = useState({
    power: prevPower,
    squadType: prevSquadType,
    availability: existing?.availability || "",
    timePreference: existing?.timePreference || "",
    canFlexTime: existing?.canFlexTime || ""
  });
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const { config: stormCfg } = useStormConfig();
  const offeredTimes = stormCfg?.[isCanyon ? "canyon" : "desert"]?.times || [];
  const showFlexQuestion = !!form.timePreference && !isAnyTime(form.timePreference, offeredTimes);

  const formatPowerInput = (val) => {
    const clean = val.replace(/[^0-9.]/g, "");
    if (!clean) return "";
    if (clean.includes(".")) {
      const num = parseFloat(clean);
      return isNaN(num) ? clean : num.toFixed(2);
    }
    const num = parseInt(clean, 10);
    if (isNaN(num)) return clean;
    if (clean.length <= 3) return clean;
    return (num / 100).toFixed(2);
  };

  const handleSubmit = () => {
    if (!form.power) { setError(tr("Squad Power is required.")); showToast?.(tr("Squad Power is required.")); return; }
    if (!form.squadType) { setError(tr("Squad Type is required.")); showToast?.(tr("Squad Type is required.")); return; }
    if (!form.availability) { setError(tr("Please select your availability.")); showToast?.(tr("Please select your availability.")); return; }
    if (!form.timePreference) { setError(tr("Please tick at least one time you can make.")); showToast?.(tr("Please tick at least one time.")); return; }
    if (showFlexQuestion && !form.canFlexTime) { setError(tr("Please answer the time flexibility question.")); showToast?.(tr("Please answer the flex question.")); return; }
setError("");
    onSave(showFlexQuestion ? form : { ...form, canFlexTime: "" });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{isCanyon ? "🏔️ " + t.canyonStorm : "🏜️ " + t.desertStorm} {tr("Sign-Up")}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">{t.squadPower} <span style={{color:"var(--red)"}}>*</span></label>
            <input className="form-input" value={form.power} onChange={e => set("power", e.target.value)} onBlur={e => set("power", formatPowerInput(e.target.value))} placeholder={tr("e.g. 4124 → 41.24")} />
            <div className="form-hint">{tr("Tip: type 4124 → it becomes 41.24 automatically")}</div>
          </div>
          <div className="form-group">
            <label className="form-label">{t.squadType} <span style={{color:"var(--red)"}}>*</span></label>
            <select className="form-input form-select" value={form.squadType} onChange={e => set("squadType", e.target.value)}>
              <option value="">— {tr("Select type")} —</option>
              {SQUAD_TYPES.map(st => <option key={st} value={st}>{tr(st)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t.availability} <span style={{color:"var(--red)"}}>*</span></label>
            <div className="radio-group">
              {[["confirmed", t.confirmed], ["sub", t.sub], ["cantMake", t.cantMake]].map(([val, label]) => (
                <div key={val} className={`radio-option ${form.availability === val ? "selected" : ""}`} onClick={() => set("availability", val)}>
                  <div className="radio-dot"></div><span style={{ fontSize: 14 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t.timePreference} <span style={{color:"var(--red)"}}>*</span></label>
            <TimePrefPicker value={form.timePreference} offered={offeredTimes} onChange={v => set("timePreference", v)} />
          </div>
          {showFlexQuestion && (
            <div className="form-group">
              <div style={{ background: "rgba(201,140,40,0.08)", border: "1px solid var(--gold)", borderRadius: 10, padding: "12px 14px", marginBottom: 10, fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6 }}>
                ⚠️ {tr("If we don't get enough sign-ups for your preferred time slot, we will not run it. In the event this happens, can you switch time slots?")}
              </div>
              <div className="radio-group">
                {[["yes", tr("Yes, I can switch")], ["no", tr("No, I cannot switch")]].map(([val, label]) => (
                  <div key={val} className={`radio-option ${form.canFlexTime === val ? "selected" : ""}`} onClick={() => set("canFlexTime", val)}>
                    <div className="radio-dot"></div><span style={{ fontSize: 14 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && <div style={{ background: "rgba(229,70,60,0.10)", border: "1px solid rgba(229,70,60,0.35)", borderRadius: 8, padding: "10px 14px", color: "var(--red)", fontSize: 13, marginTop: 4 }}>⚠️ {error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t.cancel}</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{t.submit}</button>
        </div>
      </div>
    </div>
  );
}
// ─── TIME PICKER (multi-select, only the times R4 offers) ──────────────────────
function TimePrefPicker({ value, offered, onChange, compact }) {
  const picked = value ? parseTimePref(value, offered).filter(x => offered.includes(x)) : [];
  const toggle = (tm) => onChange(sortTimes(picked.includes(tm) ? picked.filter(x => x !== tm) : [...picked, tm]).join(","));
  if (!offered.length) return <div className="form-hint">{tr("No battle times set yet — ask an R4.")}</div>;
  return (
    <div>
      <div className="radio-group">
        {offered.map(tm => {
          const on = picked.includes(tm);
          return (
            <div key={tm} role="checkbox" aria-checked={on} className={`radio-option ${on ? "selected" : ""}`} onClick={() => toggle(tm)}
              style={compact ? { padding: "9px 12px" } : undefined}>
              <div className="check-box">{on ? "✓" : ""}</div><span style={{ fontSize: compact ? 13 : 14 }}>{tm} {tr("Server time")}</span>
            </div>
          );
        })}
      </div>
      <div className="form-hint">{tr("Tick every time you can make.")}</div>
    </div>
  );
}

// ─── BATTLE PLAN TEXT ──────────────────────────────────────────────────────────
// Editable plan format: "# Heading" starts a section, "- text" is a bullet, other lines are plain text.
const planToText = (plan, notes, notesTitle = "📋 Notes & Reminders") => [
  ...plan.flatMap(ph => [`# ${ph.time}`, ...(ph.steps || []).map(st => `- ${st}`), ""]),
  ...(notes && notes.length ? [`# ${notesTitle}`, ...notes.map(n => `- ${n}`)] : []),
].join("\n");

// Stored battle_plan_* value → { same, a, b } text plan, or null when it's still the original plan.
// Older WiLD plans saved as { phases, notes } are converted to text.
const normalizePlan = (stored) => {
  if (!stored) return null;
  if (typeof stored.a === "string") return { same: stored.same !== false, a: stored.a, b: typeof stored.b === "string" ? stored.b : stored.a };
  if (Array.isArray(stored.phases)) { const txt = planToText(stored.phases, stored.notes || []); return { same: true, a: txt, b: txt }; }
  return null;
};

// Text someone typed, shown in the reader's language
function AutoText({ text }) {
  const [out] = useAutoTranslate([text]);
  return <span style={{ whiteSpace: "pre-wrap" }}>{out}</span>;
}

function PlanText({ text }) {
  const lines = String(text || "").split("\n").map(raw => raw.trim()).filter(Boolean).map(line => {
    if (line.startsWith("#")) return { heading: true, text: line.replace(/^#+\s*/, "") };
    const bullet = /^[-•*›]\s*/.test(line);
    return { bullet, text: line.replace(/^[-•*›]\s*/, "") };
  });
  // Plans are typed by R4s, so each line is auto-translated into the reader's language
  const translated = useAutoTranslate(lines.map(l => l.text));
  const sections = [];
  let cur = null;
  lines.forEach((l, i) => {
    const txt = translated[i];
    if (l.heading) { cur = { title: txt, items: [] }; sections.push(cur); return; }
    if (!cur) { cur = { title: "", items: [] }; sections.push(cur); }
    cur.items.push({ bullet: l.bullet, text: txt });
  });
  if (!sections.length) return <div style={{ color: "var(--text-dim)", fontSize: 14 }}>{tr("No battle plan yet.")}</div>;
  const colors = ["var(--gold)", "var(--blue)", "var(--blue)", "var(--red)", "var(--purple)", "var(--green)"];
  return (
    <div>
      {sections.map((sec, i) => {
        const color = /‼|❗|⭐|!!/.test(sec.title) ? "var(--red)" : colors[i % colors.length];
        return (
          <div key={i} style={{ marginBottom: 16, borderLeft: `3px solid ${color}`, paddingLeft: 14 }}>
            {sec.title && <div style={{ fontWeight: 700, fontSize: 15, color, marginBottom: 8 }}>{sec.title}</div>}
            {sec.items.map((it, j) => (
              <div key={j} style={{ fontSize: 14, color: "var(--text-mid)", marginBottom: 6, lineHeight: 1.5, display: "flex", gap: 8 }}>
                {it.bullet && <span style={{ color, flexShrink: 0 }}>›</span>}<span style={{ whiteSpace: "pre-wrap" }}>{it.text}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── BATTLE PLAN DATA ─────────────────────────────────────────────────────────
const CS_MAP = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAMgAyADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDyWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK2tF8L3+vW8s1o0AWN9jeYxBzjPpWn/wrrWv+eln/wB/D/hQByVFdb/wrrWv+eln/wB/D/hR/wAK61r/AJ6Wf/fw/wCFAHJUV1v/AArrWv8AnpZ/9/D/AIUf8K61r/npZ/8Afw/4UAclRXW/8K61r/npZ/8Afw/4Uf8ACuta/wCeln/38P8AhQByVFdb/wAK61r/AJ6Wf/fw/wCFH/Cuta/56Wf/AH8P+FAHJUV1v/Cuta/56Wf/AH8P+FH/AArrWv8AnpZ/9/D/AIUAclRXW/8ACuta/wCeln/38P8AhR/wrrWv+eln/wB/D/hQByVFdb/wrrWv+eln/wB/D/hR/wAK61r/AJ6Wf/fw/wCFAHJUV1v/AArrWv8AnpZ/9/D/AIUf8K61r/npZ/8Afw/4UAclRXW/8K61r/npZ/8Afw/4Vma14Yv9Bgilu2gKysVXy2J5xn0oAxaKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPSvhr/wAgm+/6+B/6CK1tS8StYX8tsLVXCY+YvjORn0rJ+Gv/ACCb7/r4H/oIqv4i/wCQ7c/8B/8AQRQBp/8ACYv/AM+S/wDfz/61H/CYv/z5L/38/wDrVzFFAHT/APCYv/z5L/38/wDrUf8ACYv/AM+S/wDfz/61cxRQB0//AAmL/wDPkv8A38/+tR/wmL/8+S/9/P8A61cxRQB0/wDwmL/8+S/9/P8A61H/AAmL/wDPkv8A38/+tXMUUAdP/wAJi/8Az5L/AN/P/rUf8Ji//Pkv/fz/AOtXMUUAdP8A8Ji//Pkv/fz/AOtR/wAJi/8Az5L/AN/P/rVzFFAHT/8ACYv/AM+S/wDfz/61H/CYv/z5L/38/wDrVzFFAHT/APCYv/z5L/38/wDrUf8ACYv/AM+S/wDfz/61cxRQB2WmeJG1C/jtjaqgcH5g+cYGfSsj4l/8gyw/67t/6DUXhv8A5DsH0b/0E1L8S/8AkGWH/Xdv/QaAPNqKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPSvhr/wAgm+/6+B/6CKr+Iv8AkO3P/Af/AEEVY+Gv/IJvv+vgf+giq/iL/kO3P/Af/QRQBl0UUUAF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b7MEuAkRT94D945AznPX2oA5eiiigAooooA9C0H/AJAln/uf1NeJz/8AHzL/AL7fzr2zQf8AkCWf+5/U14nP/wAfMv8Avt/OgCOiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAra8Jf8jZpv8A11/oaxa2vCX/ACNmm/8AXX+hoA9I8W/8gqP/AK7D+Rri67Txb/yCo/8ArsP5GuLoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD0KH/AJF1f+vT/wBkrw4dBXuMP/Iur/16f+yV4cOgoAWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACr2i/8h3T/APr5j/8AQhVGr2i/8h3T/wDr5j/9CFAHrfif/kBzf76/zrhK7vxP/wAgOb/fX+dcJQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAHoWg/8AIEs/9z+prxOf/j5l/wB9v517ZoP/ACBLP/c/qa8Tn/4+Zf8Afb+dAEdFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABW14S/wCRs03/AK6/0NYtbXhL/kbNN/66/wBDQB6R4t/5BUf/AF2H8jXF13+uadLqdkkMLIrCQNlzxjB/xrn/APhEr/8A562//fR/woAwKK3/APhEr/8A562//fR/wo/4RK//AOetv/30f8KAMCit/wD4RK//AOetv/30f8KP+ESv/wDnrb/99H/CgDAorf8A+ESv/wDnrb/99H/Cj/hEr/8A562//fR/woAwKK3/APhEr/8A562//fR/wo/4RK//AOetv/30f8KAMCit/wD4RK//AOetv/30f8KP+ESv/wDnrb/99H/CgDAorf8A+ESv/wDnrb/99H/Cj/hEr/8A562//fR/woAwKK3/APhEr/8A562//fR/wo/4RK//AOetv/30f8KAMCit/wD4RK//AOetv/30f8KP+ESv/wDnrb/99H/CgDo4f+RdX/r0/wDZK8OHQV7qYmg0VoWILR2xUkdMha8KHQUALRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABV7Rf+Q7p/8A18x/+hCqNXtF/wCQ7p//AF8x/wDoQoA9b8T/APIDm/31/nXCV6JrNlJqGnSW8TKHZgQW6cGua/4RK/8A+etv/wB9H/CgDAorf/4RK/8A+etv/wB9H/Cj/hEr/wD562//AH0f8KAMCit//hEr/wD562//AH0f8KP+ESv/APnrb/8AfR/woAwKK3/+ESv/APnrb/8AfR/wo/4RK/8A+etv/wB9H/CgDAorf/4RK/8A+etv/wB9H/Cj/hEr/wD562//AH0f8KAMCit//hEr/wD562//AH0f8KP+ESv/APnrb/8AfR/woAwKK3/+ESv/APnrb/8AfR/wo/4RK/8A+etv/wB9H/CgDAorf/4RK/8A+etv/wB9H/Cj/hEr/wD562//AH0f8KAMCit//hEr/wD562//AH0f8KP+ESv/APnrb/8AfR/woA6PQf8AkCWf+5/U14nP/wAfMv8Avt/OvctMtns9Ot7eQqXjXBK9OteGz/8AHzL/AL7fzoAjooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKuaVftpeqW98sYkaFtwQnAPGKp0UAd1/wALMuf+gZD/AN/T/hR/wsy5/wCgZD/39P8AhXC0UAd1/wALMuf+gZD/AN/T/hR/wsy5/wCgZD/39P8AhXC0UAd1/wALMuf+gZD/AN/T/hR/wsy5/wCgZD/39P8AhXC0UAd1/wALMuf+gZD/AN/T/hR/wsy5/wCgZD/39P8AhXC0UAd1/wALMuf+gZD/AN/T/hR/wsy5/wCgZD/39P8AhXC0UAd1/wALMuf+gZD/AN/T/hR/wsy5/wCgZD/39P8AhXC0UAd1/wALMuf+gZD/AN/T/hR/wsy5/wCgZD/39P8AhXC0UAd1/wALMuf+gZD/AN/T/hR/wsy5/wCgZD/39P8AhXC0UAd1/wALMuf+gZD/AN/T/hR/wsy5/wCgZD/39P8AhXC0UAdvL8SLmWGSM6bCA6lc+aeMjHpXEDgUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFTWdwbO9guQoYwyLIFJxnBzioaKAO6/4WZc/9AyH/AL+n/Cj/AIWZc/8AQMh/7+n/AArhaKAO6/4WZc/9AyH/AL+n/Cj/AIWZc/8AQMh/7+n/AArhaKAO6/4WZc/9AyH/AL+n/Cj/AIWZc/8AQMh/7+n/AArhaKAO6/4WZc/9AyH/AL+n/Cj/AIWZc/8AQMh/7+n/AArhaKAO6/4WZc/9AyH/AL+n/Cj/AIWZc/8AQMh/7+n/AArhaKAO6/4WZc/9AyH/AL+n/Cj/AIWZc/8AQMh/7+n/AArhaKAO6/4WZc/9AyH/AL+n/Cj/AIWZc/8AQMh/7+n/AArhaKAO6/4WZc/9AyH/AL+n/Cj/AIWZc/8AQMh/7+n/AArhaKAO6/4WZc/9AyH/AL+n/Cj/AIWZc/8AQMh/7+n/AArhaKAO6/4WZc/9AyH/AL+n/CuHdt8jPjG4k4+tNooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/Z";
const DS_MAP = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAHCAyADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDQBwc1DPfQ2rATPtz3xUw60jRo4+dFb6jNeBc+gdmOBVwGDZB5BpxPFIFAGBwPSindomyQUuKAcUvai7HYM0UgFOAzSuFhPyopdtJRfsFgoHWlAzSheaYhc0ZI6UvWjFAAAaWiii7QBRRRQAU4dKQDNOHAoAKKKUDNAAOlBNL2ptArBTgDQozTwMUgClFA60tJiCiiinzMYUhFNMgXrxTgcgEYIPoaOZiuUNYVhpsuwEnHQV5yy5+pr0nUdRitkZcZYLnb6iuL1OxjKC+tsmGQ5I/umumlsRMzVQZGc1Zi+XGOaiXBqReCK3IO60HUFu7NUIAZOBWpMgMZAPavPrG7e0nVlYgd67u0uEurVXQ545rlqQs7lIraNAtusiL03ZxWhMBjJqvbEJOwA71bcg8YzWRR5fqNr9g8QyrGuUdsrn3611NjYCJN4XbvGcUniDTjPd21wi8q/P0rQgYhtpPAraUny2EkCbkccVOrgNz0p0gDkYqSNF28is+ZjsPDAjgYpQAaAuaXGKkLDsAUhXNLRQFhuCDTwMmgDkU/AFAWHKMClwKQdKWgdgpCKWipV0Mbtopc0dafMwGHrSVJgUnHpRzMZFJGHXDVG4JGBU7DIpnHpSUmMzmi+Y5FL9mWbAcAgetXiu40ojAp8zAijhQfLkADvUE6KJCwkD+gqa5U7SVqkEGOmBWkQF4J6cd6tQtGVAVNvv61V3AcL+ddB4a0KPWluDJO8ZhYDKgc5qlBz91Gc5qC5mVrHTZtTuTBbFQ4Ut8xwMVNeeFdUtoJJ5Ei8uNSzEOOgrttI0C30mRpEdpJHG0swA4qXXvl0G+94H/lXVHCpU3zbo45Ytua5NjyRutJUwjHGTgmk/d+YY943jkr3FcF30PTIqKfIyRRmRs7AMkjtTYDDd24mt5FdW6HNVG7VxXEzSZFOKMvBHNRii4XHjrTs+lMzTgcUmwuOwDyRzThwO1NB4p1K7Bh+X40ZI7ClAzS7fei7JE+buBSjjrS0UXYCZFLmjj0peDRdgJRtpwGKKAEwaSngZoIxRdgMoqTAoIA7Ur9wI80oftSkA9qXaMZouIAcUHk0lFMB2TjtRuPtS9qTbTQg3etG76UbaNtO4AeelJg0oGKWi4mirgUUUYrIsUdKXAoHSiqTGkGBRRRTKCnLTaKmwCk80DrSUo4NNCbHUUmRTgKZICloooAKKOtKRigBKKKKAHLS0gGKWkwClFIOtOzQgCjFKAetOHSlcBg4pw6UjUh4GaL3Bj6RnCDJYD61k6rrg07935eXYcH0rCj1qacnecg9j2q1TbRFzro7+2kuPIVwZAORVlhxxXI6Ehl1K4fuB1rooJXZ8E5XpTkrIaM/X7w21myK2HcYFReG9TNxYCGRv3kR5+lUPFzn7TCg7Kaq+G5THqTqOjLyK0VP93chvUu+KGZZ4J0HyYKms3SpnkeW0fmJx0966HVYlm051K5Ycg1yti3kanGQchmANXH4dAnuR3EJtpnjPUHihOa3/ElkFu4pAOJFzWEFwcYq4yTQnGzHrndxXb6GjR6au7q3IFYGlWCMguJueeBXUQyfINoworKpK+g0rDmXY4Yd6s9Bkdahkw496lBIAxWAyvPAJSBj7tRNAOo4q8cE1GyDNNAimN6cEY96lhlzkGnsgpNoHIoZRKpyafmo17U4g5NIBaKQDBpwoGKO1PoHSigBRS0gNGaBC0h60tNNAwpRS4FFSwsFNp2KDSCwxqbin4ooHYAuDSlcinYNIRigClcRO5x/CO3c1BJHLL8uzYg65rRYEmmsg21cXYVjL2BRjHSr2keJ7jw/wDaFgtUuPOYE7mIxj6VXeAsTULxBSFxye9bRnyu6InBTVmd74V8TXuvajMlxBHDEkQZUU5Oc9zWx4iO3QL0np5RrkfAId9avXIwiwKij3zXReOXMfg3UmBwdg/9CFejFuVNtnmVIKNVRR5ZrU5i0tp4T8yEMK5OLW5G1pdQlGBIAjgdAK6C72porhjkbP1ris8bdvGOvpXFRgmmenOTid3NOy2M4UgoU49wawfCkzx3c1qZPk+8vtVi1uGm8NbmPzJlc1X8L27NqFxcZ+VBj86FFKLE2zsw6SfI/DdjUU0OzFMJ281bUi4h2n7w6VztGpSxilGKc6YB9uKjHFSMkp1Q7vSlUmgGyXOKcOlRg881IOaBC0hzTieKBQA0Zx0p+3HNUNVjv3iX+zZkjlzzvGQRVuMSGJRMwaTA3EDgmgB5NLQFx0ooAKOtGKcvSgBR0ooopNAJgUtGKdRYBuB6UmB6U+imA2ilwc0GgVhKaZEVgp5Jp+KTy1LAkUBYQn0pMmg9eKShA0QjrSkZpB1pagpBRRRVIoKKKKYBRSjrS4FAmNHUVLgU0AZp1SyQwKKKQdaLgLRR3oqgClJzSUUAFKOtIOtKOtADqKKKQBSgYpR1p+BgUwEHSlooqAEIzTZPlQnIwBTm6Vn6ndC2tSz8g8VUVqK5x+q3TXd87Mc7TgVSU4NSzlWcsvc1GvJruWxgzovDNxHHcvG5AaRcA11DR7Iwi4B6mvPoXMUiOhwynIxXc6dc/bLJZmHPSsKsdTSDOd8QxM14mSDhTUGiIttqW5z1GB+NbWoWpnmVvTrTZNPxamRE/eqMiqVROPKK2pbnUSQsBzmuQntngvVOD8r5rqdOuftVr0yycH8K9C0DwXp8USX1/As904DYflUB6cetXQg22jOtUUUmcDriJPpVvKvVQKxIdPS5r3E6j4fNwLEy2Xm9PLwD+FZuveE7KSCS7sYlguYxu2p91wOoxWjw7ivdZisVd+8jze0s2gQLuyBWii5GKUBCuT1I/KnJgc1yS3OscoI7VOvQVGjZPSpM56VmwGNkd6Q5NP4pgJ9aAQmKTbmpAueaWgtDBxTt2TSEUqj1oHYUU4cU2lFAEg6UUg6UtJgFFFFACk5pKKKYDqKbzRmkA6im80vNFgFIzSgDFKB60tSAUhGaWigBMCmsny9afTCcAkk4p3AryEK+3jpmo2CvH5mMAdKWeWOKJp5jsjXktWXp00+p3L30q+Xb/dhj9h/F+NV9kR3fgZNtze+yqP51o+PAW8HXyD+LYP8Ax8Vm+BZN1zqOTjAj/wDZq1PG2W8L3Cg8lk/9CFepTf7k8yr/ABzxvXZBFpaRjqxrk9pbhBkk4wK6HxM5+0RRdkTP40aDpgaYXUynCn5Vz39a5oy5I3O6WrJLaxktNFeFx8zjOK1dF0822mJhMM53NWlHDubJHWrioApHA4rB1ehpy6GYQScelORzGwP8qfOYt+1Mk9zToUR42J6g0kUh8oEkW9R1qoykCrnQY7VCwHpUAVhxT14oIGaSgB+M1IvHNRo2M5p26gB9KBil4FGc0AIRzmkp1HFACZozQaTI9aAFHWnr0poxilU0AOoooyBQAo6UtNzS5oAWnBsCm0cUAO3D0pvejiigAoHBpCeaWgAOD2pDj0oNJQDKw60tIOtLUDQUUUVSKFAzRgmlUZzTgMUmK40DBpaUikoRIUUUVQBR3opcUALRRRQAUUUdhQAUoHNLtpaACiikJANJgOA70oYL1aqcupQwkox+YVVvL3/QnkhOTjNUosDW81AuScCnBlPQiuQi1Oa6hAwcg1uWW9lVmJpyhy7huamM/SuZ8QXAksiF52tg10rtsjY54FcldREySxnOyTkfWnT3JZzxJJ5/ClTrTpFKsVxyDimqCDXYzJlhen4102hXP7loecA5Fcyik1vaKjLIeDisqmxUEdE8QbBqeOPCdAfrSE8LjvUqVy2KZzE6tpOqOoOIZfmXjvXt+m3UepaTDNC/yyRAZHY4ryrVtO/tG28pBmUEGM/7XYV6N4Z0RPD2jqkkrNKyh53J+UHHYdq78I27rocWLtZHDp4I1QXXlGHJ3f68sMfWvSLyePT9Jd5nG2OPG49zjFYn/Ce6R9o8oCYx7sebt+WtLWdKh1qxXDncBuiIbgn3HetoRST5Hc55uTa5zziIKFHmEAntmopEAniCh8SPsBHTNXWtUliKSIN28RnPVTnFS6jHNZm3SCVZ47Z94CrynsfWvMm1DV7na6rvZEcum3VrGZWX5fY1AJC3bBraTUFuLSUDgEZwfWsdwfSraTSa0uVCbk9RgJJpwpVANOwKyNUKOlFFFBQYpcUCloHcKKKKAuKo708daZmlDc0CHHrSUUUAGAOlKDTW+XqQKzn1mFbjyVUsxOBirjTlJXREqkY7mp1FJikB4FKDUFrUUUoHNJT6AEIzSjgUcdqKgLhRRRQFwqGYjYWZtqgZP0qbIqnO0lyRFGcRj77etWhoxpnfXJ1jVGSxQ/Tea14oljgCKAoX0qWOERrtQYX0pzjCYApt6DZg3lvcSM/kSSIT1ZGIz+VWLO3nWFUluJZAMEq7kg1e2Hn3oCYXjrmq53siOWN7s4+6tJb3WpXZSY1IGTXSWVqEiVcAADip4rMeYfl6nJq8sYUAYxUyndWKshiIAnQZqK6B8k4O31PtU80kcEZZ26dB61lTXLXGSVKx56dzUqLGOitmm5Q7U7u1TwG3Vmiik8xh1I6VkXFzPcDyEb5OgUcVq2sSWtpkAA4+arlsFyV1FQuox1Ax15rOvtVMRURgjPesd7mWVizOcn3pxp3C50Ya0ZwjSgM3oaJ7aSAbh8yHvXP2SmS7AJ7V1Vi7yoYZBwOmaUo2AzxnGT0NSpwKsT2ARiYz9RVXawPzDFJMB2SaXntSDrS02AZNJuNBIpKkBdxqRcEDIqNakHSgB+0U0qPWk59adjAoANvH3qQDHfNIxwKZvoAkzTwRxUIcE08HmgCSikBzS0ALijFOxxQBmgBuKD0p+2kK8UAMJxSgjFBUGkwRwKBMr49qKeOeaaetQXYTFPxmgDilAwKaYNiAYpwoopCCiiigQU2nU3FUmAU6kBpaYBRRRQAUUUUAGafTM84qOSYRg7jgClqBKzhBk9KzLjU41kADYqZ5xNCTHyK5S8DR3R3kjIrSEddSZOyJdUuBNdF4zirWmlp7KRXOQB3rJkk8wAEdK0dJnWKN42x81dLSSITItMXE0gx/FXY2kOIFPpXPadbgXDHHeuthVRAAB1rCo0y4lW6bao9+1ZM8CzMuSQQ3atLUmAlQDp3qmR+/QdiamKtqD1OW1S2e0vWQ8qeQfWqyAN0NdZrVl9rtQFXMiDI965gR7GwRiuiEr7mclqWrOHe4JGQK6e2iSKEFRyaydLiAQ8ZrahcbNpFZzKjoXEbIUVOuB3qnEfmOatDoKxY2SrIIZY5sZCOGP0zXprCO+sXVH+SaMgMOeCK8v4YY/Orun67qOkLsiKzQZyI5O30NdOGrRhdS2OXEUnNJonj8C38Z+z7ojFnAkzzj6V3cSR2NlHGWwkKAFjxwBXIHx7c7eNMGf+uv/wBasrUfEOoauhilKwQHrHH1P1NbxqUqabgYunVqNKRG8321bna/lGaQyI+Pu88VqW0sFvZJbKoxj5nbkv7+9UdLt457kROcIy9vWsbxDcppeoC085wuwtkGuW1KtuncqfNCWhqSeTHuWLPzH71RMAVPNZtnem5mwuTFgbTj25q+pJbYCN3XGampGSex0UZK12KEPajY/tSlXU84oyayNdBMEdabz70/NGKATGjNO5pMUtA7i0YpyjihiFG4kD3NAc1tzJvtTls7tUeL90TjPc1as9QgvS3lFsr1yOlYPiTUcrE2wrsbCyEcNTvCk5lluIycj72a7pUIqlzPc5I1b1LI6gHjrUcziOJ2OSACak8sHvTJV+Rht3ZHT1rijZHW7vY4rVvElzuzGSqg9vStRbOJW0678xS9yvmEL0H/AOun6npVqLWa4aLa64AA6Vz0OqPbGEHBSJsKM9q9CLjOHunnyjKM/eZ6HRVWw1CG+gE0ZA3cYzVs4xxXnyTTszvg01oA6UuaQGjNIoctOyPWmDmilYLWFB5oZgqlicAdajkYooI/vAfrWJc3F9dau1sqNHBnBGOo9apRTIcjdV1kGQQc+lBUAjGNtQ2luttEUViwznNaVnZNeiQKcAd6iUoxHzaFZcPIsa4Lt0A6mlurSa3IEgHPoelN1y2jsJYWtY5hLkDcvc1W04tHq5OpNMqldzAjg+5rVQvHmTKt7vMP2UoSk+3WlzqMsVuflBypPcVYCYHNZ6kxmmMRMc05jwe5p+O1IUwKRdzHuIpJH3PltvQZqlczYXkdfSt+WIFCAMtis0WKoDLN0HatU11DcpWdttXzGz5jn5an1i6WwtUh63Ev6CpopEt4ZL6b5UXiMHvXJX97Lf6g87t3+UHsKaTbuD0Ev52IjyR1pwAYcGq86GUKARlTmt3SNJ+0sssy4iByQe9bNqIhmm25VDO4I3fdrTyV4BNT3KCSQbFCovCgVAcgdOaybQy/bXMZixMxBHc00iG5yUbJH61lOd5I5qe0VvNCR5yDlvao5bajJjAyHmmshxxWk8RYDjmqrpyRilcCieOtN3mp5Equ3pQkBKGyKkGeOtRL2qZeaLAOHWhjx1paY5pARsx6UynZoUZPNNIBF61KDyOabj0pwU4pASqRnqKdketQgc08DigCXdxilU0wUvSgCSjGeKQdKUUAIVIpvSpc5o2bqAKSntSNQOtDVBY4HilzTR0paAFBzS0gpaCWFFFFAgpuad2ptUgClzSUUwFzSim4pw6UmAUhOKTPXmonfbnJoV7lIpavdNBDmPhu1Zg1M3Nk0cj4kxzVjVYJLmPch4HWudIKMwrohFSMpto2dEnbY6s2cGpdZtRPbi4TGU+8MdqxrSdrdiR3610NlcR3UMsB/iXA+tNxaYlK61OZHIBFTRMBt9ajZGhmZD0U4q5aWpmkHQCtHsQtzd0kbhurpUH7kD0rFsIRFtHFbOcIOa5ZmqMfU+JgeeuaZ1ZGHarN/H5lVLclnZeuKa2GzQC71Brnde08W04mQfI57CuktWyuKTU4VmtSpUE9vaiMrPUVjE0viD8K0I0Oc1SsomhJjPUda0E7U5sksRqc5qcdhTI+cYqQdazAeBzTscYpoPNOoEN7EcAimKRK5RdoOPvPwoPrmqkbD+3JEmJAZB5ak4Bq+8iRqA7pEpOAXOBmupRVNKW7Ody5tL2M22k1DT7af5PPkiOV2H5nGeo9qz/EF7pGoSW9xO80M6x4ZSM5I6iuw0W6WK9uQ5iaL/VoytkP61k+KfD2nXl6syKsShcMoHf2rL29NTtPRmUuduyOL03WZDrMaWiEW68cnrXT3El5BqRuYoPMjCbSB/nrVKCCz05QIYlUZ69Ca17PUY5LQy3c1tCxl2qgkyT9a1hXb1iropRa3HWt8LlNzxGJh/C1W9ylQQc5qpqZijspJZW2FV4f1J6VX0G4a6sC0n3g2OaidO8ec1hO0uVmnkUnFKRz0pNlYG4cdqcBxTduKOlAEgGKrahb/abVkVirggirG7NFNbiaurHnfimJ5pIbV7pxEgJEQH3W71teDbVIbSa8eb7x24bsBVLxZbRwaiLogHcMEZrCuZrj7KRBMyL12g4Br1be1pnnJ+zm2epRTwzDMMquPY1IoJ5x06mvN7AahDbJLah443XIwetaFlqGsiQATEjPO/iuV4J9DojjDrNRMDWzRTsBvHA7kiuMm0GM3kpmuNiKu5twwd3YYrfBlub6O5uVKxxLlC2DmsS8up9W13zURnhEgMz44QdK6qdJ04HPUn7SVzY8PaSIY/tDEhj90V0ABApIgixL5f3BwtJK+yGRs4IU815zTqVVDudt/Z0+bsP+tFYAvbjHMzU7+0Ln/nrj8K9v/V3EW0kjyP7fo9Ys3hRnFYyapcIRu2uO/atSGZLiPzEOR3z2rz8ZllfCa1Fp3PQwmY0cVpB6jpOUx7j+dOJBOSBk96ZKcRk0q/nXn2aO2yJBk7VRWZz0UDrW3pljNCWaRhuYA7R2+tZVjcNDexAjERyHI6/hXVxNGyYiHHXFTUnTUNTnm5c1uhVuJRFCWYDcnIJFef6/qs91dujH5BxxXe6w4TTJlYcsMCvLXEkk8gJ5pUqUuTn6GanbRkUdxNbziWBsEDGD6V0Ok6z9ucwPGRIo61zb7UJLdRS6RrdpYasyznaXXAPpXTTtKOi1HGTWrZ3R4NKSDWTaa/Y3l0YI5ct0GRjNag61g4yi/eOqM7hiqd0hnKoSRGpyferjdKqXZdYcR4y3Gae5Zy/iK6aWVLb7sS/wjvWbHbM5yEbPuOtbb6LK8yyPIGbOSfathLNFZSEzitlJIRj6ZoYdhJNhe+2ul8oJEsaDAFLFEE5qWsnK4NlNrUGo3sA4PzYq8eta1p4XubyIPNIYEboMZJqoQlPYiVSMPiOPk2xExwKN3d6Ys5j+RBg9yO9dxL4BhMRWO+dWPcoK5rV/D11oYDy/vI2OBIvQH3rWVCcVrsTDEQm7LcpRXMokwSTVt+QDjrVO2GHx1q68kUa5lcLjtWDWuhuVXU+lV2jOeRViO8gmm8tDz6mp3hApXsBRCZp6qRUxTAzimc0XAQ+9RNg1I9Rd6EA3aM0+kxS02AoGRTwOKRRTqQABzTwMU1etOoAKXrSUooAeOlLSDpS0AGcU4HHNIKWkwM8HjFLSDrS1JY4dKWkHSloAUUtIKWglhRRRQIO1Np3am8DrTTAKUdjUUrhVLdgKoW2qJNcNE2Fx096tJsHoa2OarXkpghZh1AquL/MhUdqsOBPbuhHLLTSYGDHrEnmknpVu5uCYfMVs8Zrm5g0czpnBU4qxFeuLUwsCT61uoLoZqT6nR2koltTuGcisDUIAkjMvQmtTTHLWWBVa/iJiY9s1K0dgkrox155qeCZ4Zg6kgg1XyVOKsRruIArbczQ6VTLceZg/NzW5YWwEanFRW1nmHLDmtO1j27EHGSBk9qxnLoi0rbk8fyNnFXVkyo5roR4FuzyLyHn/AGTSp4FvUbcb2E/8BNN0Kj1sR9Yp33OXuBVCEbZmI712Oo+Ebm1sZrl7mJhEhYqqnJrlUT5s1E4Sg7SNYVIzV4lm3+Xg1bKK4+bkVVUYNWVPy1kyinNZr5u5Op60qwbau7c80hQdqOboJkCqR0qQU7aab0NBI4DFKSFG5jgClHIpJU8yB0A6jGacUnKzJlszD1O8juJUMXEkf3XFXLK3fW7NodXvSlsrhkUKAWI71li2V0nRZALiFsBDxvHqDUV1Z6jbwQ3ErRiGU4QLICfyr1UqcYJnlvmc7M0tWt7h3igsYGSCIYj8vtVuzN5daZcPeZ32y8Z7j3rO0vxDPZXAhLKfmwwauxuXhu9Bu7i3AxJFzgd/Srq0KU6XNYUXONS1zxRtSvbm8eWWQ/K2AB0AFajww3aiYrtkHIx6+tZM58hiAuGGdwNamlRS3cG4ELvfYuTik4wgloaKTk7MjuNWvLiMRTSMVQ52npxXY+H9Ytr2BIETZMFyQB1rJfwxNCly9zPEkkaggKwO7ParPhrSRb3RvI5P3YXbtHrUYh03T0HRuqlkzqqXFIOlLmvJ8j0vMQjFHFFKBTAMCkBpSM1WlvoIpkjZurYOO1VCDm7IU5qKOQ8Ws51GNmiym3AftVbSrf7RClvcWoaI5Cv3HvXoOpaRaDTpYeJ0Vd+SvPIrzrS9SkhnNobYpKjHYT0YV6OGqxl7nY8urzXubtrC6Zhk5iU5Ax/KtGJYC3zoMH+8KprOIpBDI22Q8kelW95kGwYYjriu6EUc8pPYTV3EGkyW8HyxSKfoDXM2F/d22lzWFirb5UJlc9DW/fX1ulo1tcKudh2EdyazcPHpcC2sfLr88g7nvWWIqKC0NKV29TpdHfzNFtWJ+YxjIqa7OLSX/dNc7pWrfYXis512qQST71v3bh9PkdCGUrww7151CF68H5o7qsr0JehhKAzrnp3reFpbFf8AUqePesEZDYHfoKl8ycfxyfma+zzPC1a/LyVOQ+Ty/FU6Llzw5iS/gSC4Aj+6VyR6Vd0nPkvnoWGKynbc2XJznmt2yaF4MQnoOQa4c356WBVN+95nZlXJWxrqL3bdBb1ttnKcZIXj60y3uN1lC8y7HYdKtMoK4xmmPDvUA/w9K+STTdmfUu6LlvHugSWMhpXYqoB6fWtgbrO2RpZR5mPnbsTWFEfsGkyXygeckoUY7qetGoaqnlC8nicIowsf8LNWNejeXL0Odzve5a17WrZI1hmO1zg4rgLm7jWZnjbIOatyTSai7S3DDc5JHoo9KzZ4VaPGRz3FdkINU+WxjdXM+S4mvJWSPKp3Y96zdZ0x4zHOCyBuM98111vZxwxpIVBwAeaxtfkNwkahgxDcgdFognF6Ibehm6C802r28Ejhf3gO7HX/ADivXcAYOPm715L4dhabXLfAOFf+Vesltx564oxTu0dOH2A8iopFBGDUtIQDXJsdBAEyelShQD0p4AzTwAadwuAXijbTqKFZkj7S4gtL2Oa5RniQ5KqM89q3tR8X26WAfTSs1w5ACMCNvuRXNSANkEAils9PlvZvLt4tx9ew/Gt6VWUFyxRlUowk+Zs0dK8UatLq9ta3KxyRzPtIVcFfeum1+3S40K9STkCItz6gZqPSNBt9NxK37y5xgvj7v0rG8Z+Ibe2tJNOikDyy8SFTnYPT6mu+KlGm/aHE0p1V7M4Q3At4d5IDEcCsaS6lmYtKcknr6UTzGVxuqWztPOlMjf6peTXDypHqosW0RiRZCTluldESoijLkLle5rMhKRr9ruMJAmdgPesW41J7y4kk3EJnCioUbsGzdvdRt7R1WQFif7vNIb20bHzkZ7Yrk5HeWb7xJHrWiRuKAUchPMzohGkib4zkVXfC1FYMY59hbCEVcurfnK9KjZllfNKCM1Fgg4alximBOpFLUIp4ftUsCQcUu6o6cKAHilzTMmjdQBKCMU6oQcipNxxQA6nDpTAc1Io4oAzM+lOB9aYOtOqCx1Ppg6U8HIoAdkUZFNooFYdkUZppOKTcMYPFNBZC5qNjjJJ4FKrq2VBBI5xVe9bbA2DzimkJpFa6vEAKg5yMcVzEr+Xcb1PNDTSCVvmPBqItkknvXVBJIxmzZ0yYz3ByOa6ENtH1FcrpcoiuQfWurTDqCKipvcqDucjqkXl38h9eaqANkYrX8QR4mVh1NZao64z0raFuW7M5J81ja0c5DIxq7qFsBbn1xVbTYwgBz1rUnxJHg1jLSRqlockYAcVbtbfZkkZFXJ7Yg5QcVZhg+QZHJpuYlBE0BO0AirS5BUjqCCPqDUSJtFTIMkVm273KstmdCPGWugcG3wP9itLQ9b8Q6vqaxb4Ft0O6Z/L6L6D3rk+lek+H7FNK0RWk4Z182Vj9P8K7KE5zlq9EcWIhCEdFqyn4v1eOx05rNfmnuV27f7q9ya4BRtK46VNqN7JqmqTXshOHb92PRB0qOubEVHOZvh6SpwJBUykVAOBipU64rE3uWQRigAdjTaVetKxDdwI5pMe1PpNtCYhuKUdQOg70oGKXbmncTVzHv9EFzcNLbymLccnPNRGW0gu4prvTkZoDhCScHFboXA61Dc2cd1H5bHDHo3oa6qWIVrTRy1qOvNE5TUdHmKXOtPcQoJJMiFB0BrU0PxE+l6IYTGkpdiSj81Ldafdz6eluWXKDaTj7wzWC9hLDIyHqDXdSqRtZPQ5pwnuZkOjNq+syLJOtussrEM3bvxW9p1pDDp7aTdQRSLHIXSVchm59e1XLPTPtFmvybSXzvPUVpppzRXwk+VomXp6VlVqQTu2XGnNiW9pHIsTtAAMFWUdMdPxPvU1nZxWQdIhiMnIB61ZHHHb2pCM1xVa8pu3Q64UVASilxRisDYBS0AYopgMIJBPf0rF0tY5vEccd6rpEpLg479hW7z261DcLiIn+KujDtu8TnxEbrmXQ2dWuo1XbAoZsZOO/pWJJoWnattuolCTIcsrdz/hVrQRA6SxXIHmu3ygngit62sbSFJuVYseefuj2rmqe0oTskYxlGUV3PMvFlsul3EN7B8zOcGMj5frUOg6rMzXFw8a/KmFAHetu8ls/EV9PbxyARWzFFY/d47/rWFfmLQJEniuFliU/OEPGO9elRqVPY2e5g4rmMzUGur27WaRSuW2qB/Kui0sMLBLa5VFYj93g8jHY0lytpLp4m8wCCRQ6N+orOtWefM0pYtuAYg/rXFJ1avus35oRWpHrMyGVI4VMku7advIUVv2aSxeHFSYFSDwD1xms/wAPRMdYdhGPLRWBOO9dDqSk2TBVJORwBXbhvcr04N9V+BnWv9XnJa6GPDzcR/7w/nXRnYePlrm/KcN9x/ypMOOfn/WvqMxwUcbJShUSt5nzuAxksGmpU27+Re1UIJU2gbsfNik0liLlx2K1TWOWQ4VGY1s2FmbZCz/6xv0rDHSpYbAOjKXMzfBqpiMcq0Y8qLWT6UdjUm0UjLxXyFO3MfVzva6Km/YroTuVjllbkcVBq+oQXehmwhObiOQHAPY1ZltEnGHJwTyBxmoxp8MLMyQqdxyT3/OuydSnY4405N3ZysTXGmMhuVadDkbFxzWT517Kjf6K3lIxJ5xgeldpd2DFS8IYSHr349qyL6C8mVLODIDD5jjmmqy5SvZIqx6lFJpYHmHzduCD/L3o0jSJNXk3SlVtwfmAGC1bumeHrWzgXzEEkp5O7nFa8caRLtjVVH+yMVjOtpoXClqU7LQ9P0+bzbePD9PpWln5femCnVyym5bnQklsHNPHGM0zcFHNMnnSFCWYDaM4zzRa6Kv3LAIzTsiq1vcR3EIdM496kNS1Z6iHb+aXPrUCTRG7SGRghbncw4qxKbUz+VbTLI4HQHrTcZboPQdBC13cx28f3pGABrvLSzt9NtdqbUQDLse/ua5Pw6u7XItw5WNj+NdnPDHcwtDMgeNxhlPevQwcVy8z3ODFTbly9Dh/EXjGRkkg00lIhw03dv8Ad9B7157I0krF23Fic8969rPh/SSADYQ4AxjFMl0HSVidlsIRhT/DV1KU5auQ6VenBe7E8dttMlnbJXap9avvHCX+zQtsgjG6Z/WrdzKywRrAmZZOOO1Yl9L5YNrESVHMhP8AE1cEW2egV9XvDdL8o2wqNqj29azLY4jNTagStoO2abYQvLD8q7q2tZBYbEAHZvWtq2jDDe3alsdDZ13SE/Sr00SW5WNeRjmock9hWIwpc4X73atYofs4BILAc4rI+YHchxV+yChCN2WbqDWcl1KRXkj+YmofmHU1pzxE/wAOKpvHg9KSGQh+KeJF44qMoQaNvenYCcOpPFPyPWqoOKcGIpWAtAAinCOqyMxqwpbFJgO2UoXBoVuxFLkUALinDpTQRTsigDLpwOabTlqDQdmlHHSm0UCH5NGTTAwHU4o707APJ4OSKoy3sY3DcMgetTXDbUOa5K5kK3THnGa1hBMibsX7TUJBrTLkFHGPpWrevmMn1rlYJSlyr++a6eUia13Kc5FW4pMlSujmJhiVqjX5jirV1Ed68dBS2EG+Ygit1axm0RwgpIMV2lhzbKT6VgPbBGBAH4Vr6fPmPb6VhN3NIRsU9ag81lPoahl0/wA22DjjArUvE3rUkKjyQpAqVJobRiWcux9p4xW2CHQGs66tPLm3pwParMDjYBmiTuBMygjGKckdHUjFSDpUjAoW5FKq4PFPpQM9KTYFmwh+0alawn+OVVP0yM16L4lkMHhu8KnB2bRj3IFeeWdwLO+t7nYX8pw5Ud8Vtar4rGrafJZiykj34O5nBHFdVCpGEH3OOvTnOon0OaCBcD04pakKUmMN9K5d9TsXYhurqO0gaaU4A4A96jttXt5tuQ0ZPTdW1DoI1HTSZ4/lJ+XHUVkanp884jiFttEPygrHtz7muihCE4tdTz61ecZe7saIbcoINKCc1lWk/wBh/cXEgK44YmtGGaGcZjcMfrWDg0zeFVSjqybJpw6UzOTS4NQajqUdKaAaWmAueaWm4NKKaYC5AGMU0rGxyUUk+1OwDRSV0xcqYgAAwAAPSlzxRgGjA9aASsFFGaKBhRRRQAUUU4NxigBtMZM1MAuetBCnvTUnF3Qmk1ZmfNGw+VMjPVh1UVHfC4FqYbaR2nkXHDY2j3rT2ikEQU8dzXVLFOUbSRzfVYp3RxlvpEujI6eaZWclmYdMmkj0+DVJPstxnD+ldXd2hnQgHAqpa6UILhZy2SK3WIioWIdB89+hiXPh64t7KOBZPtEEHEYA5A/rUdpaX0sSL9nZN42sxGK7LNFc8MU4LRGk8NCb1Kmn2K2NuIxgseWNW6KK55ScnzM2hBRjyiYFLRRRzy7j5V2ADHTiiiik25bjSUdhcmlHPWjg8UYFK4w2im0/aPWmbR60AFN2LnO0Z9adj0pcGk2xWQwADpRT9lG3FIYzvTqQ0gNKwIbN9xccEuoz+NZC6VPLq/2i5lDxk5wOn0xWxIRsHrmpO9ap2ViWrsRI44U2ooUegrR0y2gulk81cntVKK1mupNke1VHJZu30roLDT1tkOAWDDl2POfalUhaPM2Zyq9EZWu6Ve3pgS3SPyxxnpisqFB4cvmklaGXjg9T+FdVfPJb2Tvk7V5zXmeo3DXF3IxYms6VabXKN1pJcpqwas+oahIu8xBhuXDY/DirpiuBk/a58HoPNb/GuNIO4FSVYdCDW1oN7czySW0z7gq7gx7e1dEU+XRmcZRb95Gt5c563dwP+2jf40qwTg7murgqP+mjf41YIx3zSHpisud9WdKhHsZV5d/Zn8uEFpG4Bx0rMSymd2Zh15J966NokY5Kgn1ppjyMbQB7U4yVjQ5WXTprl9m3AzW1YWEdtGFVMHvV9bcA1LgCm5tiIZnMEW5RzWUSWOW5JrZkjEq7TVC4RVOFHPrRCwFYU7zjCd47UEHHpVYgzyBc4RT81WgNS0uZJT+9HXpUsqZOe1VLcO0iBB05NI+qwM7JGxcqcMV6A1m1dgh7RkmmGE4NVDrIMshKDYo5xWTZaxcXWoy/vSI+qiqjBsdzdMTg/dpoU+mKktLpnkKSqNp71ZkhxkryKTArIpp/z9jTttFSA5N/c07FRNkjiljc0AS9KQk5pTkimZx1oBlEZB605WptGQOpxUF2JNwppfjioJrhIxVAagTcmIkBSOMVpGDFch1m9dXCRkjHPFXdHvhdw7X++vWue1Est243E1b8OyH7ay9iOa2cNDLn95nQ3fzLj8a5e/hJkLCuskTcCe2Kxry3GXGO2RmppuzKkro59OWNbukTmSB4WPTpWGUKSEGrmmOY7oH1PNbTV0Zx0Zb1CHaqsowc06zjwQ2OSavXsW9Ae3aorZSOO1ZcztYu2ty0Ygy9OaihzDLmrsQG2mTQhhkA/hUXKHFt4HercOCuKzYGKvtJq9E2GoYCXCbj0qskXl9BgVovgioimRSuBGlSjk4qIrg1IlDAmA5pwXmkHWnVIEmBSgUi8il6UABGKinmSJCXBI44HU0r3dtHMsTygSHop9aiijW/1G3Bk220UmZJF5/Ct6dKV72OetVSjpuLp9/di+kJlZYvPAjXPAwK1Lu+llGGmY7iASOnNcl4j8SRjxMDZKBaxnbkDGW6ZrQi1gvbxpuUqHUlXHzAg11U4yopyijg51LRl7XvDavdROXbyY/vAfxD1rGnjittQP8AZpkMeBtVjk5711Wm+Im1RIjdQIybGBUDrzVK+mghkY29tHH6Y61NGcqsW5ImULNWYWkzXEeWGHXhx6VZrnLO+kh1wRsMxzrgn0NdJgVxzhys9KDuhKKdgUYFQWJmgHNLgUUAFFFFABTSDnrTsgdaaWGaAFxS0UUAFFFFABRR3oPHXpQAYHpSdOlL/WnL0oAYM5p2WFOppb1oAXe3ejcT1phYZpcgigBwIFISCeKbgUtGgBRSZNGTQAtFAooAKUDIpKcCAKAE2+9G0+tOooAYRzRgUp60lADlpCpJzmk3YozmgBcEc5zQGx1oyaUc9aAEyDR8tIetJgUmNbkdyypFuPQHk1MMeuc1Vvo3ktJEjxvK8ZpiPJbW0KyDewQA49apw5lYlSszTs2eG8hkBJCDGM8V08N0kq8nBPf1rmLJo7uKOIFkkYnzDj9Aa0riW2sUit1DNIMKqg5b61z1otNIxdm7k2vSlNOkiDff4FeYmMmSTc4B6811Oua46yfZwiusfVhzzXF3V6zM7+WV9q76aXs7dTnvqOldY1ILD61n23if+ydTIKhonHOaalrPdyhpC2Oy1W8QabHAkTMVMjcEDtRRjaVmPmOu07xUtxfCOeLYkjYQqc8102AeleS+GlVdcto5cuokGB6GvW8j0qcTBJpo6aMnJaiEDFNxS5NFcx03AJ707aKB0paAGMMEGqNzEScir7VG4HpVRdgMhwcYweaPLSOPaBhj1rQcIuSwHFZ7qWYueh6VafYkoavqcthp7R24w8vG70FZfh0iS3l7sG5PrS685bamelP8OL+5uH/hU81tZKNwIbi4WG4mi7kVHo0ebxwF428n0qG6BlvpJB0zgCt3S7BrO2DyD55Tu/CmnaIrFyMbeMdKvLfRrGFdCMd81UOAKp3DEr1rJq7C5qi7tnfar/pU/lAjcpDCsO1QBckc1didkbg8Ck4jLbJjmgLipInE68dutNbg1BQvaom6mlLEd6YSc00DKG4VWvZWFuzKeg5oaXaMk1XjuEuJZbdhj5fXrRCPUp6oxDfTFsk5WiacSSxyg4ZeMUalaNaSDGdjdKqDk811JaGEm0X71DPskXqRgmtbRbZbdy2csRWJFMUwOordsJNxDUpXSHDU28ZGe1Zt/wASAitFT8gqjfJujLelYI1aMG8tjnzAKhsAVm59a3RCHtwCO1ZPl+XcHHr0rVO6MnFp3NxD5kGD24psUew1HAxA+tWF5NZvc0RMlSqAUNQrU0ZwalgVGTEuamQ4xUroCc1GFw3WlcCyGyKUVEp7VLSHZjWTJ4pFUin0uKLiHDrTqQDBpwoAcp4xTywRSxIAHc00LUV6GaylVBliOKukk5pMiT0ZyV7I+pak5EuNpyWUY4qrFrE+mSFhL5UYP3M9frVzTlgstPv7m9O2ZfliHqx9fwrkp4JriXfOHVW5AYc17UJJRsjx53bux97rJv8AUjNtCqpyoHr612HhhLjxH4hhJi2QiPMuBgcDrXGR2Ae6hnhH7qNgW98V3+m6+krvHHH9mTaQJkGMZHeos3e5BaW+sNJ1mTTYpi6RDarnuepqrqOt2/VW3HPQGuemMcV47P8AMF3YY8kn1raI0O3tN0SGe4wDgnvWV1T91LUpzsbOnWls9vFdlg3mk8dwa2Aa4e61SOK7s3tQypKRuTstduuGAYdCMiuPE03F3fU78NLmiOoo59KK5jpCiiigAooooAKMCiigAooooAKKKKADFFIaM0AO2sOgpQSOtM3t2pQSetADsig4702ncNwRQA0lM9KPl7ClKKe1GygBpNJSlSKMGgBMmilxQRigBKKKXFA7EM03lbflJye3apxjAxSYpaAaCiiigQUUUUAIaXtRRQAmDQOKWkPWgBaKO1FABTWUMuCBjrmnUjfdNELqSsEmlFg8oGieVbyZmW4BG3rio9XvLy100X5Kb5PkWTutV5ZxBl2yoJ7dapahfT6rZnTnhkjiif5ZMdq7qlJNXOBNtmZbskkBJYyEqScHnNUbh4QiEkBXABz61ObWSydX0+RQwXad44xWY+m3sML3M10igElR2NXFQ5UFnc3iqR2qyINvy5/Cub1UNcbTtICtnkct9K0bS7ub2wFvFAzMBjcBwfetjQtARCbi9QmQNhFY5xWV4wdxxg2c34V0+RtdikZGVUO4kivSWJzzjHtUYhRGYqijd1wKeOPeuarVc2dlOHKgopSMCgDNYmgo6UtFFCGhrkDrUeQxxUrDcMU0j0oGQyx7wQ3TtWdODEhz0HStFtzHA4qtdx5gKjljWi3CxxurM0jZAzzxWzbWn2LRBEATK/J9qsQ6TCJElkBZl5rTjjDD5h0qnPoFjB0zR/OnE84OxTkL6mtydcr0wBxVoABcACmugZSD3pOdwsYkpwSKqmNpHwK3Ws42OSM09UgtxvAUED0o5+xPKZsVrJt+6R7mnQwmSQovUcE06S5kuZNq/d7CpoAtnGzyHGeSafNcCSKA2wYbtxP6UrIx5xxWRfa0T8tuMDuxqXSLuVgxmbKnpS5XuO6Lh4yKaOBVqWMFciqZBBpIDhp9Se4YNkDHYVNDN5d/BNk4bg1joRV1GzCvIyjZrs5FYzjNtm9raebZnA5BzmudWusnRZ7JGByCormjAUlZcHrWdN9ypJsWNC7BQM1vWEXlYBqlbRBADitGE80pscImsD+7FV5hvUqe9OVvk5pjc4rE1ESPEeKybiIrdccZrbQZqnfxAyKR2poTGqpCrirCDioEyQParS9KHuSFSITTNpxTkyDUsdifqoqMrg08GgjNIENXrT8n1oEZb6Uu1VPJFdcMFWnHmUdDjq5jh4T5OYUZp6007h9KUHNccoyhLlZ1RkpxuiSlFIOadQhjx0FO/CmjoKeOtNO2qEzPv9Ljuk3RIomByCemfU1zGp6HcrdxRvLv8443Hiu5qC4tIbsKsoPynKkdjXVSxEk7M5KuHjLVHJ3FpbaSps4ityyf6wjsx7VhXl4xmSBE8tSei1val4euY7p3hdmVznioLTw7MZ9zod/UMR0rvjVVtWcSotOxjyW7+Z5a7i5O0E9629K8PXKzrIyuB71qWXhyWLU1nmmyI/mTaOp966TjGAK5a2JSfunRHCqW5jxaFG06yzEHb0AFbS8KAOg6UgGaADmuOpWlU+I6oU4wVkP3H1pRzTacKgsNw9KNwoppXPfFADtwo3D0poXAxmnUAGc0UUYoAKKKKACiinAYNADcUYp9GaAGUU7IpDzzQAlKvWk7Ud8UhD6M4puKTn0oGOLZpMmk7470Zycd6YBRRnmigBksiQQPLJwiAsT9K87m8Tam88jx3JRCxKrgYA7V0fjDUPI05bVCQ8/X2Uf5xXF2dpLe3aW0K5kfpXrYGhHkdSaue9luGgqTqVVobel+Jr8alALqffAzhXG0cA9672vIWBUspyGBwa9O0S9+36RbzH723a/1HFZ4+jGNpxWhlmmHhCMalNaGhRRRXmnjBRRRQAUUUUAFFFFABRRRQAUhGQRS0U1KwmrjNg3htoJHqKlyO4GabRTdSTEopFS8sUukCFFAHQ4rFudAlvLpI3OIF7YwK6fIxTR0welP20hOEbkNlZwWVuIoU2gDB9TU27tjFFFZuTbK5UtgyaKTIoJGMVJWou7NOXvVK6voLRN0jjPZe5rEl1O+uXZo28qPsuOtNK50UsO5K7OporFstbU/urseW/QP2NawIZQwIIPcUnGxM6TgSU09aSkzQiAI71Cy5NTE00jNAEYiAHSlC7akHSkbpQA2iiigBCQOTVC5nySiDPrmr7dCKpSQE5IYAelVEGQxMsByVzn9KzNW1JJm8uPOBw1WL258iJo4/mdv0rGjhkZ8feZjW0UiGNC7zhcknGBW7BEsMEcXels9PS1TzpeWI+UVIwySxo5ug0ae0rEoJzxVZwAwxUNpKfMILdexNSSjBz2qOozzKNCCM96lAxT4bpG+SZQQejDqKaSNxweAeK7DnLlvfzW6BN25D2NWUmSU7uKyvepoFYuMColFLVGsZNm1EM4/pVpPlNVLZSDzVteTWL3NC1HJxipDVZRgVMp461A0ToRtpki7+aFpxouMh27TwKkHSnlc03HNK4WHD7tKvWgU5IyzZHSrp0p1HaKM6tWFNXm7D1BNOJCDNDOEGBUJYscmvboYKFL3qm54GJzCpW9ynou44yluV4FMPPNLRXVKbexxqKh5jknKDBGRVncrpmP8u9VMCkJb+EkEVnXpUsSrTVmXQxFbDSvB3ReXIHNKDmoYblWG2Uc9mFWCAAMcg968LEYOdB3lse/h8ZCuvdeo5RwKkUd6Yv3RUi9K5rnU9hcUYpaKNyBMc0YpactO76sLK9xAuB1NLtpaKAADFFFFTYBR1paQUtNAFFFFMBpUk0BDnrTs0b6AEKEd6ACKdv55pdyk47+1ADaKdgUbfegBtLupcAUcUAJuo255zS8UmeaAE2kUqrnOR9KMn1pCSOaaV3YTdlcqajqMdnbMyAu2doArP1TxHZ2dpAtrIXuWOGR1xiqOuyyaeiR3GPMJJjHcg9zWfpXh2518NeTzLaWMbZM7jO4+1ejSw8UvePPlWd9Dc0nxPFfxssq7ZUODjpWr9tt8Z3E/jXLi2t/C2pmSe2W6iRgHB43A9K3ovEHh7X0nsYNOS1u1BCsWxtIrRUaVri9rPuVZfEsUd4sEiEb42ZcDJyKy9O8Whr24jvYjtwNoxyK0bLwpfXLPqcUqSNbjb5H8RHXIqjreiRX6rc25WG6X7zE4B+tV7Cm1oS6876nT29xFdQrLCwZD3HapsA9Rx71h+F7CfT7SRLiQNI7E7Qeg9aseI74afo8rK372X92gz69T+ArzpUm6qij1MMnWaSOH1+//ALQ1eaVSTGh2Rg+grb8FWTNJPfMOFHlxn3PWuRPWuz0jxLpem6bBalJt6DLkL1Y9a9fEQlCjyUkfT4uE4YZU6SMHxHZ/YtduFAwkh8xPoa2vBF7h57Fj9794mfXof0qh4m1Ww1VraS23+amVfcuMiszSrw2GpW9wMhUb5v8AdPX9KHTdTD2luglSlWwnJJapHqeMUlOJBXIIIPQ00da8Fq2jPmXuFFOO3Paj5e1AhtFKRSUAFFFFABRRRQAUUUUAFFFFABRRRSvcAoPSjNV7u6gtYjJNJtXt6mlYaTbsSM20dPxrJvdZCN5FmPMlzy/ZapXF9caidi5jt/QdTSRxIi/KuOxPrVKB3UsOlrMjW38yQyzv5kh7mpwgFKBig1okkjoWhG8SOMMMinWt9PYMEOXgPbuKWkYbjSauP3WrSN61uobqMPC4Oex6ipyOa5MxyW8nnWrlWB+72Na9lrSTERXP7uX1PANZuNjknh3HWBqUUgwRlTkUtScz0dgpG6UtI3SgBtLxSdqbQANjPNULydwPLhB3N3xV8k4qMKA2cfpTTsBgrp9zNIflwe7GtO00+O2XdgM46mrvJPHFMlnih+X+KrUr7CsRzRNMnXG2qvkyS8KMAfxHpRPeytgLgCqVxcTPFtDHHoKpILFsS2NrMkbz7pmOAEGauSL8tc/YWux3uZB8wHymt6Jna2UucsRUy0YWPK4zUwpzWFxbbmlTAzScV23T2OezW44dKtQOVIx0qoDUqSFD0qWVF2NqGQso9qtxt0rHhvVXgir0d7FjvWTjqaqSZpqwIpw61TjulP3cVZRw3NZ2ZaLAPSpAeagDc1IrDNK12MkzQBuNIgLtgdO5qdjHGMbcmuzC4Gdf3n8JwYzHxw/urWTGLEE5Y5oaUtwgwKaTu55or2Kap0o8tNHgVJ1K0nKowooooS1uxbbBRRRVDQUUUUrCEPIqWCd4iAfmXuKjpQM1XOrcs1dEqDXvQdmaMbK4BQ8dx3qYdaywWQhkODV6KUEfPw3oK8zEZcpRdWg9Oq7Hp4XMWn7Oste5PS4pAc04dK8ix64AYNLiilHSmMMUYpaKAExRilooAKKKKACiiigAoNFFACbfWjYcZFLS5xQAzDDuaASKkIwM7s0maAE60UUUAFFFIzKkZds4AJp2BtJXZFcXKW5QOGO84G0ZqxC8X+ud18pRknPFcrr7TzwwOjMq4LsFOOvbNZ2mTSWnhu5tBI0rAl8j3PSuhUG0pI4qmIV3EseOb9dZvYJtKtZGlyIHYcg+mPStjR7u7t9E8i9jIiiiDIHHK+3vTNC0yG60KW0uiVNyd++M8oR0/Gtqx0a7TQkRwLmSL5FdjkuoPf3rtrKXs7Lc56bV9TMl8PP4k0Q3XnFJRJmMqckY6ZFcVdeGbzSbqSee43SliSycDJ75rpT4xl0TUZIBaMkpfaVQcY9xUOu3V9f3Ns32dmilOBgHr7+1EOaCSE5Xd0aHgjVNVkgnt45At4qjZuHUe9Z2ozalbaw0l/GnlrJumizjccccdhWr4Xsb3TNWN3cWzCMx888bucVzmtXT3Wq3fnkGaRz5jZ60UlJSaZc3GVi4uurNKt1F8pHWMHoKzPE2rJqV6iwtut4l+UjuTya5IXgt7qeKJyVBxu9q0I182LfGwKjjArShTUavPJnsZNVo0pOdWVrFqx0+41O4aG1QM6ruOTjAq/8A8Ipq/wDz7j/vsVs+EIpLN5BNDgTjIPfiuu6c5NZ18dKnO0T1K2bv2jVLVI82fwxq6Ak2hwPRhWQRgkHqOK9f3dT37VwWq+Gb86lcPbWzPC7lkII71rhcb7T3amh0YTMXUbVSyOm8N3n2/RIWJzJF+6bnuOn6VrhT7VyvhW01HTrqaG5tnSGQZ3HoGHT9K6rJry8TFKo7M8fGQjGs1F6C7PpS4FMzRmsDmJMUmBTM0oJoAdgDp0ooooE2FFNY9qQcGgY4jJpuKcDml7UAMpQM0nenDpSbAb0o4zyQPelIGK57U72aS4e3UmOMcH1amlqaUqTqOxbv9YihPlW4Es3b0WsnypbiQzXMhkc9uw/CnxQRxp8uPrUxOOK0SsejGnGnoNVcdOlLRRQU9QoIzRRQK42ig0UDDA71DLCkvB4I71NSY5zQFwtNRnsv3b5eI8ZPat2OdZo1aMgj2NYJUMMHoah3SWUweKQAehNQ4ImVGNRabnUZzzRVWxuzdQb2XaQcfWrO4VnaxwSi4uzFpvelz6Uwsc0EjqKaWxSeao60API4qrcRyP8AcAP1qf7QlRvcxA/N+lVECg9rO38NMNiwG6Q7B65qzLqaIGCIzE9Kd5P2mNXnbA/uDpV8zAosySMIIuUz19a0zgBQowAMVGzW1uAPkQ9FGaeBkZBzSlqBxeth4woJypPU1hMeeDXY6pY/bYcDhgeK5KeB4JWjbsa6aTVjGqncYCcU9WJFMA4p61qyR461MpqEU9cjntSGjSte1asHTmse2kAx6VpxSqRWMzWLLgPTmng4NQoQTUwODWJRNFLsGMVLvD46CqwOaVWIrqw2MqUJafD2OPF4GniFf7XcsMMDJyab06kUiOTwakZB1HNe7SnTrx5qWj7Hg1qU8NLlqq67jKKUjFNAxUO60ZDs9ULRRSZppgLRRnNFAPzCgc9DSqCzYqeKA5yRinNRhHnnsSm5S5Ke7GRxEn5ulW4wMjilVAKeq88V5OKzFyXJS2PXweWqm/aVdX2JB2qQUwDingcV5miPU9B3FFIBS0wCiiigAooooAKKKUDNACUU7b70m00AJRS7TRtNAAtOwPSmHIpMmgB5Re2c03aRSZNO3nHSgBKMH0pd/sKdQAgHqKa0e8EEZB7U+k5oTcWTJKSsZd9YGWHygPk9MdqwwU02Vv3LvLKpQRr0PFdhzjA/Wqd/Zi5jJXCyryrAd67aWITdnocVTD21Rz2orPDYQJZErG8ivvU8n1BrvZNYgstL2KBvjHzY7HFcGJ5Hma3dEEaDexY4Basa/wDFD+dd27AbHBCt74x+VXWjUlZwMoON9SbQLiO/8Q3S3b75pPmVm5IPpXR6nqEdnaea0jonCjjGK860fTr57sX6ExqzbRzzXR6zp899aGO388E8DzT/ACrqu7WkQ7XOl0jVHvNOCNIWMfQ56iuE8Q3cUPiK2uAPMjJJ2g/e5rY0FpLCF4pc7wAOe/BrmdeMOyFVOZkBJJ6g5rn5JOq29i7pIypmje6kwvyPycdj6V23hXw2xt1uHRtrHI3dMVj+ENBGsXf2iQYhU5YD1r1eNUjjEcahUXgACitV9nsaUqHPqylZ2Dx3RllYDaCqgdMVoUUV585ue52xhGGwYoooqSwwKMD0oooATB9qXA9KTNG4UALgelJx7UbhTT1oAfRTOaOaAH4pMD0pvNHNADuBS0ynA0ADD2puaU570lAB1qteWUN4h3Ltlxw4qzRUq61KjJxd4nLzwT2TbZV3KejdqkVldchhn610MqRSJslUMvoaxbzR5IAZbQl06lO4q4zO+niIzVpbkS0HrXReH/CFzq1ol1csbeFvujHzN7+1dA3w/sCmBdThvU4rpWHnJcxjUx1Cm+VM88ora17w3c6EyyMwltnOBIOx9CKxScVnKLi7M6KdWNRc0dUIetJQaKk0CkyMdaRnVVOTjFQxJcXsvlwIVTu5pMaj3FaUg4Qbj6CrtjpW9xNeE7eoSrtnYQ2aj5d8p/iPareSSc8mocro56uIUfdgG2NRiNQq9gBSYzS0VByNtu7E2+9BX3paKBDCvqaPL9qcxwM1H5zKPmHFNAQyDmqmVDHqTVmXUYgxQRl29AKgYLt3XD+WDztHWtEgEt8NOCULj0pdT1KCyUg4aUjhR2qq1+YYnjt1C5/jPWuam3NKS7Fm7sT1q1C+oizA02oamrOc87uvQVtaprP2CzyrAyk4Ax2qvo9k1tbNMy/O/wB3PpWRqVvNeavDFEhdscjtVcqkJtpHSFcnJrmNftjHceco+U9a60jIxWXrVtJNZHyow7Dsayoys9TSpG60OOpw60Y2khhgjqKUda7WcrVh46VIOlRing8UholjJGK0LcnIOaz0q7CQCOaykikzUiJNWAxJqnE+BVhGzWTRqiZSaeKYlSd6h7gLT1JHc01adinGcoPmi7CnCFRWmh+dxGaCMUlKK9vDY+Fa0Km/c8HFZdUo3qUvhGk0nU1KVyPekVPmFdzoy+zqjzfaR+0NCmnCMk1KifNUoGK56+Lp0FbdnTh8LUxEr7IRI1TvzUqknrTQOelPUYrwcTiKld+89D38NhqWHXuLUeOlKcqCwGQBnFIKepO3jmue3Y3uMs7j7RB5hQoSSMGrOahTkfJtx7GpR0GadiWxQaWm99vc8AVPLbzQrl0255FUkTciopM+vWloKWoUUUmaADNAYikooAdml3GmbjnpS9elADt1G6m7T6UmKAH5ozTeaSgCT5aPlpuRRQA/5fSlwKZinUALikoooJe4Uhxz0oPI4puD6U07MUtVYxxpsVwk7SKxLvzjgj6Vxus+G5pNUbyCfJxnzHOTXpRyOV4aqs9o1zhZDhOpAHWu6Ne0TgdFuRxkOlXC2EVtDKQqzLJv9cDpWhHaTxusis5K8gEk11axIihUQKoGAAOgp4C8cD8qh4tF/VDiLfSJFdnkZixfcM1T1Lw7LfanuVPkPtXoTojDBUGoHtyRiNwnrgc1rHEpkSw8lojF8OaYujsLVSSZf3j47YrpQuPpUEMEUCkgksfvMepqcMCo5riqtSlc7KUXCNmIQc8UVIvI6A/jTSuT0rI1uNop+ykIwKYXG0UUUAhhBzRg07djilzntQMZg0U+mkc0AJRQCM8mnZX1FADaKdkYptACgZFJ0NFFAmxSc0lFRTzxW6b5ZAq+9CTbshOSSuyWioILu3uP9VKrVP3xRKLW4RkpbCHntTWO1g2N2O2evtSk5pD0qV3GzePjVRp8kcdo0VwqbYu6ZrltL8SeJoNftkubmSdZpQrR7cqQSAcY9M/pU7gcHAr0KxGjtIv2U2pmHTYRurvoznVau9jB+yoxd43bIPFoi/4Ri9MhG0Jxn1yMV5KDn8ea734g2Or3NmkttIrWUWGlhUYb6n1HtXnkdwrDGcY6g9qMV8Z25XTvSbTJ6hecKSoBZu2KEE93JshXI7ntWtZ6ZDbbWbc8ncntXK2ehKcafxFG10qW4cTXJ8tPT1rajVUTYihV9qcWJzmm7cd6zk2zkqVnMd1OaKQnA4puSakxHbgDQGzTaQcGgCSmkmkz707IxQAnJ6jNV5SI+XbI7AVZJGOM0zAPUA/WmgM6e8wP3Q2H1A5qixZnLkHPrW48ETHJRfypBbx/3FrTmQHOyRs+QoPPYCn2WjPNP5kw2ovOD3roBCinKooNOAyADRzisMaMeWACFXGAMVUENvpYeWJN08nfqavlAcc9Ko3JWOQyN26YpRd9xiYxTSCDUg5NLt9azNTI1DSobmNnCYlxwR3rkZI2gYpICGBxivQyOTVO70+3vFxInzf3gOa3p1LaMynTvscSDxSjmruo6XLZS5VWeM9wM1VjilKFzG2wdyMV0cyZhytDg2KnR8fWqp4FKr80NaDRpxykAc1ajm96yUm4qVJwKhxuXzWN2OZSRzirCsCaw4rpRVuO8HHFZygUpI1VIzT84qnHcIRnODVhZVbvmo5SrroSinAYpgYZqTtSYXFFPBBPSmDpUir8wrohi6kI8qZyTwdKcuZxHKOafQBilA4rmeruzqSSVkOHWnU0dadSsJgzYjOOorO1C+uV1CO2tkYKwAYla0HGUYDrjNSLgkMy/MAME9quLSMupFZ2zWyEF9xJzWlaWst5IUTAIGcnpVQHkAAnNbWk2lxHJ5jjYGHyhupNKpGXLzImVSK0Zm61Yxafawz7pPPBySOmaqWl1dTapD9unlSNxnBH3hXZzOPLIniViOckcVw/iLWppZvKjwu0Y4rOFZSjYaq+7axcu7qyOp+RbybuM04tg1xn2iWGRZYsb1PQ1t6fra3sgt2j2S/WtVTlKN0Sqi2Rs03vS5pO9R1sa9BcUooopgLxSgYptOBzQAtHHpRRQAcelIQM0tFBLYm0UnlrnPNOpCcUAmLRTd1OoKCiimknNArCgYNBOKTJpCc0BYXHelDE9aTJoXrSGOpMc5paKBCEZpNtOpCcGmCYm3PBApvlDPU1JRQN6kexhwCcU4Fs07NL1oIE8zb97mgSKzc9KU0bQe1A0LlDxmkwOxpCoxSYAoKDaSc0uDSbD/exRsP96gAIz3pQOOtJg0bTQAFRnNG0UAEUE4oATbQRijLUZzQAAZo20ZxSEkiiwgI445qnq2htqEEEzMwWM7ihHDCppnRMb328j8fapNI8RXF0ds8KmNHfC/7I4FaU1OLTXc5q+zSObvbeOO9Q6bGY1VeQGJya2LK7aaIpLxOvBFaEzi4mWOOJIy5x8orn9R0e8/tcQGcQwHgytnGffFdlejzWfQ5qU3SRtBhUkSebPHFuCl2CgnoM1zUV3Ppt+1uZPPiU7fMB61thxLGHRsZ6Edq46lJQlfodtKsqsbxOrufCfl6fIySGW4UZAHANc1a6XOb+H7PE6ThwQcYxzzmun0nxhbCBIdSLRSqMCTGVYevtWqfEuiAFv7QgB9j/APWrq9lSk1KLsYe1qxTUo3NG82/Ypt/3fLOfyryRtOtblQ7xDJ5OK6rXPFcd/bvZaduZHGHmIxx6CsBF2rj0rPF1Yydom+BU6ab2uRxQJAvlxgLH6CpKXFJXHc623LcQnFG6kakpCCkzSZooAUtik3j0ppOTimng0APLZo3VEzEUm+gCfcKNwqDfShhQBNvGadkVBuFKGBoeoE2RSZHrUeaM4pWAkyfTimsiSEHAJFAI5PYds1UN1M7YiQKPU1cVdgCdaeelMXmnVJoN25owafijFAIhdSe3FVZ4EljZHQbD1FXiM1G68YxVKTQmkzi7+xktZCdv7s/dPpVMEYrp9Zile3BjUbRXL4KnB611wlzK7OecbMdmpEeoacGwa0IRYV+anSU5qotSqcVLQy/HMRVyK4/OspSatwHJrNmiNeGXPU1bRsjms6HgCr0Z4xWRSJwRipFIyKiAwKcp+YVLQyfIpwIxUWRTg3FICVetPFRqRinbqAFbgE9sUqZIX3qORiYmPYDFRWE/mWau3ByRzVOPumd/eNO0n8m7iYKrfNgsf4fcV2Nu0TpvjOSR1I5rkLaFZI2uAu5UO3A7mtuBJ4YBLMQjj04AFc9acoqzOaUVJ3RfvSFs5i39w15Rdl5LtgQSw4rv9Y1aEWOyZ9rNwp9RXAXt1ClwzxyAkk11UqSdLmMnKRVkUg8jmm2OpW9lqkRuXCgjhqoXN7LPJtiyx/vdhWXqunyG2W4DNkHBJqoRaWrC9tT0qLWLGW6Nulwpftkda0M/SvHdOnuGuo4GYAlwPMNevRAiNAxyQoyfwp16Sg1Y6KU3JEuaKbSg1gbC0q03NOBxQA6ik3UbqAFopN1NbJ70APoxTORRuNAD9vem4NGTTqAG4NKFGKWigVwwBSEUpOKTdQFwyMUhIxSUUAOB4paaBmnUCYUUUUAnYKKKKAeoUUUUCCiiigaCiiigoKKKKADJFG4+lITijdQAuSe1FAbmlNACUUUUAIQT0pmRu2bhu9M06R/LjdsZCrmuAur+6fUpbi2kdMAljnOBXRQoOrcwq1+RWOwgjOpa/DAMGGPJlZuAcelY1zrVlY+Ip7O04giyik9yazrHxG1tC0dwoMB6yH73vXK/2nAdXWUITBE+QM5LAmvQ+r8qSfQ8+VVt3PUo9Vhjltp2jI8ly7OnQgCtsX2ma3E7kPErIGyOuTXn+hRSeINUubSyO238pmQk8DPrW9p88Fo01oZULwgI2D6Vyzop1VZsqM7qxJcwWNmHMWZHx95qqaVeh7qe1f72Q6fSob2/iWQJ5i/OcCrVlpgimS6fh3BIPZhTxSTkmzooS5dDSKK3BAP1qP7PH/cWnhs0uRXm3PQsIq+WOBTg2abk0A4oGSZpjdaN1Gc8UAMJzTdwHepCnpTCnJoAaXpjMRTWYKcE4NIWOOnHrTSAUycUm7NRmQ4IxTFnjLbGJFNpgPkcKC2elVDfjftEbkeoFWLkRbB8wXuGJqESAYYSrx2qlFgNl1WxiX97crGfRqpXniO3s41cxSvGejKvFaz2trcoDNBFJ3yVBoaCF4xGYl2DgDHGKd0BmL4m05rYS+fgH+HbzRb+JdPum2LcgH34q99itoxtS2iwevy1WfQdMkGTZxgnqVGDQuUWpdS9hK585D75pq6nZtKI/tMe70zWfD4Z02GZZUWQFTnbvJFaH9n2Zff9miDeoXmi0Quy75tsRhp0X/gQqGVY1wUlVh6A1G1pbSL80CZPtQtjaqBiL8zQrIbCMmpKjjqTOayLHDpSkDFIAcUEYoAQ9KjYnFSGmMCaAKF+MWknoBmuLYlmJPc13jrngjIPUVg6npkfzSRDHqBXTTmjKcL6mBTgBmnFSOtNHWt07mRItSDtTByKenBpgTL0q5b/AHqpqRmrMT4NYlJmtCOKtL2rNjk5FW0kzis2i0Xl6U4dagjkqYHPNSUPHNPHSo8ilUjNKwE6DinVGvFX9J06XVb0QRHaAMu2PuiiMeZ2W5M5KKuytgbeaZsDgAABfavRYtB0ewg/fxxkdC8x6mi48O6Vew/uolQkfK8R6V1rCzWtzjeLi+hxVlEILO7vMMWgAZADwfwqa71WO4tkkm8yOJF3OAOG9qgvbafTLu4tHbIxhh2ZfWqt5eQNoN1ZD/j5O1kTuRSrYbmV2jJTvsY9zfvq1wzSoqR52xrngCsqe3TaxwC2TyKWJrnT3jkukYwbvmUDms2e7kluZUtbaXyQ24DHIFaQopRsS2zVtbFREjkE55x61Q1+bfZlMBVyAqjtV6y1CJtMOZCrjI2t94Y7GqlpZzavKY02gZ+eSodOMXcqN2c9YwNLqMMY7SD+dewKoUAegxWJZeGLCyuFmi3719fWtrb3rKvUU3odNGLih2BRgUmDRg1gbC4ooyaMk9aACnEADNNooAMg9KKKKAHYFLTcEc0m40AOwKdtxTR0oz6UAONJRlvSigVhG6U2n98UUCsMHWnYFLRQGwdKKTIpT0o1C1wopAMUZAo6BYWikJOKUPjqOaLBsGD2opfM/CjfnigQlFOzRQNDD0pMmn4NJQNDcmjJpSmTmgJg5oGNzmin0dqAGUuTSUUALk0ZJ6UlFGwWuZfiCaSHSZChIJ44rlLSL7P4eudRmkAO4qEPVzjPFd7JCkyMrqGUjGDXM6toCts8uMzRq2VhLYAJ613YeslHl2OLEU5N3R53cPPeNyxRPT2pdPsAdZt1lG+13fvD7Vt3Ol3kl8Lc26pKxxhVwPatCbTYNOiFtccSAfNtOcGu+T5rK5yW7nQaPqVpYWN3DogWOQoQd/p7GuVgTzL2U+aVkcgbiepJ5qub1oJFt7P5c9+5qvI8rOMjLseSO1KUVq1uS0+h09xo1naCJ7q93ncBtU9KtpqrW2qwWBl8yLHycdBWJpdhcTlhMryDGee1a9toO++W5dSuzBHNc7a9m+d6mtGFTmuzoiAOKaetPP0x7Uw9a8qVr6HsR21HUU2lFSMWnBcU3Ip2RQAtNJ5qQA0YoAryRqynIqi1nkkrK49q0z0qs/U1aeoFH7JKXGJiKc1ixbJkz9KlYsuSBxUO6Rm4ZgKoCVrGFogsg3fWmQ2FvB8scQBNSQpIrZ3Eg1M3ak2AhAAGFxikxR3opAGOKMUUUAFFOBGKbQAU4dKbTh0oArLxxUi1AGOetODkVBZYDYGKUnJqIYIzTwaAA0h4FKaa3SgCF+tVZVyrehq2eaoaizJbyMnBAq4pCZgX0GyRsHjNUguDUr3LTEbxyKbuBrsjsYS3G4PrTlOOKcQNuQKQKeKGyR6tz0qzGec1CseatRQZPNZsq1iynSrcfQVXjTtVpAVxUMpE8Z9RU6kioF561MvSpLJN3tTk5qIU9WwKAJmPymu+8EWqppUl1j5pZCOnYcCvP8mvS/B3/Is231b+ZrpwkVznHjHaKOa8WR3usa+1nDHLJDbKMKg4LEZOfwxVexl13w5aSxxwOsT8gyKSE9xXS654qstDvDbrbtPcNhpBHgYzxyav6NrFt4gsGljQqASkkTjlTXQor2rd9TlcmoK8dDzq8ubjUXMt3MzyEbcgY4qstlbrL5gQl8Y3E81ueIbFdN1do41xFIu9R6eorKH3cetcdatPmcWddKnFxuircWJkUsjMzdg3IrHvxcwW628cY86Q4LBcHFdKDxRsRm3lQWHQ4qY1VbUt00YOkeGook8y7JaV+celbsFpDbA+SgT6CpQOlOUDPSspTuNQihQcjmnZpKCMipRYuaM1GARTgTkDg5pgPopOVOG4paAugoooHSgAooooAeeRSbfekyfWjJoAd2pAMGlHSigAooppJzQA4g/e4xUZlAmEQ5JGatWdsbq42A1DrFutpKJjIke04w3cVLkk7GTnZ2GPKsaszHheTjsKsWqJcRiUNlCMgiqGlpHrSSTb8xxybdi9T9a0/lt/LhQeWvQZqXzVfcpbmc6th8xgt4tzAAHoTVJnUqHQh1PXbzio5Yn+2edqLr9nTJCH7rj/ABrJguZF1SW4gQxWzt8kZ/iHtXo4fAQirTeph7Zt3NscjIII9ainl8mNpOSAOgHNV/Pk855JsRIM/IOx7CmtqFu9o0j7ggbDAdQfb1rBRXtOXodXOpQJ9NaS5tpry6/dQjOzPp61NHLHMgkjO5T0NYmp3UX2cebqUf2bb/q04ZvbHar2jTJPpUDxxmNSDhc571deKS0JpNvc0AB6UYGKo6jq1ppcW+5lCZ6L1LfQVz8njuDcfLs5Co7swGauhl+Jrx5qcG0dUKM5q6R1ppMH1rmrTxtYTMFnSSDPc8iujiljmiWWJw6MMhgeKjEYOthnarGwpU5w+JC5PrSg+9G0GkK7a5hDx0paj3H1o30APIzSGm76iublbW2aaT7q01uBJRQCGQMOhopPcaEzS5zTTQBg0CHg4pcA8nP4U2lBOaVuoXM++06SW6S6t5Ss0Y49/rXDXttfwzSI+4kuWJPfNelHjpUTxRyHLorH3FdVLE8vxHNPDqWqPN7HSJpbrzcbpT0AFbOjaNcf2t9ouoFEMZKlW7muvjgijOUjVT7ClwAelOeMctghh0tyJYki4RQv0FLinlc0EDFcnNJ7s6oJIiPSoiQDU5GRVd0INSWLuFAOaQKNvvTSCKAJKN4pF5WkKYFAEizKeC2DUmc9GzWfJtQEnj3pkVwgfhjiqSA0iOKaY1YdKrJOkuSsqt7elRTzSxjCHJPpQlYC1Jbqy4GQc+tQyIsQAbHPeq4+1yIWMoUemKVLfHzSOZH9T2p3AnjZgcYwOx9ac3PNNyaMmgBKKKKACjtSZpaACikJoB5oAWl3UlFAFNOlOpqdKeBmoLHKxAAqTINMA4p+Mc0ALTD1NLupKAExVS7t/tMDpnBI61cphBB4qr2G1dHDzQtbymOT7w9e9IFya6jUNMF4C4A3joa56e2mtHImjZff1rqhUTRzyjZkajAqVFFRx5kYKoJJ6YrVh0uUpul+QYzim5IXKyKFQQMVdVNozWfct5TARHBxzVQSzk5MjUuW6Hex0IIIp+RxXPCeYfxn86es0x/jNS4D5zoQ4A61IrDGawElmzkuasxTzZGeRU8oc5sB808McVTimJHIFWA4xUlcyLBeu88B6ismnzWTt+8icuB6qef55rz4Nk1La3dxYXaXVnIUmQ8ehHoa0o1OSVzGtTVSNjsfEvhy8n1iW9tYTMkwBIXqCBj8q2PCejz6TZS/aQFkmcNs9AKxbX4iqsQF3p8pkA5aJhg/nTLz4gyzwlNPsmjYjHmSsDt/CutOlGXtE9Tica0o+za0E8Y3KTa3HCpBMMWG+pOawO9RqXd2mldnlkJZ2Y9SakHauCpLnk5HfThyRUSQdaWkHWlqCmOBPFDyEFRnGTjNH8P4U1jkL9aa3JexQuNYAvGsoE3seA4PFXrQyrb4lfPNRm1hFyZhGoc85AqcE9uuelW7PRBsrstQwyz7vKXdtpl/HLpE8E7SRyE87B0Fa2hiWKJ2aNgrHIJ71avrKwugk88QbZztrDn5J8skTGpr5HP2V7caze+XMkMcZGQTwRTnKJcSQhwzJ121l61qkCXzLZQCJwMFhWNbak9peea4ZlIwxrRtTfuoJVE3podaE9adWfa6hFeBmjfODyO9W1boTQ4uO5SdyXAPWmkc8UBwaXcKQwC4OaWm7qUHNAC0UUE4FACEZoB7Um6gsAhPehJN6iuWrBplkaWIjC5BUd+K5nxZcXWo6zHpsBAlSIYDHgnHJrqdNeOFSCzFywyCuMZ/nVF7GC41+5uZLVLkKApw3IyOCPelSgvbuMvhOWctPM5Twm+pWV95cJZIM/v94ySc9QP0rq49Tg1K7NjdwtDOTiJv71TXOnpIftVnLskj439Mezr/AFrN1C+ntYxJNbCGdB8kwOc/7tdsa3sq14xOZQTRfumuIozaIDMw4JdeF/8Ar0afo5jcSznMnUZ7e1QaL4ptZmWzumYFh8kkmMk/WtS4usSsidB61zZjjKqfIlY6cLRi9Tn/ABdtt9lxEwyMeYo7j1rLs7iG501HYYR7gA/lWtrpRtPkLKDkYNc7oylbeziycG5zj1rLL5OSbk9jWtTcWV/E0dtb6jiDBhKZUitvRr2O28KR3MjfJEjE4+tZXii2SLV5Ih9xUyPY1QF1/wAUD5QPP2kIcenJr1aFP6xOEfMMMuaooGNfXs+oXslzcMWdzwOwHoK6DT/BVxc2qy3M4gLDIQLkge9Y2h263WuWcMnIMoJHrjJ/pXq3XmvezjMJ4LloYfQ9fE1nStCB5lrfh+40cB2cSQMcCQcYPuO1afgvUJkvGsSHa3kBIOOEYf0NdrcW8N3CYZ41kjPVWHFLFBFAu2KNI17BRivMq52q+FdKtG8u5g8SpwtJXJB1pSaSivBb1OUKKKTn0oAXAPWszX4/M0iZFPXGa06uaZZR6heCGZQyKQ2D7VpSV5pGdR2iZtsY/ssGCQCgwG69KlYYYiuq1PSLSeFS8fMf3dpxXGai/wBmvBj7pOME121MGlFyRywxV3axPRTQ2RkUua8zZnahantbO4vnZLeMyMvXHaoEDSSLGilnc4AFd/pGmrp1msfBkb5pD6n0rpoUXVfkY16vs1ZbnGXWl3lnF5txDsTOM5HWqddj4vz/AGMuDjMqjNcaOlTXpqnLlRVGo6kbsM0bjRikrnNULmjFJSg0FCEHFQSblwccVZoIzQO6M/z1JxjFOJBHWpZ7VJFJHyt2NUWjngy20yKPTrTsF0WASPu0GZc4YYNR213DO2FPPp3qy8aOMkZosO5A5jkGCQRVdrSNujcemat+TCP4OfrTSke7GKaC5ThsrdJCUUgnqQaI7IRuWV3PP8Rq+EWMcCozyfSmA3BpKUr3zSUAFFB6UdqAAc0Ui96UUAJikpc0lABRRRQAUoPFJRQBVTpUi00dMU5RUFjx0ozRjFLgkZoAAKXAoAxTsUANwKMCnYoxQO5Gyk9DimvErjDqHHoamxRtx0o1EVktoIzmOJVP0pk4JBHrVlhzUcgziru9xWRzVzZTrKxC7gelVPIuB1TFdPIuOlZl5OsJXPU9jWsKjM5Q6meltKeuKk8kr1IpJ1EibonIbrjNQRSvtw1a7mRZDEHGBTxMw/hqJTkZNTqARSKsSC5fHSpEuz3pEQYoa3D9M1LGWo7gPyCasxtmqUEOwcZq4ikVDGiyoB7CpFFRRc1PWbKHggCnBvaoxUg6CgRKpBp1RA4PFO3etAWH5prH5eOxoB71FcSiO2kbOMDNNbkMs/WrmmC3a+SOVCzEZXPQe5rPikE0KSA8MoNXYIzHH9obIUH5f9o0NuGqJnyuNmdhHGq/PnLEde1UdXCpp08pGGC8YpttcTJEkjIVUjOw9qra7OklmFWRRuOSua56V61W0jmfu7HnNzKZ5XbHzA8iqrKMEMSTVuV1gmZiPvZ4rHuL/fIUhXc5PQdq65RcZWiTdtXNvw88MWpuDIFJjOFJ611CTRSkqHUleoHavINR+1290twkhyehHH4Vp+HtSuJdTgEAcSSOFYE5rodJzhzXNKdS2h6eFTsaXYvqaQJjp170nzDiuO1tDpWwbSKctIWOKTJoGPo4poPHNJQApxT7eNZpzG3Zd31qOmh5IHMiYII59aqEVIzqNpDvE+of2T4fzEN0jDjHUEnAqto3/FOp5WpTCe+u9r4VvuCsnWNX0i7nignnkjCPuZuqgjpn8axUkludZGq3k8i2cceyN5ODIQP4R6V6cKUXRtJbnHLWeh6cRDdYnt5AH/hYH8wRXMayUW582eMZjOJYyfl9iPY+lUdP1O4vLsC0jfYoz5Y/maf4leOafBlAuGUBowelZ4eDpysloKcbvlicjI5FyZQ3KTbox04zXpM9zuWzl/idOfyrze8heBSSjbQeuOld3bpJe2On+SQZNnCk4zx0rizO9SSsddCLhuV/EMyx6XISRk9B69K47RdTuJWhUDa0chKcd66PV7OQWUj3URBZsBpDwCMcLWf4a0y7vNahYBFhhB2pjl6rA4d04uyLxM01oUvEN1NNdtNJkStlSKrW0Zk8Du46rdKW/wC+a3db057rxAbdSoY5/lVrRPD08Oh3Wn3gA85uo7cDBr0qNaNGtBvozHCScaimcn4dmSDxDZSNwvmYz9QRXqfQV5He2Vxp101vOjJIp4PTI9Qa27Xxtf28CxyxRzEDbvLFSR74r2c3y6pjnGth9dD2sTRdS0oHdXd9bWEHnXUgSPcF3H1p8VzDcIHgkSRD0KnNeX6trl1q8itOQqJ92NOg9/c10Xg3SpoS9/MGjRl2Roc8+rYrzMTk8cNhXVqytLsYzw6hTu3qdluBopgODTgc18+zjQtGaKa7oib3YBR3NUlfRA2luOPHWkSeWyuEuosjb949gPes2PXbBp2WZXMY4Dr0q3A8NxpV1GiuwkYbSeSRnFaSpTjrYwnWi1Y1bjxWrwAGHOeSwauM1TVo5bpNw2KWzz1xTr3w5qSopRHfcCBsbGPQ1gJod5a3/mXwdlXgkHIrrlVuuTnOePLe6Wp3cUqSwpInKsBinnj61ymj6xZWTTm6kfusS57VraL4gstVv4LVztkeZU2k8kE4rkeHm3ojpVePU73wvpmB9vmXrkRZ9O5qzBrRvfFgsYCDbwRPvYfxPnH6VtvAHtmgUmNSu0FOq/SszTfDtnpd39ogaUvgr87Z64r0oU5QSjE4ZVFNtyIfGH/IGTH/AD2X+tcap4r0bU9Oh1O1FvMzBNwb5Tg5FcFqdvHaalPbRElIyAMnPYVyY2D5ufodWEmrOPUqk0U1jmkrhOxIfQOtMzQpIFAyWnADFRBvWpFYdaAsKRgZzVWVip6datHBFRyxh+asVrGRc2FvdSiQ7oZR0kjOMVCZdVsMeZEt7bDo8XDAe4rSkhI6GmI7xsCp5/SgaZHb3cN8haF+R1U8FfrUiKxl6cUGOF5DMY1SX++gxmpVRkG8ybgfagY1s5xUZ604tnJNIaBiHpTKeelMzigBCaTNFFABRRRQAUUUUAFFKDRmgBKKUmkoAgXmnimIKkqCwp69KZT16UCYuKWiigVwooowfSgLi44zSUozSkccUBcbTGANPpp70DK8qjbms6e2hnPzjPvV+7/1DEEA1gJdOkpDt8pPrWsBS2GyWO18RyDFMeymQ56irvl7m3oeKli3AHJ5ra7M7IyiCpAbI+tPDEVpNCZ1Kso9iKp/ZwXKc5FK4gSTB61ZSfnrVQ2zqeDTlRs85odgLyS+tW4pQ2eKz4+tWUYipYF+NvmNTK2aq25yeatY44qGUPBzSg00dKWpAfkU4HNRnGKcnSgB+e1I8SyIyOMqwwRRS8+9Gq2JGiIKionyqowAK1LKZrXT1up5Ga3SXYIyOQT3qhkdKf5zSWj2kxBhZw6gdcit4R9pG3U5azsa2oagjkuLlY7ZFDSNnnPpXIX1+dUuHliDIo+6CeSPWtLxB5C+HUddpkEm0464965myvEVhHdnyBtO2TpRSw9pGc5EFzE2wsS2SO9SW2mKgEkmAh5NZ8uqpJiPzMBTtLkE/jW39oU6WJgwIC9QetbypX3JvYwvETI8caRr5ahhtHr71S8OLIfENsYzt/ejOK0orKbVphFEjsc/fccKK3tG8Lf2XercNMshXOOOc0uZQhYunFuVzpQWHRs5FPDHHPWm5JPt6UtcR2tWH5BppxSUUAFFFFAmKBmmuBsYc85z9KWgjdweQeKE7O5L10ZxN1a2cVxNezR7gW/0eEnrj+JvaqQSe+P2u/uBHbA4BI5IH8KCux1PR4b5kcHaV4PuPSsq50aXUzIZ42ijhGIIwK9alVUopM4pU5Rk7DdO1h9PsJ7qxWNLaNWXYTl+nUn1NX/CWjQ/2PJq2qJvuJ3Lb3OcL2FUNJ0WKG7b7ZCXiKn5WHFdi6oumfZI540ix8qtxilUq8i5UEKXNLVnKT3ZNy0zRocnaQRww9MVLqOnSTy21vbPJDE0PmomeUHpmrKQ21pNuD/brzqqL9xD61ctbebzzd3LFp2GOvCj0rgqNc3Muh2tq3KjB1OK9mSOGUl1iXAz3AqHRpLiOdERC4U/L2ZfxrrJLaOYDzBkjoaI7aOEkooGevvW8cUlHQ55UJSe4NbRS3X2t41+0YxuxUvyqMAfWo3cpx60qsCK45Scndm6goqyIL7T7TUYhHdQrIo6Z6j6GsN/BGmMxZJLhPbdXS0EcV0UsbiKKtTm0jeNScVozBtPCelWjhzG0zjoZGz+lbYAAAA4xjFGMUVnVxFSs71HcUpuW7FHXmnfKKZRWJI+uM1y+uLid1DYhRtrLnH412S9BWVqujx3qtJGAs3/AKFXXhKkYS95HPiISa0MoSvcaBMbOBVZOCPb1+tdD4RngOiRWt6xSVjvWb3B4BrnrO9lsUezlhUsGORjG3/GuhtL6wuLdQQkDRjpXqVrSR5kLxLV/q9r55jW6jJjJDkHGTWNqUsI04TzXSSROxKxoeSR61zGs6jJ50f2G0WRpXYtkZyPWief7XZiFh5XlncBjg+orgWXQhL2kd2dH1htcpnS21xearm1j+VgSF7AYyaoiSaK8Wa2JjmgcOsi9QR0rotNuXtmCbcoTgkdQMVbk0v+1bzNuqR2ygDeExx/Wu+M4xj7xi4Sk9DU8P8AinxHfRMk2pzMUGd3HP6V2fhfUtSuNcEV5eySxeUx2tjGa5mzsILCERQrgdyepqSVC/QkfSvKniLVbp6HoxwydOz3O88W3lxa6OHtJzFJ5qjcp5x3rh/OmmkaS4k8yVvvOe9QLCVOd7H6mpRgVnXr+1LpUeReY+im76N9c50CnrQD2pM55pR1oGLTWk2jpTsGmSHZzigQw3qAkHj3NSrMGAKkEHoRVGZQykFQwPBrJksdSsW82wm3xdTE/NWkI6csDwQKryKoHFYFv4oDsVngI2nBZDkZrUg1K1vkbyH3MvUYxTcGAsj4HerajES5+tVUIkIHB5q07jHFIZG4+amHinE03NAxCaYaU96Qe9ACUUppKACiijI9aACijNFABRRmjI9aACijI9aaTzQA0daWkHWlqBoKep7Uq/dFLQDCiiigQq9adSAYpaACiiigBrdaaR1p5GaQqMUAVp1BiIIzmuZvIDHJxyM11Uq5jOK5WZ2891cMvPGRW1MUtiNZnXgE1YiuiDyOahCg9KesW5h7Vq1oZ3NGKbPzEGnNEDJuHeoY8YAqyjCosUmN8sd6XyVPapA2TUgHFK4yMQL26U4RdhUqgCpMgUXAhVWXpirMcgwAaaNpp2F7CpYE3GOCKXHvUOPQ4pwzgYNSA/FOX6VH81KGYdaBMmHanHpUQk6cU4yfKflPSgR6BoGm2cuh2kk1rE8jpksy5J5q/wDYtHx/qbMfgtLpqFNCtUUc/Z1x9StchD8P5ZI9090iyHkgLn9a9a7jFKMbnlfFJuTN/WLDSf7Ju2jgs/N8tipAHBxwa8sv9PLxrJIiTKOgz0rpNQ8Mz6OyzMoeL/novb61WA3LtOMVyVazcvejY6adLs7nG3y29tbiC3tQZpfxAq5pXht3th9qlYA87BxxXQfYLcTCYrllFXAcqKiVbsbey7lOx0+GwiMcQ6nJbvVsDmlorBtvc1SS2FFLTc4pc0hi0UgNLQAUUUUCYUUUUEhShscY4pKKLtbAPwp7fpUE1pHL95mPpz0qXPFGTVKpJA4xZHBbRW/3VBb+8etT5poOaWplJy3CyWw7NFIOtLUosayhh81NVMH2qSjNO4mgoPSig9KQDGptOIzTTwaaQJBRRRTGKDxSUUgNJgIFhjaSQW6yOwzlvWuduYpbKY3EtuGjJzgdPpXSUjKjqVcBgexroo4h02c1TDxlqjkjqGkiRj9jlyRnh+Afaknn0prYx2kMjzSDGW6rV+98OiSUNbFRzkgnirFpoqWp8w4Mvc9q9OWMjyXOWnhZOWozw/DJaGQXNohSRcguuea1ooo4lKxKFUnOBwKj3FRjcSPelV+1eTVqyqNs9CnRjTJSOaaaN+KXGRmsDZDKQjJpTwKZvPtQMKKTNANADg2KcrDOc1DJ92qU5ulT/RnAb0PemBrhgehFRT8rxXOSa9dWEqLdWmQerqa0YtfsZgMsUJ/vCmosLlnGeDQJNpAxmpAYplDxOGHsagb5WyelMRS1TQI7yLzbJxDP6jofrWQ1jf6Osd2IxNztlWPrj1rrLdiIDnByeKQjHNWqjtYLFW1fzQsgUqpHAIxVg9aBxRWbYxCaY3WnU1utSAlIelLSHpVIBKKKKY7CEZppGKfTW60DSAdadTKXcaBgetJQeaKACiiigApVpKctQQOHSlptOoAKUCkp46UAFFFKOlAC9qQ4padgUAR0U7GKTFAEbDngVBNawzgiVAR6Yq2RimkZqlKwHNajapalRCGwTVNWdT1YV1rxhhggEe4qpPDGVPyDP0rSNS+5EomF5pHc1Kk2O/602aLa59KhORWgtjRScdqsQyqx5rKQn3qxFkc5OamWw0zV3IehoAxVVCfWrKHioGPUGpB1pgYYpQ4zQK4/GacCAKZwe9Lj3pNBcfn3opo4pQc0hDxTyT5Z/WmLxS70HL52D72PTvQtRN23Otg8d28dr5JsZklRAiDIIJA4rGTxXrsc4uHnVkzkw7Rtx6etddZ+HdHuNN328ass0fyyk5IyKxl8E3bT7JLiPyc8uv3sfSvQlGs7WOKLo63OulVNQ0whx8k0WcHtkZrzBeDj04r02+uItM0qSR2CpFHhfywBXmERJjBPU8moxbWncrCJ69iaimgmnVxHYOBOOtGT60gNLQAZPrTh0ptOHSk2Ao606m0UrgOoptLmmmAtFJmjNMli0UUUCClHXmkopWAUn0oBOaSgdaAH0Um6jdRYpMWijtSbqLDGyFwAU5NP7UA5pN1FgBqbSk5pKYAelN5p1NJoAOaKNwxSbqTAXml4phbHSjcKkdiTikbpTQ1LncKPUq1yvJxULMQKtyJlaqsCpNNMLEAu8PtP61binVh1/WsLUi8A3g9TUNpqgUhX/OtOW6A6gkMKYRzVW2ulmQbGzVgH1rNqwxMUoozULzCNsNkUgJ8bsjFVmTDZqZHzyDSsobpVJAVJYYrmNopl3KR+VctqNi+mShW+aBj8r46exrrWjZTkCkkhivITBOodCPyq4y6Csczpd1Pb3Uaxt8j8EE10sv7xvLTJOeTWdFoUdqdquSc5Vj2rUgjWJMdW7n1ok0x2Jlwse0dqZmnFhTM1IC0UmaM1LAaelNOe9PprdaQCU2ndqbVIApeKSimUhT0qM0/nvTW60DEooooAKKKKACkOc0tJmgBy804AU1KdnFQQLiloHIooAKUGkpw6UALTsYptSDpQA2l3GnYox7UAMJzS44p23NFADMGk2mpKKAIyDtNZGqNLHKCikpjnAraPSmMoIwwyPSqjuBy4ljlyA/Pp3p32fPcVryaNaO+9V2E9cGm/2fDbBpN8j7RnbnrWvMtiTOS3BGTx9anjiT+8PzrOl895SSjhSeAe1CpIrcBjTdiTXWIAdc+9DyrCpJNLCNtmGkBGB3rIllaVi2flzwKSV9g1NBr9MfKKQXik4xWcOnFODGqsBrLcripFmDdKy43NWEfmpkgNFWB6dalHSqsfSrKnioYD80daSikBe0vXdS0UFLdlktycmF+QD6j0rZ/4WBeEYGlx7vXzDXMhwKcJFyPWtViJx0TMZUIPdF3UdX1DWHU3cirEpysKD5QfX3qMdKhWQZ7U7zBWc5ubvI0jGMVaJJTgc1EGGetSAj1pFDqdTNw9aXPvQA6lzimUuR60gHg5NLTM4pVbPWhgOooopIAoooyKoQ6ikFLQFgpQMmkozigLCkYpBzRnNA60BYdtFG0UZFGRQAtJtFGRRkUDF6UynZFNoAKKKKTAQ9KaQcU+kNK4EY6c03NPIOaQpxSuCG01ztwaeBiggEdKC0MEoIyKkVxVaWJo/mB+XuKI5B+FAy0WBqvK4BqbIIqtKOelMDL1iOSSwMka7ih5HtXOBiRkHtxXaoFbMbj5WGDXJ39i2n3skZbMfVPpW8CGTWFy8Uijcee1dIs28D1rkIH/AHq10lq+5evalNFLYvBqbONy+9R5qOadgrYQtgVmkMbDc/PtPOKuBww+Wufsr8zXMiGMqV6n0q+6zTRf6PLscHIz0NNgaMkmyPJ5FMjxu3dAapWs93KjR3MQVl/iHQ1eB4HFToA5uRyTSAUUVIDjxTaMn0op3AKKKQkUgAnAppOaKKBoO1NoooHYKKKKdxhSEZpaZQgCiiihgFFFFABRiiiqAVKcBmkQDFPxUEBRRRQAU8dKZTx0FACjrT16U3FOXpQAvenU3vTqACkxS0UAIBigilooATFNIzT6TFADMGkC89KlooERlQABgUmB2Vc/SpCBio6bdwsQOAwClc1k6jaxJH5gBBzW4Vz9ahlgWVCjjIPtVQdgOZbAGR0NCnHar02lTxvujKun909armKRSQ0Lj3xxW1zO2oiZz0qzGpzUIlihH7xiD7irMU0TjKkn8KTZVi3GMCpQ3Tj8ajRXb7qkinS2k0kW2OTyz6kVDWoifoPb1qvNdRxnbnJp8NnIsJWafefpWPdRNBK2QzDtxSsBeF4lKt4pPQVkq2RmnhyKtRQG0twh/iqRXBPDisQPzThI3YmpcAN3J9acrNWMl1JkfMTirKXT55zS5QNPJp4PPWqkc2RzUofI96VgLGT60oqNORTs0AS0o9aYDk4p4pMB+6gHNMzzS9KVgH0m3PegH1pdwpgKBgUHJ7UBhmngg0wGfhS0/ApNvpQA2ilIxSUAFFFFABRRRQAUUUUAFFFFQAUZFNZh0FMoAkxmkpofAxSgkmgBpWm4OalIzRgUFoh3ZO01A8RQlk5FTyRFjlTioASrEP0xTsMfEdw4P4U9kyCT0rMuN8Em9W4qeC+JTDjrV2AcTg5FU9Xsft9vHMo+ePP41aeRVXOc56CpYg/k5bjNGqBq5zNvZvvwUORSalPc6bcwyKf3WPmFdPtHpUM1tDNgSIGA9apzXUVjG0/W49QmMSoVde5rYiVlByM5qE6ZaecsqxhWB/h4q6DgY7VDl2GtEVxaRBmZVALdakWNUHAp9FS3cAGR3ooopAFFFITigBaTdSZNJQA7dTaKKACkzQSMcUlBYUUUUAFFFB6UAJuptFFABRRRQAUUUUAFJmlpD1poCaikzS0iAoooBwaAHAUtIDmloAdRSA0tADx2p1Rg0/NAC0UmaM0ALRSA5oJoAWikzQTmgAyKMikooCwppKKKAEIyKTZTqKAG7KcEGe340U6ndgMeGGTG6JD9RTkghRdqRKAfalpw6Ci7EN2DsMUGMGn0UXJZH5eOlVprfcDnBFXaaV4oTJOYv4o45sxjbjqPeqfarWoki9cc9c4qrW8XoCYq9aeKYvWnr1p2GSJViPJxUUac9atxKBUsCROtXE6VAijNTKccVDAnU8U8EYqAGpF+7SAmBGafnNRjrTgcUAPwaADmkBOKXJoAWnDpTBTt1ADh1p1MBzTgcUkwFopM0m8UwHUUgbNLQAUoIxSUUAFFFFABRSE0EigBaM0A5pD1qWgFxmkKikJ4phbHU0gFI5puRTGlAJGeaj3VVh2LKketB61VEwB5qdHDjK8jvSa7FDskdKgmlGdoXk96n7Z7VVkPzEg00MhnR3jA2CqsNqxY8lavQSs8hPUCpWO44wBTuBXitlTkksferB6j0pAMUtLmAKaRzTqTd7VIDMGjBpaKAEwaSnUhFACUUUUDSEPSm5pScimmgdhcijIptFAWHZFJmkooCwUUUUDCmk8UpPam0AFFFFABRRRQAUUUUAFFFFABRRRVWAkHWlooqSAooooActLRRQAo60tFFAMO9PoooEgooooGKOtB60UUAJRRRQAUUUUAFFFFABRRRQAU6iigApw6CiigTFooooJYUdx9aKKCWc/rgAuTgCsqiiuiOwkKvWnr1ooqiizHVqOiioYE461MOoooqGA8VKv3RRRSAlHWloooAcOlLRRQAopaKKAFXrTqKKlAA6ipcD0ooqgGP1o7UUUAFFFFABRRRQAh60wdaKKAHig9aKKTAaelMNFFSBQvOJBipoP9WaKKoogP8VVgzLcYDED2NFFMDUQ/Iagl+61FFBSEtf8AU/jU38VFFJgLRRRUgFMoooAKKKKACg9KKKAG0UUUFIZSGiigYlFFFABRRRQAUUUUANPWkoooAKKKKACiiigAooooAKKKKACiiirA/9k=";

const CS_PLAN = [
  { time: "⚔️ At the Start", color: "var(--gold)", steps: ["Teams 1–7: Go directly to your assigned starting buildings (1–7 on the map).", "Team C + Floaters: Stay flexible and float — assist wherever needed."] },
  { time: "⏱ 5-Min Mark — Buildings A & E unlock", color: "var(--blue)", steps: ["Team 4 → Move to Building A", "Team 7 → Move to Building E"] },
  { time: "⏱ 8-Min Mark — Buildings B & D unlock", color: "var(--blue)", steps: ["Team 5 → Move to Building D", "Team 6 → Move to Building B"] },
  { time: "⏱ 12-Min Mark — Building C unlocks", color: "var(--red)", steps: ["Team C → Move to Building C immediately", "Floaters → Prioritize supporting Building C & 3 as needed.", "⭐ This building generates the most points — heavy support is crucial."] },
];
const CS_NOTES = [
  "Team C: watch your teleport cooldown — rotate to Building C as soon as it opens.",
  "You get 1 full drill refill during battle. Wait until empty or nearly empty to use it.",
  "If teleported away, garrison the closest building until your cooldown is over.",
  "🏆 We play to WIN not score.",
  "Teams 1–7 #1 priority: KEEP THE BUILDING BLUE — not killing.",
  "Floaters priority: KILL enemies — not keeping the building blue.",
];

const DS_PLAN = [
  { time: "⚔️ At the Start", color: "var(--gold)", steps: ["Everyone goes to their assigned building at the start of battle."] },
  { time: "‼️ When Middle Buildings Open", color: "var(--red)", steps: ["Team 1 → Move to Building B", "Team 5 → Move to Building C"] },
];
const DS_NOTES = [
  "Note 1: Teams capturing B & C — position yourselves as shown in the map so you can support the center if necessary.",
  "Note 2: If we win big you can play freely, but try to make as many substitutions as possible — more rewards for everyone.",
  "‼️ Team Assignments: Primary focus is KEEPING THE BUILDING BLUE at all times.",
  "‼️ Floaters: Primary focus is ELIMINATING ENEMIES that prevent the building from staying blue.",
];

// ─── BATTLE PLANS PAGE ────────────────────────────────────────────────────────
function BattlePlansPage({ user, csTeams, dsTeams, t, stormSettings, isR4, battlePlans, saveBattlePlan, showToast }) {
  const canyonActive = stormSettings?.canyon_active ?? true;
  // Default tab to desert when canyon is off-season for non-R4
  const [tab, setTab] = useState((!canyonActive && !isR4) ? "desert" : "canyon");

  const getUpcomingWeek = (teamsObj, type) => {
    const battleKey = getSignupWeek(type);
    return teamsObj[battleKey] ? battleKey : null;
  };

  const csWeek = getUpcomingWeek(csTeams, "canyon");
  const dsWeek = getUpcomingWeek(dsTeams, "desert");
  const csData = csWeek ? csTeams[csWeek] : null;
  const dsData = dsWeek ? dsTeams[dsWeek] : null;

  const showCanyon = canyonActive || isR4;

  return (
    <div>
      <h1 className="section-title">{t.battlePlans}</h1>
      <p className="section-sub">{tr("Your assignments and battle strategy")}</p>
      <div className="tabs">
        {showCanyon && <button className={`tab ${tab === "canyon" ? "active" : ""}`} onClick={() => setTab("canyon")}>🏔️ {t.canyonStorm}{!canyonActive && isR4 && <span style={{ fontSize: 10, marginLeft: 5, opacity: 0.6 }}>({tr("off-season")})</span>}</button>}
        <button className={`tab ${tab === "desert" ? "active" : ""}`} onClick={() => setTab("desert")}>🏜️ {t.desertStorm}</button>
      </div>
      {tab === "canyon" && showCanyon && <BattlePlanView key="canyon" data={csData} weekKey={csWeek} type="canyon" user={user} mapSrc={battlePlans?.canyon?.map || CS_MAP} mapAlt={tr("Canyon Storm map")} plan={CS_PLAN} notes={CS_NOTES} customPlan={normalizeWeekPlan(csData?.plan)} isR4={isR4} saveBattlePlan={saveBattlePlan} showToast={showToast} t={t} />}
      {tab === "desert" && <BattlePlanView key="desert" data={dsData} weekKey={dsWeek} type="desert" user={user} mapSrc={battlePlans?.desert?.map || DS_MAP} mapAlt={tr("Desert Storm map")} plan={DS_PLAN} notes={DS_NOTES} customPlan={normalizeWeekPlan(dsData?.plan)} isR4={isR4} saveBattlePlan={saveBattlePlan} showToast={showToast} t={t} />}
    </div>
  );
}

function BattlePlanView({ data, weekKey, type, user, mapSrc, mapAlt, plan, notes, customPlan, isR4, saveBattlePlan, showToast, t }) {
  const [mapBig, setMapBig] = useState(false);
  const username = user.username;
  const userId = String(user.id);

  const findMyAssignment = () => {
    if (!data) return null;
    for (const teamKey of ["teamA", "teamB"]) {
      const teamArr = data[teamKey] || [];
      // New format: [{userId, name, ...}]
      if (teamArr.length > 0 && teamArr[0]?.userId !== undefined) {
        const found = teamArr.find(m => String(m.userId) === userId || m.name === username);
        if (found) {
          const sd = (data.slotData || {})[found.userId || found.name] || {};
          return {
            team: teamKey === "teamA" ? "A" : "B",
            slot: sd.slot || "—",
            role: sd.role || "",
            time: teamKey === "teamA" ? data.timeA : data.timeB,
          };
        }
      } else {
        // Legacy slot-based format
        for (const slot of teamArr) {
          if ((slot.players || []).includes(username)) {
            return { team: teamKey === "teamA" ? "A" : "B", slot: slot.slot, role: "", time: teamKey === "teamA" ? data.timeA : data.timeB };
          }
        }
      }
    }
    return null;
  };
  const mine = findMyAssignment();

  return (
    <div>
      {/* My Assignment */}
      {mine ? (
        <div style={{ background: "var(--surface2)", border: "1.5px solid var(--gold-pale)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{t.yourAssignment}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{tr("Team")} {mine.team} • {mine.slot}</div>
          <div style={{ fontSize: 15, color: "var(--text-mid)", marginTop: 4 }}>{t.battleTime}: <strong>{mine.time}</strong> {t.serverTime}</div>
          {weekKey && <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>📅 {new Date(weekKey).toLocaleDateString(dateLocale(), { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })}</div>}
        </div>
      ) : (
        <div style={{ background: "var(--surface2)", borderRadius: 12, padding: 20, marginBottom: 20, textAlign: "center", color: "var(--text-dim)" }}>
          {tr("No assignment yet. Check back after teams are finalized.")}
        </div>
      )}

      {/* Team Lists */}
      {data && (
        <div style={{ marginBottom: 24 }}>
          {["teamA", "teamB"].map(teamKey => {
            const teamArr = data[teamKey] || [];
            const teamLabel = teamKey === "teamA" ? "A" : "B";
            const time = teamKey === "teamA" ? data.timeA : data.timeB;
            const color = teamKey === "teamA" ? "var(--gold)" : "var(--blue)";
            const isNewFormat = teamArr.length > 0 && teamArr[0]?.userId !== undefined;

            // Sort slots numerically: Team 1, Team 2... Team C/8, then Floater, then subs (no slot)
            const sortSlots = (entries) => entries.sort(([a], [b]) => {
              if (a === "Unassigned" || a === "") return 1;
              if (b === "Unassigned" || b === "") return -1;
              if (a === "Floater") return 1;
              if (b === "Floater") return -1;
              const aNum = parseInt(a.replace(/\D/g, "")) || 999;
              const bNum = parseInt(b.replace(/\D/g, "")) || 999;
              if (aNum !== bNum) return aNum - bNum;
              return a.localeCompare(b);
            });

            return (
              <div key={teamKey} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14, color }}>⚔️ {tr("Team")} {teamLabel} — {time} {t.serverTime}</div>
                {isNewFormat ? (() => {
                  const slotData = data.slotData || {};
                  const bySlot = {};
                  teamArr.forEach(m => {
                    const uid = m.userId || m.name;
                    const slot = slotData[uid]?.slot || "";
                    if (!slot) return; // skip unassigned
                    if (!bySlot[slot]) bySlot[slot] = [];
                    bySlot[slot].push(m.name || m.userId);
                  });
                  // Subs (no slot)
                  const subs = teamArr.filter(m => {
                    const uid = m.userId || m.name;
                    return !slotData[uid]?.slot;
                  }).map(m => m.name || m.userId);

                  const sorted = sortSlots(Object.entries(bySlot));
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {sorted.map(([slot, players]) => (
                        <div key={slot} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "var(--surface2)", borderRadius: 8, borderLeft: `3px solid ${color}` }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", minWidth: 52, textTransform: "uppercase", letterSpacing: 0.3 }}>{slot}</span>
                          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>→</span>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {players.map((p, j) => (
                              <span key={j} className={p === username ? "name-engineer" : ""} style={{ fontSize: 13, fontWeight: p === username ? 700 : 400 }}>
                                {p === username ? "⭐ " : ""}{p}{j < players.length - 1 ? " /" : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {subs.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "var(--surface2)", borderRadius: 8, borderLeft: `3px solid var(--text-dim)` }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", minWidth: 52, textTransform: "uppercase", letterSpacing: 0.3 }}>{tr("Subs")}</span>
                          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>→</span>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {subs.map((p, j) => (
                              <span key={j} className={p === username ? "name-engineer" : ""} style={{ fontSize: 13, fontWeight: p === username ? 700 : 400 }}>
                                {p === username ? "⭐ " : ""}{p}{j < subs.length - 1 ? "," : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  // Legacy format
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {[...teamArr].sort((a, b) => {
                      const aNum = parseInt((a.slot || "").replace(/\D/g, "")) || 999;
                      const bNum = parseInt((b.slot || "").replace(/\D/g, "")) || 999;
                      return aNum - bNum;
                    }).map((slot, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "var(--surface2)", borderRadius: 8, borderLeft: `3px solid ${color}` }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", minWidth: 52, textTransform: "uppercase", letterSpacing: 0.3 }}>{slot.slot}</span>
                        <span style={{ fontSize: 12, color: "var(--text-mid)" }}>→</span>
                        <div>
                          {(slot.players || []).filter(Boolean).map((p, j) => (
                            <span key={j} style={{ fontSize: 13, fontWeight: p === username ? 700 : 400 }} className={p === username ? "name-engineer" : ""}>
                              {p === username ? "⭐ " : ""}{p}{j < slot.players.filter(Boolean).length - 1 ? " /" : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="divider" style={{ margin: "20px 0" }} />

      {/* Battle Plan Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 21 }}>{t.battlePlanStrategy}</div>
      </div>

      <>

      {/* Map — tap to expand */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{t.battleMap} <span style={{ fontWeight: 400, color: "var(--gold)" }}>— {t.tapToEnlarge}</span></div>
        <img src={mapSrc} alt={mapAlt} onClick={() => setMapBig(true)}
          style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)", cursor: "pointer", display: "block" }} />
      </div>

      {customPlan ? (
        customPlan.same ? (
          <PlanText text={customPlan.a} />
        ) : (
          ["A", "B"].map(team => {
            const col = team === "A" ? "var(--purple)" : "var(--blue)";
            const time = team === "A" ? data?.timeA : data?.timeB;
            return (
              <div key={team} className="card" style={{ marginBottom: 16 }}>
                <div style={{ background: col, color: "#fff", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>⚔️ {tr("Team {team} plan", { team })}</span>
                  {time && <span style={{ fontSize: 12, opacity: 0.9 }}>{time} {tr("server")}</span>}
                  {mine?.team === team && <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.25)", borderRadius: 999, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>⭐ {tr("Your team")}</span>}
                </div>
                <div className="card-body"><PlanText text={team === "A" ? customPlan.a : customPlan.b} /></div>
              </div>
            );
          })
        )
      ) : (<>
      {/* Phase-by-phase plan */}
      <div style={{ marginBottom: 20 }}>
        {plan.map((phase, i) => (
          <div key={i} style={{ marginBottom: 16, borderLeft: `3px solid ${phase.color}`, paddingLeft: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: phase.color, marginBottom: 8 }}>{tr(phase.time)}</div>
            {phase.steps.map((step, j) => (
              <div key={j} style={{ fontSize: 14, color: "var(--text-mid)", marginBottom: 6, lineHeight: 1.5, display: "flex", gap: 8 }}>
                <span style={{ color: phase.color, flexShrink: 0 }}>›</span><span>{tr(step)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Notes */}
      <div style={{ background: "var(--surface2)", borderRadius: 12, padding: 16, border: "1px solid var(--border)" }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📋 {t.notesReminders}</div>
        {notes.map((n, i) => (
          <div key={i} style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 8, lineHeight: 1.5, display: "flex", gap: 8 }}>
            <span style={{ color: "var(--gold)", flexShrink: 0 }}>•</span><span>{tr(n)}</span>
          </div>
        ))}
      </div>
      </>)}

      </>

      {/* Full-screen map modal */}
      {mapBig && (
        <div className="modal-overlay" onClick={() => setMapBig(false)} style={{ alignItems: "flex-start", paddingTop: 20 }}>
          <div style={{ width: "100%", maxWidth: 700, position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setMapBig(false)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, zIndex: 10 }}>✕</button>
            <img src={mapSrc} alt={mapAlt} style={{ width: "100%", borderRadius: 12, display: "block" }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BATTLE MAP PICTURE (WiLD: optional custom map, saved in app_settings battle_plan_<storm>.map) ───
// Shrink an uploaded image so it can be stored in the database
const resizeImageToDataUrl = (file, maxSize = 1400) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

function BattleMapPicker({ type, showToast }) {
  const { plans, savePlan } = useStormConfig();
  const stored = plans?.[type] || null;
  const defaultMap = type === "canyon" ? CS_MAP : DS_MAP;
  const [busy, setBusy] = useState(false);
  const setMap = async (map) => {
    setBusy(true);
    const ok = await savePlan(type, map ? { ...(stored || {}), map } : (stored && Object.keys(stored).some(k => k !== "map") ? { ...stored, map: null } : null));
    setBusy(false);
    if (ok) showToast(map ? tr("Battle map updated ✓") : tr("Using the original map"));
  };
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { await setMap(await resizeImageToDataUrl(file)); }
    catch { showToast(tr("Couldn't read that image — try a JPG or PNG.")); }
  };
  return (
    <div>
      <img src={stored?.map || defaultMap} alt={tr("Battle map")} style={{ width: "100%", maxHeight: 170, objectFit: "contain", background: "#0b0907", borderRadius: 10, display: "block", marginBottom: 8 }} />
      <div className="row wrap" style={{ gap: 8 }}>
        <label className="btn btn-sm btn-secondary" style={{ cursor: busy ? "default" : "pointer" }}>
          📷 {tr("Change map image")}
          <input type="file" accept="image/*" onChange={onFile} disabled={busy} style={{ display: "none" }} />
        </label>
        {stored?.map && <button className="btn btn-sm btn-ghost" disabled={busy} onClick={() => setMap(null)}>{tr("Use original map")}</button>}
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
// ─── STORM STATS HELPER ───────────────────────────────────────────────────────
// ─── KILL TRACKER: OCR + parsing helpers ───────────────────────────────────────
// ─── STORM STATS HELPER ───────────────────────────────────────────────────────
function computeStormStats(userId, csTeams, dsTeams, csSignups, dsSignups) {
  const uid = String(userId);
  const weekResults = {};

  const toBattleDate = (dateStr, type) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr + "T12:00:00Z");
      const day = d.getUTCDay();
      const targetDay = type === "cs" ? 4 : 5;
      if ((type === "cs" && day === 4) || (type === "ds" && day === 5)) return dateStr;
      const daysUntil = (targetDay - day + 7) % 7 || 7;
      const battle = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + daysUntil));
      return battle.toISOString().split("T")[0];
    } catch { return dateStr; }
  };

  const myCS = (csSignups || []).filter(s => String(s.userId) === uid);
  const myDS = (dsSignups || []).filter(s => String(s.userId) === uid);

  // Mark signups — normalize week to battle date to avoid Monday vs Thursday mismatch
  // Also deduplicate: only one entry per uid+type+battleWeek
  const markSignup = (signupsArr, type) => {
    const seen = new Set();
    (signupsArr || []).forEach(s => {
      if (String(s.userId) !== uid) return;
      const battleDate = toBattleDate(s.week || "", type);
      if (!battleDate) return;
      const key = `${type}:${battleDate}`;
      if (seen.has(key)) return; // deduplicate
      seen.add(key);
      if (!weekResults[key]) weekResults[key] = "signed";
    });
  };
  markSignup(csSignups, "cs");
  markSignup(dsSignups, "ds");

  // Historical team assignments — normalize week key to battle date too
  const processTeams = (teamsObj, type) => {
    Object.entries(teamsObj).forEach(([week, data]) => {
      if (!data) return;
      const battleDate = toBattleDate(week, type);
      if (!battleDate) return;
      const getIds = (arr) => {
        if (!arr || arr.length === 0) return [];
        if (arr[0]?.userId !== undefined) return arr.map(m => String(m.userId));
        return arr.flatMap(slot => (slot.players || []).filter(Boolean));
      };
      const inA = getIds(data.teamA).includes(uid);
      const inB = getIds(data.teamB).includes(uid);
      const inWait = (data.waitlist || []).map(m => String(m.userId || m.name)).includes(uid);
      const inUnassigned = (data.unassigned || []).map(m => String(m.userId || m.name)).includes(uid);
      const key = `${type}:${battleDate}`;
      if (inA || inB) weekResults[key] = "made";
      else if (inWait && weekResults[key] !== "made") weekResults[key] = "waitlist";
      else if (inUnassigned && !weekResults[key]) weekResults[key] = "signed";
    });
  };
  processTeams(csTeams || {}, "cs");
  processTeams(dsTeams || {}, "ds");

  // Only count as missed if the battle date itself has passed
  const now = Date.now();
  const results = Object.entries(weekResults);

  const isPast = (key) => {
    const [, dateStr] = key.split(":");
    if (!dateStr) return false;
    // Battle date + 1 hour grace period
    return now > new Date(dateStr + "T23:59:00Z").getTime() + SERVER_UTC_OFFSET_HOURS * 3600000; // end of battle day, server time
  };

  const madeTeam = results.filter(([,r]) => r === "made").length;
  const waitlisted = results.filter(([,r]) => r === "waitlist").length;
  const missed = results.filter(([key, r]) => r === "signed" && isPast(key)).length;
  const signedUp = madeTeam + waitlisted + missed;
  const pct = signedUp > 0 ? Math.round((madeTeam / signedUp) * 100) : null;
  return { signedUp, madeTeam, waitlisted, missed, pct };
}

function ProfilePage({ user, setUser, members, setMembers, t, setLang, showToast, csTeams, dsTeams, csSignups, dsSignups }) {
  const { unpairBuddy } = useBuddyActions();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user.username, profession: user.profession, language: user.language });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const history = MOCK_POWER_HISTORY[user.id] || [];

  const saveProfile = async () => {
    const me = (members || []).find(m => String(m.id) === String(user.id)) || user;
    const professionChanged = form.profession !== me.profession;
    const oldBuddy = professionChanged ? me.buddy : null;
    if (oldBuddy) {
      if (!window.confirm(tr("Changing your profession removes your buddy pairing. Continue?"))) return;
      if (!(await unpairBuddy(user.id, { silent: true }))) return;
    }
    const updated = { ...user, ...form, buddy: oldBuddy ? null : (me.buddy || null) };

    setUser(updated);
    setMembers(m => m.map(mb => mb.id === user.id ? updated : mb));
    await supabase.from("members").update({
      username: form.username, profession: form.profession,
      language: form.language,
    }).eq("id", user.id);
    setLang(form.language);
    setEditing(false);
    try { localStorage.setItem("wild_session", JSON.stringify({ userId: updated.id, language: updated.language })); } catch {}
    showToast(oldBuddy ? tr("Profile updated ✓ — buddy pairing removed") : tr("Profile updated ✓"));
  };

  const changePassword = async () => {
    if (pwForm.current !== user.password) { setPwError(tr("Current password is incorrect.")); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError(tr("New passwords do not match.")); return; }
    const updated = { ...user, password: pwForm.newPw };
    setUser(updated);
    setMembers(m => m.map(mb => mb.id === user.id ? updated : mb));
    await supabase.from("members").update({ password_hash: pwForm.newPw }).eq("id", user.id);
    try { localStorage.setItem("wild_session", JSON.stringify({ userId: updated.id, language: updated.language })); } catch {}
    setPwError(""); setPwForm({ current: "", newPw: "", confirm: "" });
    showToast(tr("Password changed ✓"));
  };

  const maxPower = Math.max(...history.map(h => h.power), 1);

  return (
    <div>
      <div className="profile-header">
        <div className="profile-avatar">{user.username[0].toUpperCase()}</div>
        <div>
          <div className="profile-name" style={{ color: user.profession === "engineer" ? "var(--green)" : "var(--purple)" }}>{user.username}</div>
          <div className="profile-role">{user.role.toUpperCase()} • {user.profession === "engineer" ? "🔧 " + t.engineer : "⚔️ " + t.warLeader}</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{t.memberSince} {formatDate(user.joinDate)}</div>
        </div>
      </div>

      {/* Language Switcher — always visible */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-mid)", marginBottom: 10 }}>🌐 {t.language}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[["en","🇺🇸 EN"],["de","🇩🇪 DE"],["it","🇮🇹 IT"],["fr","🇫🇷 FR"],["sv","🇸🇪 SV"],["tr","🇹🇷 TR"]].map(([code, label]) => (
              <button key={code}
                className={`sort-chip ${user.language === code ? "active" : ""}`}
                onClick={() => {
                  const updated = { ...user, language: code };
                  setUser(updated);
                  setMembers(m => m.map(mb => mb.id === user.id ? updated : mb));
                  setLang(code);
                  try { localStorage.setItem("wild_session", JSON.stringify({ userId: updated.id, language: code })); } catch {}
                  setI18nLang(code);
                  showToast(tr("Language updated ✓"));
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {editing ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><div className="card-title">{t.editProfile}</div></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">{t.username}</label><input className="form-input" value={form.username} onChange={e => set("username", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t.profession}</label><select className="form-input form-select" value={form.profession} onChange={e => set("profession", e.target.value)}><option value="engineer">{t.engineer}</option><option value="warLeader">{t.warLeader}</option></select></div>
            <div className="form-group"><label className="form-label">{t.language}</label><select className="form-input form-select" value={form.language} onChange={e => set("language", e.target.value)}>{LANGUAGE_OPTIONS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></div>
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={saveProfile}>{t.save}</button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title">{t.profileInfo}</div>
            <button className="btn btn-sm btn-secondary" onClick={() => setEditing(true)}>{t.editProfile}</button>
          </div>
          <div className="card-body">
            <div className="row-between" style={{ marginBottom: 10 }}><span style={{ color: "var(--text-dim)", fontSize: 14 }}>{t.language}</span><span style={{ fontWeight: 600 }}>{Object.fromEntries(LANGUAGE_OPTIONS)[user.language]}</span></div>
            <div className="row-between"><span style={{ color: "var(--text-dim)", fontSize: 14 }}>{t.role}</span><span className="badge badge-gold">{user.role.toUpperCase()}</span></div>
          </div>
        </div>
      )}

      {/* Storm Participation Stats */}
      {(csTeams || dsTeams) && (() => {
        const stats = computeStormStats(user.id, csTeams || {}, dsTeams || {}, csSignups || [], dsSignups || []);
        if (stats.signedUp === 0) return null;
        const pctColor = stats.pct == null ? "var(--text-dim)" : stats.pct >= 80 ? "var(--green)" : stats.pct >= 50 ? "var(--gold)" : "var(--red)";
        return (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">⚔️ {tr("Storm Participation")}</div></div>
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 42, fontWeight: 800, color: pctColor, lineHeight: 1 }}>{stats.pct}%</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>{tr("Team Rate")}</div>
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: tr("Sign-Ups"), val: stats.signedUp, color: "var(--text)" },
                    { label: tr("Made Team"), val: stats.madeTeam, color: "var(--green)" },
                    { label: tr("Waitlisted"), val: stats.waitlisted, color: "var(--gold)" },
                    { label: tr("Missed"), val: stats.missed, color: "var(--text-dim)" },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "var(--bg)", borderRadius: 8, height: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${stats.pct}%`, background: pctColor, borderRadius: 8, transition: "width 0.5s" }} />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Power History */}
      {history.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><div className="card-title">📈 {t.powerHistory}</div></div>
          <div className="card-body">
            <div className="power-chart">
              {history.map((h, i) => (
                <div key={i} className="power-bar-wrap">
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 2 }}>{(h.power / 1000000).toFixed(1)}M</div>
                  <div className="power-bar" style={{ height: `${(h.power / maxPower) * 60}px` }}></div>
                  <div className="power-bar-label">{h.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Squad Growth Chart */}
      <DSGrowthChart user={user} dsSignups={dsSignups} />

      {/* Change Password */}
      <div className="card">
        <div className="card-header"><div className="card-title">🔒 {t.changePassword}</div></div>
        <div className="card-body">
          <div className="form-group"><label className="form-label">{tr("Current Password")}</label><input className="form-input" type="password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">{t.newPassword}</label><input className="form-input" type="password" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">{t.confirmPassword}</label><input className="form-input" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} /></div>
          {pwError && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{pwError}</p>}
          <button className="btn btn-primary" onClick={changePassword}>{t.changePassword}</button>
        </div>
      </div>
    </div>
  );
}
// ─── ADMIN SIGNUPS ────────────────────────────────────────────────────────────
const CS_SLOTS = ["Team 1","Team 2","Team 3","Team 4","Team 5","Team 6","Team 7","Team C","Floater"];
const DS_SLOTS = ["Team 1","Team 2","Team 3","Team 4","Team 5","Team 6","Team 7","Team 8","Floater"];

// ─── EDIT SIGNUP MODAL (Admin only) ──────────────────────────────────────────
function EditSignupModal({ signup, type, memberName, onClose, onSave, t }) {
  const { config: stormCfg } = useStormConfig();
  const offeredTimes = stormCfg?.[type === "canyon" ? "canyon" : "desert"]?.times || [];
  const [form, setForm] = useState({
    power: signup.power || "",
    squadType: signup.squadType || "Air",
    availability: signup.availability || "confirmed",
    timePreference: signup.timePreference || "either",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">✏️ {tr("Edit Sign-Up")} — {memberName}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">{t.squadPower}</label>
            <input className="form-input" value={form.power} onChange={e => set("power", e.target.value)} onBlur={e => {
              const clean = e.target.value.replace(/[^0-9.]/g, "");
              if (!clean.includes(".") && clean.length >= 3) {
                const num = parseInt(clean, 10);
                if (!isNaN(num)) set("power", (num / 100).toFixed(2));
              }
            }} placeholder={tr("e.g. 7250 → 72.50")} />
          </div>
          <div className="form-group">
            <label className="form-label">{t.squadType}</label>
            <select className="form-input form-select" value={form.squadType} onChange={e => set("squadType", e.target.value)}>
              {SQUAD_TYPES.map(st => <option key={st} value={st}>{tr(st)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t.availability}</label>
            <div className="radio-group">
              {[["confirmed", t.confirmed], ["sub", t.sub], ["cantMake", t.cantMake]].map(([val, label]) => (
                <div key={val} className={`radio-option ${form.availability === val ? "selected" : ""}`} onClick={() => set("availability", val)}>
                  <div className="radio-dot"></div><span style={{ fontSize: 14 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t.timePreference}</label>
            <TimePrefPicker value={form.timePreference} offered={offeredTimes} onChange={v => set("timePreference", v)} compact />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t.cancel}</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...signup, ...form })}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

function WeekDetailView({ view, tab, histTeams, slots, isAdmin, t, showToast, getName, onBack, onClear, onSave, onRemove, onPatchWeek, signups }) {
  const [weekSlotData, setWeekSlotData] = useState(histTeams?.slotData || {});
  const [weekAttendance, setWeekAttendance] = useState(histTeams?.attendance || {});
  const [nameColWidth, setNameColWidth] = useState(100);
  const [sortA, setSortA] = useState({ col: null, dir: "asc" });
  const [sortB, setSortB] = useState({ col: null, dir: "asc" });

  const setSlot = (uid, field, value) => setWeekSlotData(prev => ({ ...prev, [uid]: { ...(prev[uid]||{}), [field]: value } }));
  const setAtt = (uid, val) => setWeekAttendance(prev => ({ ...prev, [uid]: val }));

  const getAvailability = (uid, member) => {
    if (member?.availability) return member.availability;
    return signups?.find(s => String(s.userId) === String(uid))?.availability || null;
  };

  // Touch-friendly column resize
  const startResize = (e) => {
    e.stopPropagation(); e.preventDefault();
    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    const startW = nameColWidth;
    const onMove = ev => setNameColWidth(Math.max(60, Math.min(180, startW + (ev.touches ? ev.touches[0].clientX : ev.clientX) - startX)));
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  };

  // Slot cap: set by R4 under "Spots per assignment" (default 2, Floater 4)
  // Spots + plan are saved on THIS battle week's team data, so every new week starts on the defaults
  const slotCaps = histTeams?.slotCaps || {};
  const getSlotCap = (slotName, teamKey) => getSlotCapFor(teamSlotCaps(slotCaps, teamKey), slotName);
  const [mapOpen, setMapOpen] = useState(false);
  // ── Battle plan for this week (📝 Plan) ──
  const weekPlan = normalizeWeekPlan(histTeams?.plan);
  const originalPlanText = tab === "canyon" ? planToText(CS_PLAN, CS_NOTES) : planToText(DS_PLAN, DS_NOTES);
  const [planTeam, setPlanTeam] = useState(null); // "A" | "B" while the popup is open
  const [planText, setPlanText] = useState("");
  const [planSame, setPlanSame] = useState(true);
  const [planMapBig, setPlanMapBig] = useState(false);
  const openPlan = (team) => {
    const cur = weekPlan || { same: true, a: originalPlanText, b: originalPlanText };
    setPlanSame(cur.same);
    setPlanText(team === "A" ? cur.a : (cur.same ? cur.a : cur.b));
    setPlanMapBig(false);
    setPlanTeam(team);
  };
  const savePlan = async () => {
    const cur = weekPlan || { same: true, a: originalPlanText, b: originalPlanText };
    let next;
    if (planTeam === "A") next = cur.same ? { same: true, a: planText, b: planText } : { same: false, a: planText, b: cur.b };
    else next = planSame ? { same: true, a: cur.a, b: cur.a } : { same: false, a: cur.a, b: planText };
    if (await onPatchWeek({ plan: next })) { showToast(tr("Team {team} plan saved for this week ✓", { team: planTeam })); setPlanTeam(null); }
  };
  const resetPlan = async () => {
    if (!window.confirm(tr("Reset this week's battle plan to the original for BOTH teams?"))) return;
    if (await onPatchWeek({ plan: null })) { showToast(tr("Plan reset to the original for this week")); setPlanTeam(null); }
  };
  const { plans: battlePlansCfg } = useStormConfig();
  const battleMapSrc = battlePlansCfg?.[tab]?.map || (tab === "canyon" ? CS_MAP : DS_MAP);
  const [capsTeam, setCapsTeam] = useState(null); // "teamA" | "teamB" while the popup is open
  const [capsDraft, setCapsDraft] = useState({});
  const openCaps = (teamKey) => { setCapsDraft(Object.fromEntries(slots.map(sl => [sl, getSlotCap(sl, teamKey)]))); setCapsTeam(teamKey); };
  const saveCaps = async () => {
    const clean = Object.fromEntries(Object.entries(capsDraft).map(([k, v]) => { const n = parseInt(v, 10); return [k, Math.max(0, Math.min(20, isNaN(n) ? 0 : n))]; }));
    const full = (tk) => Object.fromEntries(slots.map(sl => [sl, getSlotCap(sl, tk)])); // keeps the other team's current spots
    const next = { teamA: capsTeam === "teamA" ? clean : full("teamA"), teamB: capsTeam === "teamB" ? clean : full("teamB") };
    if (await onPatchWeek({ slotCaps: next })) { showToast(tr("Team {team} spots saved ✓", { team: capsTeam === "teamA" ? "A" : "B" })); setCapsTeam(null); }
  };
  const countSlot = (teamKey, slotName) => {
    const members = getTeamMembers(histTeams?.[teamKey]);
    return members.filter(m => {
      const uid = m.userId || m.name;
      const sd = weekSlotData[uid] || {};
      return (sd.slot || m.slot) === slotName;
    }).length;
  };

  // Support both new format [{userId, name}] and legacy slot-based [{slot, players}]
  const getTeamMembers = (teamArr) => {
    if (!teamArr || teamArr.length === 0) return [];
    if (teamArr[0]?.userId !== undefined) return teamArr;
    return teamArr.flatMap(slot => (slot.players||[]).filter(Boolean).map(name => ({ name, userId: name, slot: slot.slot })));
  };

  const toggleSort = (teamKey, col) => {
    const setter = teamKey === "teamA" ? setSortA : setSortB;
    const current = teamKey === "teamA" ? sortA : sortB;
    setter(prev => prev.col === col ? { col, dir: prev.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });
  };

  const sortMembers = (members, sort) => {
    if (!sort.col) return members;
    return [...members].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.col === "name") return dir * (a.name || "").localeCompare(b.name || "");
      if (sort.col === "status") {
        const order = { confirmed: 0, sub: 1, cantMake: 2 };
        const aAvail = getAvailability(a.userId || a.name, a);
        const bAvail = getAvailability(b.userId || b.name, b);
        return dir * ((order[aAvail] ?? 3) - (order[bAvail] ?? 3));
      }
      if (sort.col === "slot") return dir * ((weekSlotData[a.userId || a.name]?.slot || "").localeCompare(weekSlotData[b.userId || b.name]?.slot || ""));
      if (sort.col === "role") return dir * ((weekSlotData[a.userId || a.name]?.role || "").localeCompare(weekSlotData[b.userId || b.name]?.role || ""));
      if (sort.col === "pwr") {
        const aP = parseFloat(a.power || signups?.find(s => String(s.userId) === String(a.userId || a.name))?.power || 0);
        const bP = parseFloat(b.power || signups?.find(s => String(s.userId) === String(b.userId || b.name))?.power || 0);
        return dir * (aP - bP);
      }
      if (sort.col === "type") return dir * ((a.squadType || signups?.find(s => String(s.userId) === String(a.userId || a.name))?.squadType || "").localeCompare(b.squadType || signups?.find(s => String(s.userId) === String(b.userId || b.name))?.squadType || ""));
      return 0;
    });
  };

  const renderTeam = (teamKey, teamLabel, color, sort) => {
    const members = sortMembers(getTeamMembers(histTeams?.[teamKey]), sort);
    if (members.length === 0) return <div style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 16 }}>{tr("No Team {team} members.", { team: teamLabel })}</div>;

    // Count starters and subs
    const starterCount = members.filter(m => (weekSlotData[m.userId || m.name]?.role) === "starter").length;
    const subCount = members.filter(m => (weekSlotData[m.userId || m.name]?.role) === "sub").length;
    const starterOver = starterCount > 20;
    const subOver = subCount > 10;

    return (
      <div style={{ marginBottom: 24 }}>
        {/* Sticky team header — pinned under the top bar while scrolling this team */}
        <div className="team-sticky" style={{ borderBottom: `2px solid ${color}` }}>
        <div style={{ fontWeight: 700, marginBottom: 6, color, fontSize: 15 }}>
          {tr("Team")} {teamLabel} — {teamKey === "teamA" ? histTeams?.timeA : histTeams?.timeB} {t.serverTime}
          <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 400, color: "var(--text-dim)" }}>{tr("{n} members", { n: members.length })}</span>
        </div>
        {/* Starters · Subs · Spots · Map · Plan — always one row */}
        <div className="team-pills">
          <span className={`badge ${starterOver ? "badge-red" : "badge-green"}`}>{tr("Starters")} {starterCount}/20{starterOver ? " ⚠️" : ""}</span>
          <span className={`badge ${subOver ? "badge-red" : "badge-gold"}`}>{tr("Subs")} {subCount}/10{subOver ? " ⚠️" : ""}</span>
          <button type="button" className="badge badge-blue" onClick={() => openCaps(teamKey)} title={tr("Spots per assignment for Team {team}", { team: teamLabel })}>👥 {tr("Spots")}</button>
          <button type="button" className="badge badge-blue" onClick={() => setMapOpen(true)} title={tr("Battle map")}>🗺️ {tr("Map")}</button>
          <button type="button" className="badge badge-blue" onClick={() => openPlan(teamLabel)}
            title={teamLabel === "B" && (!weekPlan || weekPlan.same) ? tr("Team B uses Team A's plan — tap to change") : tr("Team {team} battle plan", { team: teamLabel })}>
            📝 {tr("Plan")}{teamLabel === "B" && (!weekPlan || weekPlan.same) ? <sup className="same-a">=A</sup> : null}
          </button>
        </div>
        </div>
        <div style={{ overflowX: "auto", margin: "0 -4px" }}>
          <table className="data-table storm-assign">
            <colgroup>
              <col />
              <col style={{ width: 36 }} />
              <col style={{ width: 26 }} />
              <col style={{ width: 64 }} />
              <col style={{ width: 54 }} />
              <col style={{ width: 22 }} />
            </colgroup>
            <thead><tr>
              {[["name",tr("Player")],["pwr",tr("Pwr")],["type",tr("Type")],["slot",tr("Assign")],["role",tr("Role")]].map(([col,label]) => (
                <th key={col} style={{ cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort(teamKey, col)}>
                  {label}{sort.col === col ? (sort.dir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
              <th></th>
            </tr></thead>
            <tbody>
              {members.map((m, i) => {
                const uid = m.userId || m.name;
                const sd = weekSlotData[uid] || {};
                const avail = getAvailability(uid, m);
                const sig = signups?.find(s => String(s.userId) === String(uid));
                const pwr = m.power || sig?.power || "";
                const type = m.squadType || sig?.squadType || "";
                const typeShort = { Air: tr("Air"), Tank: tr("Tnk"), Missile: tr("Msl") }[type] || (type ? type.slice(0, 3) : "—");
                const status = avail === "confirmed" ? { txt: "✓", c: "var(--green)", tip: tr("Confirmed") }
                  : avail === "sub" ? { txt: "S", c: "var(--gold)", tip: tr("Signed up as sub") }
                  : avail === "cantMake" ? { txt: "✗", c: "var(--red)", tip: tr("Can't make") } : null;
                const stripe = i % 2 === 0 ? "transparent" : "var(--surface2)";
                const selectedSlot = sd.slot || m.slot || "";
                const slotCap = selectedSlot ? getSlotCap(selectedSlot, teamKey) : null;
                const slotCount = selectedSlot ? countSlot(teamKey, selectedSlot) : 0;
                const slotFull = slotCap !== null && slotCount > slotCap;
                const shortSlot = (sl) => sl === "Floater" ? "Flt" : sl.replace("Team ", "T");
                return (
                  <tr key={uid ?? i} style={{ background: stripe }}>
                    <td style={{ fontWeight: 600 }}>
                      {status && <span title={status.tip} style={{ color: status.c, fontWeight: 700, fontSize: 11, marginRight: 3 }}>{status.txt}</span>}
                      {m.name || getName(m.userId)}
                    </td>
                    <td style={{ fontSize: 11 }}>{pwr || "—"}</td>
                    <td style={{ fontSize: 10, color: "var(--text-dim)" }} title={tr(type)}>{typeShort}</td>
                    <td style={{ overflow: "visible" }}>
                      <select className="slot-pick" style={slotFull ? { borderColor: "var(--red)" } : undefined}
                        value={selectedSlot} aria-label={tr("Assignment for {name}", { name: m.name || getName(m.userId) })}
                        onChange={e => setSlot(uid, "slot", e.target.value)}>
                        <option value="">—</option>
                        {slots.map(sl => {
                          const cap = getSlotCap(sl, teamKey);
                          const cnt = countSlot(teamKey, sl);
                          if (cap === 0 && sl !== selectedSlot && cnt === 0) return null; // assignment not used this week
                          if (cap === 0) return <option key={sl} value={sl} disabled={sl !== selectedSlot}>{shortSlot(sl)} ({tr("off")})</option>;
                          const full = sl !== selectedSlot && cnt >= cap;
                          return <option key={sl} value={sl} disabled={full}>{shortSlot(sl)} {cnt}/{cap}</option>;
                        })}
                      </select>
                    </td>
                    <td style={{ overflow: "visible" }}>
                      <div className="team-seg" role="group" aria-label={tr("Role")}>
                        {[["starter",tr("St"),tr("Starter")],["sub",tr("Sub"),tr("Sub")]].map(([v, lbl, tip]) => (
                          <button key={v} type="button" title={tip} style={{ fontSize: 10 }}
                            className={sd.role === v ? `on-${v}` : ""} aria-pressed={sd.role === v}
                            onClick={() => setSlot(uid, "role", sd.role === v ? "" : v)}>{lbl}</button>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", overflow: "visible" }}>
                      <button type="button" aria-label={tr("Remove from team")} title={tr("Remove from team")}
                        style={{ background: "none", border: "none", padding: 0, color: "var(--red)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                        onClick={() => onRemove && onRemove(uid, teamKey)}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const exportExcel = async () => {
    const isCanyon = tab === "canyon";
    const teamSlots = isCanyon
      ? ["Team 1", "Team 2", "Team 3", "Team 4", "Team 5", "Team 6", "Team 7", "Team C"]
      : ["Team 1", "Team 2", "Team 3", "Team 4", "Team 5", "Team 6", "Team 7", "Team 8"];

    const getPlayers = (teamKey, slotName) => {
      const mems = getTeamMembers(histTeams?.[teamKey]);
      return mems.filter(m => {
        const uid = m.userId || m.name;
        const s = (weekSlotData[uid]?.slot || m.slot || "");
        return slotName === "Floater" ? s === "Floater" : s === slotName;
      }).map(m => m.name || getName(m.userId));
    };

    const getSubs = (teamKey) => {
      return getTeamMembers(histTeams?.[teamKey]).filter(m => {
        const uid = m.userId || m.name;
        const sd = weekSlotData[uid] || {};
        return sd.role === "sub";
      }).map(m => m.name || getName(m.userId));
    };

    // Load SheetJS dynamically
    if (!window.XLSX) {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    const XLSX = window.XLSX;

    const wb = XLSX.utils.book_new();
    const YELLOW = { fgColor: { rgb: "FFFF00" } };
    const GREEN = { fgColor: { rgb: "92D050" } };
    const BOLD = { bold: true };

    const buildTeamRows = (teamKey, label, time, fill) => {
      const rows = [];
      rows.push([{ v: `⚔️ ${label} ⚔️`, s: { font: { bold: true, sz: 13 }, fill: { patternType: "solid", ...fill } } }, "", "", ""]);
      rows.push([{ v: `⏰ ${time || tr("TBD")} ${tr("server time")}`, s: { font: BOLD } }, "", "", ""]);
      teamSlots.forEach(slot => {
        const p = getPlayers(teamKey, slot);
        if (getSlotCap(slot, teamKey) === 0 && p.length === 0) return; // not used this week
        rows.push([
          { v: `${slot}:`, s: { font: BOLD } },
          { v: p[0] || "—" },
          { v: "/" },
          { v: p.slice(1).join(" / ") || "—" },
        ]);
      });
      const floaters = getPlayers(teamKey, "Floater");
      Array.from({ length: Math.max(getSlotCap("Floater", teamKey), floaters.length) }, (_, i) => i).forEach(i => {
        rows.push([{ v: `${tr("Floater")} ${i + 1}:`, s: { font: BOLD } }, { v: floaters[i] || "—" }, "", ""]);
      });
      const subs = getSubs(teamKey);
      if (subs.length > 0) rows.push([{ v: tr("Subs") + ":", s: { font: BOLD } }, { v: subs.join(", ") }, "", ""]);
      rows.push(["", "", "", ""]);
      return rows;
    };

    const title = (isCanyon ? "🏔️ Canyon Storm — " : "🏜️ Desert Storm — ") + tr("Team Assignments");
    const allRows = [
      [{ v: title, s: { font: { bold: true, sz: 14 } } }],
      [""],
      ...buildTeamRows("teamA", tr("Team") + " A", histTeams?.timeA, { patternType: "solid", fgColor: { rgb: "FFFF00" } }),
      ...buildTeamRows("teamB", tr("Team") + " B", histTeams?.timeB, { patternType: "solid", fgColor: { rgb: "92D050" } }),
    ];

    const ws = XLSX.utils.aoa_to_sheet(allRows);
    ws["!cols"] = [{ wch: 20 }, { wch: 22 }, { wch: 3 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws, "Teams");

    XLSX.writeFile(wb, `${isCanyon ? "canyon" : "desert"}-teams-${view}.xlsx`);
    showToast(tr("Excel exported! 📊"));
  };

  const exportWeekCSV = () => {
    const lines = ["Team,Player,Slot,Role,Attended"];
    ["teamA", "teamB"].forEach(teamKey => {
      const teamLabel = teamKey === "teamA" ? "A" : "B";
      const members = getTeamMembers(histTeams?.[teamKey]);
      members.forEach(m => {
        const uid = m.userId || m.name;
        const sd = weekSlotData[uid] || {};
        lines.push(`${teamLabel},${m.name || getName(m.userId)},${sd.slot||""},${sd.role||""},${weekAttendance[uid]?"Yes":"No"}`);
      });
    });
    (histTeams?.waitlist || []).forEach(m => {
      lines.push(`Waitlist,${m.name || getName(m.userId)},,,`);
    });
    (histTeams?.unassigned || []).forEach(m => {
      lines.push(`Unassigned,${m.name || getName(m.userId)},,,`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a"); el.href = url; el.download = `${tab}-${view}.csv`; el.click();
    showToast(tr("Exported!"));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← {tr("Back")}</button>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm btn-secondary" onClick={exportWeekCSV}>⬇️ CSV</button>
          <button className="btn btn-sm btn-secondary" onClick={exportExcel}>📊 {tr("Export Teams")}</button>
          <button className="btn btn-sm btn-primary" onClick={() => onSave(weekSlotData, weekAttendance)}>💾 {tr("Save")}</button>
        </div>
      </div>
      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{tab === "canyon" ? "🏔️" : "🏜️"} {tr("Battle")} — {formatDate(view)}</h3>
      {mapOpen && (
        <div className="modal-overlay" onClick={() => setMapOpen(false)} style={{ alignItems: "flex-start", paddingTop: 20 }}>
          <div style={{ width: "100%", maxWidth: 700, position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setMapOpen(false)} aria-label={tr("Close map")} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, zIndex: 10 }}>✕</button>
            <img src={battleMapSrc} alt={tab === "canyon" ? tr("Canyon Storm map") : tr("Desert Storm map")} style={{ width: "100%", borderRadius: 12, display: "block" }} />
          </div>
        </div>
      )}
      {planTeam && (
        <div className="modal-overlay" onClick={() => setPlanTeam(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📝 {tab === "canyon" ? "Canyon" : "Desert"} — {tr("Team {team} plan", { team: planTeam })}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setPlanTeam(null)} aria-label={tr("Close")}>✕</button>
            </div>
            <div className="modal-body">
              <img src={battleMapSrc} alt={tab === "canyon" ? tr("Canyon Storm map") : tr("Desert Storm map")} onClick={() => setPlanMapBig(b => !b)}
                style={{ width: "100%", maxHeight: planMapBig ? "none" : 170, objectFit: "contain", background: "#0b0907", borderRadius: 10, display: "block", cursor: "pointer", marginBottom: 12 }} />
              {planTeam === "A" ? (<>
                <div className="form-hint" style={{ marginBottom: 6 }}>{trRich("Start a line with <b>#</b> for a heading and <b>-</b> for a bullet.")}</div>
                {(!weekPlan || weekPlan.same) && <div className="form-hint" style={{ marginBottom: 6, color: "var(--gold)" }}>{tr("Team B is set to \"Same as A\", so this plan is shown to everyone.")}</div>}
                <textarea className="form-input" rows={12} value={planText} onChange={e => setPlanText(e.target.value)} style={{ fontFamily: "inherit", fontSize: 13, lineHeight: 1.5, resize: "vertical" }} />
                {weekPlan && <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8, paddingLeft: 0 }} onClick={resetPlan}>↺ {tr("Reset to original")}</button>}
              </>) : (<>
                <label className="row" style={{ gap: 8, cursor: "pointer", marginBottom: 10, fontSize: 14, fontWeight: 600 }}>
                  <input type="checkbox" checked={planSame} style={{ width: 18, height: 18, accentColor: "var(--gold)" }}
                    onChange={e => { const same = e.target.checked; setPlanSame(same); if (!same && !(weekPlan && !weekPlan.same)) setPlanText((weekPlan || {}).a ?? originalPlanText); }} />
                  {tr("Same as A")}
                </label>
                {planSame ? (
                  <div className="form-hint" style={{ background: "var(--surface2)", borderRadius: 8, padding: "10px 12px" }}>{tr("Team B uses Team A's plan. Members see one plan for everyone on the Plans tab.")}</div>
                ) : (<>
                  <div className="form-hint" style={{ marginBottom: 6 }}>{trRich("Start a line with <b>#</b> for a heading and <b>-</b> for a bullet.")}</div>
                  <textarea className="form-input" rows={12} value={planText} onChange={e => setPlanText(e.target.value)} style={{ fontFamily: "inherit", fontSize: 13, lineHeight: 1.5, resize: "vertical" }} />
                </>)}
              </>)}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPlanTeam(null)}>{tr("Cancel")}</button>
              <button className="btn btn-primary" onClick={savePlan}>💾 {tr("Save plan")}</button>
            </div>
          </div>
        </div>
      )}
      {capsTeam && (
        <div className="modal-overlay" onClick={() => setCapsTeam(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">👥 {tr("Team")} {capsTeam === "teamA" ? "A" : "B"} — {tr("Spots per assignment")}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setCapsTeam(null)} aria-label={tr("Close")}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-hint" style={{ marginBottom: 10 }}>{tr("How many players each assignment holds for Team {team} only. Set 0 to hide an assignment you're not using.", { team: capsTeam === "teamA" ? "A" : "B" })}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))", gap: 8 }}>
                {slots.map(sl => (
                  <label key={sl} style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--text-mid)" }}>
                    {sl}
                    <input className="form-input" type="number" min={0} max={20} inputMode="numeric" style={{ padding: "8px 10px" }}
                      value={capsDraft[sl] ?? ""} onChange={e => setCapsDraft(d => ({ ...d, [sl]: e.target.value }))} />
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer" style={{ alignItems: "center", flexWrap: "nowrap" }}>
              {(() => {
                const total = Object.values(capsDraft).reduce((n, v) => n + (parseInt(v, 10) || 0), 0);
                const ok = total === 20;
                return (
                  <span className="spots-counter" style={{ color: ok ? "var(--green)" : total > 20 ? "var(--red)" : "var(--text-mid)" }}>
                    {ok ? "20/20 ✓" : total < 20 ? `${total}/20 · ${tr("{n} more", { n: 20 - total })}` : `${total}/20 · ${tr("{n} too many", { n: total - 20 })}`}
                  </span>
                );
              })()}
              <button className="btn btn-secondary" onClick={() => setCapsTeam(null)}>{tr("Cancel")}</button>
              <button className="btn btn-primary" onClick={saveCaps} style={{ whiteSpace: "nowrap" }}>💾 {tr("Save")}</button>
            </div>
          </div>
        </div>
      )}
      {renderTeam("teamA", "A", "var(--gold)", sortA)}
      {renderTeam("teamB", "B", "var(--blue)", sortB)}

      {/* Unassigned */}
      {(histTeams?.unassigned || []).length > 0 && (
        <div style={{ marginTop: 8, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: "var(--text-dim)", fontSize: 15 }}>
            ❓ {tr("Unassigned")} <span style={{ fontSize: 12, fontWeight: 400 }}>— {tr("signed up but not placed on a team")}</span>
          </div>
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px" }}>
            {histTeams.unassigned.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderBottom: i < histTeams.unassigned.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 14 }}>❓</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{m.name || getName(m.userId)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waitlist */}
      {(histTeams?.waitlist || []).length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: "var(--red)", fontSize: 15 }}>
            ⏳ {tr("Waitlist")} <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-dim)" }}>— {tr("give these players priority next week")}</span>
          </div>
          <div style={{ background: "rgba(229,57,53,0.05)", border: "1px solid rgba(229,57,53,0.2)", borderRadius: 10, padding: "12px 16px" }}>
            {histTeams.waitlist.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < histTeams.waitlist.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 16 }}>⏳</span>
                <span style={{ fontWeight: 600 }}>{m.name || getName(m.userId)}</span>
                {m.fromTeam && <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{tr("was Team {team}", { team: m.fromTeam })}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STORM LEADERBOARD ────────────────────────────────────────────────────────
function StormLeaderboard({ csTeams, dsTeams, csSignups, dsSignups, members, getName }) {
  const [sortCol, setSortCol] = useState("pct");
  const [sortDir, setSortDir] = useState("desc");
  const [filter, setFilter] = useState("all"); // all | canyon | desert

  const approved = members.filter(m => m.approved && !m.disabled);

  const rows = approved.map(m => {
    const csStats = computeStormStats(m.id, filter !== "desert" ? csTeams : {}, {}, filter !== "desert" ? csSignups : [], []);
    const dsStats = computeStormStats(m.id, {}, filter !== "canyon" ? dsTeams : {}, [], filter !== "canyon" ? dsSignups : []);
    const combined = filter === "canyon" ? csStats
      : filter === "desert" ? dsStats
      : {
          signedUp: csStats.signedUp + dsStats.signedUp,
          madeTeam: csStats.madeTeam + dsStats.madeTeam,
          waitlisted: csStats.waitlisted + dsStats.waitlisted,
          missed: csStats.missed + dsStats.missed,
          pct: (csStats.signedUp + dsStats.signedUp) > 0
            ? Math.round(((csStats.madeTeam + dsStats.madeTeam) / (csStats.signedUp + dsStats.signedUp)) * 100)
            : null,
        };
    return { ...m, ...combined };
  });

  const toggle = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };
  const arrow = (col) => sortCol === col ? (sortDir === "desc" ? " ↓" : " ↑") : " ↕";

  const sorted = [...rows].sort((a, b) => {
    const dir = sortDir === "desc" ? -1 : 1;
    if (sortCol === "name") return dir * a.username.localeCompare(b.username);
    const va = a[sortCol] ?? -1;
    const vb = b[sortCol] ?? -1;
    return dir * (va - vb);
  });

  const pctColor = (pct) => pct == null ? "var(--text-dim)" : pct >= 80 ? "var(--green)" : pct >= 50 ? "var(--gold)" : "var(--red)";

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{tr("Show")}:</span>
        {[["all",tr("All Storms")],["canyon","🏔️ Canyon"],["desert","🏜️ Desert"]].map(([v, l]) => (
          <button key={v} className={`sort-chip ${filter === v ? "active" : ""}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-dim)" }}>{tr("{n} members", { n: sorted.length })}</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table" style={{ fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ cursor: "pointer" }} onClick={() => toggle("name")}>{tr("Player")}{arrow("name")}</th>
              <th style={{ cursor: "pointer", textAlign: "center" }} onClick={() => toggle("pct")}>{tr("Rate")}{arrow("pct")}</th>
              <th style={{ cursor: "pointer", textAlign: "center" }} onClick={() => toggle("signedUp")}>{tr("Signed Up")}{arrow("signedUp")}</th>
              <th style={{ cursor: "pointer", textAlign: "center" }} onClick={() => toggle("madeTeam")}>{tr("Made Team")}{arrow("madeTeam")}</th>
              <th style={{ cursor: "pointer", textAlign: "center" }} onClick={() => toggle("waitlisted")}>{tr("Waitlisted")}{arrow("waitlisted")}</th>
              <th style={{ cursor: "pointer", textAlign: "center" }} onClick={() => toggle("missed")}>{tr("Missed")}{arrow("missed")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m, i) => {
              const stripe = i % 2 === 0 ? "transparent" : "var(--surface2)";
              return (
                <tr key={m.id} style={{ background: stripe }}>
                  <td style={{ fontWeight: 600, padding: "7px 12px" }}>
                    <span className={m.profession === "engineer" ? "name-engineer" : "name-warleader"}>{m.username}</span>
                  </td>
                  <td style={{ textAlign: "center", padding: "7px 12px" }}>
                    {m.pct != null ? (
                      <span style={{ fontWeight: 800, fontSize: 15, color: pctColor(m.pct) }}>{m.pct}%</span>
                    ) : <span style={{ color: "var(--text-dim)" }}>—</span>}
                  </td>
                  <td style={{ textAlign: "center", padding: "7px 12px" }}>{m.signedUp}</td>
                  <td style={{ textAlign: "center", padding: "7px 12px", color: "var(--green)", fontWeight: 600 }}>{m.madeTeam}</td>
                  <td style={{ textAlign: "center", padding: "7px 12px", color: "var(--gold)" }}>{m.waitlisted || 0}</td>
                  <td style={{ textAlign: "center", padding: "7px 12px", color: "var(--text-dim)" }}>{m.missed || 0}</td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>{tr("No storm history yet.")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── STORM SETTINGS MODAL (⚙️ — survey times, season, battle plan) ────────────
function StormSettingsModal({ type, showToast, onClose, isAdmin, seasonActive, onToggleSeason }) {
  const { config, save } = useStormConfig();
  const cfg = config?.[type] || DEFAULT_STORM_CONFIG[type];
  const [newTime, setNewTime] = useState("");

  const addTime = async () => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(newTime.trim());
    if (!m || +m[1] > 23 || +m[2] > 59) { showToast(tr("Enter a time like 09:00")); return; }
    const tm = `${m[1].padStart(2, "0")}:${m[2]}`;
    if (cfg.times.includes(tm)) { setNewTime(""); return; }
    if (await save(type, { times: sortTimes([...cfg.times, tm]) })) { setNewTime(""); showToast(tr("{time} added to the sign-up survey ✓", { time: tm })); }
  };
  const removeTime = async (tm) => {
    if (cfg.times.length <= 1) { showToast(tr("Keep at least one time.")); return; }
    if (await save(type, { times: cfg.times.filter(x => x !== tm) })) showToast(tr("{time} removed from the sign-up survey", { time: tm }));
  };
  const sectionTitle = { fontWeight: 700, fontSize: 15, marginBottom: 6 };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">⚙️ {type === "canyon" ? "Canyon Storm" : "Desert Storm"} — {tr("Settings")}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label={tr("Close")}>✕</button>
        </div>
        <div className="modal-body">
          <div style={sectionTitle}>⏰ {tr("Sign-up time options")}</div>
          <div className="form-hint" style={{ marginBottom: 8 }}>{tr("Only these times show in the sign-up survey. Members can tick more than one. Changes save instantly.")}</div>
          <div className="chip-row" style={{ marginBottom: 10 }}>
            {cfg.times.map(tm => (
              <span key={tm} className="chip">{tm}<button type="button" aria-label={tr("Remove {time}", { time: tm })} onClick={() => removeTime(tm)}>✕</button></span>
            ))}
          </div>
          <div className="row" style={{ gap: 8 }}>
            <input className="form-input" type="time" step={60} value={newTime} onChange={e => setNewTime(e.target.value)} style={{ maxWidth: 140 }} aria-label={tr("New time")} />
            <button className="btn btn-sm btn-primary" onClick={addTime}>+ {tr("Add time")}</button>
          </div>

          <div className="divider" style={{ margin: "18px 0" }} />

          {isAdmin && <>
            <div style={sectionTitle}>🌙 {tr("Season")}</div>
            <div className="row-between" style={{ gap: 10 }}>
              <div className="form-hint" style={{ margin: 0 }}>
                {seasonActive ? tr("Active — members can see this storm.") : tr("Disabled — this storm is hidden from members.")}
              </div>
              <button className={`btn btn-sm ${seasonActive ? "btn-secondary" : "btn-purple"}`} style={{ whiteSpace: "nowrap" }} onClick={onToggleSeason}>
                {seasonActive ? "🌙 " + tr("Disable") : "☀️ " + tr("Enable")}
              </button>
            </div>
            <div className="divider" style={{ margin: "18px 0" }} />
          </>}

          <div style={sectionTitle}>🗺️ {tr("Battle map picture")}</div>
          <div className="form-hint" style={{ marginBottom: 8 }}>{tr("Battle plans are set per week — use 📝 Plan on each team in the week's assignments.")}</div>
          <BattleMapPicker type={type} showToast={showToast} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>{tr("Done")}</button>
        </div>
      </div>
    </div>
  );
}

function AdminSignups({ setMembers, setViewMember, csAllSignups, dsAllSignups, csSignups: csSignupsLive, dsSignups: dsSignupsLive, members, csTeams, setCsTeams, dsTeams, setDsTeams, t, showToast, isAdmin, setCsSignups, setDsSignups, stormSettings, setStormSettings }) {
  // On battle day the loaded list also holds next battle's sign-ups — admin tools only use today's battle
  const csSignups = csSignupsLive.filter(s => s.week === getSignupWeek("canyon"));
  // Battle day: sign-ups that already went to NEXT battle (shown in a separate list)
  const csNextSignups = csSignupsLive.filter(s => s.week === getNextSignupWeek("canyon") && getNextSignupWeek("canyon") !== getSignupWeek("canyon"));
  const dsNextSignups = dsSignupsLive.filter(s => s.week === getNextSignupWeek("desert") && getNextSignupWeek("desert") !== getSignupWeek("desert"));
  const [nextOpen, setNextOpen] = useState(false);
  const dsSignups = dsSignupsLive.filter(s => s.week === getSignupWeek("desert"));
  const [tab, setTab] = useState("canyon");
  const { config: stormCfg } = useStormConfig();
  const offeredTimes = stormCfg?.[tab === "desert" ? "desert" : "canyon"]?.times || [];
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sorts, setSorts] = useState([]);
  const [view, setView] = useState("current");
  const [assignments, setAssignments] = useState({});
  const [playerColWidth, setPlayerColWidth] = useState(110);
  const [tableSort, setTableSort] = useState({ col: null, dir: "asc" });
  const [csTimeA, setCsTimeARaw] = useState(() => { try { return localStorage.getItem("wild_cs_timeA") || "12:00"; } catch { return "12:00"; } });
  const [csTimeB, setCsTimeBRaw] = useState(() => { try { return localStorage.getItem("wild_cs_timeB") || "23:00"; } catch { return "23:00"; } });
  const [dsTimeA, setDsTimeARaw] = useState(() => { try { return localStorage.getItem("wild_ds_timeA") || "18:00"; } catch { return "18:00"; } });
  const [dsTimeB, setDsTimeBRaw] = useState(() => { try { return localStorage.getItem("wild_ds_timeB") || "23:00"; } catch { return "23:00"; } });
  const [attendance, setAttendance] = useState({});
  const [editSignup, setEditSignup] = useState(null);

  const [adminSignupForm, setAdminSignupForm] = useState(null); // null = closed, {memberId, power, squadType, availability, timePreference, canFlexTime}
  const [adminSignupOpen, setAdminSignupOpen] = useState(false);
  const [signupSearch, setSignupSearch] = useState("");
  const [hideAssigned, setHideAssigned] = useState(false);

  const openAdminSignup = () => {
    setAdminSignupForm({ memberId: "", power: "", squadType: "", availability: "confirmed", timePreference: "either", canFlexTime: "" });
    setAdminSignupOpen(true);
  };

  const saveAdminSignup = () => {
    const f = adminSignupForm;
    if (!f.memberId) { showToast(tr("Select a member.")); return; }
    if (!f.power) { showToast(tr("Enter squad power.")); return; }
    if (!f.squadType) { showToast(tr("Select squad type.")); return; }
    const weekStart = getSignupWeek(tab === "canyon" ? "canyon" : "desert");
    const signup = { userId: f.memberId, power: f.power, squadType: f.squadType, availability: f.availability, timePreference: f.timePreference, canFlexTime: f.canFlexTime || "", week: weekStart };
    const notThis = x => !(String(x.userId) === String(f.memberId) && x.week === weekStart);
    if (tab === "canyon") setCsSignups(s => [...s.filter(notThis), signup]);
    else setDsSignups(s => [...s.filter(notThis), signup]);
    setAdminSignupOpen(false);
    setAdminSignupForm(null);
    showToast(tr("{name} signed up ✓", { name: members.find(m=>String(m.id)===String(f.memberId))?.username || tr("Member") }));
  };

  const toggleSignups = async (type) => {
    const newVal = !(stormSettings?.[type] ?? false);
    const { error } = await supabase.from("storm_settings")
      .update({ signups_open: newVal, updated_at: new Date().toISOString() })
      .eq("type", type);
    if (error) { showToast(tr("Error updating sign-up status.")); return; }
    setStormSettings(prev => ({ ...prev, [type]: newVal }));
    showToast((type === "canyon" ? "🏔️ Canyon: " : "🏜️ Desert: ") + (newVal ? tr("sign-ups opened ✅") : tr("sign-ups closed 🔒")));
  };

  const toggleSeasonActive = async (type) => {
    const newVal = !(stormSettings?.[`${type}_active`] ?? true);
    const { error } = await supabase.from("storm_settings")
      .update({ season_active: newVal, updated_at: new Date().toISOString() })
      .eq("type", type);
    if (error) { showToast(tr("Error updating season status.")); return; }
    setStormSettings(prev => ({ ...prev, [`${type}_active`]: newVal }));
    showToast((type === "canyon" ? "🏔️ Canyon: " : "🏜️ Desert: ") + (newVal ? tr("season enabled — visible to members ✅") : tr("season disabled — hidden from members 🔒")));
  };

  // Battle date key = most recent Thursday (Canyon) or Friday (Desert) — same as getSignupWeek
  const getBattleWeekKey = () => getSignupWeek(tab === "canyon" ? "canyon" : "desert");

  const toggleTableSort = (col) => {
    setTableSort(prev => prev.col === col ? { col, dir: prev.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });
  };
  const tableSortArrow = (col) => tableSort.col === col ? (tableSort.dir === "asc" ? " ↑" : " ↓") : " ↕";

  // Sync assignments from saved week data when tab or teams change
  useEffect(() => {
    const weekKey = getBattleWeekKey();
    const weekData = (tab === "canyon" ? csTeams : dsTeams)[weekKey];
    if (weekData) {
      const loaded = {};
      (weekData.teamA || []).forEach(m => { loaded[m.userId || m.name] = { team: "A" }; });
      (weekData.teamB || []).forEach(m => { loaded[m.userId || m.name] = { team: "B" }; });
      setAssignments(loaded);
    } else {
      setAssignments({});
    }
  }, [tab, csTeams, dsTeams]);

  const timeA = tab === "canyon" ? csTimeA : dsTimeA;
  const timeB = tab === "canyon" ? csTimeB : dsTimeB;
  const setTimeA = (v) => {
    if (tab === "canyon") {
      setCsTimeARaw(v);
      try { localStorage.setItem("wild_cs_timeA", v); } catch {}
      const weekKey = getBattleWeekKey();
      setCsTeams(prev => ({ ...prev, [weekKey]: { ...(prev[weekKey] || { teamA: [], teamB: [] }), timeA: v } }));
    } else {
      setDsTimeARaw(v);
      try { localStorage.setItem("wild_ds_timeA", v); } catch {}
      const weekKey = getBattleWeekKey();
      setDsTeams(prev => ({ ...prev, [weekKey]: { ...(prev[weekKey] || { teamA: [], teamB: [] }), timeA: v } }));
    }
  };
  const setTimeB = (v) => {
    if (tab === "canyon") {
      setCsTimeBRaw(v);
      try { localStorage.setItem("wild_cs_timeB", v); } catch {}
      const weekKey = getBattleWeekKey();
      setCsTeams(prev => ({ ...prev, [weekKey]: { ...(prev[weekKey] || { teamA: [], teamB: [] }), timeB: v } }));
    } else {
      setDsTimeBRaw(v);
      try { localStorage.setItem("wild_ds_timeB", v); } catch {}
      const weekKey = getBattleWeekKey();
      setDsTeams(prev => ({ ...prev, [weekKey]: { ...(prev[weekKey] || { teamA: [], teamB: [] }), timeB: v } }));
    }
  };

  const saveEditedSignup = async (updated) => {
    if (editSignup.type === "canyon") {
      setCsSignups(s => s.map(x => String(x.userId) === String(updated.userId) && x.week === getSignupWeek("canyon") ? { ...x, ...updated } : x));
    } else {
      setDsSignups(s => s.map(x => String(x.userId) === String(updated.userId) && x.week === getSignupWeek("desert") ? { ...x, ...updated } : x));
    }
    // Also update member's power in Supabase if power changed
    if (updated.power) {
      const powerInUnits = Math.round(parseFloat(updated.power) * 1000000);
      await supabase.from("members").update({ power: powerInUnits }).eq("id", updated.userId);
      setMembers && setMembers(m => m.map(mb => String(mb.id) === String(updated.userId) ? { ...mb, power: powerInUnits } : mb));
    }
    setEditSignup(null);
    showToast(tr("Sign-up updated ✓"));
  };

  const getName = (userId) => members.find(m => String(m.id) === String(userId))?.username || tr("Unknown");

  const toggleSort = (s) => setSorts(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const sortSignups = (signups) => {
    if (sorts.length === 0) return signups;
    return [...signups].sort((a, b) => {
      for (const s of sorts) {
        let diff = 0;
        if (s === "availability") {
          const order = { confirmed: 0, sub: 1, cantMake: 2 };
          diff = (order[a.availability] ?? 0) - (order[b.availability] ?? 0);
        }
        if (s === "power") {
          diff = (parseFloat(b.power) || 0) - (parseFloat(a.power) || 0);
        }
        if (s === "time") {
          const key = (x) => isAnyTime(x.timePreference, offeredTimes) ? "" : parseTimePref(x.timePreference, offeredTimes).join(",");
          diff = key(a).localeCompare(key(b));
        }
        if (diff !== 0) return diff;
      }
      return 0;
    });
  };

  // Per-time availability: how many players can play each time.
  // A multi-time sign-up counts toward every time it lists; "Any" counts toward all times.
  const getPieData = (signups) => {
    const total = signups.length || 1;
    const counts = {};
    let anyCount = 0;
    offeredTimes.forEach(t => { counts[t] = 0; });
    signups.forEach(sg => {
      if (isAnyTime(sg.timePreference, offeredTimes)) {
        anyCount++;
        if (offeredTimes.length) offeredTimes.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
        return;
      }
      parseTimePref(sg.timePreference, offeredTimes).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    });
    const palette = ["var(--purple)", "var(--red)", "var(--blue)", "var(--green)", "var(--gold-light)", "var(--text-dim)"];
    const rows = Object.keys(counts).sort((a, b) => a.localeCompare(b))
      .map((label, i) => ({ label, count: counts[label], pct: Math.round(counts[label] / total * 100), color: palette[i % palette.length] }));
    return { rows, anyCount, total: signups.length };
  };

  const assign = (userId, key, value) => setAssignments(a => ({ ...a, [userId]: { ...(a[userId]||{}), [key]: value } }));

  const countTeam = (team) => Object.values(assignments).filter(a => a.team === team).length;

  const saveTeams = async () => {
    const weekKey = getBattleWeekKey();

    // Build team arrays — including explicitly unassigned (team="U")
    const teamAMembers = Object.entries(assignments)
      .filter(([,a]) => a.team === "A")
      .map(([uid]) => {
        const sig = (tab === "canyon" ? csSignups : dsSignups).find(s => String(s.userId) === String(uid));
        return { userId: uid, name: getName(uid), availability: sig?.availability || null, power: sig?.power || null, squadType: sig?.squadType || null };
      });
    const teamBMembers = Object.entries(assignments)
      .filter(([,a]) => a.team === "B")
      .map(([uid]) => {
        const sig = (tab === "canyon" ? csSignups : dsSignups).find(s => String(s.userId) === String(uid));
        return { userId: uid, name: getName(uid), availability: sig?.availability || null, power: sig?.power || null, squadType: sig?.squadType || null };
      });
    const unassignedMembers = Object.entries(assignments)
      .filter(([,a]) => a.team === "U")
      .map(([uid]) => {
        const sig = (tab === "canyon" ? csSignups : dsSignups).find(s => String(s.userId) === String(uid));
        return { userId: uid, name: getName(uid), availability: sig?.availability || null, power: sig?.power || null, squadType: sig?.squadType || null };
      });
    // Also capture anyone still on — (no team set) from current signups
    const currentSignups_ = tab === "canyon" ? csSignups : dsSignups;
    const currentSignupIds = currentSignups_.map(s => String(s.userId));
    const assignedIds = new Set(Object.keys(assignments));
    const notSetMembers = currentSignupIds
      .filter(uid => !assignedIds.has(uid))
      .map(uid => {
        const sig = currentSignups_.find(s => String(s.userId) === uid);
        return { userId: uid, name: getName(uid), availability: sig?.availability || null, power: sig?.power || null, squadType: sig?.squadType || null };
      });

    // Cap at 30 per team — overflow goes to waitlist
    const teamACapped = teamAMembers.slice(0, 30);
    const teamBCapped = teamBMembers.slice(0, 30);
    const waitlist = [
      ...teamAMembers.slice(30).map(m => ({ ...m, fromTeam: "A" })),
      ...teamBMembers.slice(30).map(m => ({ ...m, fromTeam: "B" })),
    ];
    if (waitlist.length > 0) {
      showToast("⚠️ " + tr("{n} player(s) moved to waitlist — teams capped at 30.", { n: waitlist.length }));
    }

    const existing = (tab === "canyon" ? csTeams : dsTeams)[weekKey] || {};
    const teamData = {
      timeA, timeB,
      teamA: teamACapped,
      teamB: teamBCapped,
      waitlist,
      unassigned: [...unassignedMembers, ...notSetMembers],
      slotData: existing.slotData || {},
      ...(existing.slotCaps ? { slotCaps: existing.slotCaps } : {}),
      ...(existing.plan ? { plan: existing.plan } : {}),
    };
    if (tab === "canyon") setCsTeams(prev => ({ ...prev, [weekKey]: teamData }));
    else setDsTeams(prev => ({ ...prev, [weekKey]: teamData }));

    showToast(tr("Teams saved! ✓"));
  };

  const exportCSV = (signups) => {
    const header = "Username,Power,Type,Availability,Time Pref,Can Flex,Team,Slot,Role,Attended\n";
    const rows = signups.map(s => {
      const name = getName(s.userId); const a = assignments[s.userId] || {};
      const timePref = timePrefLabel(s.timePreference, offeredTimes).replace(/ \/ /g, " & ");
      const flex = isAnyTime(s.timePreference, offeredTimes) ? "N/A" : s.canFlexTime === "yes" ? "Yes" : s.canFlexTime === "no" ? "No" : "";
      return `${name},${s.power},${s.squadType},${s.availability},${timePref},${flex},${a.team||""},${a.slot||""},${a.role||""},${attendance[s.userId]?"Yes":"No"}`;
    }).join("\n");
    const blob = new Blob([header+rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const el = document.createElement("a"); el.href=url; el.download=`${tab}-${serverToday()}.csv`; el.click();
    showToast(tr("CSV exported!"));
  };

  const copyAll = (signups) => {
    const lines = [`⚔️ ${tab === "canyon" ? "Canyon" : "Desert"} Storm — Team A (${timeA}) / Team B (${timeB})\n`];
    signups.forEach(s => {
      const name = getName(s.userId); const a = assignments[s.userId]||{};
      lines.push(`${name} | ${s.power} | ${s.squadType} | ${s.availability} | ${timePrefLabel(s.timePreference, offeredTimes)} | Team ${a.team||"?"} | ${a.slot||"?"} | ${a.role||"?"}`);
    });
    navigator.clipboard.writeText(lines.join("\n")).then(() => showToast(tr("Copied!")));
  };

  // signupSearch moved to top
  const applyTableSort = (signups) => {
    if (!tableSort.col) return signups;
    return [...signups].sort((a, b) => {
      const dir = tableSort.dir === "asc" ? 1 : -1;
      if (tableSort.col === "name") return dir * getName(a.userId).localeCompare(getName(b.userId));
      if (tableSort.col === "power") return dir * ((parseFloat(b.power)||0) - (parseFloat(a.power)||0)) * -1;
      if (tableSort.col === "type") return dir * (a.squadType||"").localeCompare(b.squadType||"");
      if (tableSort.col === "status") { const o={confirmed:0,sub:1,cantMake:2}; return dir*((o[a.availability]||0)-(o[b.availability]||0)); }
      if (tableSort.col === "time") return dir * timePrefLabel(a.timePreference, offeredTimes).localeCompare(timePrefLabel(b.timePreference, offeredTimes));
      if (tableSort.col === "flex") return dir * (a.canFlexTime||"").localeCompare(b.canFlexTime||"");
      if (tableSort.col === "team") { const o={A:0,B:1,"":2}; const aa=assignments[a.userId]||{}; const bb=assignments[b.userId]||{}; return dir*((o[aa.team]??2)-(o[bb.team]??2)); }
      return 0;
    });
  };

  const currentSignups = applyTableSort(
    (tab === "canyon" ? sortSignups(csSignups) : sortSignups(dsSignups))
      .filter(s => getName(s.userId).toLowerCase().includes(signupSearch.toLowerCase()))
      .filter(s => !hideAssigned || !assignments[s.userId]?.team || assignments[s.userId]?.team === "")
  );

  // Get previous week's waitlist for priority flagging
  const prevWaitlistIds = (() => {
    const teamsObj = tab === "canyon" ? csTeams : dsTeams;
    const allWeeks = Object.keys(teamsObj).sort();
    const battleKey = getBattleWeekKey();
    const prevWeeks = allWeeks.filter(w => w < battleKey);
    if (prevWeeks.length === 0) return new Set();
    const lastWeek = teamsObj[prevWeeks[prevWeeks.length - 1]];
    return new Set((lastWeek?.waitlist || []).map(m => m.userId || m.name));
  })();
  const pieData = getPieData(tab === "canyon" ? csSignups : dsSignups, tab);
  const slots = tab === "canyon" ? CS_SLOTS : DS_SLOTS;
  const weeks = tab === "canyon" ? Object.keys(csTeams) : Object.keys(dsTeams);

  // History view
  if (view !== "current") {
    const histTeams = (tab === "canyon" ? csTeams : dsTeams)[view];
    const slots = tab === "canyon" ? CS_SLOTS : DS_SLOTS;
    return (
      <WeekDetailView
        view={view} tab={tab} histTeams={histTeams} slots={slots}
        isAdmin={isAdmin} t={t} showToast={showToast} getName={getName}
        signups={tab === "canyon" ? csSignups : dsSignups}
        onBack={() => setView("current")}
        onClear={async () => {
          if (!window.confirm(tr("Clear team assignments for {date}?", { date: formatDate(view) }))) return;
          const empty = { timeA: histTeams?.timeA||"", timeB: histTeams?.timeB||"", teamA:[], teamB:[], slotData:{}, attendance:{} };
          if (tab === "canyon") setCsTeams(prev => ({ ...prev, [view]: empty }));
          else setDsTeams(prev => ({ ...prev, [view]: empty }));
          await supabase.from("battle_teams").delete().eq("type", tab==="canyon"?"canyon":"desert").eq("battle_date", view);
          setView("current"); showToast(tr("Week cleared."));
        }}
        onPatchWeek={async (patch) => {
          const updated = { ...(histTeams || {}), ...patch };
          if (tab === "canyon") setCsTeams(prev => ({ ...prev, [view]: updated }));
          else setDsTeams(prev => ({ ...prev, [view]: updated }));
          return true;
        }}
        onSave={(slotData, attendance) => {
          const updated = { ...histTeams, slotData, attendance };
          if (tab === "canyon") setCsTeams(prev => ({ ...prev, [view]: updated }));
          else setDsTeams(prev => ({ ...prev, [view]: updated }));
          showToast(tr("Saved ✓"));
        }}
        onRemove={(uid, teamKey) => {
          // Remove player from the team — they go back to unassigned in main table
          const updated = {
            ...histTeams,
            [teamKey]: (histTeams?.[teamKey] || []).filter(m => (m.userId || m.name) !== uid),
          };
          if (tab === "canyon") setCsTeams(prev => ({ ...prev, [view]: updated }));
          else setDsTeams(prev => ({ ...prev, [view]: updated }));
          showToast(tr("Player unassigned — assign them in the main table."));
        }}
      />
    );
  }

  return (
    <div>
      <div className="tabs">
        <button className={`tab ${tab==="canyon"?"active":""}`} onClick={()=>setTab("canyon")}>🏔️ Canyon Storm</button>
        <button className={`tab ${tab==="desert"?"active":""}`} onClick={()=>setTab("desert")}>🏜️ Desert Storm</button>
        <button className={`tab ${tab==="leaderboard"?"active":""}`} onClick={()=>setTab("leaderboard")}>📊 {tr("Leaderboard")}</button>
      </div>

      {tab === "leaderboard" && <StormLeaderboard csTeams={csTeams} dsTeams={dsTeams} csSignups={csAllSignups} dsSignups={dsAllSignups} members={members} getName={getName} />}

      {(tab === "canyon" || tab === "desert") && <>
      {/* Team times + open/close sign-ups */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:10, marginBottom:16, alignItems:"end"}}>
        <div><label className="form-label">{tr("Team A Time")}</label><input className="form-input" value={timeA} onChange={e=>setTimeA(e.target.value)} placeholder="12:00"/></div>
        <div><label className="form-label">{tr("Team B Time")}</label><input className="form-input" value={timeB} onChange={e=>setTimeB(e.target.value)} placeholder="23:00"/></div>
        <div>
          <label className="form-label">{tr("Sign-ups")}</label>
          <button
            className={`btn ${(stormSettings?.[tab] ?? false) ? "btn-danger" : "btn-green"}`}
            style={{ padding: "0 14px", height: 48, fontSize: 14, whiteSpace: "nowrap" }}
            onClick={() => toggleSignups(tab)}
            title={(stormSettings?.[tab] ?? false) ? tr("Sign-ups are open — tap to close") : tr("Sign-ups are closed — tap to open")}
          >
            {(stormSettings?.[tab] ?? false) ? "🔒 " + tr("Close") : "✅ " + tr("Open")}
          </button>
        </div>
      </div>

      {/* Time slot availability — players available per time (always ALL sign-ups, not search results) */}
      {(tab === "canyon" ? csSignups : dsSignups).length > 0 && (
        <div className="card" style={{marginBottom:12}}>
          <div style={{padding:"10px 14px"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8, fontSize:13}}>
              <span style={{fontWeight:600}}>⏰ {tr("Time Slots")}</span>
              <span style={{color:"var(--text-dim)"}}>{tr("Total")}: <strong style={{color:"var(--text)"}}>{pieData.total}</strong></span>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:6, fontSize:13}}>
              {pieData.rows.map(d => (
                <div key={d.label} style={{display:"grid", gridTemplateColumns:"52px 1fr auto", alignItems:"center", gap:8}}>
                  <span style={{fontWeight:600}}>{d.label}</span>
                  <div style={{height:10, borderRadius:5, background:"var(--border)", overflow:"hidden"}}>
                    <div style={{width:`${d.pct}%`, height:"100%", background:d.color, borderRadius:5}} />
                  </div>
                  <span style={{whiteSpace:"nowrap"}}><strong>{d.count}</strong> <span style={{color:"var(--text-dim)"}}>({d.pct}%)</span></span>
                </div>
              ))}
            </div>
            {pieData.anyCount > 0 && (
              <div style={{marginTop:8, fontSize:11, color:"var(--text-dim)"}}>{pieData.anyCount === 1 ? tr("Includes 1 “Any” sign-up in every time. Players who picked two times count in both.") : tr("Includes {n} “Any” sign-ups in every time. Players who picked two times count in both.", { n: pieData.anyCount })}</div>
            )}
          </div>
        </div>
      )}

      {settingsOpen && <StormSettingsModal type={tab} showToast={showToast} onClose={() => setSettingsOpen(false)}
        isAdmin={isAdmin} seasonActive={stormSettings?.[`${tab}_active`] ?? true} onToggleSeason={() => toggleSeasonActive(tab)} />}

      {/* R4 + Admin: ➕ Add · 💾 Save · 🙈 Hide · 🔍 Search · ⚙️ */}
      <div style={{ marginBottom: 14 }}>
        {!adminSignupOpen ? (
          <div className="storm-actions">
            <button className="btn btn-sm btn-primary" onClick={openAdminSignup} title={tr("Add a member sign-up")}>➕ {tr("Add")}</button>
            <button className="btn btn-sm btn-primary" onClick={saveTeams} title={tr("Save teams")}>💾 {tr("Save")}</button>
            <button className={`btn btn-sm ${hideAssigned ? "btn-gold" : "btn-secondary"}`} onClick={() => setHideAssigned(h => !h)} title={hideAssigned ? tr("Show all sign-ups") : tr("Hide assigned players")}>
              {hideAssigned ? "👁 " + tr("All") : "🙈 " + tr("Hide")}
            </button>
            <input className="form-input storm-search" type="search" value={signupSearch} onChange={e => setSignupSearch(e.target.value)} placeholder={"🔍 " + tr("Search")} aria-label={tr("Search by username")} />
            <button className="btn btn-sm btn-secondary storm-gear" onClick={() => setSettingsOpen(true)} title={tr("Storm settings")} aria-label={tr("Storm settings")}>⚙️</button>
          </div>
        ) : (
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="card-title">➕ {tr("Add Member Sign-Up")}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setAdminSignupOpen(false)}>✕</button>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">{tr("Member")}</label>
                  <select className="form-input form-select" value={adminSignupForm.memberId}
                    onChange={e => setAdminSignupForm(f => ({ ...f, memberId: e.target.value }))}>
                    <option value="">— {tr("Select member")} —</option>
                    {members.filter(m => m.approved && !m.disabled)
                      .filter(m => !(tab === "canyon" ? csSignups : dsSignups).find(s => String(s.userId) === String(m.id)))
                      .sort((a, b) => a.username.localeCompare(b.username))
                      .map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="form-group">
                    <label className="form-label">{tr("Squad Power")}</label>
                    <input className="form-input" value={adminSignupForm.power}
                      onChange={e => setAdminSignupForm(f => ({ ...f, power: e.target.value }))}
                      placeholder={tr("e.g. 41.24")} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{tr("Squad Type")}</label>
                    <select className="form-input form-select" value={adminSignupForm.squadType}
                      onChange={e => setAdminSignupForm(f => ({ ...f, squadType: e.target.value }))}>
                      <option value="">— {tr("Select")} —</option>
                      {SQUAD_TYPES.map(st => <option key={st} value={st}>{tr(st)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{tr("Availability")}</label>
                  <div className="radio-group">
                    {[["confirmed",tr("Confirmed")],["sub",tr("Sub")],["cantMake",tr("Can't Make")]].map(([val,label]) => (
                      <div key={val} className={`radio-option ${adminSignupForm.availability === val ? "selected" : ""}`}
                        onClick={() => setAdminSignupForm(f => ({ ...f, availability: val }))}>
                        <div className="radio-dot"></div><span style={{ fontSize: 13 }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{tr("Time Preference")}</label>
                  <TimePrefPicker compact value={adminSignupForm.timePreference} offered={offeredTimes}
                    onChange={v => setAdminSignupForm(f => ({ ...f, timePreference: v, canFlexTime: isAnyTime(v, offeredTimes) ? "" : f.canFlexTime }))} />
                </div>
                {adminSignupForm.timePreference && !isAnyTime(adminSignupForm.timePreference, offeredTimes) && (
                  <div className="form-group">
                    <div style={{ background: "rgba(201,140,40,0.08)", border: "1px solid var(--gold)", borderRadius: 10, padding: "10px 14px", marginBottom: 8, fontSize: 12, color: "var(--text-mid)" }}>
                      ⚠️ {tr("If we don't get enough sign-ups for their preferred time slot, can they switch?")}
                    </div>
                    <div className="radio-group">
                      {[["yes",tr("Yes")],["no",tr("No")]].map(([val,label]) => (
                        <div key={val} className={`radio-option ${adminSignupForm.canFlexTime === val ? "selected" : ""}`}
                          onClick={() => setAdminSignupForm(f => ({ ...f, canFlexTime: val }))}>
                          <div className="radio-dot"></div><span style={{ fontSize: 13 }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="row" style={{ gap: 8, marginTop: 4 }}>
                  <button className="btn btn-primary" onClick={saveAdminSignup}>✓ {tr("Add Sign-Up")}</button>
                  <button className="btn btn-secondary" onClick={() => setAdminSignupOpen(false)}>{tr("Cancel")}</button>
                </div>
              </div>
            </div>
        )}
      </div>

      {/* Search (in the action row normally; shown here while the add form is open) */}
      {adminSignupOpen && <div style={{ marginBottom: 10 }}>
        <input className="form-input" value={signupSearch} onChange={e => setSignupSearch(e.target.value)} placeholder={"🔍 " + tr("Search by username...")} style={{ maxWidth: 300 }} />
      </div>}

      {/* After the sign-up cut-off, new sign-ups go to next week's battle — show them here so they aren't "missing" */}
      {getNextSignupWeek(tab) !== getSignupWeek(tab) && (() => {
        const nextList = tab === "canyon" ? csNextSignups : dsNextSignups;
        const fmt = (d) => new Date(d + "T12:00:00Z").toLocaleDateString(dateLocale(), { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
        return (<>
          <div className="next-battle-note">
            <span>📅 {trRich("This list is the <b>{date}</b> battle (sign-ups closed). New sign-ups go to <b>{next}</b>: {n}", { date: fmt(getSignupWeek(tab)), next: fmt(getNextSignupWeek(tab)), n: nextList.length })}</span>
            {nextList.length > 0 && <button className="btn btn-sm btn-secondary" onClick={() => setNextOpen(true)}>{tr("View")}</button>}
          </div>
          {nextOpen && (
            <div className="modal-overlay" onClick={() => setNextOpen(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="modal-title">📅 {tab === "canyon" ? "Canyon" : "Desert"} — {tr("{date} sign-ups", { date: fmt(getNextSignupWeek(tab)) })} ({nextList.length})</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setNextOpen(false)} aria-label={tr("Close")}>✕</button>
                </div>
                <div className="modal-body" style={{ padding: "8px 12px" }}>
                  <table className="data-table" style={{ fontSize: 13 }}>
                    <thead><tr><th>{tr("Player")}</th><th>{tr("Pwr")}</th><th>{tr("Type")}</th><th>{tr("St")}</th><th>{tr("Time")}</th></tr></thead>
                    <tbody>
                      {[...nextList].sort((x, y) => getName(x.userId).localeCompare(getName(y.userId))).map(sg => (
                        <tr key={sg.userId}>
                          <td style={{ fontWeight: 600 }}>{getName(sg.userId)}</td>
                          <td>{sg.power}</td>
                          <td style={{ fontSize: 11 }}>{tr(sg.squadType)}</td>
                          <td>{sg.availability === "confirmed" ? "✓" : sg.availability === "sub" ? "S" : "✗"}</td>
                          <td style={{ fontSize: 11 }}>{timePrefLabel(sg.timePreference, offeredTimes, true)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="form-hint" style={{ marginTop: 8 }}>{tr("These move into the main list automatically tomorrow, ready for team building.")}</div>
                </div>
                <div className="modal-footer"><button className="btn btn-primary" onClick={() => setNextOpen(false)}>{tr("Done")}</button></div>
              </div>
            </div>
          )}
        </>);
      })()}

      {/* Team counts + cap warning — sticky, ignores search/hide */}
      {(() => {
        const cA = countTeam("A"); const cB = countTeam("B");
        const overA = cA > 30; const overB = cB > 30;
        const totalSignups = (tab === "canyon" ? csSignups : dsSignups).length;
        return (
          <div className="count-pills sticky-counts">
            <span className={`badge ${overA ? "badge-red" : "badge-gold"}`} title={tr("Team") + " A"}>A {cA}/30{overA ? " ⚠️" : ""}</span>
            <span className={`badge ${overB ? "badge-red" : "badge-blue"}`} title={tr("Team") + " B"}>B {cB}/30{overB ? " ⚠️" : ""}</span>
            <span className="badge badge-gray" title={tr("Unassigned")}>{tr("Unassigned")} {Math.max(0, totalSignups - cA - cB)}</span>
            {totalSignups > 60 && <span className="badge badge-red" title={tr("On waitlist")}>{tr("Waitlist")} {totalSignups - 60}</span>}
          </div>
        );
      })()}

      {/* Main table with inline assignment — sized to fit a phone without sideways scroll */}
      <div style={{ overflowX: "auto", margin: "0 -4px" }}>
        <table className="data-table storm-assign">
          <colgroup>
            <col />
            <col style={{ width: 38 }} />
            <col style={{ width: 28 }} />
            <col style={{ width: 18 }} />
            <col style={{ width: 38 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 24 }} />
          </colgroup>
          <thead>
            <tr>
              {[["name",tr("Player")],["power",tr("Pwr")],["type",tr("Type")],["status",tr("St")],["time",tr("Time")],["team",tr("Team")]].map(([col,label]) => (
                <th key={col} style={{ cursor: "pointer", userSelect: "none" }} onClick={() => toggleTableSort(col)}>
                  {label}{tableSort.col === col ? (tableSort.dir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentSignups.map((s,i) => {
              const a = assignments[s.userId]||{};
              const isPriority = prevWaitlistIds.has(s.userId) || prevWaitlistIds.has(String(s.userId));
              const rowBg = a.team === "A" ? "var(--gold-pale)"
                : a.team === "B" ? "rgba(74,155,196,0.14)"
                : (i % 2 === 0 ? "transparent" : "var(--surface2)");
              const typeShort = { Air: tr("Air"), Tank: tr("Tnk"), Missile: tr("Msl") }[s.squadType] || (s.squadType || "—").slice(0, 3);
              const status = s.availability === "confirmed" ? { txt: "✓", c: "var(--green)", tip: tr("Confirmed") }
                : s.availability === "sub" ? { txt: "S", c: "var(--gold)", tip: tr("Sub") }
                : { txt: "✗", c: "var(--red)", tip: tr("Can't make") };
              const timeTxt = !s.timePreference ? tr("Any") : timePrefLabel(s.timePreference, offeredTimes, true);
              const flex = s.timePreference && !isAnyTime(s.timePreference, offeredTimes)
                ? (s.canFlexTime === "yes" ? { txt: "✓", c: "var(--green)" } : s.canFlexTime === "no" ? { txt: "✗", c: "var(--red)" } : null)
                : null;
              return (
                <tr key={s.userId ?? i} style={{ background: rowBg }}>
                  <td style={{ fontWeight: 600 }}>
                    {isPriority && <span title={tr("Priority: was on waitlist last week")} style={{ color: "var(--gold)", marginRight: 2, fontSize: 10 }}>⭐</span>}
                    <span style={{ cursor: "pointer" }} onClick={() => setViewMember && setViewMember(members.find(m => String(m.id) === String(s.userId)))}>{getName(s.userId)}</span>
                  </td>
                  <td>{s.power}</td>
                  <td style={{ fontSize: 10, color: "var(--text-dim)" }} title={tr(s.squadType)}>{typeShort}</td>
                  <td style={{ fontWeight: 700, color: status.c, textAlign: "center" }} title={status.tip}>{status.txt}</td>
                  <td style={{ fontSize: 11 }} title={flex ? (flex.txt === "✓" ? tr("Can switch times") : tr("Can't switch times")) : undefined}>
                    {timeTxt}{flex && <span style={{ color: flex.c, fontWeight: 700, fontSize: 10, marginLeft: 1 }}>{flex.txt}</span>}
                  </td>
                  <td style={{ overflow: "visible" }}>
                    <div className="team-seg" role="group" aria-label={tr("Team for {name}", { name: getName(s.userId) })}>
                      {["A","B","U"].map(v => (
                        <button key={v} type="button" className={a.team === v ? `on-${v}` : ""}
                          title={v === "U" ? tr("Unassigned") : `${tr("Team")} ${v}`} aria-pressed={a.team === v}
                          onClick={() => assign(s.userId, "team", a.team === v ? "" : v)}>{v}</button>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: "center", overflow: "visible" }}>
                    <button type="button" aria-label={tr("Edit sign-up")} style={{ background: "none", border: "none", padding: 0, fontSize: 13, cursor: "pointer" }} onClick={()=>setEditSignup({signup:s, type:tab})}>✏️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Battle History */}
      {weeks.length > 0 && (() => {
        // Filter out weeks with no players in either team (support both old slot-based and new member-based formats)
        const teamsObj = tab === "canyon" ? csTeams : dsTeams;
        const nonEmptyWeeks = weeks.filter(week => {
          const wt = teamsObj[week];
          if (!wt) return false;
          const hasA = Array.isArray(wt.teamA) && wt.teamA.length > 0;
          const hasB = Array.isArray(wt.teamB) && wt.teamB.length > 0;
          return hasA || hasB;
        });
        if (nonEmptyWeeks.length === 0) return null;
        return (
          <div style={{marginTop:28}}>
            <div style={{fontWeight:700, marginBottom:10}}>📅 {t.battleHistory}</div>
            {nonEmptyWeeks.map(week => (
              <div key={week} className="week-card" onClick={()=>setView(week)}>
                <div>
                  <div style={{fontWeight:700}}>{tab==="canyon"?"🏔️":"🏜️"} {formatDate(week)}</div>
                  <div style={{fontSize:13, color:"var(--text-dim)", marginTop:2}}>{tr("Click to view teams")}</div>
                </div>
                <span style={{color:"var(--gold)", fontWeight:700}}>{tr("View")} →</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Edit Signup Modal — Admin only */}
      {editSignup && (
        <EditSignupModal
          signup={editSignup.signup}
          type={editSignup.type}
          memberName={getName(editSignup.signup.userId)}
          onClose={() => setEditSignup(null)}
          onSave={saveEditedSignup}
          t={t}
        />
      )}
      </>}
    </div>
  );
}
// ─── ADMIN MEMBERS ────────────────────────────────────────────────────────────
function AdminMembers({ setViewMember, members, setMembers, t, showToast, isAdmin, user }) {
  const pending = members.filter(m => !m.approved);
  const approved = members.filter(m => m.approved);
  const [resetModal, setResetModal] = useState(null); // { id, username }
  const [tempPw, setTempPw] = useState("");
  const [resetDone, setResetDone] = useState(null); // { username, password }

  const approve = (id) => { setMembers(m => m.map(mb => mb.id === id ? { ...mb, approved: true } : mb)); showToast(tr("Member approved ✓")); };
  const deny = (id) => { setMembers(m => m.filter(mb => mb.id !== id)); showToast(tr("Member denied.")); };
  const deleteMember = (id) => {
    if (id === user.id) { showToast(tr("You can't delete yourself!")); return; }
    setMembers(m => m.filter(mb => mb.id !== id)); showToast(tr("Member deleted."));
  };
  const toggleDisable = (id, currentlyDisabled) => {
    setMembers(m => m.map(mb => mb.id === id ? { ...mb, disabled: !currentlyDisabled } : mb));
    showToast(currentlyDisabled ? tr("Member re-enabled ✓") : tr("Member disabled — hidden from all active lists ✓"));
  };
  const [memberSearch, setMemberSearch] = useState("");
  const [showDisabled, setShowDisabled] = useState(false);
  const [actionsFor, setActionsFor] = useState(null); // member whose ⋯ actions are open
  const [memberSort, setMemberSort] = useState("username");
  const [memberSortDir, setMemberSortDir] = useState("asc");

  const toggleMemberSort = (col) => {
    if (memberSort === col) setMemberSortDir(d => d === "asc" ? "desc" : "asc");
    else { setMemberSort(col); setMemberSortDir("asc"); }
  };

  const filteredMembers = (showDisabled ? members.filter(m => m.approved) : members.filter(m => m.approved && !m.disabled))
    .filter(m => m.username.toLowerCase().includes(memberSearch.toLowerCase()))
    .sort((a, b) => {
      let va, vb;
      if (memberSort === "username") { va = a.username.toLowerCase(); vb = b.username.toLowerCase(); }
      else if (memberSort === "power") { va = a.power || 0; vb = b.power || 0; }
      else if (memberSort === "signupCount") { va = a.signupCount || 0; vb = b.signupCount || 0; }
      else if (memberSort === "role") { va = a.role || ""; vb = b.role || ""; }
      else if (memberSort === "profession") { va = a.profession || ""; vb = b.profession || ""; }
      else { va = a[memberSort] || 0; vb = b[memberSort] || 0; }
      if (va < vb) return memberSortDir === "asc" ? -1 : 1;
      if (va > vb) return memberSortDir === "asc" ? 1 : -1;
      return 0;
    });

  const sortArrow = (col) => memberSort === col ? (memberSortDir === "asc" ? " ↑" : " ↓") : " ↕";

  const exportMembers = () => {
    const header = "Username,Profession,Power,Role,Join Date,Signup Count\n";
    const rows = filteredMembers.map(m =>
      `${m.username},${m.profession},${m.power || 0},${m.role},${m.joinDate || ""},${m.signupCount || 0}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a"); el.href = url; el.download = `members-${serverToday()}.csv`; el.click();
    showToast(tr("Members exported!"));
  };

  const doReset = () => {
    if (!tempPw) { showToast(tr("Enter a temporary password.")); return; }
    setMembers(m => m.map(mb => mb.id === resetModal.id ? { ...mb, password: tempPw } : mb));
    setResetDone({ username: resetModal.username, password: tempPw });
    setResetModal(null);
    setTempPw("");
  };
  const [requireApproval, setRequireApproval] = useState(null); // null = loading
  useEffect(() => {
    supabase.from("app_settings").select("value").eq("key", "require_approval").maybeSingle()
      .then(({ data }) => setRequireApproval(data?.value === "true"));
  }, []);
  const toggleRequireApproval = async () => {
    const next = !requireApproval;
    const { error } = await supabase.from("app_settings").upsert({ key: "require_approval", value: String(next), updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) { showToast("⚠️ " + tr("Couldn't change the setting — try again.")); return; }
    setRequireApproval(next);
    showToast(next ? tr("New accounts now need approval ✓") : tr("New accounts are approved automatically ✓"));
  };
  const changeRole = (id, role) => { setMembers(m => m.map(mb => mb.id === id ? { ...mb, role } : mb)); showToast(tr("Role updated to {role} ✓", { role: roleLabel(role) })); };

  return (
    <div>
      {isAdmin && requireApproval !== null && (
        <div className="approval-row">
          <span title={requireApproval ? tr("New accounts wait for an R4 or Admin to approve them") : tr("New accounts can use the hub right away")}>
            🔐 {tr("New account approval")}: <strong style={{ color: requireApproval ? "var(--green)" : "var(--text-mid)" }}>{requireApproval ? tr("ON") : tr("OFF")}</strong>
          </span>
          <button className={`btn btn-sm ${requireApproval ? "btn-secondary" : "btn-green"}`} style={{ padding: "3px 10px", fontSize: 12 }} onClick={toggleRequireApproval}>
            {requireApproval ? tr("Turn off") : tr("Turn on")}
          </button>
        </div>
      )}
      {pending.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 10, color: "var(--red)" }}>{t.pendingApprovals2} ({pending.length})</div>
          {pending.map(m => (
            <div key={m.id} className="card" style={{ marginBottom: 8 }}>
              <div className="card-body" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{m.username}</div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{m.profession === "engineer" ? tr("Engineer") : tr("War Leader")} • {tr("Joined")} {formatDate(m.joinDate)}</div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn btn-sm btn-green" onClick={() => approve(m.id)}>{t.approve}</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deny(m.id)}>{t.deny}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="members-tools">
        <input className="form-input" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder={"🔍 " + tr("Search {n} members", { n: filteredMembers.length })} aria-label={tr("Search members")} />
        <button className={`btn btn-sm ${showDisabled ? "btn-primary" : "btn-secondary"}`} onClick={() => setShowDisabled(d => !d)} title={showDisabled ? tr("Hide disabled members") : tr("Show disabled members")}>{showDisabled ? "🙈 " + tr("Disabled") : "👁 " + tr("Disabled")}</button>
        {isAdmin && <button className="btn btn-sm btn-secondary" onClick={exportMembers} title={tr("Export CSV")} aria-label={tr("Export CSV")}>⬇️</button>}
      </div>
      <table className="data-table members-table">
        <colgroup><col /><col style={{ width: 48 }} /><col style={{ width: 80 }} /><col style={{ width: 32 }} /><col style={{ width: 28 }} /></colgroup>
        <thead><tr>
          <th onClick={() => toggleMemberSort("username")}>{tr("Player")}{sortArrow("username")}</th>
          <th onClick={() => toggleMemberSort("power")}>{tr("Pwr")}{sortArrow("power")}</th>
          <th onClick={() => toggleMemberSort("role")}>{tr("Role")}{sortArrow("role")}</th>
          <th onClick={() => toggleMemberSort("signupCount")} title={tr("Storm sign-ups")}>{tr("SU")}{sortArrow("signupCount")}</th>
          <th aria-label={tr("Actions")}></th>
        </tr></thead>
        <tbody>
          {filteredMembers.map((m, i) => (
            <tr key={m.id} style={{ background: i % 2 === 0 ? "transparent" : "var(--surface2)", opacity: m.disabled ? 0.5 : 1 }}>
              <td className={m.profession === "engineer" ? "name-engineer" : "name-warleader"}>
                <span className="member-name" onClick={() => setViewMember && setViewMember(m)}>
                  <span aria-hidden="true">{m.profession === "engineer" ? "🔧" : "⚔️"}</span> {m.username}{m.disabled && <span className="member-off">{tr("off")}</span>}
                </span>
              </td>
              <td>{m.power ? (m.power / 1000000).toFixed(1) + "M" : "—"}</td>
              <td>
                {isAdmin ? (
                  <select className="member-role" value={m.role} onChange={e => changeRole(m.id, e.target.value)} aria-label={tr("Role for {name}", { name: m.username })}>
                    <option value="member">{tr("Member")}</option>
                    <option value="r4">R4</option>
                    <option value="admin">{tr("Admin")}</option>
                  </select>
                ) : <span className="badge badge-gold" style={{ fontSize: 10, padding: "2px 6px" }}>{roleLabel(m.role)}</span>}
              </td>
              <td style={{ textAlign: "center" }}>{m.signupCount || 0}</td>
              <td style={{ textAlign: "center" }}>
                <button type="button" className="member-more" onClick={() => setActionsFor(m)} aria-label={tr("Actions for {name}", { name: m.username })}>⋯</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Member actions */}
      {actionsFor && (
        <div className="modal-overlay" onClick={() => setActionsFor(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 340 }}>
            <div className="modal-header">
              <div className="modal-title">{actionsFor.username}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActionsFor(null)} aria-label={tr("Close")}>✕</button>
            </div>
            <div className="modal-body stack" style={{ gap: 8 }}>
              {isAdmin && <div className="form-hint" style={{ margin: 0 }}>{tr("Member ID")}: <span style={{ fontFamily: "monospace" }}>{actionsFor.memberId}</span></div>}
              <button className="btn btn-secondary btn-full" onClick={() => { setViewMember && setViewMember(actionsFor); setActionsFor(null); }}>👤 {tr("View profile")}</button>
              <button className="btn btn-secondary btn-full" onClick={() => { setResetModal({ id: actionsFor.id, username: actionsFor.username }); setTempPw(""); setActionsFor(null); }}>🔑 {tr("Reset password")}</button>
              {actionsFor.id !== user.id && <button className="btn btn-secondary btn-full" onClick={() => { toggleDisable(actionsFor.id, actionsFor.disabled); setActionsFor(null); }}>{actionsFor.disabled ? "▶️ " + tr("Enable member") : "⏸ " + tr("Disable member")}</button>}
              {actionsFor.id !== user.id && <button className="btn btn-danger btn-full" onClick={() => { if (window.confirm(tr("Delete {name}? This can't be undone.", { name: actionsFor.username }))) { deleteMember(actionsFor.id); setActionsFor(null); } }}>🗑️ {tr("Delete member")}</button>}
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="modal-overlay" onClick={() => setResetModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🔒 {t.resetPassword} — {resetModal.username}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setResetModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">{tr("Set Temporary Password")}</label>
                <input className="form-input" value={tempPw} onChange={e => setTempPw(e.target.value)} placeholder={tr("Enter a temporary password")} />
                <div className="form-hint">{tr("Tell the member this password so they can log in and change it themselves.")}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setResetModal(null)}>{t.cancel}</button>
              <button className="btn btn-primary" onClick={doReset}>{t.resetPassword}</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Done Confirmation */}
      {resetDone && (
        <div className="modal-overlay" onClick={() => setResetDone(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">✅ {tr("Password Reset")}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setResetDone(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
                <div style={{ marginBottom: 8 }}>{trRich("Password for <b>{name}</b> has been reset to:", { name: resetDone.username })}</div>
                <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "14px 20px", fontSize: 22, fontWeight: 700, letterSpacing: 2, fontFamily: "monospace", color: "var(--gold)", marginBottom: 12 }}>{resetDone.password}</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{tr("Share this with the member so they can log in and change their password.")}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-full" onClick={() => { navigator.clipboard?.writeText(resetDone.password); showToast(tr("Copied!")); setResetDone(null); }}>📋 {tr("Copy & Close")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Parse a date string "YYYY-MM-DD" without timezone conversion
const parseSupabaseDate = (str) => {
  if (!str) return null;
  try {
    // Supabase can return:
    // "2026-03-21 17:00:00+00"
    // "2026-03-21 17:00:00+00:00"
    // "2026-03-21T17:00:00Z"
    // "2026-03-21T17:00:00.000Z"
    let s = str.toString().trim();
    // Replace space with T
    s = s.replace(" ", "T");
    // Normalize timezone: +00:00 or +00 → Z
    s = s.replace(/\+00:00$/, "Z").replace(/\+00$/, "Z");
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
};

// ─── ADMIN DATA ───────────────────────────────────────────────────────────────
function AdminData({ members, csSignups, dsSignups, t, showToast, setMembers }) {
  const approved = members.filter(m => m.approved && !m.disabled);
  const engineers = approved.filter(m => m.profession === "engineer").length;
  const warLeaders = approved.filter(m => m.profession === "warLeader").length;
  const [resetting, setResetting] = useState(false);

  const toBattleDate = (dateStr, type) => {
    if (!dateStr) return dateStr;
    try {
      const d = new Date(dateStr + "T12:00:00Z");
      const day = d.getUTCDay();
      const targetDay = type === "cs" ? 4 : 5;
      if ((type === "cs" && day === 4) || (type === "ds" && day === 5)) return dateStr;
      const daysUntil = (targetDay - day + 7) % 7 || 7;
      const battle = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + daysUntil));
      return battle.toISOString().split("T")[0];
    } catch { return dateStr; }
  };

  const resetSignupCounts = async () => {
    if (!window.confirm(tr("Recalculate signup counts from actual signup data? This fixes inflated counts from past bugs."))) return;
    setResetting(true);
    // Count unique BATTLE WEEKS per member (normalize all dates to battle date)
    for (const m of approved) {
      const csWeeks = new Set(csSignups.filter(s => String(s.userId) === String(m.id)).map(s => toBattleDate(s.week, "cs")).filter(Boolean));
      const dsWeeks = new Set(dsSignups.filter(s => String(s.userId) === String(m.id)).map(s => toBattleDate(s.week, "ds")).filter(Boolean));
      const total = csWeeks.size + dsWeeks.size;
      await supabase.from("members").update({ signup_count: total }).eq("id", m.id);
      setMembers(prev => prev.map(mb => String(mb.id) === String(m.id) ? { ...mb, signupCount: total } : mb));
    }
    setResetting(false);
    showToast(tr("Signup counts reset ✓"));
  };

  return (
    <div>
      {/* Fix inflated counts */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-sm btn-secondary" onClick={resetSignupCounts} disabled={resetting}>
          {resetting ? tr("Resetting...") : "🔄 " + tr("Recalculate Signup Counts")}
        </button>
        <button className="btn btn-sm btn-danger" style={{ marginLeft: 8 }} onClick={async () => {
          if (!window.confirm(tr("Delete duplicate signup rows from database? This is safe and permanent."))) return;
          // For each member+week combo, keep only the latest row and delete the rest
          const { data: csRows } = await supabase.from("canyon_signups").select("id,member_id,week_start").order("updated_at", { ascending: false });
          const { data: dsRows } = await supabase.from("desert_signups").select("id,member_id,week_start").order("updated_at", { ascending: false });
          const getDupes = (rows) => {
            const seen = new Set(); const dupes = [];
            (rows || []).forEach(r => { const k = `${r.member_id}:${r.week_start}`; if (seen.has(k)) dupes.push(r.id); else seen.add(k); });
            return dupes;
          };
          const csDupes = getDupes(csRows);
          const dsDupes = getDupes(dsRows);
          if (csDupes.length > 0) await supabase.from("canyon_signups").delete().in("id", csDupes);
          if (dsDupes.length > 0) await supabase.from("desert_signups").delete().in("id", dsDupes);
          showToast(tr("Removed {n} duplicate rows ✓", { n: csDupes.length + dsDupes.length }));
        }}>🗑️ {tr("Remove Duplicate Signups")}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🔧</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--green)" }}>{engineers}</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>{tr("Engineers")}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>⚔️</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--purple)" }}>{warLeaders}</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>{tr("War Leaders")}</div>
          </div>
        </div>
      </div>
      {/* Sign-up Frequency */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">📊 {t.signupFrequency}</div></div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>{tr("Member")}</th><th>{tr("Role")}</th><th>{tr("Sign-Ups")}</th><th>{t.attendance}</th><th>{tr("Rate")}</th></tr></thead>
            <tbody>
              {approved.sort((a, b) => b.signupCount - a.signupCount).map(m => (
                <tr key={m.id}>
                  <td className={m.profession === "engineer" ? "name-engineer" : "name-warleader"}>{m.username}</td>
                  <td><span className="badge badge-gold">{roleLabel(m.role)}</span></td>
                  <td style={{ fontWeight: 700 }}>{m.signupCount}</td>
                  <td>{m.attendanceCount}</td>
                  <td><span className={`badge ${m.signupCount > 0 && m.attendanceCount / m.signupCount > 0.8 ? "badge-green" : "badge-gold"}`}>{m.signupCount > 0 ? Math.round(m.attendanceCount / m.signupCount * 100) + "%" : tr("N/A")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Power Growth */}
      <div className="card">
        <div className="card-header"><div className="card-title">📈 {tr("Member Power Growth (Week over Week)")}</div></div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>{tr("Member")}</th><th>{tr("Current Power")}</th><th>{tr("Oct")}</th><th>{tr("Nov")}</th><th>{tr("Dec")}</th><th>{tr("Jan")}</th><th>{tr("Growth")}</th></tr></thead>
            <tbody>
              {approved.filter(m => m.power > 0).sort((a, b) => b.power - a.power).map(m => {
                const history = MOCK_POWER_HISTORY[m.id] || [];
                const growth = history.length > 1 ? m.power - history[history.length - 2].power : 0;
                return (
                  <tr key={m.id}>
                    <td className={m.profession === "engineer" ? "name-engineer" : "name-warleader"}>{m.username}</td>
                    <td style={{ fontWeight: 700 }}>{formatPower(m.power)}</td>
                    {["Oct","Nov","Dec","Jan"].map(mon => {
                      const h = history.find(x => x.month === mon);
                      return <td key={mon} style={{ fontSize: 12, color: "var(--text-dim)" }}>{h ? formatPower(h.power) : "—"}</td>;
                    })}
                    <td><span className={`badge ${growth > 0 ? "badge-green" : "badge-gray"}`}>{growth > 0 ? "+" : ""}{formatPower(growth)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Parse a train date+time safely, handling both "2:00" and "02:00"
const parseTrainTime = (date, time) => {
  if (!date || !time) return null;
  const paddedTime = time.includes(":") ? time.split(":").map(p => p.padStart(2, "0")).join(":") : time;
  // Server is UTC-2, so add offset to convert to UTC
  const dt = new Date(date + "T" + paddedTime + ":00Z");
  if (isNaN(dt.getTime())) return null;
  dt.setUTCHours(dt.getUTCHours() + SERVER_UTC_OFFSET_HOURS);
  return dt;
};

// ─── TRAIN COUNTDOWN ─────────────────────────────────────────────────────────
function TrainCountdown({ target }) {
  const countdown = useCountdown(target);
  const isPast = new Date(target) < Date.now();
  if (isPast) return null;
  return <div style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600, marginTop: 4 }}>⏱ {tr("Starts in")} {countdown}</div>;
}

// ─── TRAINS PAGE (Member view) ────────────────────────────────────────────────
function TrainsPage({ user, trains, trainGoals, members }) {
  const getName = (id) => members.find(m => String(m.id) === String(id))?.username || tr("TBD");
  const today = serverToday();

  // Get current week start (Monday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getUTCDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setUTCDate(d.getUTCDate() + diff);
    return d.toISOString().split("T")[0];
  };

  const thisWeek = getWeekStart(today);
  const nextWeek = getWeekStart(new Date(serverNow().getTime() + 7 * 86400000).toISOString().split("T")[0]);

  const thisWeekTrains = trains.filter(trn => getWeekStart(trn.date) === thisWeek).sort((a,b) => a.date.localeCompare(b.date));
  const nextWeekGoal = trainGoals.find(g => g.weekStart === nextWeek);
  const thisWeekGoal = trainGoals.find(g => g.weekStart === thisWeek);

  const upcomingTrains = trains.filter(trn => trn.date >= today).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 14);

  return (
    <div>
      <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, marginBottom: 4 }}>🚂 {tr("Trains")}</h1>
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>{tr("Daily train schedule and weekly goals")}</p>

      {/* Next week goal */}
      {(nextWeekGoal || thisWeekGoal) && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>📋 {tr("Next Week's Goal")}</div>
            <div style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.6 }}>{nextWeekGoal?.goal || thisWeekGoal?.goal ? <AutoText text={nextWeekGoal?.goal || thisWeekGoal?.goal} /> : tr("Goal not set yet.")}</div>
          </div>
        </div>
      )}

      {/* This week schedule */}
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>📅 {tr("This Week's Schedule")}</div>
      {thisWeekTrains.length === 0 && (
        <div style={{ color: "var(--text-dim)", textAlign: "center", padding: 30 }}>{tr("No trains scheduled this week yet.")}</div>
      )}
      {upcomingTrains.map(trn => {
        const isMe = String(trn.conductorId) === String(user.id) || String(trn.guardianId) === String(user.id);
        const myRole = String(trn.conductorId) === String(user.id) ? tr("Conductor") + " 🚂" : String(trn.guardianId) === String(user.id) ? tr("Guardian") + " 🛡️" : null;
        const trainDt = parseTrainTime(trn.date, trn.time);
        const isPast = trainDt < Date.now();
        return (
          <div key={trn.id} className="card" style={{ marginBottom: 8, opacity: isPast ? 0.6 : 1, border: isMe ? "1.5px solid var(--gold)" : undefined }}>
            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: isMe ? "var(--gold)" : "var(--text)" }}>
                    {trn.date} — {trn.time} {tr("server time")}
                    {isMe && <span className="badge badge-gold" style={{ marginLeft: 8, fontSize: 11 }}>{tr("You")}: {myRole}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-mid)", marginTop: 4 }}>
                    🚂 {tr("Conductor")}: <strong>{getName(trn.conductorId)}</strong> &nbsp;|&nbsp; 🛡️ {tr("Guardian")}: <strong>{getName(trn.guardianId)}</strong>
                  </div>
                  {isMe && !isPast && <TrainCountdown target={trainDt} />}
                </div>
                {!isPast && <span className="badge badge-green">{tr("Upcoming")}</span>}
                {isPast && <span className="badge badge-gray">{tr("Done")}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── ADMIN TRAINS ─────────────────────────────────────────────────────────────
function AdminTrains({ trains, trainGoals, members, showToast }) {
  const [tab, setTab] = useState("schedule");
  const [editTrain, setEditTrain] = useState(null);
  const [form, setForm] = useState({ date: "", time: "14:00", conductorId: "", guardianId: "" });
  const [goalForm, setGoalForm] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);
  const approved = members.filter(m => m.approved && !m.disabled);
  const [memberSearch, setMemberSearch] = useState({ conductor: "", guardian: "" });
  const getName = (id) => members.find(m => String(m.id) === String(id))?.username || "—";

  const filteredConductors = approved.filter(m => m.username.toLowerCase().includes(memberSearch.conductor.toLowerCase())).sort((a,b) => a.username.localeCompare(b.username));
  const filteredGuardians = approved.filter(m => m.username.toLowerCase().includes(memberSearch.guardian.toLowerCase())).sort((a,b) => a.username.localeCompare(b.username));

  const getWeekStart = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00Z");
    const day = d.getUTCDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setUTCDate(d.getUTCDate() + diff);
    return d.toISOString().split("T")[0];
  };

  const today = serverToday();
  const nextWeek = getWeekStart(new Date(serverNow().getTime() + 7 * 86400000).toISOString().split("T")[0]);
  const currentGoal = trainGoals.find(g => g.weekStart === nextWeek);

  const saveTrain = async () => {
    if (!form.date || !form.time) { showToast(tr("Please fill date and time.")); return; }
    const weekStart = getWeekStart(form.date);
    if (editTrain) {
      await supabase.from("trains").update({
        train_time: form.time ? form.time.split(":").map(p => p.padStart(2,"0")).join(":") : form.time, conductor_id: form.conductorId || null,
        guardian_id: form.guardianId || null, updated_at: new Date(),
      }).eq("id", editTrain.id);
      showToast(tr("Train updated ✓"));
    } else {
      const { error } = await supabase.from("trains").upsert({
        train_date: form.date, train_time: form.time ? form.time.split(":").map(p => p.padStart(2,"0")).join(":") : form.time, week_start: weekStart,
        conductor_id: form.conductorId || null, guardian_id: form.guardianId || null,
      }, { onConflict: "train_date" });
      if (error) { showToast(tr("Error saving train.")); return; }
      showToast(tr("Train saved ✓"));
    }
    setEditTrain(null);
    setForm({ date: "", time: "14:00", conductorId: "", guardianId: "" });
  };

  const deleteTrain = async (id) => {
    await supabase.from("trains").delete().eq("id", id);
    showToast(tr("Train removed."));
  };

  const startEdit = (trn) => {
    setEditTrain(trn);
    setForm({ date: trn.date, time: trn.time, conductorId: trn.conductorId || "", guardianId: trn.guardianId || "" });
    setTab("schedule");
  };

  const saveGoal = async () => {
    if (!goalForm.trim()) return;
    setSavingGoal(true);
    if (currentGoal) {
      await supabase.from("train_goals").update({ goal: goalForm }).eq("id", currentGoal.id);
    } else {
      await supabase.from("train_goals").insert({ week_start: nextWeek, goal: goalForm });
    }
    setSavingGoal(false);
    showToast(tr("Goal saved ✓"));
  };

  const upcoming = trains.filter(trn => trn.date >= today).sort((a,b) => a.date.localeCompare(b.date));
  const historical = trains.filter(trn => trn.date < today).sort((a,b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${tab === "schedule" ? "active" : ""}`} onClick={() => setTab("schedule")}>📅 {tr("Schedule")}</button>
        <button className={`tab ${tab === "goal" ? "active" : ""}`} onClick={() => setTab("goal")}>🎯 {tr("Goal")}</button>
        <button className={`tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>📜 {tr("History")}</button>
      </div>

      {tab === "schedule" && (
        <div>
          {/* Add/Edit Train Form */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><div className="card-title">{editTrain ? "✏️ " + tr("Edit Train") : "➕ " + tr("Add Train")}</div></div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">{tr("Date")}</label>
                  <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">{tr("Time (Server = UTC 24hr)")}</label>
                  <input className="form-input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder={tr("e.g. 14:00")} />
                  <div className="form-hint" style={{ color: "var(--gold)", fontWeight: 600 }}>🕐 {tr("Current server time")}: {(() => { const n = new Date(); const sn = new Date(n.getTime() - SERVER_UTC_OFFSET_HOURS * 3600000); return String(sn.getUTCHours()).padStart(2,"0") + ":" + String(sn.getUTCMinutes()).padStart(2,"0"); })()}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">🚂 {tr("Conductor")}</label>
                  <input className="form-input" placeholder={tr("Search...")} value={memberSearch.conductor} onChange={e => setMemberSearch(s => ({ ...s, conductor: e.target.value }))} style={{ marginBottom: 4 }} />
                  <select className="form-input form-select" value={form.conductorId} onChange={e => setForm(f => ({ ...f, conductorId: e.target.value }))}>
                    <option value="">— {tr("Select member")} —</option>
                    {filteredConductors.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">🛡️ {tr("Guardian")}</label>
                  <input className="form-input" placeholder={tr("Search...")} value={memberSearch.guardian} onChange={e => setMemberSearch(s => ({ ...s, guardian: e.target.value }))} style={{ marginBottom: 4 }} />
                  <select className="form-input form-select" value={form.guardianId} onChange={e => setForm(f => ({ ...f, guardianId: e.target.value }))}>
                    <option value="">— {tr("Select member")} —</option>
                    {filteredGuardians.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
                  </select>
                </div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-primary" onClick={saveTrain}>💾 {editTrain ? tr("Update Train") : tr("Save Train")}</button>
                {editTrain && <button className="btn btn-secondary" onClick={() => { setEditTrain(null); setForm({ date: "", time: "14:00", conductorId: "", guardianId: "" }); }}>{tr("Cancel")}</button>}
              </div>
            </div>
          </div>

          {/* Upcoming trains */}
          <div style={{ fontWeight: 700, marginBottom: 10 }}>{tr("Upcoming Trains")} ({upcoming.length})</div>
          {upcoming.length === 0 && <div style={{ color: "var(--text-dim)", padding: 20, textAlign: "center" }}>{tr("No upcoming trains scheduled.")}</div>}
          {upcoming.map(trn => (
            <div key={trn.id} className="card" style={{ marginBottom: 8 }}>
              <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{trn.date} — {trn.time} {tr("server time")}</div>
                  <div style={{ fontSize: 13, color: "var(--text-mid)", marginTop: 2 }}>
                    🚂 {getName(trn.conductorId)} &nbsp;|&nbsp; 🛡️ {getName(trn.guardianId)}
                  </div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => startEdit(trn)}>✏️</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteTrain(trn.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "goal" && (
        <div>
          <div className="card">
            <div className="card-header"><div className="card-title">🎯 {tr("Next Week's Goal")}</div></div>
            <div className="card-body">
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 12 }}>{tr("Week of {date}", { date: nextWeek })}</div>
              <div className="form-group">
                <label className="form-label">{tr("Goal Description")}</label>
                <textarea className="form-input" rows={4} value={goalForm || currentGoal?.goal || ""} onChange={e => setGoalForm(e.target.value)} placeholder={tr("e.g. Reach level 25 on all buildings, focus on barracks upgrades...")} style={{ resize: "vertical" }} />
              </div>
              <button className="btn btn-primary" onClick={saveGoal} disabled={savingGoal}>{savingGoal ? tr("Saving...") : "💾 " + tr("Save Goal")}</button>
            </div>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>{tr("Past Trains")} ({historical.length})</div>
          {historical.length === 0 && <div style={{ color: "var(--text-dim)", padding: 20, textAlign: "center" }}>{tr("No train history yet.")}</div>}
          {historical.map(trn => (
            <div key={trn.id} className="card" style={{ marginBottom: 8, opacity: 0.7 }}>
              <div className="card-body">
                <div style={{ fontWeight: 700 }}>{trn.date} — {trn.time} {tr("server time")}</div>
                <div style={{ fontSize: 13, color: "var(--text-mid)", marginTop: 2 }}>
                  🚂 {getName(trn.conductorId)} &nbsp;|&nbsp; 🛡️ {getName(trn.guardianId)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CALCULATORS ─────────────────────────────────────────────────────────────

// ── Weapon Shards data (shards needed TO REACH this level from previous)
const WEAPON_SHARDS_DATA = [
  { level: 1, shards: 50 }, { level: 2, shards: 20 }, { level: 3, shards: 20 },
  { level: 4, shards: 20 }, { level: 5, shards: 20 }, { level: 6, shards: 40 },
  { level: 7, shards: 40 }, { level: 8, shards: 40 }, { level: 9, shards: 40 },
  { level: 10, shards: 40 }, { level: 11, shards: 60 }, { level: 12, shards: 60 },
  { level: 13, shards: 60 }, { level: 14, shards: 60 }, { level: 15, shards: 60 },
  { level: 16, shards: 100 }, { level: 17, shards: 100 }, { level: 18, shards: 100 },
  { level: 19, shards: 100 }, { level: 20, shards: 100 }, { level: 21, shards: 150 },
  { level: 22, shards: 150 }, { level: 23, shards: 150 }, { level: 24, shards: 150 },
  { level: 25, shards: 150 }, { level: 26, shards: 200 }, { level: 27, shards: 200 },
  { level: 28, shards: 200 }, { level: 29, shards: 200 }, { level: 30, shards: 200 },
];

// ── Drone data [level, parts_per_level, xp_per_level] — 5 segments per level
const DRONE_DATA = [
  [1,5,11250],[2,5,11250],[3,5,11250],[4,5,11250],[5,5,11250],[6,10,15000],[7,10,15000],[8,10,15000],[9,10,15000],[10,10,15000],
  [11,20,18750],[12,20,18750],[13,20,18750],[14,20,18750],[15,20,18750],[16,30,22500],[17,30,22500],[18,30,22500],[19,30,22500],[20,30,22500],
  [21,40,26250],[22,40,26250],[23,40,26250],[24,40,26250],[25,40,26250],[26,50,30000],[27,50,30000],[28,50,30000],[29,50,30000],[30,50,30000],
  [31,60,37500],[32,60,37500],[33,60,37500],[34,60,37500],[35,60,37500],[36,80,37500],[37,80,37500],[38,80,37500],[39,80,37500],[40,80,37500],
  [41,100,37500],[42,100,37500],[43,100,37500],[44,100,37500],[45,100,37500],[46,120,37500],[47,120,37500],[48,120,37500],[49,120,37500],[50,120,37500],
  [51,140,45000],[52,140,45000],[53,140,45000],[54,140,45000],[55,140,45000],[56,160,45000],[57,160,45000],[58,160,45000],[59,160,45000],[60,160,45000],
  [61,180,45000],[62,180,45000],[63,180,45000],[64,180,45000],[65,180,45000],[66,200,45000],[67,200,45000],[68,200,45000],[69,200,45000],[70,200,45000],
  [71,250,52500],[72,250,52500],[73,250,52500],[74,250,52500],[75,250,52500],[76,300,52500],[77,300,52500],[78,300,52500],[79,300,52500],[80,300,52500],
  [81,350,52500],[82,350,52500],[83,350,52500],[84,350,52500],[85,350,52500],[86,400,55000],[87,400,55000],[88,400,55000],[89,400,55000],[90,400,55000],
  [91,450,60000],[92,450,60000],[93,450,60000],[94,450,60000],[95,450,60000],[96,500,60000],[97,500,60000],[98,500,60000],[99,500,60000],[100,500,60000],
  [101,600,75000],[102,600,75000],[103,600,75000],[104,600,75000],[105,600,75000],[106,700,75000],[107,700,75000],[108,700,75000],[109,700,75000],[110,700,75000],
  [111,800,180000],[112,800,180000],[113,800,180000],[114,800,180000],[115,800,180000],[116,1000,180000],[117,1000,180000],[118,1000,180000],[119,1000,180000],[120,1000,180000],
  [121,1500,210000],[122,1500,210000],[123,1500,210000],[124,1500,210000],[125,1500,210000],[126,2000,210000],[127,2000,210000],[128,2000,210000],[129,2000,210000],[130,2000,210000],
  [131,3000,240000],[132,3000,240000],[133,3000,240000],[134,3000,240000],[135,3000,240000],[136,4000,240000],[137,4000,240000],[138,4000,240000],[139,4000,240000],[140,4000,240000],
  [141,5000,300000],[142,5000,300000],[143,5000,300000],[144,5000,300000],[145,5000,300000],[146,500,900000],[147,500,900000],[148,500,900000],[149,500,900000],[150,500,900000],
  [151,500,900000],[152,500,900000],[153,500,900000],[154,500,900000],[155,500,900000],[156,500,900000],[157,500,900000],[158,500,900000],[159,500,900000],[160,600,1000000],
  [161,600,1000000],[162,600,1000000],[163,600,1000000],[164,600,1000000],[165,600,1000000],[166,600,1000000],[167,600,1000000],[168,600,1000000],[169,600,1000000],[170,700,1125000],
  [171,700,1125000],[172,700,1125000],[173,700,1125000],[174,700,1125000],[175,700,1125000],[176,700,1125000],[177,700,1125000],[178,700,1125000],[179,700,1125000],[180,800,1440000],
  [181,800,1440000],[182,800,1440000],[183,800,1440000],[184,800,1440000],[185,800,1440000],[186,800,1440000],[187,800,1440000],[188,800,1440000],[189,800,1440000],[190,900,1620000],
  [191,900,1620000],[192,900,1620000],[193,900,1620000],[194,900,1620000],[195,900,1620000],[196,900,1620000],[197,900,1620000],[198,900,1620000],[199,900,1620000],[200,1000,1800000],
  [201,1000,1800000],[202,1000,1800000],[203,1000,1800000],[204,1000,1800000],[205,1000,1800000],[206,1000,1800000],[207,1000,1800000],[208,1000,1800000],[209,1000,1800000],[210,1100,1980000],
  [211,1100,1980000],[212,1100,1980000],[213,1100,1980000],[214,1100,1980000],[215,1100,1980000],[216,1100,1980000],[217,1100,1980000],[218,1100,1980000],[219,1100,1980000],[220,1200,2160000],
  [221,1200,2160000],[222,1200,2160000],[223,1200,2160000],[224,1200,2160000],[225,1200,2160000],[226,1200,2160000],[227,1200,2160000],[228,1200,2160000],[229,1200,2160000],[230,1300,2340000],
  [231,1300,2340000],[232,1300,2340000],[233,1300,2340000],[234,1300,2340000],[235,1300,2340000],[236,1300,2340000],[237,1300,2340000],[238,1300,2340000],[239,1300,2340000],[240,1400,2520000],
  [241,1400,2520000],[242,1400,2520000],[243,1400,2520000],[244,1400,2520000],[245,1400,2520000],[246,1400,2520000],[247,1400,2520000],[248,1400,2520000],[249,1400,2520000],[250,2000,3800000],
  [251,2000,3800000],[252,2000,3800000],[253,2000,3800000],[254,2000,3800000],[255,2000,3800000],[256,2250,4500000],[257,2250,4500000],[258,2250,4500000],[259,2250,4500000],[260,2500,5250000],
  [261,2500,5250000],[262,2500,5250000],[263,2500,5250000],[264,2500,5250000],[265,2500,5250000],[266,2750,5600000],[267,2750,5600000],[268,2750,5600000],[269,2750,5600000],[270,3000,6900000],
  [271,3000,6900000],[272,3000,6900000],[273,3000,6900000],[274,3000,6900000],[275,3000,6900000],[276,3250,7800000],[277,3250,7800000],[278,3250,7800000],[279,3250,7800000],[280,3500,8750000],
  [281,3500,8750000],[282,3500,8750000],[283,3500,8750000],[284,3500,8750000],[285,3500,8750000],[286,3750,9750000],[287,3750,9750000],[288,3750,9750000],[289,3750,9750000],[290,4000,10800000],
  [291,4000,10800000],[292,4000,10800000],[293,4000,10800000],[294,4000,10800000],[295,4000,10800000],[296,4250,11900000],[297,4250,11900000],[298,4250,11900000],[299,4250,11900000],[300,4250,11900000],
];

// ── T11 Research data [from%, to%, materials, cores, oil]
const T11_DATA = {
  "Helmet|Base":[[0,1,6000,0,0],[1,2,6000,0,0],[2,3,6000,0,0],[3,4,6000,0,0],[4,5,6000,10,0],[5,6,6000,0,0],[6,7,6000,0,0],[7,8,6000,0,0],[8,9,6000,0,0],[9,10,6000,10,0],[10,11,6000,0,0],[11,12,6000,0,0],[12,13,6000,0,0],[13,14,6000,0,0],[14,15,6000,10,0],[15,16,6000,0,0],[16,17,6000,0,0],[17,18,6000,0,0],[18,19,6000,0,0],[19,20,6000,10,0],[20,21,6000,0,0],[21,22,6000,0,0],[22,23,6000,0,0],[23,24,6000,0,0],[24,25,6000,10,0],[25,26,6000,0,0],[26,27,6000,0,0],[27,28,6000,0,0],[28,29,6000,0,0],[29,30,6000,10,0],[30,31,6000,0,0],[31,32,6000,0,0],[32,33,6000,0,0],[33,34,6000,0,0],[34,35,6000,10,0],[35,36,6000,0,0],[36,37,6000,0,0],[37,38,6000,0,0],[38,39,6000,0,0],[39,40,6000,10,0],[40,41,6000,0,0],[41,42,6000,0,0],[42,43,6000,0,0],[43,44,6000,0,0],[44,45,6000,10,0],[45,46,6000,0,0],[46,47,6000,0,0],[47,48,6000,0,0],[48,49,6000,0,0],[49,50,8000,15,0],[50,51,8000,0,0],[51,52,8000,0,0],[52,53,8000,0,0],[53,54,8000,0,0],[54,55,8000,15,0],[55,56,8000,0,0],[56,57,8000,0,0],[57,58,8000,0,0],[58,59,8000,0,0],[59,60,8000,15,0],[60,61,8000,0,0],[61,62,8000,0,0],[62,63,8000,0,0],[63,64,8000,0,0],[64,65,8000,15,0],[65,66,8000,0,0],[66,67,8000,0,0],[67,68,8000,0,0],[68,69,8000,0,0],[69,70,8000,15,0],[70,71,8000,0,0],[71,72,8000,0,0],[72,73,8000,0,0],[73,74,8000,0,0],[74,75,8000,15,0],[75,76,8000,0,0],[76,77,8000,0,0],[77,78,8000,0,0],[78,79,8000,0,0],[79,80,8000,15,0],[80,81,8000,0,0],[81,82,8000,0,0],[82,83,8000,0,0],[83,84,8000,0,0],[84,85,8000,15,0],[85,86,8000,0,0],[86,87,8000,0,0],[87,88,8000,0,0],[88,89,8000,0,0],[89,90,8000,15,0],[90,91,8000,0,0],[91,92,8000,0,0],[92,93,8000,0,0],[93,94,8000,0,0],[94,95,8000,15,0],[95,96,8000,0,0],[96,97,8000,0,0],[97,98,8000,0,0],[98,99,8000,0,0],[99,100,0,15,1200000]],
  "Body Armor|Base":[[0,1,10000,0,0],[1,2,10000,0,0],[2,3,10000,0,0],[3,4,10000,0,0],[4,5,10000,20,0],[5,6,10000,0,0],[6,7,10000,0,0],[7,8,10000,0,0],[8,9,10000,0,0],[9,10,10000,20,0],[10,11,10000,0,0],[11,12,10000,0,0],[12,13,10000,0,0],[13,14,10000,0,0],[14,15,10000,20,0],[15,16,10000,0,0],[16,17,10000,0,0],[17,18,10000,0,0],[18,19,10000,0,0],[19,20,10000,20,0],[20,21,10000,0,0],[21,22,10000,0,0],[22,23,10000,0,0],[23,24,10000,0,0],[24,25,10000,20,0],[25,26,10000,0,0],[26,27,10000,0,0],[27,28,10000,0,0],[28,29,10000,0,0],[29,30,10000,20,0],[30,31,10000,0,0],[31,32,10000,0,0],[32,33,10000,0,0],[33,34,10000,0,0],[34,35,10000,20,0],[35,36,10000,0,0],[36,37,10000,0,0],[37,38,10000,0,0],[38,39,10000,0,0],[39,40,10000,20,0],[40,41,10000,0,0],[41,42,10000,0,0],[42,43,10000,0,0],[43,44,10000,0,0],[44,45,10000,20,0],[45,46,10000,0,0],[46,47,10000,0,0],[47,48,10000,0,0],[48,49,10000,0,0],[49,50,12000,25,0],[50,51,12000,0,0],[51,52,12000,0,0],[52,53,12000,0,0],[53,54,12000,0,0],[54,55,12000,25,0],[55,56,12000,0,0],[56,57,12000,0,0],[57,58,12000,0,0],[58,59,12000,0,0],[59,60,12000,25,0],[60,61,12000,0,0],[61,62,12000,0,0],[62,63,12000,0,0],[63,64,12000,0,0],[64,65,12000,25,0],[65,66,12000,0,0],[66,67,12000,0,0],[67,68,12000,0,0],[68,69,12000,0,0],[69,70,12000,25,0],[70,71,12000,0,0],[71,72,12000,0,0],[72,73,12000,0,0],[73,74,12000,0,0],[74,75,12000,25,0],[75,76,12000,0,0],[76,77,12000,0,0],[77,78,12000,0,0],[78,79,12000,0,0],[79,80,12000,25,0],[80,81,12000,0,0],[81,82,12000,0,0],[82,83,12000,0,0],[83,84,12000,0,0],[84,85,12000,25,0],[85,86,12000,0,0],[86,87,12000,0,0],[87,88,12000,0,0],[88,89,12000,0,0],[89,90,12000,25,0],[90,91,12000,0,0],[91,92,12000,0,0],[92,93,12000,0,0],[93,94,12000,0,0],[94,95,12000,25,0],[95,96,12000,0,0],[96,97,12000,0,0],[97,98,12000,0,0],[98,99,12000,0,0],[99,100,0,25,1200000]],
  "Accessories|Base":[[0,1,16000,0,0],[1,2,16000,0,0],[2,3,16000,0,0],[3,4,16000,0,0],[4,5,16000,30,0],[5,6,16000,0,0],[6,7,16000,0,0],[7,8,16000,0,0],[8,9,16000,0,0],[9,10,16000,30,0],[10,11,16000,0,0],[11,12,16000,0,0],[12,13,16000,0,0],[13,14,16000,0,0],[14,15,16000,30,0],[15,16,16000,0,0],[16,17,16000,0,0],[17,18,16000,0,0],[18,19,16000,0,0],[19,20,16000,30,0],[20,21,16000,0,0],[21,22,16000,0,0],[22,23,16000,0,0],[23,24,16000,0,0],[24,25,16000,30,0],[25,26,16000,0,0],[26,27,16000,0,0],[27,28,16000,0,0],[28,29,16000,0,0],[29,30,16000,30,0],[30,31,16000,0,0],[31,32,16000,0,0],[32,33,16000,0,0],[33,34,16000,0,0],[34,35,16000,30,0],[35,36,16000,0,0],[36,37,16000,0,0],[37,38,16000,0,0],[38,39,16000,0,0],[39,40,16000,30,0],[40,41,16000,0,0],[41,42,16000,0,0],[42,43,16000,0,0],[43,44,16000,0,0],[44,45,16000,30,0],[45,46,16000,0,0],[46,47,16000,0,0],[47,48,16000,0,0],[48,49,16000,0,0],[49,50,20000,40,0],[50,51,20000,0,0],[51,52,20000,0,0],[52,53,20000,0,0],[53,54,20000,0,0],[54,55,20000,40,0],[55,56,20000,0,0],[56,57,20000,0,0],[57,58,20000,0,0],[58,59,20000,0,0],[59,60,20000,40,0],[60,61,20000,0,0],[61,62,20000,0,0],[62,63,20000,0,0],[63,64,20000,0,0],[64,65,20000,40,0],[65,66,20000,0,0],[66,67,20000,0,0],[67,68,20000,0,0],[68,69,20000,0,0],[69,70,20000,40,0],[70,71,20000,0,0],[71,72,20000,0,0],[72,73,20000,0,0],[73,74,20000,0,0],[74,75,20000,40,0],[75,76,20000,0,0],[76,77,20000,0,0],[77,78,20000,0,0],[78,79,20000,0,0],[79,80,20000,40,0],[80,81,20000,0,0],[81,82,20000,0,0],[82,83,20000,0,0],[83,84,20000,0,0],[84,85,20000,40,0],[85,86,20000,0,0],[86,87,20000,0,0],[87,88,20000,0,0],[88,89,20000,0,0],[89,90,20000,40,0],[90,91,20000,0,0],[91,92,20000,0,0],[92,93,20000,0,0],[93,94,20000,0,0],[94,95,20000,40,0],[95,96,20000,0,0],[96,97,20000,0,0],[97,98,20000,0,0],[98,99,20000,0,0],[99,100,0,40,1200000]],
  "Weapon|Base":[[0,1,30000,40,0],[1,2,30000,0,0],[2,3,30000,40,0],[3,4,30000,0,0],[4,5,30000,40,0],[5,6,30000,0,0],[6,7,30000,40,0],[7,8,30000,0,0],[8,9,30000,40,0],[9,10,30000,0,0],[10,11,30000,40,0],[11,12,30000,0,0],[12,13,30000,40,0],[13,14,30000,0,0],[14,15,30000,40,0],[15,16,30000,0,0],[16,17,30000,40,0],[17,18,30000,0,0],[18,19,30000,40,0],[19,20,30000,0,0],[20,21,30000,40,0],[21,22,30000,0,0],[22,23,30000,40,0],[23,24,30000,0,0],[24,25,30000,40,0],[25,26,30000,0,0],[26,27,30000,40,0],[27,28,30000,0,0],[28,29,30000,40,0],[29,30,30000,0,0],[30,31,30000,40,0],[31,32,30000,0,0],[32,33,30000,40,0],[33,34,30000,0,0],[34,35,30000,40,0],[35,36,30000,0,0],[36,37,30000,40,0],[37,38,30000,0,0],[38,39,30000,40,0],[39,40,30000,0,0],[40,41,30000,40,0],[41,42,30000,0,0],[42,43,30000,40,0],[43,44,30000,0,0],[44,45,30000,40,0],[45,46,30000,0,0],[46,47,30000,40,0],[47,48,30000,0,0],[48,49,30000,40,0],[49,50,30000,0,0],[50,51,30000,40,0],[51,52,30000,0,0],[52,53,30000,40,0],[53,54,30000,0,0],[54,55,30000,40,0],[55,56,30000,0,0],[56,57,30000,40,0],[57,58,30000,0,0],[58,59,30000,40,0],[59,60,30000,0,0],[60,61,30000,40,0],[61,62,30000,0,0],[62,63,30000,40,0],[63,64,30000,0,0],[64,65,30000,40,0],[65,66,30000,0,0],[66,67,30000,40,0],[67,68,30000,0,0],[68,69,30000,40,0],[69,70,30000,0,0],[70,71,30000,40,0],[71,72,30000,0,0],[72,73,30000,40,0],[73,74,30000,0,0],[74,75,30000,40,0],[75,76,30000,0,0],[76,77,30000,40,0],[77,78,30000,0,0],[78,79,30000,40,0],[79,80,30000,0,0],[80,81,30000,40,0],[81,82,30000,0,0],[82,83,30000,40,0],[83,84,30000,0,0],[84,85,30000,40,0],[85,86,30000,0,0],[86,87,30000,40,0],[87,88,30000,0,0],[88,89,30000,40,0],[89,90,30000,0,0],[90,91,30000,40,0],[91,92,30000,0,0],[92,93,30000,40,0],[93,94,30000,0,0],[94,95,30000,40,0],[95,96,30000,0,0],[96,97,30000,40,0],[97,98,30000,0,0],[98,99,30000,40,0],[99,100,0,40,1200000]],
  "Helmet|Star 1":[[0,1,30000,40,0],[1,2,30000,0,0],[2,3,30000,40,0],[3,4,30000,0,0],[4,5,30000,40,0],[5,6,30000,0,0],[6,7,30000,40,0],[7,8,30000,0,0],[8,9,30000,40,0],[9,10,30000,0,0],[10,11,30000,40,0],[11,12,30000,0,0],[12,13,30000,40,0],[13,14,30000,0,0],[14,15,30000,40,0],[15,16,30000,0,0],[16,17,30000,40,0],[17,18,30000,0,0],[18,19,30000,40,0],[19,20,30000,0,0],[20,21,30000,40,0],[21,22,30000,0,0],[22,23,30000,40,0],[23,24,30000,0,0],[24,25,30000,40,0],[25,26,30000,0,0],[26,27,30000,40,0],[27,28,30000,0,0],[28,29,30000,40,0],[29,30,30000,0,0],[30,31,30000,40,0],[31,32,30000,0,0],[32,33,30000,40,0],[33,34,30000,0,0],[34,35,30000,40,0],[35,36,30000,0,0],[36,37,30000,40,0],[37,38,30000,0,0],[38,39,30000,40,0],[39,40,30000,0,0],[40,41,30000,40,0],[41,42,30000,0,0],[42,43,30000,40,0],[43,44,30000,0,0],[44,45,30000,40,0],[45,46,30000,0,0],[46,47,30000,40,0],[47,48,30000,0,0],[48,49,30000,40,0],[49,50,30000,0,0],[50,51,30000,40,0],[51,52,30000,0,0],[52,53,30000,40,0],[53,54,30000,0,0],[54,55,30000,40,0],[55,56,30000,0,0],[56,57,30000,40,0],[57,58,30000,0,0],[58,59,30000,40,0],[59,60,30000,0,0],[60,61,30000,40,0],[61,62,30000,0,0],[62,63,30000,40,0],[63,64,30000,0,0],[64,65,30000,40,0],[65,66,30000,0,0],[66,67,30000,40,0],[67,68,30000,0,0],[68,69,30000,40,0],[69,70,30000,0,0],[70,71,30000,40,0],[71,72,30000,0,0],[72,73,30000,40,0],[73,74,30000,0,0],[74,75,30000,40,0],[75,76,30000,0,0],[76,77,30000,40,0],[77,78,30000,0,0],[78,79,30000,40,0],[79,80,30000,0,0],[80,81,30000,40,0],[81,82,30000,0,0],[82,83,30000,40,0],[83,84,30000,0,0],[84,85,30000,40,0],[85,86,30000,0,0],[86,87,30000,40,0],[87,88,30000,0,0],[88,89,30000,40,0],[89,90,30000,0,0],[90,91,30000,40,0],[91,92,30000,0,0],[92,93,30000,40,0],[93,94,30000,0,0],[94,95,30000,40,0],[95,96,30000,0,0],[96,97,30000,40,0],[97,98,30000,0,0],[98,99,30000,40,0],[99,100,0,40,3200000]],
  "Body Armor|Star 1":[[0,1,30000,40,0],[1,2,30000,0,0],[2,3,30000,40,0],[3,4,30000,0,0],[4,5,30000,40,0],[5,6,30000,0,0],[6,7,30000,40,0],[7,8,30000,0,0],[8,9,30000,40,0],[9,10,30000,0,0],[10,11,30000,40,0],[11,12,30000,0,0],[12,13,30000,40,0],[13,14,30000,0,0],[14,15,30000,40,0],[15,16,30000,0,0],[16,17,30000,40,0],[17,18,30000,0,0],[18,19,30000,40,0],[19,20,30000,0,0],[20,21,30000,40,0],[21,22,30000,0,0],[22,23,30000,40,0],[23,24,30000,0,0],[24,25,30000,40,0],[25,26,30000,0,0],[26,27,30000,40,0],[27,28,30000,0,0],[28,29,30000,40,0],[29,30,30000,0,0],[30,31,30000,40,0],[31,32,30000,0,0],[32,33,30000,40,0],[33,34,30000,0,0],[34,35,30000,40,0],[35,36,30000,0,0],[36,37,30000,40,0],[37,38,30000,0,0],[38,39,30000,40,0],[39,40,30000,0,0],[40,41,30000,40,0],[41,42,30000,0,0],[42,43,30000,40,0],[43,44,30000,0,0],[44,45,30000,40,0],[45,46,30000,0,0],[46,47,30000,40,0],[47,48,30000,0,0],[48,49,30000,40,0],[49,50,30000,0,0],[50,51,30000,40,0],[51,52,30000,0,0],[52,53,30000,40,0],[53,54,30000,0,0],[54,55,30000,40,0],[55,56,30000,0,0],[56,57,30000,40,0],[57,58,30000,0,0],[58,59,30000,40,0],[59,60,30000,0,0],[60,61,30000,40,0],[61,62,30000,0,0],[62,63,30000,40,0],[63,64,30000,0,0],[64,65,30000,40,0],[65,66,30000,0,0],[66,67,30000,40,0],[67,68,30000,0,0],[68,69,30000,40,0],[69,70,30000,0,0],[70,71,30000,40,0],[71,72,30000,0,0],[72,73,30000,40,0],[73,74,30000,0,0],[74,75,30000,40,0],[75,76,30000,0,0],[76,77,30000,40,0],[77,78,30000,0,0],[78,79,30000,40,0],[79,80,30000,0,0],[80,81,30000,40,0],[81,82,30000,0,0],[82,83,30000,40,0],[83,84,30000,0,0],[84,85,30000,40,0],[85,86,30000,0,0],[86,87,30000,40,0],[87,88,30000,0,0],[88,89,30000,40,0],[89,90,30000,0,0],[90,91,30000,40,0],[91,92,30000,0,0],[92,93,30000,40,0],[93,94,30000,0,0],[94,95,30000,40,0],[95,96,30000,0,0],[96,97,30000,40,0],[97,98,30000,0,0],[98,99,30000,40,0],[99,100,0,40,3200000]],
  "Accessories|Star 1":[[0,1,30000,40,0],[1,2,30000,0,0],[2,3,30000,40,0],[3,4,30000,0,0],[4,5,30000,40,0],[5,6,30000,0,0],[6,7,30000,40,0],[7,8,30000,0,0],[8,9,30000,40,0],[9,10,30000,0,0],[10,11,30000,40,0],[11,12,30000,0,0],[12,13,30000,40,0],[13,14,30000,0,0],[14,15,30000,40,0],[15,16,30000,0,0],[16,17,30000,40,0],[17,18,30000,0,0],[18,19,30000,40,0],[19,20,30000,0,0],[20,21,30000,40,0],[21,22,30000,0,0],[22,23,30000,40,0],[23,24,30000,0,0],[24,25,30000,40,0],[25,26,30000,0,0],[26,27,30000,40,0],[27,28,30000,0,0],[28,29,30000,40,0],[29,30,30000,0,0],[30,31,30000,40,0],[31,32,30000,0,0],[32,33,30000,40,0],[33,34,30000,0,0],[34,35,30000,40,0],[35,36,30000,0,0],[36,37,30000,40,0],[37,38,30000,0,0],[38,39,30000,40,0],[39,40,30000,0,0],[40,41,30000,40,0],[41,42,30000,0,0],[42,43,30000,40,0],[43,44,30000,0,0],[44,45,30000,40,0],[45,46,30000,0,0],[46,47,30000,40,0],[47,48,30000,0,0],[48,49,30000,40,0],[49,50,30000,0,0],[50,51,30000,40,0],[51,52,30000,0,0],[52,53,30000,40,0],[53,54,30000,0,0],[54,55,30000,40,0],[55,56,30000,0,0],[56,57,30000,40,0],[57,58,30000,0,0],[58,59,30000,40,0],[59,60,30000,0,0],[60,61,30000,40,0],[61,62,30000,0,0],[62,63,30000,40,0],[63,64,30000,0,0],[64,65,30000,40,0],[65,66,30000,0,0],[66,67,30000,40,0],[67,68,30000,0,0],[68,69,30000,40,0],[69,70,30000,0,0],[70,71,30000,40,0],[71,72,30000,0,0],[72,73,30000,40,0],[73,74,30000,0,0],[74,75,30000,40,0],[75,76,30000,0,0],[76,77,30000,40,0],[77,78,30000,0,0],[78,79,30000,40,0],[79,80,30000,0,0],[80,81,30000,40,0],[81,82,30000,0,0],[82,83,30000,40,0],[83,84,30000,0,0],[84,85,30000,40,0],[85,86,30000,0,0],[86,87,30000,40,0],[87,88,30000,0,0],[88,89,30000,40,0],[89,90,30000,0,0],[90,91,30000,40,0],[91,92,30000,0,0],[92,93,30000,40,0],[93,94,30000,0,0],[94,95,30000,40,0],[95,96,30000,0,0],[96,97,30000,40,0],[97,98,30000,0,0],[98,99,30000,40,0],[99,100,0,40,3200000]],
  "Weapon|Star 1":[[0,1,30000,40,0],[1,2,30000,0,0],[2,3,30000,40,0],[3,4,30000,0,0],[4,5,30000,40,0],[5,6,30000,0,0],[6,7,30000,40,0],[7,8,30000,0,0],[8,9,30000,40,0],[9,10,30000,0,0],[10,11,30000,40,0],[11,12,30000,0,0],[12,13,30000,40,0],[13,14,30000,0,0],[14,15,30000,40,0],[15,16,30000,0,0],[16,17,30000,40,0],[17,18,30000,0,0],[18,19,30000,40,0],[19,20,30000,0,0],[20,21,30000,40,0],[21,22,30000,0,0],[22,23,30000,40,0],[23,24,30000,0,0],[24,25,30000,40,0],[25,26,30000,0,0],[26,27,30000,40,0],[27,28,30000,0,0],[28,29,30000,40,0],[29,30,30000,0,0],[30,31,30000,40,0],[31,32,30000,0,0],[32,33,30000,40,0],[33,34,30000,0,0],[34,35,30000,40,0],[35,36,30000,0,0],[36,37,30000,40,0],[37,38,30000,0,0],[38,39,30000,40,0],[39,40,30000,0,0],[40,41,30000,40,0],[41,42,30000,0,0],[42,43,30000,40,0],[43,44,30000,0,0],[44,45,30000,40,0],[45,46,30000,0,0],[46,47,30000,40,0],[47,48,30000,0,0],[48,49,30000,40,0],[49,50,30000,0,0],[50,51,30000,40,0],[51,52,30000,0,0],[52,53,30000,40,0],[53,54,30000,0,0],[54,55,30000,40,0],[55,56,30000,0,0],[56,57,30000,40,0],[57,58,30000,0,0],[58,59,30000,40,0],[59,60,30000,0,0],[60,61,30000,40,0],[61,62,30000,0,0],[62,63,30000,40,0],[63,64,30000,0,0],[64,65,30000,40,0],[65,66,30000,0,0],[66,67,30000,40,0],[67,68,30000,0,0],[68,69,30000,40,0],[69,70,30000,0,0],[70,71,30000,40,0],[71,72,30000,0,0],[72,73,30000,40,0],[73,74,30000,0,0],[74,75,30000,40,0],[75,76,30000,0,0],[76,77,30000,40,0],[77,78,30000,0,0],[78,79,30000,40,0],[79,80,30000,0,0],[80,81,30000,40,0],[81,82,30000,0,0],[82,83,30000,40,0],[83,84,30000,0,0],[84,85,30000,40,0],[85,86,30000,0,0],[86,87,30000,40,0],[87,88,30000,0,0],[88,89,30000,40,0],[89,90,30000,0,0],[90,91,30000,40,0],[91,92,30000,0,0],[92,93,30000,40,0],[93,94,30000,0,0],[94,95,30000,40,0],[95,96,30000,0,0],[96,97,30000,40,0],[97,98,30000,0,0],[98,99,30000,40,0],[99,100,0,40,3200000]],
  "Helmet|Star 2":[[0,2,50000,45,0],[2,4,50000,45,0],[4,6,50000,45,0],[6,8,50000,45,0],[8,10,50000,45,0],[10,12,50000,45,0],[12,14,50000,45,0],[14,16,50000,45,0],[16,18,50000,45,0],[18,20,50000,45,0],[20,22,50000,45,0],[22,24,50000,45,0],[24,26,50000,45,0],[26,28,50000,45,0],[28,30,50000,45,0],[30,32,50000,45,0],[32,34,50000,45,0],[34,36,50000,45,0],[36,38,50000,45,0],[38,40,50000,45,0],[40,42,50000,45,0],[42,44,50000,45,0],[44,46,50000,45,0],[46,48,50000,45,0],[48,50,50000,45,0],[50,52,50000,45,0],[52,54,50000,45,0],[54,56,50000,45,0],[56,58,50000,45,0],[58,60,50000,45,0],[60,62,50000,45,0],[62,64,50000,45,0],[64,66,50000,45,0],[66,68,50000,45,0],[68,70,50000,45,0],[70,72,50000,45,0],[72,74,50000,45,0],[74,76,50000,45,0],[76,78,50000,45,0],[78,80,50000,45,0],[80,82,50000,45,0],[82,84,50000,45,0],[84,86,50000,45,0],[86,88,50000,45,0],[88,90,50000,45,0],[90,92,50000,45,0],[92,94,50000,45,0],[94,96,50000,45,0],[96,98,50000,45,0],[98,100,0,45,3600000]],
  "Body Armor|Star 2":[[0,2,50000,45,0],[2,4,50000,45,0],[4,6,50000,45,0],[6,8,50000,45,0],[8,10,50000,45,0],[10,12,50000,45,0],[12,14,50000,45,0],[14,16,50000,45,0],[16,18,50000,45,0],[18,20,50000,45,0],[20,22,50000,45,0],[22,24,50000,45,0],[24,26,50000,45,0],[26,28,50000,45,0],[28,30,50000,45,0],[30,32,50000,45,0],[32,34,50000,45,0],[34,36,50000,45,0],[36,38,50000,45,0],[38,40,50000,45,0],[40,42,50000,45,0],[42,44,50000,45,0],[44,46,50000,45,0],[46,48,50000,45,0],[48,50,50000,45,0],[50,52,50000,45,0],[52,54,50000,45,0],[54,56,50000,45,0],[56,58,50000,45,0],[58,60,50000,45,0],[60,62,50000,45,0],[62,64,50000,45,0],[64,66,50000,45,0],[66,68,50000,45,0],[68,70,50000,45,0],[70,72,50000,45,0],[72,74,50000,45,0],[74,76,50000,45,0],[76,78,50000,45,0],[78,80,50000,45,0],[80,82,50000,45,0],[82,84,50000,45,0],[84,86,50000,45,0],[86,88,50000,45,0],[88,90,50000,45,0],[90,92,50000,45,0],[92,94,50000,45,0],[94,96,50000,45,0],[96,98,50000,45,0],[98,100,0,45,3600000]],
  "Accessories|Star 2":[[0,2,50000,45,0],[2,4,50000,45,0],[4,6,50000,45,0],[6,8,50000,45,0],[8,10,50000,45,0],[10,12,50000,45,0],[12,14,50000,45,0],[14,16,50000,45,0],[16,18,50000,45,0],[18,20,50000,45,0],[20,22,50000,45,0],[22,24,50000,45,0],[24,26,50000,45,0],[26,28,50000,45,0],[28,30,50000,45,0],[30,32,50000,45,0],[32,34,50000,45,0],[34,36,50000,45,0],[36,38,50000,45,0],[38,40,50000,45,0],[40,42,50000,45,0],[42,44,50000,45,0],[44,46,50000,45,0],[46,48,50000,45,0],[48,50,50000,45,0],[50,52,50000,45,0],[52,54,50000,45,0],[54,56,50000,45,0],[56,58,50000,45,0],[58,60,50000,45,0],[60,62,50000,45,0],[62,64,50000,45,0],[64,66,50000,45,0],[66,68,50000,45,0],[68,70,50000,45,0],[70,72,50000,45,0],[72,74,50000,45,0],[74,76,50000,45,0],[76,78,50000,45,0],[78,80,50000,45,0],[80,82,50000,45,0],[82,84,50000,45,0],[84,86,50000,45,0],[86,88,50000,45,0],[88,90,50000,45,0],[90,92,50000,45,0],[92,94,50000,45,0],[94,96,50000,45,0],[96,98,50000,45,0],[98,100,0,45,3600000]],
  "Weapon|Star 2":[[0,2,50000,45,0],[2,4,50000,45,0],[4,6,50000,45,0],[6,8,50000,45,0],[8,10,50000,45,0],[10,12,50000,45,0],[12,14,50000,45,0],[14,16,50000,45,0],[16,18,50000,45,0],[18,20,50000,45,0],[20,22,50000,45,0],[22,24,50000,45,0],[24,26,50000,45,0],[26,28,50000,45,0],[28,30,50000,45,0],[30,32,50000,45,0],[32,34,50000,45,0],[34,36,50000,45,0],[36,38,50000,45,0],[38,40,50000,45,0],[40,42,50000,45,0],[42,44,50000,45,0],[44,46,50000,45,0],[46,48,50000,45,0],[48,50,50000,45,0],[50,52,50000,45,0],[52,54,50000,45,0],[54,56,50000,45,0],[56,58,50000,45,0],[58,60,50000,45,0],[60,62,50000,45,0],[62,64,50000,45,0],[64,66,50000,45,0],[66,68,50000,45,0],[68,70,50000,45,0],[70,72,50000,45,0],[72,74,50000,45,0],[74,76,50000,45,0],[76,78,50000,45,0],[78,80,50000,45,0],[80,82,50000,45,0],[82,84,50000,45,0],[84,86,50000,45,0],[86,88,50000,45,0],[88,90,50000,45,0],[90,92,50000,45,0],[92,94,50000,45,0],[94,96,50000,45,0],[96,98,50000,45,0],[98,100,0,45,3600000]],
  "Helmet|Star 3":[[0,2,60000,50,0],[2,4,60000,50,0],[4,6,60000,50,0],[6,8,60000,50,0],[8,10,60000,50,0],[10,12,60000,50,0],[12,14,60000,50,0],[14,16,60000,50,0],[16,18,60000,50,0],[18,20,60000,50,0],[20,22,60000,50,0],[22,24,60000,50,0],[24,26,60000,50,0],[26,28,60000,50,0],[28,30,60000,50,0],[30,32,60000,50,0],[32,34,60000,50,0],[34,36,60000,50,0],[36,38,60000,50,0],[38,40,60000,50,0],[40,42,60000,50,0],[42,44,60000,50,0],[44,46,60000,50,0],[46,48,60000,50,0],[48,50,60000,50,0],[50,52,60000,50,0],[52,54,60000,50,0],[54,56,60000,50,0],[56,58,60000,50,0],[58,60,60000,50,0],[60,62,60000,50,0],[62,64,60000,50,0],[64,66,60000,50,0],[66,68,60000,50,0],[68,70,60000,50,0],[70,72,60000,50,0],[72,74,60000,50,0],[74,76,60000,50,0],[76,78,60000,50,0],[78,80,60000,50,0],[80,82,60000,50,0],[82,84,60000,50,0],[84,86,60000,50,0],[86,88,60000,50,0],[88,90,60000,50,0],[90,92,60000,50,0],[92,94,60000,50,0],[94,96,60000,50,0],[96,98,60000,50,0],[98,100,0,50,3600000]],
  "Body Armor|Star 3":[[0,2,60000,50,0],[2,4,60000,50,0],[4,6,60000,50,0],[6,8,60000,50,0],[8,10,60000,50,0],[10,12,60000,50,0],[12,14,60000,50,0],[14,16,60000,50,0],[16,18,60000,50,0],[18,20,60000,50,0],[20,22,60000,50,0],[22,24,60000,50,0],[24,26,60000,50,0],[26,28,60000,50,0],[28,30,60000,50,0],[30,32,60000,50,0],[32,34,60000,50,0],[34,36,60000,50,0],[36,38,60000,50,0],[38,40,60000,50,0],[40,42,60000,50,0],[42,44,60000,50,0],[44,46,60000,50,0],[46,48,60000,50,0],[48,50,60000,50,0],[50,52,60000,50,0],[52,54,60000,50,0],[54,56,60000,50,0],[56,58,60000,50,0],[58,60,60000,50,0],[60,62,60000,50,0],[62,64,60000,50,0],[64,66,60000,50,0],[66,68,60000,50,0],[68,70,60000,50,0],[70,72,60000,50,0],[72,74,60000,50,0],[74,76,60000,50,0],[76,78,60000,50,0],[78,80,60000,50,0],[80,82,60000,50,0],[82,84,60000,50,0],[84,86,60000,50,0],[86,88,60000,50,0],[88,90,60000,50,0],[90,92,60000,50,0],[92,94,60000,50,0],[94,96,60000,50,0],[96,98,60000,50,0],[98,100,0,50,3600000]],
  "Accessories|Star 3":[[0,2,60000,50,0],[2,4,60000,50,0],[4,6,60000,50,0],[6,8,60000,50,0],[8,10,60000,50,0],[10,12,60000,50,0],[12,14,60000,50,0],[14,16,60000,50,0],[16,18,60000,50,0],[18,20,60000,50,0],[20,22,60000,50,0],[22,24,60000,50,0],[24,26,60000,50,0],[26,28,60000,50,0],[28,30,60000,50,0],[30,32,60000,50,0],[32,34,60000,50,0],[34,36,60000,50,0],[36,38,60000,50,0],[38,40,60000,50,0],[40,42,60000,50,0],[42,44,60000,50,0],[44,46,60000,50,0],[46,48,60000,50,0],[48,50,60000,50,0],[50,52,60000,50,0],[52,54,60000,50,0],[54,56,60000,50,0],[56,58,60000,50,0],[58,60,60000,50,0],[60,62,60000,50,0],[62,64,60000,50,0],[64,66,60000,50,0],[66,68,60000,50,0],[68,70,60000,50,0],[70,72,60000,50,0],[72,74,60000,50,0],[74,76,60000,50,0],[76,78,60000,50,0],[78,80,60000,50,0],[80,82,60000,50,0],[82,84,60000,50,0],[84,86,60000,50,0],[86,88,60000,50,0],[88,90,60000,50,0],[90,92,60000,50,0],[92,94,60000,50,0],[94,96,60000,50,0],[96,98,60000,50,0],[98,100,0,50,3600000]],
  "Weapon|Star 3":[[0,2,60000,50,0],[2,4,60000,50,0],[4,6,60000,50,0],[6,8,60000,50,0],[8,10,60000,50,0],[10,12,60000,50,0],[12,14,60000,50,0],[14,16,60000,50,0],[16,18,60000,50,0],[18,20,60000,50,0],[20,22,60000,50,0],[22,24,60000,50,0],[24,26,60000,50,0],[26,28,60000,50,0],[28,30,60000,50,0],[30,32,60000,50,0],[32,34,60000,50,0],[34,36,60000,50,0],[36,38,60000,50,0],[38,40,60000,50,0],[40,42,60000,50,0],[42,44,60000,50,0],[44,46,60000,50,0],[46,48,60000,50,0],[48,50,60000,50,0],[50,52,60000,50,0],[52,54,60000,50,0],[54,56,60000,50,0],[56,58,60000,50,0],[58,60,60000,50,0],[60,62,60000,50,0],[62,64,60000,50,0],[64,66,60000,50,0],[66,68,60000,50,0],[68,70,60000,50,0],[70,72,60000,50,0],[72,74,60000,50,0],[74,76,60000,50,0],[76,78,60000,50,0],[78,80,60000,50,0],[80,82,60000,50,0],[82,84,60000,50,0],[84,86,60000,50,0],[86,88,60000,50,0],[88,90,60000,50,0],[90,92,60000,50,0],[92,94,60000,50,0],[94,96,60000,50,0],[96,98,60000,50,0],[98,100,0,50,3600000]],
};

const fmtNum = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
};

function LevelSelector({ label, value, setValue, min, max }) {
  const [display, setDisplay] = useState(String(value));

  // Sync display if value changes externally (e.g. +/- buttons)
  useEffect(() => { setDisplay(String(value)); }, [value]);

  const handleChange = (e) => {
    setDisplay(e.target.value); // allow free typing including empty
    const v = parseInt(e.target.value);
    if (!isNaN(v)) setValue(Math.max(min, Math.min(max, v)));
  };

  const handleBlur = () => {
    const v = parseInt(display);
    const clamped = isNaN(v) ? min : Math.max(min, Math.min(max, v));
    setValue(clamped);
    setDisplay(String(clamped));
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--bg)" }}>
        <button onClick={() => setValue(v => { const nv = Math.max(min, v - 1); setDisplay(String(nv)); return nv; })} style={{ width: 44, height: 48, border: "none", borderRight: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: 20, color: "var(--text-mid)", flexShrink: 0 }}>−</button>
        <input
          type="number"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          style={{ flex: 1, border: "none", background: "transparent", textAlign: "center", fontSize: 18, fontWeight: 700, color: "var(--text)", fontFamily: "Outfit, sans-serif", outline: "none", padding: "0 4px", height: 48 }}
        />
        <button onClick={() => setValue(v => { const nv = Math.min(max, v + 1); setDisplay(String(nv)); return nv; })} style={{ width: 44, height: 48, border: "none", borderLeft: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: 20, color: "var(--text-mid)", flexShrink: 0 }}>+</button>
      </div>
    </div>
  );
}

function ResultCard({ children }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 16px", marginTop: 16, textAlign: "center" }}>
      {children}
    </div>
  );
}

function ResultRow({ icon, label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
      <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || "var(--text)" }}>{icon} {value}</div>
    </div>
  );
}

// ── Weapon Shards Calculator
function WeaponShardsCalc() {
  const [fromLevel, setFromLevel] = useState(1);
  const [toLevel, setToLevel] = useState(10);
  const [includeUnlock, setIncludeUnlock] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const maxLevel = WEAPON_SHARDS_DATA.length;
  const safeFrom = Math.min(fromLevel, toLevel);
  const safeTo = Math.max(fromLevel, toLevel);

  const totalShards = (() => {
    let total = 0;
    // shards to go from level N-1 to N is stored at WEAPON_SHARDS_DATA[N-1]
    // "from level X to level Y" means we need shards for levels X+1 through Y
    for (let lvl = safeFrom + 1; lvl <= safeTo; lvl++) {
      const row = WEAPON_SHARDS_DATA.find(r => r.level === lvl);
      if (row) total += row.shards;
    }
    if (includeUnlock) total += 50; // unlock cost
    return total;
  })();

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ background: "linear-gradient(135deg, var(--gold) 0%, #a67c2e 100%)", borderRadius: 10, marginBottom: 16, padding: "16px" }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>⚔️ {tr("Weapon Shards Calculator")}</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 }}>{tr("Calculate shards needed to level up exclusive weapons")}</div>
        </div>
        <LevelSelector label={tr("From Level")} value={fromLevel} setValue={setFromLevel} min={1} max={maxLevel} />
        <LevelSelector label={tr("To Level")} value={toLevel} setValue={setToLevel} min={1} max={maxLevel} />
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: 12, fontSize: 14, color: "var(--text-mid)" }}>
          <input type="checkbox" checked={includeUnlock} onChange={e => setIncludeUnlock(e.target.checked)} />
          <span>{tr("Include Weapon Unlock Cost (+50 shards)")}</span>
        </label>
      </div>

      <ResultCard>
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>{tr("Total Shards Required — Level {from} → {to}", { from: safeFrom, to: safeTo })}</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: "var(--gold)" }}>{totalShards.toLocaleString(dateLocale())}</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 8, background: "rgba(201,140,40,0.1)", borderRadius: 8, padding: "8px 12px", textAlign: "left" }}>
          <strong style={{ color: "var(--gold)" }}>{tr("Note")}:</strong> {tr("Unlocking a weapon requires 50 named shards specific to that weapon. Subsequent levels can use named or universal shards.")}
        </div>
      </ResultCard>

      <button className="btn btn-ghost btn-full" style={{ marginTop: 12 }} onClick={() => setShowTable(t => !t)}>
        {showTable ? tr("Hide Shards Table") : tr("Show Shards Table")} {showTable ? "▲" : "▼"}
      </button>
      {showTable && (
        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-dim)" }}>{tr("Level")}</th>
                <th style={{ padding: "8px 12px", textAlign: "right", color: "var(--text-dim)" }}>{tr("Shards")}</th>
                <th style={{ padding: "8px 12px", textAlign: "right", color: "var(--text-dim)" }}>{tr("Cumulative")}</th>
              </tr>
            </thead>
            <tbody>
              {WEAPON_SHARDS_DATA.map((row, i) => {
                const cum = WEAPON_SHARDS_DATA.slice(0, i + 1).reduce((s, r) => s + r.shards, 0);
                const inRange = row.level > safeFrom && row.level <= safeTo;
                return (
                  <tr key={row.level} style={{ borderBottom: "1px solid var(--border)", background: inRange ? "rgba(201,140,40,0.08)" : "transparent" }}>
                    <td style={{ padding: "6px 12px", fontWeight: inRange ? 700 : 400 }}>{row.level}</td>
                    <td style={{ padding: "6px 12px", textAlign: "right" }}>{row.shards}</td>
                    <td style={{ padding: "6px 12px", textAlign: "right", color: "var(--text-dim)" }}>{cum}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Drone Parts Calculator
function DroneCalc() {
  const [fromLevel, setFromLevel] = useState(1);
  const [toLevel, setToLevel] = useState(10);
  const [showTable, setShowTable] = useState(false);

  const maxLevel = DRONE_DATA[DRONE_DATA.length - 1][0];

  const safeFrom = Math.min(fromLevel, toLevel);
  const safeTo = Math.max(fromLevel, toLevel);

  const { parts, xp } = (() => {
    let totalParts = 0, totalXp = 0;
    for (let lvl = safeFrom + 1; lvl <= safeTo; lvl++) {
      const row = DRONE_DATA.find(r => r[0] === lvl);
      if (row) { totalParts += row[1]; totalXp += row[2]; }
    }
    return { parts: totalParts, xp: totalXp };
  })();

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ background: "linear-gradient(135deg, #2c5f8a 0%, #1a3d5c 100%)", borderRadius: 10, marginBottom: 16, padding: "16px" }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>⚙️ {tr("Drone Parts Calculator")}</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 }}>{tr("Drone upgrade parts & battle data needed per level")}</div>
        </div>
        <LevelSelector label={tr("From Level")} value={fromLevel} setValue={setFromLevel} min={1} max={maxLevel} />
        <LevelSelector label={tr("To Level")} value={toLevel} setValue={setToLevel} min={1} max={maxLevel} />
      </div>

      <ResultCard>
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>{tr("Level")} {safeFrom} → {safeTo}</div>
        <div style={{ display: "flex", gap: 12 }}>
          <ResultRow icon="⚙️" label={tr("Drone Parts Required")} value={fmtNum(parts)} color="#2c5f8a" />
          <ResultRow icon="📋" label={tr("Battle Data Required")} value={fmtNum(xp)} color="#8a5c2c" />
        </div>
      </ResultCard>

      <button className="btn btn-ghost btn-full" style={{ marginTop: 12 }} onClick={() => setShowTable(t => !t)}>
        {showTable ? tr("Hide Full Table") : tr("Show Full Table")} {showTable ? "▲" : "▼"}
      </button>
      {showTable && (
        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ padding: "6px 8px", textAlign: "left", color: "var(--text-dim)" }}>{tr("Lvl")}</th>
                <th style={{ padding: "6px 8px", textAlign: "right", color: "var(--text-dim)" }}>{tr("Parts")}</th>
                <th style={{ padding: "6px 8px", textAlign: "right", color: "var(--text-dim)" }}>{tr("Battle Data")}</th>
              </tr>
            </thead>
            <tbody>
              {DRONE_DATA.map(row => {
                const inRange = row[0] > safeFrom && row[0] <= safeTo;
                return (
                  <tr key={row[0]} style={{ borderBottom: "1px solid var(--border)", background: inRange ? "rgba(44,95,138,0.1)" : "transparent" }}>
                    <td style={{ padding: "5px 8px", fontWeight: inRange ? 700 : 400 }}>{row[0]}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right" }}>{row[1].toLocaleString(dateLocale())}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right", color: "var(--text-dim)" }}>{row[2].toLocaleString(dateLocale())}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── T11 Research Calculator
function T11Calc() {
  const [researchType, setResearchType] = useState("Helmet");
  const [stage, setStage] = useState("Base");
  const [fromPct, setFromPct] = useState(0);
  const [toPct, setToPct] = useState(10);
  const [displayFrom, setDisplayFrom] = useState("0");
  const [displayTo, setDisplayTo] = useState("10");

  const types = ["Helmet", "Body Armor", "Accessories", "Weapon"];
  const stages = ["Base", "Star 1", "Star 2", "Star 3"];
  const key = `${researchType}|${stage}`;
  const rows = T11_DATA[key] || [];
  const maxPct = rows.length > 0 ? rows[rows.length - 1][1] : 100;

  const validPcts = [...new Set(rows.map(r => r[0]).concat([maxPct]))].sort((a, b) => a - b);

  useEffect(() => { setDisplayFrom(String(fromPct)); }, [fromPct]);
  useEffect(() => { setDisplayTo(String(toPct)); }, [toPct]);

  const safeFrom = Math.min(fromPct, toPct);
  const safeTo = Math.max(fromPct, toPct);

  const { mat, cores, oil } = (() => {
    let tm = 0, tc = 0, to = 0;
    for (const row of rows) {
      if (row[0] >= safeFrom && row[1] <= safeTo) {
        tm += row[2]; tc += row[3]; to += row[4];
      }
    }
    return { mat: tm, cores: tc, oil: to };
  })();

  const snapPct = (v) => validPcts.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a);

  const handleFromChange = (e) => {
    setDisplayFrom(e.target.value);
    const v = parseInt(e.target.value);
    if (!isNaN(v)) setFromPct(snapPct(v));
  };
  const handleFromBlur = () => {
    const v = parseInt(displayFrom);
    const snapped = isNaN(v) ? validPcts[0] : snapPct(v);
    setFromPct(snapped);
    setDisplayFrom(String(snapped));
  };
  const handleToChange = (e) => {
    setDisplayTo(e.target.value);
    const v = parseInt(e.target.value);
    if (!isNaN(v)) setToPct(snapPct(v));
  };
  const handleToBlur = () => {
    const v = parseInt(displayTo);
    const snapped = isNaN(v) ? validPcts[0] : snapPct(v);
    setToPct(snapped);
    setDisplayTo(String(snapped));
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ background: "linear-gradient(135deg, #3a2c6b 0%, #1f1840 100%)", borderRadius: 10, marginBottom: 16, padding: "16px" }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>🔬 {tr("T11 Research Calculator")}</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 }}>{tr("Armament materials, cores & oil required")}</div>
        </div>

        <div className="form-group">
          <label className="form-label">{tr("Research Type")}</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {types.map(t => (
              <button key={t} onClick={() => setResearchType(t)} style={{ padding: "10px 8px", border: `2px solid ${researchType === t ? "var(--gold)" : "var(--border)"}`, borderRadius: 8, background: researchType === t ? "rgba(201,140,40,0.1)" : "var(--bg)", cursor: "pointer", fontSize: 13, fontWeight: researchType === t ? 700 : 400, color: researchType === t ? "var(--gold)" : "var(--text-mid)" }}>
                {tr(t)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">{tr("Stage")}</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {stages.map(s => (
              <button key={s} onClick={() => { setStage(s); setFromPct(0); setToPct(10); }} style={{ padding: "10px 4px", border: `2px solid ${stage === s ? "var(--gold)" : "var(--border)"}`, borderRadius: 8, background: stage === s ? "rgba(201,140,40,0.1)" : "var(--bg)", cursor: "pointer", fontSize: 12, fontWeight: stage === s ? 700 : 400, color: stage === s ? "var(--gold)" : "var(--text-mid)" }}>
                {tr(s)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div className="form-group">
            <label className="form-label">{tr("From %")}</label>
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--bg)" }}>
              <button onClick={() => { const idx = validPcts.indexOf(fromPct); const nv = validPcts[Math.max(0, idx - 1)]; setFromPct(nv); setDisplayFrom(String(nv)); }} style={{ width: 44, height: 48, border: "none", borderRight: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: 20, color: "var(--text-mid)", flexShrink: 0 }}>−</button>
              <input type="number" value={displayFrom} min={0} max={maxPct}
                onChange={handleFromChange} onBlur={handleFromBlur}
                style={{ flex: 1, border: "none", background: "transparent", textAlign: "center", fontSize: 16, fontWeight: 700, color: "var(--text)", fontFamily: "Outfit, sans-serif", outline: "none", padding: 0, height: 48 }} />
              <button onClick={() => { const idx = validPcts.indexOf(fromPct); const nv = validPcts[Math.min(validPcts.length - 1, idx + 1)]; setFromPct(nv); setDisplayFrom(String(nv)); }} style={{ width: 44, height: 48, border: "none", borderLeft: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: 20, color: "var(--text-mid)", flexShrink: 0 }}>+</button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{tr("To %")}</label>
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--bg)" }}>
              <button onClick={() => { const idx = validPcts.indexOf(toPct); const nv = validPcts[Math.max(0, idx - 1)]; setToPct(nv); setDisplayTo(String(nv)); }} style={{ width: 44, height: 48, border: "none", borderRight: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: 20, color: "var(--text-mid)", flexShrink: 0 }}>−</button>
              <input type="number" value={displayTo} min={0} max={maxPct}
                onChange={handleToChange} onBlur={handleToBlur}
                style={{ flex: 1, border: "none", background: "transparent", textAlign: "center", fontSize: 16, fontWeight: 700, color: "var(--text)", fontFamily: "Outfit, sans-serif", outline: "none", padding: 0, height: 48 }} />
              <button onClick={() => { const idx = validPcts.indexOf(toPct); const nv = validPcts[Math.min(validPcts.length - 1, idx + 1)]; setToPct(nv); setDisplayTo(String(nv)); }} style={{ width: 44, height: 48, border: "none", borderLeft: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: 20, color: "var(--text-mid)", flexShrink: 0 }}>+</button>
            </div>
          </div>
        </div>
      </div>

      <ResultCard>
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>{tr(researchType)} ({tr(stage)}): {safeFrom}% → {safeTo}%</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <ResultRow icon="💎" label={tr("Armament Materials")} value={fmtNum(mat)} color="#5b8dd9" />
          <ResultRow icon="🧊" label={tr("Armament Cores")} value={fmtNum(cores)} color="#6bb5c8" />
          <ResultRow icon="🛢️" label={tr("Oil")} value={oil > 0 ? fmtNum(oil) : "—"} color="#c8a86b" />
        </div>
      </ResultCard>
    </div>
  );
}

function CalculatorsPage() {
  const [tab, setTab] = useState("shards");
  const tabs = [
    { id: "shards", icon: "⚔️", label: tr("Weapon\nShards") },
    { id: "drone", icon: "⚙️", label: tr("Drone\nParts") },
    { id: "t11", icon: "🔬", label: tr("T11\nResearch") },
  ];
  return (
    <div>
      <h1 className="section-title">{tr("Calculators")}</h1>
      <p className="section-sub">{tr("Planning tools for Last War upgrades")}</p>

      {/* Pretty tab bar like management */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 6, padding: "14px 8px",
            background: tab === t.id ? "var(--gold)" : "var(--surface)",
            border: `2px solid ${tab === t.id ? "var(--gold)" : "var(--border)"}`,
            borderRadius: 14, cursor: "pointer",
            color: tab === t.id ? "#fff" : "var(--text-mid)",
            fontFamily: "Outfit, sans-serif",
            transition: "all 0.2s",
            boxShadow: tab === t.id ? "0 4px 16px rgba(201,140,40,0.35)" : "none",
          }}>
            <span style={{ fontSize: 24 }}>{t.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.3 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "shards" && <WeaponShardsCalc />}
      {tab === "drone" && <DroneCalc />}
      {tab === "t11" && <T11Calc />}
    </div>
  );
}
