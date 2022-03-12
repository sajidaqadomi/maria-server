import User from '../models/user.js'
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";

export const signupUser = async (req, res) => {
    let user = req.body

    try {
        let oldUser = await User.findOne({ $or: [{ email: user.email }, { userName: user.userName }] })
        if (oldUser) return res.status(403).json({ error: 'Email Address or User Name is already in use' })

        let passwordHash = await bcrypt.hash(user.password, 10)

        let newUser = new User({ ...user, password: passwordHash })
        let { _doc: { password, ...others } } = await newUser.save()
        return res.status(201).json({ ...others })
    } catch (error) {
        return res.status(500).json({ error })
    }
}


export const signinUser = async (req, res) => {
    const user = req.body

    try {
        const currentUser = await User.findOne({ userName: user.userName })
        // console.log(currentUser)
        if (!currentUser) return res.status(401).json({ error: 'Invalid username or  password' })

        if (bcrypt.compareSync(user.password, currentUser.password)) {
            const userToken = jwt.sign({ userName: currentUser.userName, id: currentUser._id, isAdmin: currentUser.isAdmin }, process.env.SECRET, { expiresIn: '1d' })
            return res.status(200).json({ userToken });
        } else {
            return res.status(401).json({ error: 'Invalid username or  password' });
        }

    } catch (error) {
        return res.status(500).json({ error });

    }


}