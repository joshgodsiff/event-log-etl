import express from 'express';
import * as path from 'path';
import fs from 'node:fs/promises';
import { QueryParams } from './types';
import { parse, pUserId, pDate, pEvents } from './parser';

const router = express.Router();
const logFilePath = path.join(__dirname, '../data/events.log');
const fileContents = fs.readFile(logFilePath, 'utf-8');

router.get('/log', async (req, res) => {
  const contents = await fileContents;

  // Query params
  const { userId, eventType, fromDate, toDate } = parseParams(req.query, res);

  // Parse the log file
  const parsedEvents = parse(contents);

  if (!parsedEvents) {
    res.status(500).json({ error: 'Failed to parse log file' });
    return;
  }

  // Filter events based on query params
  const filteredEvents = parsedEvents.filter(event => {
    return (
      (!userId || event.userId === userId) &&
      (!eventType || event.eventType === eventType) &&
      (!fromDate || new Date(event.timestamp) >= new Date(fromDate)) &&
      (!toDate || new Date(event.timestamp) <= new Date(toDate))
    );
  });

  const sortedEvents = filteredEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  res.json(sortedEvents);
});

const parseParams = (query: express.Request['query'], res: express.Response):  QueryParams => {
  const { userId, eventType, fromDate, toDate } = query;

  let parsedUserId;
  let parsedEventType;
  let parsedFromDate;
  let parsedToDate;

  try {
    parsedUserId = userId ? pUserId.parse(userId as string).value : undefined;
  } catch (error) {
    res.status(400).json({ error: 'Invalid userId format' });
  }
  
  try {
    parsedEventType = eventType ? pEvents.parse(eventType as string).value : undefined;
  } catch (error) {
    res.status(400).json({ error: 'Invalid eventType format' });
  }

  try {
    parsedFromDate = fromDate ? pDate.parse(fromDate as string).value : undefined;
  } catch (error) {
    res.status(400).json({ error: 'Invalid fromDate format' });
  }

  try {
    parsedToDate = toDate ? pDate.parse(toDate as string).value : undefined;
  } catch (error) {
    res.status(400).json({ error: 'Invalid toDate format' });
  }

  return {
    'userId': parsedUserId,
    'eventType': parsedEventType,
    'fromDate': parsedFromDate,
    'toDate': parsedToDate
  };
};

export default router;
