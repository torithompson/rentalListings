const mysql = require("./config.js");

// queries a place and limits by amenities and number rooms
// it returns all fields from the "place" table, as well as the city name, state name, and the owner's first/last name and email
// returns a promise -- so you must use .then() to access its data
function findListing(criteria) {
    let query = `SELECT A.*, B.name as cityName, C.name as stateName, D.first_name, D.last_name, D.email
    FROM places A
    JOIN cities B on A.city_id = B.id
    JOIN states C on C.id = B.state_id
    JOIN users D ON A.user_id = D.id
    WHERE A.number_rooms >= ?
    AND A.price_by_night <= ?
    AND A.max_guest >= ?  LIMIT 1`;
    let safeQuery = mysql.functions.format(query, [criteria.number_rooms, criteria.max_price, criteria.max_guests]);

    if(criteria.amenities) {
    let query = `SELECT A.*, B.name as cityName, C.name as stateName, D.first_name, D.last_name, D.email
        FROM places A
        JOIN cities B on A.city_id = B.id
        JOIN states C on C.id = B.state_id
        JOIN users D ON A.user_id = D.id
        WHERE A.id IN (
        SELECT place_id FROM place_amenity 
        WHERE amenity_id 
        IN(?)
        GROUP BY place_id
        HAVING count(place_id) >= ?
    )
    AND A.number_rooms >= ?
    AND A.price_by_night <= ?
    AND A.max_guest >= ?  LIMIT 1`;
    let safeQuery = mysql.functions.format(query, [criteria.amenities, criteria.amenities.length, criteria.number_rooms, criteria.max_price, criteria.max_guests]);
   
    }
    
    return querySql(safeQuery);
}

// queries a list of places and limits by the number of rooms
// only returns 1 result -- that is a promise -- so you must use .then() to access its data
function findListings(criteria) {
    let selectQuery = `SELECT A.*, B.name as cityName, C.name as stateName FROM places A
        JOIN cities B ON A.city_id = B.id
        JOIN states C on B.state_id = C.id
        WHERE number_rooms >= ?
        AND B.id = ?
        AND C.id = ?`;
    let safeQuery = mysql.functions.format(selectQuery, [ criteria.number_rooms, criteria.city_id, criteria.state_id]);
    return querySql(safeQuery);
}
//Displays the matching listing based on place ID and the amenities that match that place ID
function displayOne(criteria) {
    let selectQuery = `SELECT A.*, C.name as amenityName, D.name as cityName, E.name as stateName
    FROM places A    
    JOIN place_amenity B ON B.place_id = A.id    
    JOIN amenities C ON B.amenity_id = C.id   
    JOIN cities D ON A.city_id = D.id
    JOIN states E ON D.state_id = E.id
     WHERE A.id = ?`;
    let safeQuery = mysql.functions.format(selectQuery, [ criteria.id]);
    return querySql(safeQuery);
}
//Queries the database for a list of all amenities that match that place ID
function amenityList(criteria) {
    let selectQuery = `SELECT A.name FROM amenities A
    JOIN place_amenity B ON A.id=B.amenity_id
    JOIN places C ON C.id = B.place_id
    WHERE C.id = ?`;
    let safeQuery = mysql.functions.format(selectQuery, [ criteria.amenities]);
    return querySql(safeQuery);
}
// export the functions so they can be used in other files
module.exports = {
    "findListing": findListing,
    "findListings": findListings,
    "mysql": querySql,
    "displayOne": displayOne,
    "amenityList": amenityList
};


/*****************************************************************
 *       Written by professor
 *****************************************************************/
function querySql(sql) {
    let con = mysql.getCon();

    con.connect(function(error) {
        if (error) {
          return console.error(error);
        } 
      });

    return new Promise((resolve, reject) => {
        con.query(sql, (error, sqlResult) => {
            if(error) {
                return reject(error);
            }           

            return resolve(sqlResult);
        });

        con.end();
    });
}
