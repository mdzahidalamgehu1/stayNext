const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");

const validatelisting = (req, res, next) =>{
  let {error} = listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errMsg);
  } else {
    next();
  }
};

router.get("/", wrapAsync(async (req, res) =>{
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", {allListing});
}))

//New Route
router.get("/new", (req, res) =>{
  res.render("listings/new.ejs");
})


//show route
router.get("/:id", wrapAsync(async(req, res) =>{
  let {id} = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if(!listing){
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs",{listing})
}))

//create route
router.post("/", validatelisting, wrapAsync(async (req, res, next) =>{
  let result = listingSchema.validate(req.body);
  if(result.error){
    throw new ExpressError(404, result.error);
  }      
  const newListing = new Listing(req.body.listing);
  newListing.image = {
    url: req.body.listing.image.url,
    filename: "default",
  };
  await newListing.save();
  req.flash("success", "New Listing Created!")
  res.redirect("/listings");
}));

//edit
router.get("/:id/edit", wrapAsync(async (req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing});
}))

 //update 
router.put("/:id", validatelisting, wrapAsync(async (req, res) =>{
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, req.body.listing);
  req.flash("success", "Listing updated!")
  res.redirect(`/listings/${id}`);
}));

//Delete
router.delete("/:id", wrapAsync(async (req, res) => {
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!")
  res.redirect("/listings")
}))

module.exports = router;