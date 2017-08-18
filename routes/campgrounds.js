var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../middleware");
var geocoder = require("geocoder");

router.get("/", function(req, res){
  Campground.find({}, function(err, camp){
    if(err){
      console.log(err);
    } else {
      res.render("campgrounds/index", {campgrounds: camp, page: 'campgrounds'});
    }
  });
});

router.post("/", middleware.isLoggedIn, function(req, res){
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    Campground.create(newCampground, function(err, camp){
      if(err){
        console.log("Error create in database");
      } else {
        req.flash("success", "Successfully created campground");
        res.redirect("/campgrounds");
      }
    });
  });
});

router.get("/new", middleware.isLoggedIn, function(req, res){
  res.render("campgrounds/new");
});

router.get("/:id", function(req, res){
  Campground.findById(req.params.id).populate("comments").exec(function(err, camp){
    if(err){
      console.log("err");
    } else {
      res.render("campgrounds/show", {campground: camp});
    }
  });
});

router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, camp)  {
      res.render("campgrounds/edit", {campground: camp});
    });
});

router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, location: location, lat: lat, lng: lng};

    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function (err, camp) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Successfully updated campground");
        res.redirect("/campgrounds/" + camp._id);
      }
    });
  });
});

router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
  Campground.findByIdAndRemove(req.params.id, function (err, camp) {
   if (err) {
      res.redirect("/campgrounds");
    } else {
      req.flash("success", "Successfully deleted campground");
      res.redirect("/campgrounds");
    }
  });
});

module.exports = router;