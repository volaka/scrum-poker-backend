import { Router } from 'express';
import {
  createSprint, getAllSprints,
  getSprintByName,
  getStoriesBySprintName,
  getVotesOfActiveStoryOfSprint, setNewDevLink
} from '../controllers/Sprint';
import { voteStory, changeVoteStory, finalizeStory } from '../controllers/Story';

// eslint-disable-next-line new-cap
const router = Router();

router.get('/sprint', (req, res) => {
  getAllSprints()
    .then(result => res.status(200).json({ result }))
    .catch(e => res.status(500).json({ result: e }));
});

router.post('/sprint', (req, res) => {
  const { name, voter, storyList } = req.body;

  // Check if the required fields are correct
  if (!name || voter === undefined || !storyList) {
    res.status(400).json({ result: 'Some fields are empty.', name, voter, storyList });
    return;
  }

   createSprint(name, voter, storyList)
     .then(() => res.status(200).json({ result: 'Sprint is successfully created.' }))
     .catch(e => res.status(500).json({ result: e }));
});

router.put('/sprint/link', (req, res) => {
  const { name, newLink } = req.body;

  if (!name || !newLink) {
    res.status(400).json({ result: 'Please enter name and newLink.' });
  }
  setNewDevLink(name, newLink)
    .then(() => res.status(204).send())
    .catch(e => res.status(500).json({ result: e }));
});

router.get('/sprint/:name', (req, res) => {
  const name = req.params.name;

  getSprintByName(name)
    .then(result => {
      if (!result) res.status(404).json({ result: 'No sprint found with requested name.' });
      else res.status(200).json({ result });
    }).catch(e => res.status(500).json({ result: e }));
});

router.get('/sprint/:name/stories', (req, res) => {
  const name = req.params.name;
  getStoriesBySprintName(name)
    .then(result => {
      if (!result) {
        res.status(404).json({ result: [] });
      } else res.status(200).json({ result });
    }).catch(e => res.status(500).json({ result: e }));
});

router.get('/sprint/:name/active/votes', (req, res) => {
  const name = req.params.name;

  getVotesOfActiveStoryOfSprint(name)
    .then(result => res.status(200).json({ result }))
    .catch(e => res.status(500).json({ result: e }));
});

router.post('/story/vote', (req, res) => {
  const { storyId, point, voter } = req.body;
  if (storyId === undefined || !point || voter === undefined) {
    res.status(400).json({ result: 'Story ID or Voting point is missing.' });
    return;
  }

  voteStory(storyId, point, voter)
    .then(() => res.status(204).send())
    .catch(e => res.status(500).json({ result: e }));
});

router.put('/story/vote', (req, res) => {
  const { voteId, point } = req.body;
  if (voteId === undefined || !point) {
    res.status(400).json({ result: 'Story ID or Voting point is missing.' });
    return;
  }

  changeVoteStory(voteId, point)
    .then(() => res.status(204).send())
    .catch(e => res.status(500).json({ result: e }));
});

router.put('/story/finalize', (req, res) => {
  const { sprintName, point } = req.body;
  if (!sprintName || point === undefined) {
    res.status(400).json({ result: 'Sprint Name or point is missing.' });
    return;
  }

  finalizeStory(sprintName, point)
    .then(() => res.status(204).send())
    .catch(e => res.status(500).json({ result: e }));
});

export default router;
