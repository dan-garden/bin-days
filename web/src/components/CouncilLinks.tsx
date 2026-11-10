import { councilPath, shortCouncilName } from '../../../src/councils/names.js';
import type { CouncilLink } from '../api.js';

interface CouncilLinksProps {
  councils: CouncilLink[];
  /** Show each council's state, for lists that mix states. */
  showState?: boolean;
  /** Called with a council id while the pointer or focus is on its link, and with nothing after. */
  onHover?: (council?: string) => void;
}

/** A plain list of links to council pages. */
export function CouncilLinks({ councils, showState, onHover }: CouncilLinksProps) {
  return (
    <ul className="council-links">
      {councils.map((council) => (
        <li key={council.id}>
          <a
            href={councilPath(council)}
            onMouseEnter={() => onHover?.(council.id)}
            onMouseLeave={() => onHover?.()}
            onFocus={() => onHover?.(council.id)}
            onBlur={() => onHover?.()}
          >
            {shortCouncilName(council.name)}
            {showState && <span className="council-links-state">{council.state}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
