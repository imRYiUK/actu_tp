/**
 * Utilitaires pour la gestion des URLs avec des caractères spéciaux
 */

/**
 * Encode un nom de catégorie pour l'utiliser dans une URL
 * @param categoryName - Le nom de la catégorie à encoder
 * @returns Le nom encodé pour l'URL
 */
export function encodeCategoryName(categoryName: string): string {
  return encodeURIComponent(categoryName);
}

/**
 * Décode un nom de catégorie depuis une URL
 * @param encodedName - Le nom encodé depuis l'URL
 * @returns Le nom décodé
 */
export function decodeCategoryName(encodedName: string): string {
  return decodeURIComponent(encodedName);
}

/**
 * Génère une URL sécurisée pour une catégorie
 * @param categoryName - Le nom de la catégorie
 * @returns L'URL complète pour la catégorie
 */
export function getCategoryUrl(categoryName: string): string {
  return `/categories/${encodeCategoryName(categoryName)}`;
} 