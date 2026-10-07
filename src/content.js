export const defaults = {
  identity: {name:'ÉTUDE & CONSEIL', type:'CABINET JURIDIQUE', tagline:'La justesse du droit. La force du conseil.', location:'Cocody, Abidjan · Côte d’Ivoire', phone:'+225 07 00 00 00 00', email:'contact@etude-conseil.ci', hours:'08:30 – 17:30', heroTitle:'Le droit exige', heroAccent:'de la justesse.', heroText:'À vos côtés pour protéger vos intérêts, éclairer vos décisions et donner à vos projets un cadre solide.', aboutTitle:'Votre situation mérite', aboutAccent:'toute notre attention.', aboutText:'Chaque décision compte. Derrière chaque dossier, il y a des enjeux, des personnes et des projets qui méritent d’être défendus avec sérieux.', aboutSecond:'Notre cabinet réunit des compétences complémentaires pour vous accompagner avec disponibilité, confidentialité et discernement — du premier échange jusqu’à la résolution de votre dossier.', heroImage:'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1100&q=85', approachImage:'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=85', linkedin:'', instagram:''},
  services: [
    {title:'Droit des affaires',text:'Sécuriser vos décisions, structurer vos projets et accompagner la vie de votre entreprise.'},
    {title:'Droit immobilier',text:'Acquisition, vente, baux et opérations immobilières suivis avec méthode et précision.'},
    {title:'Droit de la famille',text:'Vous conseiller dans les moments importants et protéger durablement vos intérêts.'},
    {title:'Conseil & contentieux',text:'Une stratégie claire, une défense engagée et un accompagnement à chaque étape.'}
  ],
  team: [
    {name:'Maître Aïssata Koné',role:'ASSOCIÉE · DROIT DES AFFAIRES',bio:'Avocate au Barreau · 14 ans d’expérience',image:'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=750&q=85'},
    {name:'Maître Jean-Marc Yao',role:'NOTAIRE · DROIT IMMOBILIER',bio:'Notaire · 18 ans d’expérience',image:'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=750&q=85'}
  ],
  articles: [
    {category:'DROIT IMMOBILIER',title:'Acheter un bien immobilier : les étapes à anticiper',body:'Un premier échange permet d’identifier les pièces nécessaires et les vérifications utiles avant tout engagement.'},
    {category:'DROIT DES AFFAIRES',title:'Créer son entreprise : choisir le bon cadre juridique',body:'La structure juridique dépend de vos objectifs, de vos associés et de votre activité.'},
    {category:'DROIT DE LA FAMILLE',title:'Préparer sa succession : pourquoi s’y prendre tôt ?',body:'Anticiper permet de mieux organiser la transmission de son patrimoine et de dialoguer avec ses proches.'}
  ],
  faq: [{question:'Comment demander un rendez-vous ?',answer:'Remplissez le formulaire du site. Le cabinet vous recontactera pour convenir d’un créneau.'}],
  availability: {days:'Lundi au vendredi', note:'Les rendez-vous sont confirmés par le cabinet après réception de votre demande.'}
};
export function loadContent(){try{return {...defaults,...JSON.parse(localStorage.getItem('legal-content')||'{}')}}catch{return defaults}}
export function loadRequests(){try{return JSON.parse(localStorage.getItem('legal-requests')||'[]')}catch{return []}}
