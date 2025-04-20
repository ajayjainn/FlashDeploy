import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  repository: {
    type: String,
    required: true,
    trim: true
  },
  deployedUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Deploying', 'Deployed', 'Failed'],
    default: 'Deploying'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
ProjectSchema.set('toJSON', {
  virtuals: true,
  versionKey:false,
  transform: function (doc, ret) {   delete ret._id  }
});

export default mongoose.model('Project', ProjectSchema);
