require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const ForumPost = require('../models/forumPost');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const posts = await ForumPost.find({}).lean();
  posts.forEach(p => {
    console.log('\nPost:', p.title);
    console.log('Comments count:', p.comments?.length ?? 0);
    if (p.comments?.length > 0) {
      console.log('First comment keys:', Object.keys(p.comments[0]));
      console.log('First comment:', JSON.stringify(p.comments[0], null, 2));
    }
  });
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
