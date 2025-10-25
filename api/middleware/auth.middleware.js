const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
	 const auth = req.headers.authorization;
	 if (!auth) return res.status(401).json({ error: 'No authorization header' });
	 const parts = auth.split(' ');
	 if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid authorization format' });
	 const token = parts[1];
	 try {
	 	const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
	 	req.user = payload;
	 	next();
	 } catch (err) {
	 	return res.status(401).json({ error: 'Invalid token' });
	 }
}

module.exports = authMiddleware;
