import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

const LEVELS = [
  {
    label: '🗺️  Orientation',
    collapsed: false,
    items: [
      { label: "Vue d'ensemble", link: '/00-orientation/' },
      { label: "Carte de l'écosystème", link: '/00-orientation/ecosystem-map/' },
      { label: "Quiz d'orientation", link: '/00-orientation/quiz-orientation/' },
      { label: 'Comment utiliser ce parcours', link: '/00-orientation/how-to/' },
    ],
  },
  {
    label: '01 — Fondations',
    collapsed: true,
    items: [
      { label: "Vue d'ensemble", link: '/01-fondations/' },
      { label: 'Les modèles', link: '/01-fondations/models/' },
      { label: "L'agentic loop", link: '/01-fondations/agentic-loop/' },
      { label: 'Le context window', link: '/01-fondations/context-window/' },
      { label: 'CLAUDE.md', link: '/01-fondations/claude-md/' },
      { label: 'Mémoire & sessions', link: '/01-fondations/memory-sessions/' },
      { label: '🧪 Lab 01', link: '/01-fondations/lab-01/', badge: { text: 'Lab', variant: 'tip' } },
    ],
  },
  {
    label: '02 — CLI Mastery',
    collapsed: true,
    items: [
      { label: "Vue d'ensemble", link: '/02-cli-mastery/' },
      { label: 'CLI flags', link: '/02-cli-mastery/cli-flags/' },
      { label: 'Slash commands', link: '/02-cli-mastery/slash-commands/' },
      { label: 'Checkpointing', link: '/02-cli-mastery/checkpointing/' },
      { label: 'Hooks', link: '/02-cli-mastery/hooks/' },
      { label: 'Permission modes', link: '/02-cli-mastery/permission-modes/' },
      { label: 'Sessions avancées', link: '/02-cli-mastery/sessions-advanced/' },
      { label: '🧪 Lab 02', link: '/02-cli-mastery/lab-02/', badge: { text: 'Lab', variant: 'tip' } },
    ],
  },
  {
    label: '03 — Multi-agents',
    collapsed: true,
    items: [
      { label: "Vue d'ensemble", link: '/03-multi-agents/' },
      { label: 'Subagents', link: '/03-multi-agents/subagents/' },
      { label: 'Agent Teams', link: '/03-multi-agents/agent-teams/' },
      { label: 'Skills', link: '/03-multi-agents/skills/' },
      { label: 'MCP', link: '/03-multi-agents/mcp/' },
      { label: 'Plugins', link: '/03-multi-agents/plugins/' },
      { label: 'Architecture challenge', link: '/03-multi-agents/challenge-architecture/' },
      { label: '🧪 Lab 03', link: '/03-multi-agents/lab-03/', badge: { text: 'Lab', variant: 'tip' } },
    ],
  },
  {
    label: '04 — Production',
    collapsed: true,
    items: [
      { label: "Vue d'ensemble", link: '/04-production/' },
      { label: 'GitHub Actions', link: '/04-production/github-actions/' },
      { label: 'Agent SDK (Python)', link: '/04-production/agent-sdk-python/' },
      { label: 'Agent SDK (TypeScript)', link: '/04-production/agent-sdk-typescript/' },
      { label: 'Sandboxing', link: '/04-production/sandboxing/' },
      { label: 'Routines', link: '/04-production/routines/' },
      { label: 'Managed Agents', link: '/04-production/managed-agents/' },
      { label: '🧪 Lab 04', link: '/04-production/lab-04/', badge: { text: 'Lab', variant: 'tip' } },
    ],
  },
  {
    label: '05 — Expert',
    collapsed: true,
    badge: { text: 'Expert', variant: 'caution' },
    items: [
      { label: "Vue d'ensemble", link: '/05-expert/' },
      { label: 'UltraPlan & UltraReview', link: '/05-expert/ultraplan-ultrareview/' },
      { label: 'Cowork & Claude Design', link: '/05-expert/cowork-claude-design/' },
      { label: 'Context Engineering', link: '/05-expert/context-engineering/' },
      { label: 'Patterns avancés', link: '/05-expert/advanced-patterns/' },
      { label: '🧪 Lab 05 — Capstone', link: '/05-expert/lab-05/', badge: { text: 'Capstone', variant: 'caution' } },
    ],
  },
  {
    label: '📚 Référence',
    collapsed: true,
    items: [
      { label: 'Slash commands', link: '/reference/slash-commands/' },
      { label: 'CLI flags', link: '/reference/cli-flags/' },
      { label: "Variables d'env", link: '/reference/env-vars/' },
      { label: 'Hooks events', link: '/reference/hooks-events/' },
      { label: 'Frontmatter subagents', link: '/reference/frontmatter-fields/' },
      { label: 'Settings keys', link: '/reference/settings-keys/' },
    ],
  },
  {
    label: '🎯 Architecture Patterns',
    collapsed: true,
    badge: { text: 'Expert', variant: 'caution' },
    items: [
      { label: 'Doer / Judge', link: '/architecture-patterns/doer-judge/' },
      { label: 'Fan-out', link: '/architecture-patterns/fan-out/' },
      { label: 'Writer / Reviewer', link: '/architecture-patterns/writer-reviewer/' },
      { label: 'Context engineering', link: '/architecture-patterns/context-engineering/' },
    ],
  },
  {
    label: '🃏 Flashcards',
    collapsed: true,
    items: [
      { label: "Vue d'ensemble", link: '/flashcards/' },
      { label: 'N0 — Orientation', link: '/flashcards/n0/' },
      { label: 'N1 — Fondations', link: '/flashcards/n1/' },
      { label: 'N2 — CLI Mastery', link: '/flashcards/n2/' },
      { label: 'N3 — Multi-agents', link: '/flashcards/n3/' },
      { label: 'N4 — Production', link: '/flashcards/n4/' },
      { label: 'N5 — Expert', link: '/flashcards/n5/' },
    ],
  },
];

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  integrations: [
    starlight({
      title: 'Claude Code Mastery',
      description:
        "Parcours d'apprentissage complet de l'écosystème Claude — du CLI aux agents en production.",
      defaultLocale: 'root',
      locales: {
        root: { label: 'Français', lang: 'fr' },
      },
      logo: {
        src: './src/assets/logo.svg',
        replacesTitle: false,
      },
      social: {
        github: 'https://github.com/tonrepo/claude-mastery',
      },
      sidebar: LEVELS,
      customCss: ['./src/styles/custom.css', './src/styles/tailwind.css'],
      components: {
        Header: './src/components/Header.astro',
        Footer: './src/components/Footer.astro',
      },
      lastUpdated: true,
      pagination: true,
    }),
    react(),
    tailwind({ applyBaseStyles: false, configFile: './tailwind.config.mjs' }),
  ],
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  vite: {
    ssr: {
      noExternal: ['@supabase/ssr'],
    },
  },
});
