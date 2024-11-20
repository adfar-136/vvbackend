import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    authorName: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const DiscussionSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    authorName: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
  },
  { timestamps: true }
);

const Discussion = mongoose.model("Discussion", DiscussionSchema);

export { Discussion };
