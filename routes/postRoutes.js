import express from "express";
import { 
  getAllPosts, 
  getPostById, 
  createPost, 
  deletePost, 
  deleteComment, 
  getUserPosts 
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js"; // Import auth middleware

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.get("/user/:userId", getUserPosts);

// ⛔ Require authentication for creating and deleting posts/comments
router.post("/", protect, createPost);
router.delete("/:id", protect, deletePost);
router.delete("/:postId/comments/:commentId", protect, deleteComment);

export default router;
