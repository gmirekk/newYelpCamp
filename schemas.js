const Joi = require('joi');

// CREATES ADDITIONAL VALIDATION FOR SCHEMA FROM DB SIDE SO NECCESSARY OBJECTS ARE PASSED IN IN CORRECT MANNER FOR MONGODB
module.exports.campgroundSchema = Joi.object({
  // NEW VARIABLE WITH JOI OBJECT
  campground: Joi.object({
    //campgroud object is defined in the form and used to gather all info required
    // like schema, we define the type of object type required and any other requirement i.e. min value 0 for price
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    image: Joi.string().required(),
    description: Joi.string().required(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required(),
  }).required(),
});
