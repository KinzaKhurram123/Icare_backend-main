require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const ForumPost = require('../models/forumPost');
const User = require('../models/user');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const farhan = await User.findOne({ email: 'farhan@gmail.com' });
  if (!farhan) { console.log('User not found'); process.exit(1); }

  // Remove all empty comments (no text field) from all posts
  const result = await ForumPost.updateMany(
    {},
    { $pull: { comments: { text: { $exists: false } } } }
  );
  console.log(`✅ Removed empty comments from ${result.modifiedCount} posts`);

  // Add a real comment to the "Managing Hypertension" post
  const post = await ForumPost.findOne({ title: /Managing Hypertension/i });
  if (post) {
    post.comments.push({
      text: 'Great point! I have had similar experiences with Lisinopril. The key is monitoring potassium levels closely when combining with Metformin. I usually start with a lower dose and titrate up over 4 weeks.',
      author: farhan._id,
      isAnonymized: false,
    });
    await post.save();
    console.log('✅ Added comment to "Managing Hypertension" post');
  }

  // Add a comment to the ECG post too
  const ecgPost = await ForumPost.findOne({ title: /ECG/i });
  if (ecgPost) {
    ecgPost.comments.push({
      text: 'Excellent case presentation! The reciprocal changes in I and aVL are classic for inferior STEMI. Quick cath lab activation was the right call. What was the door-to-balloon time?',
      author: farhan._id,
      isAnonymized: false,
    });
    await ecgPost.save();
    console.log('✅ Added comment to ECG post');
  }

  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
