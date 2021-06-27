const mongoose = require("mongoose");
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/YelpCamp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

//CHECKING MONGO CONNECTION STATUS
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('MONGODB CONNECTED!')
});

// GENERATES RANDOM ITEM FROM AN ARRAY THAT WILL BE SELECTED 
const sample = array => array[Math.floor(Math.random() * array.length)] 

// REMOVING EVERYTHING  IN THE DATABASE AND ADDING NEW CAMPGROUNDS
const seedDB = async() => {
    await Campground.deleteMany({}); //DELETES EVERYTHING
    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000) // GENERATES RANDOM NUMBER FROM 0 TO 1000(THAT'S HAVE MANY CITIES IS IN  THE FILE)
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({ // CREATES NEW CAMPGROUND FOR EACH LOOP
            author: '60d0a607823b7d5308c14e32',
            location: `${cities[random1000].city}, ${cities[random1000].state}`, // USING THE RANDOM NUMBER IT PICKS BOTH CITY AND STATE
            title: `${sample(descriptors)} ${sample(places)}`, // PASSES TWO ARRAYS INTO SAMPLE FUNCTION AND PICKS TWO RANDOM PLACES AND DESCRIPTIONS
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Mollitia assumenda necessitatibus atque adipisci consequatur quae quod, culpa esse ducimus porro nemo impedit sit harum ratione quisquam, eveniet quia reprehenderit vero.',
            price,
            geometry:{
              type:'Point',
              coordinates:[16.439848,43.506829]
            },
            images: [
                {
                  url: 'https://source.unsplash.com/collection/4651015',
                  filename: 'YelpCamp/qiszijzc4vjm1vbejmei'
                },
                {
                  url: 'https://source.unsplash.com/collection/483251',
                  filename: 'YelpCamp/qhmnui5ngg1pww1ayhyp'
                },
              ],
        })
        await camp.save();
    }
}
// RUNS THE FUNCTION AND CLOSES THE CONNECTION ONCE COMPLETED
seedDB().then( () => {
    mongoose.connection.close();
})

// PRINTS THE BELOW

//{ "_id" : ObjectId("60ba34494bde6d0ae915aed2"), "location" : "Rockwall, Texas", "title" : "Misty River", "__v" : 0 }
