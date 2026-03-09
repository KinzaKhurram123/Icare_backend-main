const User = require('../models/user');

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('✅ USER PROFILE FETCHED:');
        console.log('   Name:', user.name);
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('-----------------------------------');

        res.json(user);
    } catch (error) {
        console.error('❌ Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const { name, phoneNumber, profilePicture } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        console.log('✅ USER PROFILE UPDATED:');
        console.log('   Name:', user.name);
        console.log('   Phone:', user.phoneNumber);
        console.log('-----------------------------------');

        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
