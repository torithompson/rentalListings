const express = require('express');
const app = express();
const queries = require("./mysql/queries");

// This is the route that will be used to display the listing
app.set('view engine', 'ejs');
//Listen on port 3000
app.listen(3000);
//Index page route
app.get('/', function(request, response) {
  response.render('index', { title: 'Airbnb Search App', title2: 'Tori Thompson'});
});
//Route to display one listing getting the information from the URL
app.get('/airbnb/find-one', (request, response) => {
  queries.findListing(
    { 
      number_rooms: request.query.bedrooms,
      max_guests: request.query.maxGuests,
      max_price: request.query.maxPrice,
      amenities: request.query.amenities
    }).then(result => {
      if(result.length > 0) {
        queries.amenityList({amenities:result[0].id}).then(amenities => {
          if(amenities.length > 0) {
            response.render("listing", {title: 'Airbnb Search App', title2: 'Tori Thompson', listing: result, amenities: amenities });
      }
    });
    }
    else
      response.render("notFound", {title: 'Airbnb Search App', title2: 'Tori Thompson'});
  });
});
//Route to display a list of listings based on the city and state
app.get ("/airbnb/find-many", async (request, response) => {
  queries.findListings(
    { 
      number_rooms: request.query.bedrooms,
      state_id: request.query.state,
      city_id: request.query.city
    }).then(result => {
      if(result.length <= 0) {
        response.render('notFound', { title: 'Airbnb Search App', title2: 'Tori Thompson'});
      } else {
      response.render("listings", { title: 'Airbnb Search App', title2: 'Tori Thompson', listings: result });
      }
    });
});
//Route to display one listing based on the place ID
app.get("/single-listing", (request, response) => {
  queries.displayOne({id: request.query.id}).then(result => {
    response.render("listing", { title: 'Airbnb Search App', title2: 'Tori Thompson', listing: result, amenities: "" });
  });
});
//Query to retrieve the list of states, amenities already in results so set to "" to reuse listing page
app.get("/states", (request, response) => {
  queries.mysql(`SELECT id, name FROM states`).then(result => {
    response.json(result);
  });
});
//Query to retrieve the list of cities
app.get("/cities", (request, response) => {
  queries.mysql("SELECT * FROM cities where state_id = '" + request.query.state + "'").then(result => {
    response.json(result);
  });
});