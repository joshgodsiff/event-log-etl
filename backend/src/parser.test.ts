import * as path from 'path';
import fs from 'node:fs';

import {
  pLine,
  pDate,
  pUser,
  pEvent,
  pDateWithSep,
  pDateSep,
  pFile,
  parse,
} from './parser';

describe('Parser Tests', () => {
  it('should parse the actual data file', () => {
    const logFilePath = path.join(__dirname, '../data/events.log');

    const fileContent = fs.readFileSync(logFilePath, 'utf-8');
    const result = parse(fileContent);

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(100);

    if (result === null) {
      throw new Error('Parsing failed, result is null');
    }

    // Line 1
    // 2024-03-01T07:48:16 - User 101 Event: submit_form
    const firstEvent = result[0];
    expect(firstEvent).toEqual({
      timestamp: new Date('2024-03-01T07:48:16'),
      userId: 101,
      eventType: 'submit_form',
      originalLine: '2024-03-01T07:48:16 - User 101 Event: submit_form'
    });

    // Line 42
    // 2024-02-29T05:59:59 - User 102 Event: submit_form
    const fortySecondEvent = result[41];
    expect(fortySecondEvent).toEqual({
      timestamp: new Date('2024-02-29T05:59:59'),
      userId: 102,
      eventType: 'submit_form',
      originalLine: '2024-02-29T05:59:59 - User 102 Event: submit_form'
    });

    // Line 100
    // 2024-03-01T07:26:57 - User 103 Event: logout
    const hundredthEvent = result[99];
    expect(hundredthEvent).toEqual({
      timestamp: new Date('2024-03-01T07:26:57'),
      userId: 103,
      eventType: 'logout',
      originalLine: '2024-03-01T07:26:57 - User 103 Event: logout'
    });
  })


  it('should parse multiple lines correctly', () => {
    const lines = 
`2024-03-02T05:27:26 - User 103 Event: click_button
2024-03-01T02:52:14 - User 102 Event: view_page
2024-02-29T13:02:50 - User 103 Event: logout
`;
    const result = pFile.parse(lines);

    expect(result.value).toHaveLength(3);

    const [one, two, three] = result.value;

    expect(one).toEqual({
      timestamp: new Date('2024-03-02T05:27:26'),
      userId: 103,
      eventType: 'click_button',
      originalLine: '2024-03-02T05:27:26 - User 103 Event: click_button'
    });

    expect(two).toEqual({
      timestamp: new Date('2024-03-01T02:52:14'),
      userId: 102,
      eventType: 'view_page',
      originalLine: '2024-03-01T02:52:14 - User 102 Event: view_page'
    });

    expect(three).toEqual({
      timestamp: new Date('2024-02-29T13:02:50'),
      userId: 103,
      eventType: 'logout',
      originalLine: '2024-02-29T13:02:50 - User 103 Event: logout'
    });
  })

  it('should parse a line correctly', () => {
    const line = '2024-03-01T07:48:16 - User 101 Event: submit_form';
    const parsed = pLine.parse(line);

    expect(parsed.value).toEqual({
      timestamp: new Date('2024-03-01T07:48:16'),
      userId: 101,
      eventType: 'submit_form',
      originalLine: line
    });
  })

  it('dateSep parser should parse the date separator correctly', () => {
    const dateSepStr = ' - ';
    const parsedDateSep = pDateSep.parse(dateSepStr);
    expect(parsedDateSep.value).toBe(' - ');
  });

  it('should parse a date correctly', () => {
    const dateStr = '2024-03-01T07:48:16';
    const parsedDate = pDate.parse(dateStr);
    expect(parsedDate.value).toEqual(new Date('2024-03-01T07:48:16'));
  });

  it('should parse a date with separator correctly', () => {
    const dateWithSepStr = '2024-03-01T07:48:16 - ';
    const parsedDateWithSep = pDateWithSep.parse(dateWithSepStr);
    expect(parsedDateWithSep.value).toEqual(new Date('2024-03-01T07:48:16'));
  });

  it('should parse a user ID correctly', () => {
    const userIdStr = 'User 101';
    const parsedUserId = pUser.parse(userIdStr);
    expect(parsedUserId.value).toBe(101);
  });

  it('should parse an event type correctly', () => {
    const eventTypeStr = 'Event: submit_form';
    const parsedEventType = pEvent.parse(eventTypeStr);
    expect(parsedEventType.value).toBe('submit_form');
  });
});