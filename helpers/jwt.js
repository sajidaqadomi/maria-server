import jwt from 'express-jwt'
import dotenv from 'dotenv'

export default function authJwt() {
    dotenv.config()
    const secret = process.env.secret
    const api = process.env.API_URL

    return jwt({
        secret: secret,
        algorithms: ['HS256'],
        //  isRevoked: isRevoked
    }).unless({
        path: [
            { url: /\/api\/v1\//, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: `${api}/carts`, methods: ['POST', 'OPTIONS'] },
            `${api}/auth/signin`,
            `${api}/auth/signup`
        ]
    })
}

// async function isRevoked(req, payload, done) {
//     console.log(req.url)
//      if(req.url==/\/api\/v1\/users\/(.+)/)
//     if (!payload.isAdmin) done(null, true)
//     done();


// }
