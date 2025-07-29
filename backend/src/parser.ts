import { UserEvent } from './types';

import * as p from 'parjs'
import * as c from 'parjs/combinators';

/*
I have a rule with take-home coding assignments: They have to be in some way fun, and I have to learn something new.

I've never used parser combinators in JS/TS before, and this seemed like a fun toy problem to try them out on.

Is this better/more sensible than just throwing regex and .split() at the problem? Probably not.

Was it more entertaining and educational? Absolutely.
*/

// Unclear if we want to accept TZ info, so I didn't.
const validDateChars = p.anyCharOf('0123456789-:T');

// Probably more sensible to make this just a regular string, but equally I'd generally try to restrict events
// to some known set of values, so you could go either way with this.
export const pEvents = p.anyStringOf('submit_form', 'click_button', 'view_page', 'logout');

export const pUserId = p.int();

export const pDateSep = p.string(' - ');
export const userStr = p.string('User ');
export const eventStr = p.string('Event: ');

export const pDate = validDateChars.pipe(
  c.many(),
  c.stringify(),
  c.map((dateStr) => {
    return new Date(dateStr);
  })
);

export const pDateWithSep = pDate.pipe(
  c.thenq(pDateSep),
);

export const pUser = userStr.pipe(
  c.qthen(pUserId),
  c.thenq(p.whitespace())
);

export const pEvent = eventStr.pipe(
  c.qthen(pEvents)
);

export const pLine = p.noCharOf('\n').pipe(
  c.many(),
  c.stringify(),
  c.backtrack(), // This lets us capture the line without consuming it.
  c.then(pDateWithSep),
  c.then(pUser),
  c.then(pEvent)
).pipe(
  c.map((values) => {
    const [[[originalLine, timestamp], userId], eventType] = values;

    return {
      timestamp,
      userId,
      eventType,
      originalLine
    };
  })
);

export const pFile = pLine.pipe(
  c.manySepBy(p.newline()),
  c.thenq(
    p.newline().pipe(c.or(p.eof())), // Allow for a trailing newline or end of file
  )
);

export function parse(input: string): UserEvent[] | null {
  const result = pFile.parse(input);

  if (result.kind !== p.ResultKind.Ok) {
        return null;
    } else {
      return result.value;
    }
};
