import express from "express";
import { Discussion } from "../models/discussionModel.js";
import { verifyUser } from "../routes/userrouter.js";

const router = express.Router();

// Create a new discussion
router.post("/", verifyUser, async (req, res) => {
  const { content } = req.body;
 
  try {
    const newDiscussion = new Discussion({
      content,
      authorName: req.user.username,
      authorId: req.user.id,
    });
    await newDiscussion.save();
    return res.status(201).json({ status: true, message: "Discussion created", discussion: newDiscussion });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to create discussion" });
  }
});

// Fetch discussions with pagination
router.get("/", async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  try {
    const discussions = await Discussion.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const totalDiscussions = await Discussion.countDocuments();
    return res.status(200).json({ discussions, totalPages: Math.ceil(totalDiscussions / limit) });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to fetch discussions" });
  }
});

// Like a discussion
// router.patch("/:id/like", verifyUser, async (req, res) => {
//   try {
//     const discussion = await Discussion.findById(req.params.id);
//     if (!discussion) {
//       return res.status(404).json({ status: false, message: "Discussion not found" });
//     }
//     discussion.likes += 1;
//     await discussion.save();
//     return res.status(200).json({ status: true, message: "Liked the discussion" });
//   } catch (error) {
//     return res.status(500).json({ status: false, message: "Failed to like discussion" });
//   }
// });
router.patch("/:id/like", verifyUser, async (req, res) => {
  const user = req.user;  // Logged-in user

  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ status: false, message: "Discussion not found" });
    }

    // Check if the user has already liked the discussion
    const userHasLiked = discussion.likedBy.includes(user.id);
   
    if (userHasLiked) {
      // User has liked, so unlike it
      discussion.likes -= 1;
      discussion.likedBy = discussion.likedBy.filter((id) => id.toString() !== user.id.toString());
      await discussion.save();
      return res.status(200).json({ status: true, message: "Unliked the discussion" });
    } else {
      // User has not liked, so like it
      discussion.likes += 1;
      discussion.likedBy.push(user.id);  // Add user ID to likedBy array
      await discussion.save();
      return res.status(200).json({ status: true, message: "Liked the discussion" });
    }
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to like/dislike discussion" });
  }
});

// Comment on a discussion
router.post("/:id/comment",verifyUser , async (req, res) => {  
  const { content } = req.body;
 
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ status: false, message: "Discussion not found" });
    }
    discussion.comments.push({
      content,
      authorName: req.user.username,
      authorId: req.user.id,
    });
    await discussion.save();
    return res.status(201).json({ status: true, message: "Comment added" });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to add comment" });
  }
});

router.delete("/:discussionId/comment/:commentId", verifyUser, async (req, res) => {
  const { discussionId, commentId } = req.params;
  const user = req.user;  // Logged-in user
  
  try {
    const discussion = await Discussion.findById(discussionId);
  
    if (!discussion) {
      return res.status(404).json({ status: false, message: "Discussion not found" });
    }

    // Find the comment by its ID
    const comment = discussion.comments.id(commentId);
   
    if (!comment) {
      return res.status(404).json({ status: false, message: "Comment not found" });
    }

    // Check if the logged-in user is the one who posted the comment
    if (comment.authorId.toString() !== user.id.toString()) {
      return res.status(403).json({ status: false, message: "You can only delete your own comments" });
    }

  
    await Discussion.updateOne(
      { _id: discussionId },
      { $pull: { comments: { _id: commentId } } } // Pull the comment by its ID
    );

    return res.status(200).json({ status: true, message: "Comment deleted" });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to delete comment" });
  }
});
router.patch("/:discussionId/comment/:commentId", verifyUser, async (req, res) => {
  const { discussionId, commentId } = req.params;
  const { content } = req.body;  // New content for the comment
  const user = req.user;  // Logged-in user
  
  try {
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ status: false, message: "Discussion not found" });
    }

    // Find the comment by its ID
    const comment = discussion.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ status: false, message: "Comment not found" });
    }

    // Check if the logged-in user is the one who posted the comment
    if (comment.authorId.toString() !== user.id.toString()) {
      return res.status(403).json({ status: false, message: "You can only edit your own comments" });
    }

    // Update the comment content using the $set operator
    await Discussion.updateOne(
      { _id: discussionId, "comments._id": commentId },
      { $set: { "comments.$.content": content } } // Update the content of the comment
    );

    return res.status(200).json({ status: true, message: "Comment updated" });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to update comment" });
  }
});


export { router as DiscussionRouter };
