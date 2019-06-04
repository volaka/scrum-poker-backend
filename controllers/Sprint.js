import { getClient } from '../util/pgClient';

/***
 * Takes name, voter and string of stories
 * and create a sprint then saves stories
 * in database
 * @param name
 * @param voter
 * @param storyList
 * @returns {Promise<string>}
 */
export const createSprint = (name, voter, storyList) => new Promise(async (resolve, reject) => {
  try {
    // Get Database client and connect
    const client = getClient();
    await client.connect();

    // Add new sprint to database
    const insertSprintQuery = 'INSERT INTO sprint(name, vote_count, dev_link) ' +
      'VALUES($1,$2,$1) RETURNING *';
    const insertSprintValues = [name, voter];
    const insertSprint = await client.query(insertSprintQuery, insertSprintValues);

    // Close connection
    await client.end();

    await createStoryList(storyList, insertSprint.rows[0].id);
    // Return success message
    resolve('Ok');
  } catch (e) {
    reject(e.message);
    console.error('Create Sprint - Controller: ', e.message);
  }
});

/***
 * Takes stories in a string which are separated with newline
 * splits them and saves them in database
 * @param {string} storyList
 * @param {number} sprintId
 * @returns {Promise<string>}
 */
const createStoryList = (storyList, sprintId) => new Promise(async (resolve, reject) => {
  try {
    // Get Database client and connect
    const client = getClient();
    await client.connect();

    // Split stories by new line and insert each of them
    // Make active the first entry and make not voted the rest of them
    const insertStoryQuery = 'INSERT INTO story(name, status, s_id) ' +
      'VALUES($1,$2,$3) RETURNING *';
    const stories = storyList.split('\n');

    for (let i = 0; i < stories.length; i++) {
      const insertStoryValues = [
        stories[i],
        i === 0 ? 'Active' : 'Not Voted',
        sprintId
      ];
      await client.query(insertStoryQuery, insertStoryValues);
    }
    await client.end();
    resolve('Ok');
  } catch (e) {
    reject(e.message);
    console.error('Create Story List - Controller: ', e.message);
  }
});

/***
 * Gets Sprint with the requested name
 * @param {string} name
 * @returns {Promise<null || object || string >}
 */
export const getSprintByName = (name) => new Promise(async (resolve, reject) => {
  try {
    // Get Database client and connect
    const client = getClient();
    await client.connect();

    // Get sprint from database
    const getSprintQuery = 'SELECT * FROM sprint WHERE name=$1 or dev_link=$1';
    const getSprintValues = [name];
    const sprint = await client.query(getSprintQuery, getSprintValues);

    // Close connection
    await client.end();

    if (sprint.rows.length === 0) {
      resolve(null);
      return;
    }
    resolve(sprint.rows[0]);
  } catch (e) {
    reject(e.message);
    console.error('Get Sprint - Controller: ', e.message);
  }
});

/***
 * Gets all sprints
 * @returns {Promise<null || object || string >}
 */
export const getAllSprints = () => new Promise(async (resolve, reject) => {
  try {
    // Get Database client and connect
    const client = getClient();
    await client.connect();

    // Get sprint from database
    const getSprintQuery = 'SELECT * FROM sprint order by id';
    const sprint = await client.query(getSprintQuery);

    // Close connection
    await client.end();

    resolve(sprint.rows);
  } catch (e) {
    reject(e.message);
    console.error('Get All Sprints - Controller: ', e.message);
  }
});

/***
 * Gets stories of a sprint by sprint's name
 * @param {string} name
 * @returns {Promise<null || array || string>}
 */
export const getStoriesBySprintName = (name) => new Promise(async (resolve, reject) => {
  try {
    // Get Database client and connect
    const client = getClient();
    await client.connect();

    // Get stories of a sprint from database
    const getStoriesQuery = 'SELECT story.id, story.name, story.status, story.point ' +
      'FROM story ' +
      'INNER JOIN sprint ON story.s_id=sprint.id ' +
      'where sprint.name=$1 or dev_link=$1 order by story.id';
    const getStoriesValues = [name];
    const getStories = await client.query(getStoriesQuery, getStoriesValues);

    // Close connection
    await client.end();

    if (getStories.rows.length === 0) {
      resolve(null);
      return;
    }
    resolve(getStories.rows);
  } catch (e) {
    reject(e.message);
    console.error('Get Stories - Controller: ', e.message);
  }
});

/***
 * Gets votes of the active story of requested sprint
 * @param {string} name
 * @returns {Promise<array || string>}
 */
export const getVotesOfActiveStoryOfSprint = (name) => new Promise(async (resolve, reject) => {
  try {
    // Get Database client and connect
    const client = getClient();
    await client.connect();

    // Get sprint from database
    const getStoryVotesQuery = 'SELECT vote.id, sprint.name, story.name, vote.point, vote.voter ' +
      '  FROM sprint ' +
      '  LEFT JOIN story ON story.s_id=sprint.id ' +
      '  LEFT JOIN vote ON vote.s_id=story.id ' +
      '    where (sprint.name=$1 or dev_link=$1) and story.status=\'Active\'\n';
    const getStoryVotesValues = [name];
    const getStoryVotes = await client.query(getStoryVotesQuery, getStoryVotesValues);

    // Close connection
    await client.end();

    resolve(getStoryVotes.rows);
  } catch (e) {
    reject(e.message);
    console.error('Get Votes of Active Story - Controller: ', e.message);
  }
});

export const setNewDevLink = (sprintName, newLink) => new Promise(async (resolve, reject) => {
  try {
    // Get Database client and connect
    const client = getClient();
    await client.connect();

    // Get sprint from database
    const setNewLinkQuery = 'UPDATE sprint SET dev_link = $1 WHERE name = $2 or dev_link = $2';
    const setNewLinkValues = [newLink, sprintName];
    await client.query(setNewLinkQuery, setNewLinkValues);

    // Close connection
    await client.end();

    resolve();
  } catch (e) {
    reject(e.message);
    console.error('Get Votes of Active Story - Controller: ', e.message);
  }
});
