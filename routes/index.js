import { Router } from 'express';

// eslint-disable-next-line new-cap
const router = Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

export default router;
