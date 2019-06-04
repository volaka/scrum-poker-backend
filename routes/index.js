import { Router } from 'express';
import { getClient } from '../util/pgClient';
// eslint-disable-next-line new-cap
const router = Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.json({ result: 'Ok' });
});

router.post('/sprint', async (req, res) => {
  const { name, voter, storyList } = req.body;

  // Check if the required fields are correct
  if (!name || voter === undefined || !storyList) {
    res.status(400).json({ result: 'Some fields are empty.', name, voter, storyList });
    return;
  }

  try {
    // Get Database client and connect
    const client = getClient();
    await client.connect();

    // Add new sprint to database
    const insertSprintQuery = 'INSERT INTO sprint(name, vote_count, dev_link) ' +
      'VALUES($1,$2,$1) RETURNING *';
    const insertSprintValues = [name, voter];
    const insertSprint = await client.query(insertSprintQuery, insertSprintValues);

    // Split stories by new line and insert each of them
    // Make active the first entry and make not voted the rest of them
    const insertStoryQuery = 'INSERT INTO story(name, status, s_id) ' +
      'VALUES($1,$2,$3) RETURNING *';
    const stories = storyList.split('\n');
    for (let i = 0; i < stories.length; i++) {
      const insertStoryValues = [
        stories[i],
        i === 0 ? 'Active' : 'Not Voted',
        insertSprint.rows[0].id
      ];
      await client.query(insertStoryQuery, insertStoryValues);
    }
    // Close connection
    await client.end();

    // Return success message
    res.status(200).json({ result: 'Sprint created.', name });
  } catch (e) {
    res.status(500).json({ result: e.message });
    console.error(e);
  }
});

router.get('/sprint/:name', async (req, res) => {
  const name = req.params.name;
  try {
    // Get Database client and connect
    const client = getClient();
    await client.connect();

    // Get sprint from database
    const getSprintQuery = 'SELECT * FROM sprint WHERE name=$1';
    const getSprintValues = [name];
    const getSprint = await client.query(getSprintQuery, getSprintValues);

    // Close connection
    await client.end();

    if (getSprint.rows.length === 0) {
      res.status(404).json({ result: 'There is no sprint with specified name.' });
      return;
    }
    res.status(200).json({ result: getSprint.rows[0] });
  } catch (e) {
    res.status(500).json({ result: e.message });
    console.error(e);
  }
});

router.get('/sprint/:name/stories', async (req, res) => {
  const name = req.params.name;
  try {
    // Get Database client and connect
    const client = getClient();
    await client.connect();

    // Get sprint from database
    const getStoriesQuery = 'SELECT story.id, story.name, story.status, story.point ' +
      'FROM story ' +
      'INNER JOIN sprint ON story.s_id=sprint.id ' +
      'where sprint.name=$1 order by story.id';
    const getStoriesValues = [name];
    const getStories = await client.query(getStoriesQuery, getStoriesValues);

    // Close connection
    await client.end();

    if (getStories.rows.length === 0) {
      res.status(404).json({ result: 'There are no stories associated with specified sprint.' });
      return;
    }
    res.status(200).json({ result: getStories.rows });
  } catch (e) {
    res.status(500).json({ result: e.message });
    console.error(e);
  }
});

router.get('/sprint/:name/active/votes', async (req, res) => {
  const name = req.params.name;
  try {
    // Get Database client and connect
    const client = getClient();
    await client.connect();

    // Get sprint from database
    const getStoryVotesQuery = 'SELECT vote.id, sprint.name, story.name, vote.point, vote.voter ' +
      '  FROM sprint ' +
      '  LEFT JOIN story ON story.s_id=sprint.id ' +
      '  LEFT JOIN vote ON vote.s_id=story.id ' +
      '    where sprint.name=$1 and story.status=\'Active\'\n';
    const getStoryVotesValues = [name];
    const getStoryVotes = await client.query(getStoryVotesQuery, getStoryVotesValues);

    // Close connection
    await client.end();

    res.status(200).json({ result: getStoryVotes.rows });
  } catch (e) {
    res.status(500).json({ result: e.message });
    console.error(e);
  }
});

router.post('/story/vote', async (req, res) => {
  const { storyId, point, voter } = req.body;
  if (storyId === undefined || !point || voter === undefined) {
    res.status(400).json({ result: 'Story ID or Voting point is missing.' });
    return;
  }

  try {
    const client = getClient();
    await client.connect();

    const voteQuery = 'INSERT INTO vote(s_id, point, voter) VALUES($1,$2,$3)';
    const voteValues = [storyId, point, voter];
    const vote = await client.query(voteQuery, voteValues);

    await client.end();

    res.status(200).json({ result: vote.rows });
  } catch (e) {
    res.status(500).json({ result: e.message });
    console.error(e);
  }
});

router.put('/story/vote', async (req, res) => {
  const { voteId, point } = req.body;
  if (voteId === undefined || !point) {
    res.status(400).json({ result: 'Story ID or Voting point is missing.' });
    return;
  }

  try {
    const client = getClient();
    await client.connect();

    const normalizedPoint = point === '?' ? 999 : point;
    const voteQuery = 'UPDATE vote SET point = $1 WHERE id = $2';
    const voteValues = [normalizedPoint, voteId];
    const vote = await client.query(voteQuery, voteValues);

    await client.end();

    res.status(200).json({ result: vote.rows });
  } catch (e) {
    res.status(500).json({ result: e.message });
    console.error(e);
  }
});

router.put('/story/finalize', async (req, res) => {
  const { sprintName, point } = req.body;
  if (!sprintName || point === undefined) {
    res.status(400).json({ result: 'Sprint Name or point is missing.' });
    return;
  }

  try {
    // Get Database client and connect
    const client = getClient();
    await client.connect();

    const finalizeQuery = `UPDATE story
    SET point=$1, status='Voted'
    FROM sprint
    WHERE sprint.id=story.s_id and sprint.name=$2 and story.status='Active'
    RETURNING *`;
    const finalizeValues = [point, sprintName];
    await client.query(finalizeQuery, finalizeValues);

    const openNewStoryQuery = `WITH notVotedTable AS (
      SELECT s_id, story.id as storyid, story.name as storyname, 
             sprint.name as sprintname, story.status
      FROM   story
      JOIN	 sprint
      ON		 story.s_id=sprint.id
      WHERE  story.status='Not Voted'
      ORDER BY story.id
      LIMIT  1
      )
    UPDATE story s
    SET    status = 'Active' 
    FROM   notVotedTable
    WHERE  s.id = notVotedTable.storyid
    RETURNING *;`;
    const openNewStory = await client.query(openNewStoryQuery);
    // Close connection
    await client.end();

    res.status(200).json({ result: openNewStory.rows });
  } catch (e) {
    res.status(500).json({ result: e.message });
    console.error(e);
  }
});

export default router;
