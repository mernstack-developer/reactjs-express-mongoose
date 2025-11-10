const express = require('express');
const { authorize } = require('../middleware/roleMiddleware');
const router = express.Router();
const userController = require('../controllers/user.controller');
router.post('/', authorize(['admin']), userController.createUser);
router.get('/',  userController.getUsers);
router.get('/:id', authorize(['admin', 'teacher']), userController.getUserById);
router.put('/:id', authorize(['admin']), userController.updateUser);
router.delete('/:id', authorize(['admin']), userController.deleteUser);

module.exports = router;
