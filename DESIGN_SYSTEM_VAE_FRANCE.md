# Design System VAE France

## 1. Identité Visuelle "République Numérique Premium"

L'objectif est d'inspirer confiance, institutionnalité et modernité. On s'inspire des codes de l'État (Marianne, Bleu/Blanc/Rouge) mais avec une touche "Startup d'État" fluide et accessible.

### Palette de Couleurs

**Couleurs Primaires (L'État)**
- **Bleu France** : `#0055A4` (Fondations, Header, Boutons Primaires)
- **Blanc** : `#FFFFFF` (Fonds, Cards, Espace)
- **Rouge Marianne** : `#EF4135` (Accents, Erreurs, Call-to-Action secondaires très ponctuels)

**Couleurs Secondaires (Modernité & UI)**
- **Gris Ardoise** : `#1E293B` (Texte Principal, Titres)
- **Gris Nuage** : `#F1F5F9` (Fonds de sections, Inputs inactifs)
- **Bleu Ciel** : `#E0F2FE` (Badges, Focus rings)
- **Vert Succès** : `#10B981` (Validation, Étapes complétées)

### Typographie

**Police Principale** : `Inter` (Google Fonts) ou `Marianne` (si disponible, sinon fallback sur sans-serif propre).
- **Titres (H1, H2)** : Bold / ExtraBold. Tracking serré (-0.02em).
- **Corps** : Regular / Medium. Lisibilité maximale.

### Ombres & Bordures (Glassmorphism subtil)
- **Cards** : `shadow-sm` (repos) -> `shadow-md` (hover). Bordure fine `border-slate-100`.
- **Inputs** : `border-slate-300` -> focus: `ring-2 ring-blue-600`.
- **Radius** : `rounded-lg` (8px) pour les cards, `rounded-md` (6px) pour les boutons. Pas de "fully rounded" sauf pour les badges.

---

## 2. Composants UI (Tailwind 4)

### Boutons
*   **Primaire** : `bg-[#0055A4] text-white hover:bg-[#004280] transition-all shadow-sm font-medium px-6 py-3 rounded-md`
*   **Secondaire** : `bg-white text-[#0055A4] border border-[#0055A4] hover:bg-blue-50 transition-all font-medium px-6 py-3 rounded-md`
*   **Ghost** : `text-slate-600 hover:text-[#0055A4] hover:bg-slate-100 px-4 py-2 rounded-md`

### Inputs & Formulaires
*   **Label** : `block text-sm font-medium text-slate-700 mb-1`
*   **Input** : `w-full border-slate-300 rounded-md shadow-sm focus:ring-[#0055A4] focus:border-[#0055A4] sm:text-sm py-2.5`
*   **Erreur** : `text-[#EF4135] text-sm mt-1`

### Cards
*   **Container** : `bg-white rounded-xl shadow-sm border border-slate-100 p-6`

---

## 3. Layouts & Structure

### Header
*   Logo "République" ou "France VAE" à gauche.
*   Navigation simple à droite.
*   Fond Blanc, Border-bottom subtile.

### Footer
*   Fond `#1E293B` (Dark Slate).
*   Liens légaux obligatoires.
*   Logo "Marianne" en monochrome blanc.

### Grille
*   Container centré `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
*   Espacement aéré (`gap-8`, `py-12`).

---

## 4. Expérience Utilisateur (UX)

*   **Feedback immédiat** : Spinners sur les actions, Toasts pour les succès/erreurs.
*   **Accessibilité** : Contraste AA minimum. Focus visible.
*   **Mobile First** : Tout doit être parfaitement navigable sur mobile.
