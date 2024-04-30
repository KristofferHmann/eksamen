import jwt from 'jsonwebtoken'
function authMiddleware(req, res, next) {
    const authorizationHeader = req.headers['authorization'];

    if (typeof authorizationHeader === 'undefined') {
        return res.status(422).json({
            message: 'Authorization header is missing',
        });
    }
    const token = authorizationHeader.split(' ')[1]
    console.log(token);

    try {
        const decodedPayload = jwt.verify(token, 'gdgjgd464fhgdsdrg5');
        req.user = decodedPayload;
    } catch (err) {
        return res.status(403).json({
            message: 'unauthorized'
        })
    }
    console.log(authorizationHeader);
    next();
}


export { authMiddleware };