// Remark config — lint MDX/Markdown du contenu Starlight.
//
// Stratégie : preset "recommended" (erreurs structurelles : refs cassées,
// tableaux malformés, etc.) puis on désactive les règles trop bruyantes
// pour de la prose pédagogique en français.
//
// Lancement :
//   npx remark "src/content/docs/**/*.{md,mdx}" --quiet --frail   # CI
//   npx remark "src/content/docs/**/*.{md,mdx}" --quiet           # check local
//
// Le plugin `remark-mdx` est obligatoire pour parser les imports + JSX
// inline des pages MDX. Sans lui, remark échoue dès la première page.

import remarkFrontmatter from 'remark-frontmatter';
import remarkMdx from 'remark-mdx';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';

export default {
  plugins: [
    // Parser : MDX + frontmatter YAML.
    remarkMdx,
    [remarkFrontmatter, ['yaml']],

    // Preset de base — détecte les vrais bugs structurels.
    remarkPresetLintRecommended,

    // ────────── Tweaks par règle ──────────

    // Désactivé : les imports MDX en début de fichier sont vus comme du HTML
    // par remark — faux positif systématique sur Starlight.
    ['remark-lint-no-html', false],

    // Désactivé : on autorise les liens internes en relatif et les anchors
    // de Starlight qui ne sont pas résolus côté remark (il ne connaît pas
    // les routes dynamiques).
    ['remark-lint-no-undefined-references', false],

    // Désactivé : Starlight pages MDX ont parfois plusieurs H1 implicites
    // via Component imports. Le titre H1 est géré par le frontmatter.
    ['remark-lint-no-multiple-toplevel-headings', false],

    // Permissif : les codeblocks sans langage sont OK pour de la sortie
    // brute / de l'output console. On laisse mais sans erreur.
    ['remark-lint-fenced-code-flag', false],

    // Strict : les listes doivent utiliser un seul style de bullet.
    ['remark-lint-unordered-list-marker-style', '-'],

    // Strict : on impose l'ordre `1.`, `2.`, `3.` (pas `1.`, `1.`, `1.`).
    ['remark-lint-ordered-list-marker-value', 'ordered'],
  ],
};
