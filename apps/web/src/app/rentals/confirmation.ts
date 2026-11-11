/**
 * Mot de confirmation exige par les retraits et suppressions du module Location.
 *
 * Volontairement partage entre l'interface et les actions serveur : les deux
 * cotes doivent appliquer exactement la meme regle, sinon le bouton peut etre
 * actif alors que le serveur refuse (ou l'inverse).
 */
export const CONFIRMATION_WORD = "SUPPRIMER";

/**
 * Vrai uniquement pour le mot exact, espaces de bordure mis a part.
 * La casse n'est pas normalisee : la confirmation doit rester un geste
 * deliberé, pas une frappe approximative.
 */
export function isConfirmationWord(value: string): boolean {
  return value.trim() === CONFIRMATION_WORD;
}
