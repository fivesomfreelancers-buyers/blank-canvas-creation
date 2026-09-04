// Curated catalog used by the freelancer verification wizard.
// Categories + subcategories (skills) come from the single source of truth in
// `@/lib/categories`, and the software/tools catalog lives in `@/lib/toolsCatalog`.

import { CATEGORIES as PLATFORM_CATEGORIES } from './categories';

export interface CategoryDef {
  id: string;
  name: string;
  subcategories: string[];
}

export const CATEGORIES: CategoryDef[] = PLATFORM_CATEGORIES.map((c) => ({
  id: c.slug,
  name: c.name,
  subcategories: c.subcategories.map((s) => s.name),
}));

export type { SoftwareDef } from './toolsCatalog';
export {
  SOFTWARE_CATALOG,
  softwareLogo,
  toolsForCategories,
  searchTools,
  findTool,
} from './toolsCatalog';

export const EXPERIENCE_OPTIONS = [
  'Less than 1 year',
  '1 year',
  '2 years',
  '3 years',
  '5+ years',
  '10+ years',
];

export const EDUCATION_OPTIONS = [
  'High School',
  'Diploma',
  'Bachelor Degree',
  'Master Degree',
  'PhD',
  'Self-Taught',
];
