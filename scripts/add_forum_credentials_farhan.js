const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

const User = require('../models/user');
const Credential = require('../models/credential');
const ForumPost = require('../models/forumPost');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const farhan = await User.findOne({ email: 'farhan@gmail.com' });
  if (!farhan) { console.log('Doctor not found'); process.exit(1); }

  // ── Credentials ──────────────────────────────────────────────────────────
  await Credential.create([
    {
      user: farhan._id,
      type: 'Medical License',
      title: 'PMDC License 2024',
      documentUrl: 'https://example.com/docs/pmdc-license.pdf',
      status: 'verified',
      verifiedAt: new Date(),
    },
    {
      user: farhan._id,
      type: 'Specialization Certificate',
      title: 'Cardiology Board Certification',
      documentUrl: 'https://example.com/docs/cardiology-cert.pdf',
      status: 'verified',
      verifiedAt: new Date(),
    },
    {
      user: farhan._id,
      type: 'Indemnity Insurance',
      title: 'Medical Indemnity Insurance 2024',
      documentUrl: 'https://example.com/docs/insurance.pdf',
      status: 'pending',
    },
  ]);
  console.log('✅ 3 credentials added for farhan');

  // ── Forum Posts ───────────────────────────────────────────────────────────
  await ForumPost.create([
    {
      title: 'Managing Hypertension in Diabetic Patients',
      content: 'I have been seeing a lot of patients with both Type 2 Diabetes and Stage 1 Hypertension. The challenge is balancing ACE inhibitors with their existing Metformin regimen. Has anyone had success with a specific combination therapy? I have been using Lisinopril 10mg with good results but would love to hear other approaches.',
      author: farhan._id,
      category: 'Case Study',
      tags: ['hypertension', 'diabetes', 'cardiology'],
    },
    {
      title: 'Best practices for teleconsultation documentation',
      content: 'With the rise of virtual consultations, I find it challenging to maintain the same documentation quality as in-person visits. What are your workflows for SOAP notes during video calls? I have started using voice-to-text which has helped significantly.',
      author: farhan._id,
      category: 'General',
      tags: ['teleconsultation', 'documentation'],
    },
    {
      title: 'Interesting ECG finding — seeking second opinion',
      content: 'Had a 45-year-old male patient present with chest discomfort. ECG showed ST elevation in leads II, III, aVF with reciprocal changes in I and aVL. Troponin was borderline. Patient was hemodynamically stable. Referred for urgent cath. Turned out to be RCA occlusion. Sharing for educational purposes — always trust the ECG!',
      author: farhan._id,
      category: 'Clinical Research',
      tags: ['ECG', 'STEMI', 'cardiology'],
    },
  ]);
  console.log('✅ 3 forum posts added for farhan');

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
