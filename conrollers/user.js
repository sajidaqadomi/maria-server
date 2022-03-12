import User from '../models/user.js'

export const user_get = async (req, res) => {
    const { isAdmin } = req.user
    const query = req.query.new
    if (!isAdmin) return res.status(403).json("You are not alowed to do that!");

    try {
        const userList = query ? await User.find().sort({ _id: -1 }).limit(5).select('-password') : await User.find().select('-password')

        if (userList) return res.status(200).json(userList)
        return res.status(401).json({ error: 'Cannot found users' })
    } catch (error) {
        return res.status(500).json({ error: error.message })

    }
}
export const user_get_byId = async (req, res) => {
    const { id } = req.params
    const { id: userId, isAdmin } = req.user
    try {
        if (!(userId == id || isAdmin)) return res.status(403).json({ error: 'You are not alowed to do that!"' })

        const user = await User.findById(id).select('-password')

        if (user) return res.status(200).json(user)
        return res.status(401).json({ error: 'The user with the given ID was not found' })
    } catch (error) {
        return res.status(500).json({ error: error.message })

    }
}
export const user_get_count = async (req, res) => {
    const { isAdmin } = req.user
    if (!isAdmin) return res.status(403).json({ error: 'You are not alowed to do that!' })
    try {
        const userCount = await User.countDocuments()
        if (userCount) return res.status(200).json({ count: userCount })
        return res.status(500).json({ error: 'Cannot found users count' })
    } catch (error) {
        return res.status(500).json({ error: error.message })

    }
}

export const user_update = async (req, res) => {
    const { id } = req.params
    const user = req.body
    const { id: userId, isAdmin } = req.user

    if (!(userId == id || isAdmin)) return res.status(403).json({ error: 'You are not alowed to do that!"' })

    try {
        const updatedUser = await User.findByIdAndUpdate(id, { ...user }, { new: true }).select('-password')
        if (updatedUser) return res.status(200).json(updatedUser)
        return res.status(500).json({ error: 'The user cannot be updated' })
    } catch (error) {
        return res.status(500).json({ error: error.message })

    }
}

export const user_remove = async (req, res) => {
    const { id } = req.params
    const { id: userId, isAdmin } = req.user

    if (!(userId == id || isAdmin)) return res.status(403).json({ error: 'You are not alowed to do that!"' })

    try {
        const deletedUser = await User.findByIdAndDelete(id)
        if (deletedUser) return res.status(200).json(deletedUser)
        return res.status(500).json({ error: 'The user cannot be deleted' })
    } catch (error) {
        return res.status(500).json({ error: error.message })

    }
}

export const user_stats = async (req, res) => {

    const { isAdmin } = req.user
    if (!isAdmin) return res.status(403).json({ error: `You are not alowed to do that!` })

    const date = new Date()
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1))

    try {
        const stats = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $substr: ["$createdAt", 5, 2] }
                }
            },
            {
                $group: {
                    _id: "$month",
                    count: { $sum: 1 }
                }
            }, {
                $sort: {
                    _id: 1
                }
            }

        ])

        if (stats) return res.status(200).json(stats)

        return res.status(400).json({ error: 'Cannot get users stats' })

    } catch (err) {
        res.status(500).json({ error: err.message })

    }
}