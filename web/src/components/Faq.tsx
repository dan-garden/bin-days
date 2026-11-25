import { Stack, Title } from '@mantine/core';
import type { PageData } from '../../../src/api/site.js';

/** Common questions, each opening to its answer. The answers are the site's own HTML. */
export function Faq({ faq }: { faq: NonNullable<PageData['faq']> }) {
  return (
    <section className="faq">
      <Stack gap="sm">
        <Title order={2} size="h3">
          Common questions
        </Title>
        <div className="faq-list">
          {faq.map(({ question, answer }) => (
            <details key={question} className="faq-item">
              <summary>{question}</summary>
              {/* biome-ignore lint/security/noDangerouslySetInnerHtml: written in this repository and built by the server. */}
              <div className="prose" dangerouslySetInnerHTML={{ __html: answer }} />
            </details>
          ))}
        </div>
      </Stack>
    </section>
  );
}
