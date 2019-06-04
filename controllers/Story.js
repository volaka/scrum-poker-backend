import { getClient } from '../util/pgClient';

/***
 * Inserts a vote to the database
 * @param {number}storyId
 * @param {string} point
 * @param {number} voter
 * @returns {Promise<>}
 */
export const voteStory = (storyId, point, voter) => new Promise(async (resolve, reject) => {
  try {
    const client = getClient();
    await client.connect();

    // Save ? vote as 999 because database columns is type of smallint
    const normalizedPoint = point === '?' ? 999 : point;

    const voteQuery = 'INSERT INTO vote(s_id, point, voter) VALUES($1,$2,$3)';
    const voteValues = [storyId, normalizedPoint, voter];
    await client.query(voteQuery, voteValues);

    await client.end();

    resolve();
  } catch (e) {
    reject(e.message);
    console.error('Vote a Story - Controller: ', e.message);
  }
});

/***
 * Changes a given vote with new point
 * @param {number} voteId
 * @param {string} point
 * @returns {Promise<>}
 */
export const changeVoteStory = (voteId, point) => new Promise(async (resolve, reject) => {
  try {
    const client = getClient();
    await client.connect();

    // Save ? vote as 999 because database columns is type of smallint
    const normalizedPoint = point === '?' ? 999 : point;

    const voteQuery = 'UPDATE vote SET point = $1 WHERE id = $2';
    const voteValues = [normalizedPoint, voteId];
    await client.query(voteQuery, voteValues);

    await client.end();

    resolve();
  } catch (e) {
    reject(e.message);
    console.error('Change Vote of a Story - Controller: ', e.message);
  }
});

/***
 * Finalizes story, saves the agreed point,
 * sets status as Voted and make next stories status as Active
 * @param {string} sprintName
 * @param {number} point
 * @returns {Promise<>}
 */
export const finalizeStory = (sprintName, point) => new Promise(async (resolve, reject) => {
  try {
    const client = getClient();
    await client.connect();

    const finalizeQuery = `UPDATE story
    SET point=$1, status='Voted'
    FROM sprint
    WHERE sprint.id=story.s_id and sprint.name=$2 and story.status='Active'
    RETURNING *`;
    const finalizeValues = [point, sprintName];
    await client.query(finalizeQuery, finalizeValues);

    await client.end();

    // Sets next story's status as Active
    await setActiveNewStory(sprintName);

    resolve();
  } catch (e) {
    reject(e.message);
    console.error('Change Vote of a Story - Controller: ', e.message);
  }
});

/***
 * Select next 'Not Voted' story of given sprint
 * Sets it's status as Active
 * @param {string} sprintName
 * @returns {Promise<>}
 */
const setActiveNewStory = (sprintName) => new Promise(async (resolve, reject) => {
  try {
    const client = getClient();
    await client.connect();

    const openNewStoryQuery = `WITH notVotedTable AS (
      SELECT s_id, story.id as storyid, story.name as storyname, 
             sprint.name as sprintname, story.status
      FROM   story
      JOIN	 sprint
      ON		 story.s_id=sprint.id
      WHERE  story.status='Not Voted' and sprint.name=$1
      ORDER BY story.id
      LIMIT  1
    )
    UPDATE story s
    SET    status = 'Active' 
    FROM   notVotedTable
    WHERE  s.id = notVotedTable.storyid
    RETURNING *;`;

    const openNewStoryValues = [sprintName];
    await client.query(openNewStoryQuery, openNewStoryValues);

    await client.end();

    resolve();
  } catch (e) {
    reject(e.message);
    console.error('Change Vote of a Story - Controller: ', e.message);
  }
});
