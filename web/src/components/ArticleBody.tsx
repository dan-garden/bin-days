import { Text } from '@mantine/core';
import type { PageData } from '../../../src/api/site.js';
import { formatDate } from '../lib.js';

/** A written page: a guide, or one of the site's own pages. */
export function ArticleBody({ article }: { article: NonNullable<PageData['article']> }) {
  return (
    <article className="article">
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: written in this repository and built by the server. */}
      <div className="prose" dangerouslySetInnerHTML={{ __html: article.html }} />
      <Text size="sm" c="dimmed" mt="xl">
        Last checked{' '}
        {formatDate(article.updated, { day: 'numeric', month: 'long', year: 'numeric' })}
      </Text>
    </article>
  );
}
