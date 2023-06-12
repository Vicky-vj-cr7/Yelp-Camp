const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

process.env.NODE_ENV = "production";
const dbUrl =
  process.env.NODE_ENV !== "production"
    ? "mongodb://localhost:27017/yelp-camp"
    : process.env.DB_URL;

const author =
  process.env.NODE_ENV !== "production"
    ? "612245b6d8146044140f9d6d"
    : "6128ae32dfb24a0016f968ed";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected !");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 150; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: author,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dhxie5cun/image/upload/v1630056267/YelpCamp/een5saipl0zqkn8veciu.jpg",
          filename: "Yelpcamp/en5saipl0zqkn8veciu",
        },
        {
          url: "https://res.cloudinary.com/dhxie5cun/image/upload/v1629988164/Yelpcamp/default_img_1_tnc1d1.jpg",
          filename: "YelpCamp/default_img_1_tnc1d1.jpg",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
