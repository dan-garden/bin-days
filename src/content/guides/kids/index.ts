import type { Article } from '../../articles.js';
import { truckScene } from '../../illustrations.js';
import { markdownToHtml } from '../../markdown.js';
import { kidsBinHeroes } from './bin-heroes.js';
import { kidsLitterAndWildlife } from './litter-and-wildlife.js';
import { kidsReduceReuseRecycle } from './reduce-reuse-recycle.js';
import { kidsResources } from './resources.js';
import { kidsWhereRubbishGoes } from './where-does-rubbish-go.js';
import { kidsWhichBin } from './which-bin.js';

/** The kids' guides, in reading order. Each sits under the "For kids" page in the breadcrumb. */
export const KIDS_GUIDES: Article[] = [
  kidsWhichBin,
  kidsReduceReuseRecycle,
  kidsWhereRubbishGoes,
  kidsLitterAndWildlife,
  kidsBinHeroes,
  kidsResources,
];

export const kidsIndex: Article = {
  path: '/guides/kids',
  title: 'Bins and recycling for kids',
  seoTitle: 'Recycling for kids: bins and rubbish explained | Bin Days',
  description:
    'Fun, simple guides for kids (and the grown-ups helping them) about bins, recycling, rubbish and looking after the planet, made in Australia.',
  updated: '2026-11-26',
  related: ['/which-bin', '/guides/bin-lid-colours', '/data/bin-collections'],
  html:
    truckScene('lime', 'A bin truck lifting a green bin with its robot arm.') +
    markdownToHtml(`
Where does rubbish go? Why do bins have different coloured lids? How can you help? These guides answer the big questions about bins and recycling, with pictures, quizzes and things to try at home or at school.

${KIDS_GUIDES.map((guide) => `## [${guide.title}](${guide.path})\n\n${guide.description}`).join('\n\n')}`),
};
