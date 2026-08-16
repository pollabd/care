import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

noteSchema.index({ owner: 1, createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;
