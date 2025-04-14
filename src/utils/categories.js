// Exportation des sous-catégories pour une utilisation globale dans l'application
export const SUBCATEGORIES = {
  gaming: [
    { id: 'xbox-series-x', name: 'XBOX séries X' },
    { id: 'playstation-5', name: 'Playstation 5' },
    { id: 'playstation-4', name: 'Playstation 4' },
    { id: 'switch', name: 'Switch' },
    { id: 'xbox-one', name: 'Xbox One' },
    { id: 'playstation-3', name: 'Playstation 3' },
    { id: 'xbox-360', name: 'Xbox 360' },
    { id: 'wii-u', name: 'Wii U' },
    { id: '3ds', name: '3DS' },
    { id: 'ds', name: 'DS' },
    { id: 'playstation-vita', name: 'Playstation Vita' },
    { id: 'playstation-portable', name: 'Playstation Portable' },
    { id: 'wii', name: 'Wii' },
    { id: 'other-gaming', name: 'Autres' },
  ],
  retro: [
    { id: 'super-nintendo', name: 'Super Nintendo' },
    { id: 'megadrive', name: 'Megadrive' },
    { id: 'game-boy', name: 'Game Boy' },
    { id: 'playstation-one', name: 'Playstation One' },
    { id: 'nes', name: 'NES' },
    { id: 'playstation-2', name: 'Playstation 2' },
    { id: 'dreamcast', name: 'Dreamcast' },
    { id: 'nintendo-64', name: 'Nintendo 64' },
    { id: 'master-system', name: 'Master System' },
    { id: 'game-boy-advance', name: 'Game Boy Advance' },
    { id: 'saturn', name: 'Saturn' },
    { id: 'neo-geo', name: 'Neo Geo' },
    { id: 'xbox-original', name: 'Xbox' },
    { id: 'commodore', name: 'Commodore' },
    { id: 'panasonic-3do', name: 'Panasonic 3DO' },
    { id: 'pc-engine-coregrafX', name: 'Nec PC Engine CoreGrafX' },
    { id: 'neo-geo-cd', name: 'Neo Geo CD' },
    { id: 'game-gear', name: 'Game Gear' },
    { id: 'mega-cd', name: 'Mega CD' },
    { id: 'atari-jaguar', name: 'Atari Jaguar' },
    { id: 'atari-7800', name: 'Atari 7800' },
    { id: '32-x', name: '32 X' },
    { id: 'atari-800-xl', name: 'Atari 800 XL' },
    { id: 'amiga-cd-32', name: 'Amiga CD 32' },
    { id: 'atari-2600', name: 'Atari 2600' },
    { id: 'atari-lynx', name: 'Atari Lynx' },
    { id: 'pc-engine-gt', name: 'Nec Pc Engine GT' },
    { id: 'philips-videopac', name: 'Philips Videopac' },
    { id: 'pc-engine-duo', name: 'Nec Pc Engine DUO' },
    { id: 'neo-geo-pocket', name: 'Neo Geo Pocket' },
    { id: 'neo-geo-pocket-color', name: 'Neo Geo Pocket couleur' },
    { id: 'pc-engine-supergrafX', name: 'Nec Pc Engine SuperGrafX' },
    { id: 'virtual-boy', name: 'Virtual Boy' },
    { id: 'wonder-swan', name: 'Wonder Swan' },
    { id: 'mattel-intellivision', name: 'Mattel Intellivision' },
    { id: 'philips-cdi', name: 'Philips CDI' },
    { id: 'game-watch', name: 'Game & Watch' },
    { id: 'vectrex', name: 'Vectrex' },
    { id: 'jaguar-cd', name: 'Jaguar CD' },
    { id: 'divers-retro', name: 'Divers rétro' }
  ],
  tcg: [
    { 
      id: 'ecarlate-violet', 
      name: 'Série Ecarlate et Violet',
      subCategories: [
        { id: 'ev-base', name: 'Set de Base' },
        { id: 'ev-ultra-premium', name: 'Ultra Premium' },
        { id: 'ev-evolution-ecarlate', name: 'Évolution Écarlate' },
        { id: 'ev-flammes-obscures', name: 'Flammes Obscures' },
        { id: 'ev-paradisglas', name: 'Paradis Glacé' },
        { id: 'ev-astres-radieux', name: 'Astres Radieux' },
        { id: 'ev-origins-paldea', name: 'Origines de Paldea' },
        { id: 'ev-151', name: '151' },
        { id: 'ev-tera-obsidienne', name: 'Tera Obsidienne' },
        { id: 'ev-forces-temporelles', name: 'Forces Temporelles' }
      ]
    },
    { 
      id: 'epee-bouclier', 
      name: 'Série Epée et Bouclier',
      subCategories: [
        { id: 'eb-base', name: 'Set de Base' },
        { id: 'eb-clash-rebelles', name: 'Clash des Rebelles' },
        { id: 'eb-tenebre-embrasee', name: 'Ténèbres Embrasées' },
        { id: 'eb-voltage-eclatant', name: 'Voltage Éclatant' },
        { id: 'eb-styles-combat', name: 'Styles de Combat' },
        { id: 'eb-evolution-celeste', name: 'Évolution Céleste' },
        { id: 'eb-reglement-tempete', name: 'Règlement de la Tempête' },
        { id: 'eb-stars-brillantes', name: 'Étoiles Brillantes' },
        { id: 'eb-astres-scintillants', name: 'Astres Scintillants' },
        { id: 'eb-origine-perdue', name: 'Origine Perdue' },
        { id: 'eb-tempete-argentee', name: 'Tempête Argentée' },
        { id: 'eb-couronne-zenith', name: 'Couronne du Zénith' }
      ]
    },
    { 
      id: 'soleil-lune', 
      name: 'Série Soleil et Lune',
      subCategories: [
        { id: 'sl-base', name: 'Set de Base' },
        { id: 'sl-gardiens-ascendants', name: 'Gardiens Ascendants' },
        { id: 'sl-ombres-ardentes', name: 'Ombres Ardentes' },
        { id: 'sl-invasion-carmin', name: 'Invasion Carmin' },
        { id: 'sl-ultra-prisme', name: 'Ultra-Prisme' },
        { id: 'sl-lumiere-interdite', name: 'Lumière Interdite' },
        { id: 'sl-tempete-celeste', name: 'Tempête Céleste' },
        { id: 'sl-dragon-majeste', name: 'Majesté des Dragons' },
        { id: 'sl-tonnerre-perdu', name: 'Tonnerre Perdu' },
        { id: 'sl-team-up', name: 'Team Up' },
        { id: 'sl-duo-de-choc', name: 'Duo de Choc' },
        { id: 'sl-harmonie-esprits', name: 'Harmonie des Esprits' },
        { id: 'sl-eclipse-cosmique', name: 'Éclipse Cosmique' }
      ]
    },
    { 
      id: 'xy', 
      name: 'Série XY',
      subCategories: [
        { id: 'xy-base', name: 'Set de Base' },
        { id: 'xy-etincelles', name: 'Étincelles' },
        { id: 'xy-poings-furieux', name: 'Poings Furieux' },
        { id: 'xy-vigueur-spectrale', name: 'Vigueur Spectrale' },
        { id: 'xy-primo-choc', name: 'Primo-Choc' },
        { id: 'xy-ciel-rugissant', name: 'Ciel Rugissant' },
        { id: 'xy-origines-antiques', name: 'Origines Antiques' },
        { id: 'xy-impulsion-turbo', name: 'Impulsion TURBO' },
        { id: 'xy-impact-des-destins', name: 'Impact des Destins' },
        { id: 'xy-offensive-vapeur', name: 'Offensive Vapeur' },
        { id: 'xy-evolution', name: 'Évolutions' }
      ]
    },
    { 
      id: 'noir-blanc', 
      name: 'Série Noir et Blanc',
      subCategories: [
        { id: 'nb-base', name: 'Set de Base' },
        { id: 'nb-pouvoirs-emergents', name: 'Pouvoirs Émergents' },
        { id: 'nb-nobles-victoires', name: 'Nobles Victoires' },
        { id: 'nb-destinee-future', name: 'Destinées Futures' },
        { id: 'nb-explorateurs-obscurs', name: 'Explorateurs Obscurs' },
        { id: 'nb-dragons-exaltes', name: 'Dragons Exaltés' },
        { id: 'nb-frontiere-franchie', name: 'Frontières Franchies' },
        { id: 'nb-tempete-plasma', name: 'Tempête Plasma' },
        { id: 'nb-glaciation-plasma', name: 'Glaciation Plasma' },
        { id: 'nb-explosion-plasma', name: 'Explosion Plasma' },
        { id: 'nb-legendes-lumineuses', name: 'Légendes Lumineuses' }
      ]
    },
    { 
      id: 'appel-legendes', 
      name: 'Série L\'appel des légendes',
      subCategories: [
        { id: 'al-set-complet', name: 'Set Complet' },
        { id: 'al-cartes-rares', name: 'Cartes Rares' },
        { id: 'al-cartes-holo', name: 'Cartes Holo' },
        { id: 'al-promo', name: 'Cartes Promo' },
        { id: 'al-legendaires', name: 'Cartes Légendaires' }
      ]
    },
    { 
      id: 'heartgold-soulsilver', 
      name: 'Série HeartGold SoulSilver',
      subCategories: [
        { id: 'hgss-base', name: 'Set de Base' },
        { id: 'hgss-unleashed', name: 'Déchaînement' },
        { id: 'hgss-undaunted', name: 'Indomptable' },
        { id: 'hgss-triumphant', name: 'Triomphe' },
        { id: 'hgss-promo', name: 'Cartes Promo' }
      ]
    },
    { 
      id: 'platine', 
      name: 'Série Platine',
      subCategories: [
        { id: 'pt-base', name: 'Set de Base' },
        { id: 'pt-rising-rivals', name: 'Rivaux Émergents' },
        { id: 'pt-supreme-victors', name: 'Suprêmes Vainqueurs' },
        { id: 'pt-arceus', name: 'Arceus' },
        { id: 'pt-promo', name: 'Cartes Promo' }
      ]
    },
    { 
      id: 'diamant-perle', 
      name: 'Série Diamant et Perle',
      subCategories: [
        { id: 'dp-base', name: 'Set de Base' },
        { id: 'dp-mysterious-treasures', name: 'Trésors Mystérieux' },
        { id: 'dp-secret-wonders', name: 'Merveilles Secrètes' },
        { id: 'dp-great-encounters', name: 'Rencontres Légendaires' },
        { id: 'dp-majestic-dawn', name: 'Aube Majestueuse' },
        { id: 'dp-legends-awakened', name: 'Éveil des Légendes' },
        { id: 'dp-stormfront', name: 'Front Tempête' },
        { id: 'dp-promo', name: 'Cartes Promo' }
      ]
    },
    { 
      id: 'ex', 
      name: 'Série EX',
      subCategories: [
        { id: 'ex-ruby-sapphire', name: 'Rubis & Saphir' },
        { id: 'ex-sandstorm', name: 'Tempête de Sable' },
        { id: 'ex-dragon', name: 'Dragon' },
        { id: 'ex-team-magma-vs-aqua', name: 'Team Magma vs Team Aqua' },
        { id: 'ex-hidden-legends', name: 'Légendes Cachées' },
        { id: 'ex-firered-leafgreen', name: 'Rouge Feu & Vert Feuille' },
        { id: 'ex-team-rocket-returns', name: 'Retour de la Team Rocket' },
        { id: 'ex-deoxys', name: 'Deoxys' },
        { id: 'ex-emerald', name: 'Émeraude' },
        { id: 'ex-unseen-forces', name: 'Forces Cachées' },
        { id: 'ex-delta-species', name: 'Espèces Delta' },
        { id: 'ex-legend-maker', name: 'Créateur de Légendes' },
        { id: 'ex-holon-phantoms', name: 'Fantômes de Holon' },
        { id: 'ex-crystal-guardians', name: 'Gardiens de Cristal' },
        { id: 'ex-dragon-frontiers', name: 'Frontières Dragon' },
        { id: 'ex-power-keepers', name: 'Gardiens du Pouvoir' }
      ]
    },
    { 
      id: 'wizards', 
      name: 'Wizards',
      subCategories: [
        { id: 'wizards-base', name: 'Set de Base' },
        { id: 'wizards-jungle', name: 'Jungle' },
        { id: 'wizards-fossil', name: 'Fossile' },
        { id: 'wizards-base2', name: 'Set de Base 2' },
        { id: 'wizards-team-rocket', name: 'Team Rocket' },
        { id: 'wizards-gym-heroes', name: 'Gym Heroes' },
        { id: 'wizards-gym-challenge', name: 'Gym Challenge' },
        { id: 'wizards-neo-genesis', name: 'Neo Genesis' },
        { id: 'wizards-neo-discovery', name: 'Neo Discovery' },
        { id: 'wizards-neo-revelation', name: 'Neo Revelation' },
        { id: 'wizards-neo-destiny', name: 'Neo Destiny' },
        { id: 'wizards-legendary', name: 'Legendary Collection' },
        { id: 'wizards-promo', name: 'Cartes Promo' }
      ]
    }
  ],
  goodies: [
    { id: 'funko-pop', name: 'Funko Pop' },
    { id: 'figurines', name: 'Figurines' },
    { id: 'other-goodies', name: 'Autres' },
  ]
};

