import { suburbPath } from '../../../src/councils/names.js';

/** A plain list of links to the pages of a council's suburbs. */
export function SuburbLinks({ council, suburbs }: { council: { id: string }; suburbs: string[] }) {
  return (
    <ul className="council-links">
      {suburbs.map((suburb) => (
        <li key={suburb}>
          <a href={suburbPath(council, suburb)}>{suburb}</a>
        </li>
      ))}
    </ul>
  );
}
