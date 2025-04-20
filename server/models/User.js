import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  githubId:   { type: String, required: true, unique: true },
  displayName: String,
  username: String,
  profileUrl: String,
  photos: [String],
  email: String,
  accessToken: String,
  refreshToken: String,
  createdAt:  { type: Date, default: Date.now },
  lastLogin:  { type: Date, default: Date.now }
});
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey:false,
  transform: function (doc, ret) {   delete ret._id  }
});

export default mongoose.model('User', UserSchema);
