import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getMyFriends, getRecommendedUsers } from '../controllers/user.contoller.js';

const router = express.Router();
//apply protectRoute middleware to all routes in this router
router.use(protectRoute);

router.get('/', getRecommendedUsers);
router.get('/friends', getMyFriends);


export default router;