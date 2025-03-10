import Post from "../models/Post.js";
import Comment from "../models/Comment.js"; // Ensure Comment model is imported

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" }, // Use "author" since Comment schema uses that field
      });
    res.json(posts);
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: "Invalid Post ID" });
  }
};

export const createPost = async (req, res) => {
  const { title, content } = req.body;

  // Ensure user is logged in
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const newPost = new Post({
    title,
    content,
    author: req.user.id, // Assign the logged-in user as the author
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Find the comment inside the post using _id field as string
    const comment = post.comments.find((c) => c.toString() === commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Retrieve full comment document to check the author
    const commentDoc = await Comment.findById(comment);
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

export const deletePost = async (req, res) => {
  try {
    console.log("User making the request:", req.user);

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user data" });
    }

    // Allow admin OR post author to delete
    if (!req.user.isAdmin && post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ message: "✅ Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ author: userId }).populate("author", "username");
    res.json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
