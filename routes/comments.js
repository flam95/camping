var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");
var middleware = require("../middleware");

//Comments
router.get("/new", middleware.isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, camp){
    if(err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground: camp});
    }
  });
});

router.post("/", middleware.isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, camp) {
    if(err){
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) {
          console.log(err);
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          camp.comments.push(comment);
          camp.save();
          req.flash("success", "Successfully created comment");
          res.redirect("/campgrounds/" + camp._id);
        }
      });
    }
  });
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
  Comment.findById(req.params.comment_id, function (err, com) {
    if (err) {
      res.redirect("back");
    } else {
      res.render("comments/edit", {campground_id: req.params.id, comment: com});
    }
  });
});

router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, com) {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "Successfully updated comment");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
  Comment.findByIdAndRemove(req.params.comment_id, function (err, com) {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "Successfully deleted comment");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

module.exports = router;