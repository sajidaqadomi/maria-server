export default function errorHandler(err, req, res, next) {

    if (err?.name === 'UnauthorizedError') {
        return res.status(403).json({ error: 'The user is not authorized' })

    }

}