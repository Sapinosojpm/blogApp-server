import express from "express";
import { getCommentsByPost, addComment, deleteComment } from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get comments for a specific post
router.get("/:postId", getCommentsByPost);

// Add a comment (requires authentication)
router.post("/:postId", protect, addComment);

// Delete a comment using both postId and commentId
router.delete("/:postId/:commentId", protect, deleteComment);

export default router;
