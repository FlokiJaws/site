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
      { id: 'other-retro', name: 'Autres' },
    ],
    tcg: [
      { id: 'ecarlate-violet', name: 'Série Ecarlate et Violet' },
      { id: 'epee-bouclier', name: 'Série Epée et Bouclier' },
      { id: 'soleil-lune', name: 'Série Soleil et Lune' },
      { id: 'xy', name: 'Série XY' },
      { id: 'noir-blanc', name: 'Série Noir et Blanc' },
      { id: 'appel-legendes', name: 'Série L\'appel des légendes' },
      { id: 'heartgold-soulsilver', name: 'Série HeartGold SoulSilver' },
      { id: 'platine', name: 'Série Platine' },
      { id: 'diamant-perle', name: 'Série Diamant et Perle' },
      { id: 'ex', name: 'Série EX' },
      { id: 'wizards', name: 'Wizards' },
      { id: 'other-tcg', name: 'Autres' },
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
    
    const subcategory = category.find(sub => sub.id === subcategoryId);
    return subcategory ? subcategory.name : null;
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
      });
    });
    
    return result;
  };
  
  // Fonction pour vérifier si un ID de sous-catégorie est valide
  export const isValidSubcategory = (categoryType, subcategoryId) => {
    if (!SUBCATEGORIES[categoryType]) return false;
    return SUBCATEGORIES[categoryType].some(sub => sub.id === subcategoryId);
  };