import jwt from 'express-jwt'
import dotenv from 'dotenv'

export default function authJwt() {
    dotenv.config()
    const secret = process.env.SECRET
    const api = process.env.API_URL

    return jwt({
        secret: secret,
        algorithms: ['HS256'],
        //  isRevoked: isRevoked
    }).unless({
        path: [
            { url: /\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: `/carts`, methods: ['POST', 'OPTIONS'] },
            `/auth/signin`,
            `/auth/signup`
        ]
    })
}

// async function isRevoked(req, payload, done) {
//     console.log(req.url)
//      if(req.url==/\/api\/v1\/users\/(.+)/)
//     if (!payload.isAdmin) done(null, true)
//     done();


// }
