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
        console.log('📝 UPDATE PROFILE body:', req.body);
        console.log('📝 Keys received:', Object.keys(req.body));
        console.log('📝 cnic:', req.body.cnic);
        console.log('📝 height:', req.body.height);
        console.log('📝 weight:', req.body.weight);
        console.log('📝 address:', req.body.address);
        const { name, phoneNumber, profilePicture, bio, age, qualification, cnic, height, weight, address, emergencyContact1, emergencyContact2 } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (profilePicture) user.profileImage = profilePicture;
        if (bio !== undefined) user.bio = bio;
        if (age !== undefined) user.age = age;
        if (qualification !== undefined) user.qualification = qualification;
        if (cnic !== undefined) user.cnic = cnic;
        if (height !== undefined) user.height = height;
        if (weight !== undefined) user.weight = weight;
        if (address !== undefined) user.address = address;
        if (emergencyContact1 !== undefined) user.emergencyContact1 = emergencyContact1;
        if (emergencyContact2 !== undefined) user.emergencyContact2 = emergencyContact2;

        await user.save();

        console.log('✅ Saved user cnic:', user.cnic, 'height:', user.height, 'weight:', user.weight, 'address:', user.address);

        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Save/update FCM token for push notifications
exports.saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'FCM token is required' });
    }

    await User.findByIdAndUpdate(req.user.id, { fcmToken });
    console.log(`✅ FCM token saved for user ${req.user.id}`);

    res.json({ success: true, message: 'FCM token saved' });
  } catch (error) {
    console.error('❌ Error saving FCM token:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Search users by name/email/role (Admin/Instructor only)
exports.searchUsers = async (req, res) => {
  try {
    const { q, role } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;

    const users = await User.find(filter).select('name email role phoneNumber profilePicture').limit(20);
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('❌ Search Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