// Fonction utilitaire pour obtenir le nom d'une sous-catégorie à partir de son ID
export const getSubcategoryNameById = (categoryType, subcategoryId) => {
  const category = SUBCATEGORIES[categoryType];
  if (!category) return null;
  
  // Recherche directe dans la liste principale
  const subcategory = category.find(sub => sub.id === subcategoryId);
  if (subcategory) return subcategory.name;
  
  // Recherche dans les sous-sous-catégories si elles existent
  for (const mainSubcat of category) {
    if (mainSubcat.subCategories) {
      const nestedSubcat = mainSubcat.subCategories.find(sub => sub.id === subcategoryId);
      if (nestedSubcat) return nestedSubcat.name;
    }
  }
  
  return null;
};

// Fonction utilitaire pour obtenir toutes les sous-catégories disponibles sous forme de liste plate
export const getAllSubcategories = () => {
  const result = [];
  
  Object.keys(SUBCATEGORIES).forEach(categoryType => {
    SUBCATEGORIES[categoryType].forEach(sub => {
      result.push({
        categoryType,
        subcategoryId: sub.id,
        name: sub.name
      });
      
      // Ajouter les sous-sous-catégories s'il y en a
      if (sub.subCategories) {
        sub.subCategories.forEach(nestedSub => {
          result.push({
            categoryType,
            subcategoryId: nestedSub.id,
            parentSubcategoryId: sub.id,
            name: nestedSub.name
          });
        });
      }
    });
  });
  
  return result;
};

// Fonction pour vérifier si un ID de sous-catégorie est valide
export const isValidSubcategory = (categoryType, subcategoryId) => {
  if (!SUBCATEGORIES[categoryType]) return false;
  
  // Vérifier dans la liste principale
  if (SUBCATEGORIES[categoryType].some(sub => sub.id === subcategoryId)) return true;
  
  // Vérifier dans les sous-sous-catégories
  return SUBCATEGORIES[categoryType].some(mainSub => 
    mainSub.subCategories && mainSub.subCategories.some(nestedSub => nestedSub.id === subcategoryId)
  );
};

// Fonction pour obtenir le parent d'une sous-catégorie (pour TCG)
export const getParentSubcategory = (categoryType, subcategoryId) => {
  if (!SUBCATEGORIES[categoryType]) return null;
  
  for (const mainSubcat of SUBCATEGORIES[categoryType]) {
    if (mainSubcat.subCategories) {
      const isChild = mainSubcat.subCategories.some(sub => sub.id === subcategoryId);
      if (isChild) return mainSubcat;
    }
  }
  
  return null;
};