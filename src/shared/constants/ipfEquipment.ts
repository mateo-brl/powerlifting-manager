/**
 * Constantes pour l'équipement approuvé IPF
 * Liste officielle des marques approuvées par l'IPF pour les compétitions
 * Source: IPF Approved List (mise à jour 2024)
 */

export interface EquipmentBrand {
  name: string;
  country?: string;
  website?: string;
}

export interface IPFApprovedEquipment {
  singlets: EquipmentBrand[];
  belts: EquipmentBrand[];
  knee_sleeves: EquipmentBrand[];
  wrist_wraps: EquipmentBrand[];
  shoes: EquipmentBrand[];
}

export const IPF_APPROVED_EQUIPMENT: IPFApprovedEquipment = {
  singlets: [
    { name: 'SBD', country: 'UK', website: 'https://sbdapparel.com' },
    { name: 'Titan', country: 'USA', website: 'https://titansupport.com' },
    { name: 'Inzer', country: 'USA', website: 'https://inzernet.com' },
    { name: 'Metal', country: 'Israel', website: 'https://gometal.com' },
    { name: 'A7', country: 'USA', website: 'https://a7.co' },
    { name: 'Strengthshop', country: 'UK', website: 'https://strengthshop.co.uk' },
    { name: 'Eleiko', country: 'Sweden', website: 'https://eleiko.com' },
    { name: 'Wahlanders', country: 'Sweden', website: 'https://wahlanders.com' },
    { name: 'Cerberus', country: 'Australia', website: 'https://cerberus-strength.com' },
    { name: 'Virus', country: 'USA', website: 'https://virus.com' },
  ],
  belts: [
    { name: 'SBD', country: 'UK', website: 'https://sbdapparel.com' },
    { name: 'Inzer', country: 'USA', website: 'https://inzernet.com' },
    { name: 'Pioneer', country: 'USA', website: 'https://generalleathercraft.com' },
    { name: 'Eleiko', country: 'Sweden', website: 'https://eleiko.com' },
    { name: 'Wahlanders', country: 'Sweden', website: 'https://wahlanders.com' },
    { name: 'Titan', country: 'USA', website: 'https://titansupport.com' },
    { name: 'Strengthshop', country: 'UK', website: 'https://strengthshop.co.uk' },
    { name: 'Metal', country: 'Israel', website: 'https://gometal.com' },
    { name: 'Best Belts', country: 'USA', website: 'https://bestbelts.net' },
    { name: 'Cerberus', country: 'Australia', website: 'https://cerberus-strength.com' },
  ],
  knee_sleeves: [
    { name: 'SBD', country: 'UK', website: 'https://sbdapparel.com' },
    { name: 'Titan', country: 'USA', website: 'https://titansupport.com' },
    { name: 'Rehband', country: 'Sweden', website: 'https://rehband.com' },
    { name: 'Strengthshop', country: 'UK', website: 'https://strengthshop.co.uk' },
    { name: 'Eleiko', country: 'Sweden', website: 'https://eleiko.com' },
    { name: 'Metal', country: 'Israel', website: 'https://gometal.com' },
    { name: 'A7', country: 'USA', website: 'https://a7.co' },
    { name: 'Cerberus', country: 'Australia', website: 'https://cerberus-strength.com' },
    { name: 'Inzer', country: 'USA', website: 'https://inzernet.com' },
  ],
  wrist_wraps: [
    { name: 'SBD', country: 'UK', website: 'https://sbdapparel.com' },
    { name: 'Titan', country: 'USA', website: 'https://titansupport.com' },
    { name: 'Inzer', country: 'USA', website: 'https://inzernet.com' },
    { name: 'Strengthshop', country: 'UK', website: 'https://strengthshop.co.uk' },
    { name: 'Metal', country: 'Israel', website: 'https://gometal.com' },
    { name: 'Gangsta Wraps', country: 'USA', website: 'https://markbellslingshot.com' },
    { name: 'A7', country: 'USA', website: 'https://a7.co' },
    { name: 'Cerberus', country: 'Australia', website: 'https://cerberus-strength.com' },
    { name: 'Pioneer', country: 'USA', website: 'https://generalleathercraft.com' },
  ],
  shoes: [
    { name: 'Adidas', country: 'Germany', website: 'https://adidas.com' },
    { name: 'Nike', country: 'USA', website: 'https://nike.com' },
    { name: 'Reebok', country: 'USA', website: 'https://reebok.com' },
    { name: 'ASICS', country: 'Japan', website: 'https://asics.com' },
    { name: 'Sabo', country: 'Russia', website: 'https://saboshoes.com' },
    { name: 'VS Athletics', country: 'USA', website: 'https://vsathletics.com' },
    { name: 'Notorious Lift', country: 'USA', website: 'https://notoriouslift.com' },
    { name: 'Do-Win', country: 'China' },
    { name: 'Metal', country: 'Israel', website: 'https://gometal.com' },
    { name: 'Titan', country: 'USA', website: 'https://titansupport.com' },
    { name: 'Converse', country: 'USA', website: 'https://converse.com' },
  ],
};

/**
 * Retourne la liste des noms de marques pour une catégorie donnée
 */
export function getApprovedBrandNames(category: keyof IPFApprovedEquipment): string[] {
  return IPF_APPROVED_EQUIPMENT[category].map((brand) => brand.name);
}

/**
 * Vérifie si une marque est approuvée IPF pour une catégorie donnée
 */
export function isIPFApproved(
  category: keyof IPFApprovedEquipment,
  brandName: string
): boolean {
  const normalizedBrand = brandName.toLowerCase().trim();
  return IPF_APPROVED_EQUIPMENT[category].some(
    (brand) => brand.name.toLowerCase() === normalizedBrand
  );
}

/**
 * Retourne toutes les marques approuvées sous forme de liste plate pour autocomplete
 */
export function getAllApprovedBrandsForAutocomplete(): { value: string; label: string; category: string }[] {
  const result: { value: string; label: string; category: string }[] = [];

  const categoryLabels: Record<keyof IPFApprovedEquipment, string> = {
    singlets: 'Combinaison',
    belts: 'Ceinture',
    knee_sleeves: 'Genouillères',
    wrist_wraps: 'Bandes de poignets',
    shoes: 'Chaussures',
  };

  for (const [category, brands] of Object.entries(IPF_APPROVED_EQUIPMENT)) {
    for (const brand of brands) {
      result.push({
        value: brand.name,
        label: brand.name,
        category: categoryLabels[category as keyof IPFApprovedEquipment],
      });
    }
  }

  return result;
}

/**
 * Spécifications IPF pour l'équipement
 */
export const IPF_EQUIPMENT_SPECS = {
  belt: {
    max_width_cm: 10,
    max_thickness_mm: 13,
    material: 'leather',
  },
  knee_sleeves: {
    max_length_cm: 30,
    max_thickness_mm: 7,
  },
  wrist_wraps: {
    max_length_cm: 100, // 1 mètre incluant boucle pouce
    max_width_cm: 8,
  },
  singlet: {
    must_cover_torso: true,
    no_support_material: true,
  },
} as const;
