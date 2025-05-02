export function lookupKeyToObjectNested(object: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  // Groupe les clés par leur préfixe (avant le premier point)
  const groupedKeys: Record<string, string[]> = {};
  
  // Identifie les clés avec points et les regroupe
  for (const key of Object.keys(object)) {
    if (key.includes('.')) {
      const [prefix] = key.split('.');
      if (!groupedKeys[prefix]) {
        groupedKeys[prefix] = [];
      }
      groupedKeys[prefix].push(key);
    } else {
      // Copie les clés simples telles quelles
      result[key] = object[key];
    }
  }
  
  // Traite chaque groupe
  for (const [prefix, keys] of Object.entries(groupedKeys)) {
    // Vérifie si les valeurs sont des tableaux
    const arrayKeys = keys.filter(key => Array.isArray(object[key]));
    const allArrays = arrayKeys.length > 0 && arrayKeys.length === keys.length;
    
    if (allArrays) {
      // Détermine la longueur du tableau (en prenant la longueur du premier tableau)
      const arrayLength = object[arrayKeys[0]].length;
      
      // Crée un tableau d'objets
      result[prefix] = [];
      
      // Pour chaque position dans les tableaux
      for (let i = 0; i < arrayLength; i++) {
        const item: Record<string, any> = {};
        
        // Pour chaque propriété
        for (const key of keys) {
          // Gestion des clés imbriquées (ex: "prop.subprop.value")
          const path = key.substring(prefix.length + 1).split('.');
          
          if (i < object[key].length) {
            const value = object[key][i]; // Récupère la valeur à cette position
            setNestedValue(item, path, value);
          }
        }
        
        result[prefix].push(item);
      }
    } else {
      // Crée une structure d'objet imbriquée
      result[prefix] = {};
      
      for (const key of keys) {
        // Gestion des clés imbriquées (ex: "prop.subprop.value")
        const path = key.substring(prefix.length + 1).split('.');
        setNestedValue(result[prefix], path, object[key]);
      }
    }
  }
  
  return result;
}

/**
 * Définit une valeur dans un objet en suivant un chemin de propriétés imbriquées
 */
function setNestedValue(obj: Record<string, any>, path: string[], value: any): void {
  if (path.length === 1) {
    // Cas de base: on définit la valeur
    obj[path[0]] = value;
    return;
  }
  
  // Cas récursif: on crée l'objet intermédiaire s'il n'existe pas
  const key = path[0];
  if (!obj[key] || typeof obj[key] !== 'object') {
    obj[key] = {};
  }
  
  // On continue avec le reste du chemin
  setNestedValue(obj[key], path.slice(1), value);
}
