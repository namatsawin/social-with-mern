const express = require("express");
const router = express.Router();
const fs = require("fs");

// Utils and middleWares
const { isAuthenticated } = require("../middlewares/auth");
const { isHasContent } = require("../middlewares/post");

// Mongodb model
const PostModel = require("../models/post.model");

router.post("/create", isAuthenticated, isHasContent, async (req, res) => {
  try {
    const post = await PostModel.create({
      user: req.user.id,
      profile: req.profile.id,
    });
    if (req.photo) {
      const postPath = `${__dirname}/../client/public/uploads/posts/${post.id}`;
      if (!fs.existsSync(`${postPath}`)) {
        fs.mkdirSync(`${postPath}`);
      }
      req.photo.mv(`${postPath}/post.png`);
      post.photo = `/uploads/posts/${post.id}/post.png`;
    }
    if (req.content) {
      post.content = req.content;
    }

    post
      .save()
      .then((p) =>
        p
          .populate("profile", ["avatar", "firstName", "lastName"])
          .execPopulate()
      )
      .then((p) => res.send(p));
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error.message });
  }
});

router.post("/fetch/:id", isAuthenticated, async (req, res) => {
  try {
    const posts = await PostModel.find({ user: req.params.id })
      .populate("profile", ["firstName", "lastName", "avatar"])
      .sort({
        postedAt: -1,
      });
    res.send(posts);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error.message });
  }
});

router.delete("/:postId", isAuthenticated, async (req, res) => {
  try {
    const post = await PostModel.findOne({
      $and: [{ _id: req.params.postId }, { user: req.user.id }],
    });

    const postPath = `${__dirname}/../client/public/uploads/posts/${req.params.postId}`;
    if (fs.existsSync(`${postPath}`)) {
      fs.rmdirSync(`${postPath}`, { recursive: true });
    }

    await post.remove();
    res.send({ success: "Deleted post successfully." });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error.message });
  }
});

router.post("/like/:postId", isAuthenticated, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.postId);

    if (post.likes.find((like) => like.user.toString() === req.user.id)) {
      // post.likes.filter((like) => like.user.toString() !== req.user.id);
      const removeIndex = post.likes
        .map((like) => like.user.toString())
        .indexOf(req.user.id);
      post.likes.splice(removeIndex, 1);
    } else {
      post.likes.unshift({ user: req.user.id });
    }
    post.save().then((p) => res.send(p));
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error.message });
  }
});

router.post("/comment/:postId", isAuthenticated, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).send({ error: "No content commented." });
  try {
    const post = await PostModel.findById(req.params.postId);

    post.comments.unshift({
      user: req.user.id,
      content: content,
      firstName: req.profile.firstName,
      lastName: req.profile.lastName,
      avatar: req.profile.avatar,
    });

    post.save().then((p) => res.send(p));
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error.message });
  }
});

router.delete(
  "/comment/:postId/:commentId",
  isAuthenticated,
  async (req, res) => {
    try {
      const post = await PostModel.findById(req.params.postId);
      const comment = post.comments.find(
        (c) => c._id.toString() === req.params.commentId.toString()
      );

      if (!comment)
        return res.status(400).send({ error: "Comment not found." });

      if (
        post.user.toString() === req.user.id.toString() ||
        comment.user.toString() === req.user.id.toString()
      ) {
        const removeIndex = post.comments
          .map((comment) => comment._id.toString())
          .indexOf(req.params.commentId);

        post.comments.splice(removeIndex, 1);

        post.save().then((p) => {
          return res.send(p);
        });
      } else {
        return res.status(403).send({ error: "Deleted access denied." });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({ error: error.message });
    }
  }
);

module.exports = router;