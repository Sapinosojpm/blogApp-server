import Post from "../models/Post.js";
import Comment from "../models/Comment.js"; // Ensure Comment model is imported

export const getCommentsByPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate({
      path: "comments",
      populate: { path: "author", select: "username" },
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post.comments);
  } catch (error) {
    res.status(400).json({ message: "Error fetching comments" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Find the post to which we want to add the comment
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Create a new comment document
    const comment = new Comment({
      content,
      author: req.user.id,
      post: req.params.postId,
    });
    await comment.save();

    // Push the new comment's ID to the post's comments array
    post.comments.push(comment._id);
    await post.save();

    // Populate the comment's author field before returning the response
    const populatedComment = await Comment.findById(comment._id).populate("author", "username");

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Retrieve the actual comment document to check for authorization
    const commentDoc = await Comment.findById(commentId);
    if (!commentDoc) return res.status(404).json({ message: "Comment not found" });

    // Allow only admin or comment author to delete the comment
    if (!req.user.isAdmin && commentDoc.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    // Remove the comment's ObjectId from the post's comments array
    post.comments = post.comments.filter((c) => c.toString() !== commentId);
    await post.save();

    // Delete the comment document from the database
    await Comment.findByIdAndDelete(commentId);

    res.json({ message: "✅ Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
