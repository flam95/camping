var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function (err, camp)  {
      if (err) {
        req.flash("error", "Campground not found");
        res.redirect("back"); 
      } else {
        if(camp.author.id.equals(req.user._id) || req.user.isAdmin){
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }     
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function (err, com)  {
      if (err) {
        res.redirect("back"); 
      } else {
        if(com.author.id.equals(req.user._id) || req.user.isAdmin){
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }     
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
}

middlewareObj.isLoggedIn = function (req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/login");
}

module.exports = middlewareObj;