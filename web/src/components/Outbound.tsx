import { Anchor, type AnchorProps } from '@mantine/core';
import type { ReactNode } from 'react';

interface OutboundProps extends AnchorProps {
  href: string;
  children: ReactNode;
  'aria-label'?: string;
}

/** A link that leaves the app (a council's site, the docs, GitHub), so it opens in a new tab. */
export function Outbound(props: OutboundProps) {
  return <Anchor target="_blank" rel="noreferrer" {...props} />;
}
