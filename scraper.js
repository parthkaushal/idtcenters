const axios = require('axios');
const cheerio = require('cheerio');
var admin = require('firebase-admin');

var serviceAccount = require("d:/parth/dev/keys/expproj-59130-firebase-adminsdk-c7uly-7dcf08800a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://expproj-59130.firebaseio.com"
});
let db = admin.firestore();

var cities = [];

async function getDetails(city) {
    await axios(city.url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      const content = $('.entry-content p:first-child').text();
      var addrStartIndex = content.indexOf("Address:");
      var addrEndIndex = content.indexOf("Phone:");
      if(addrEndIndex == -1)
        addrEndIndex = content.length
      var address
      if(addrStartIndex>=0)
        address = content.substring(addrStartIndex + 8, addrEndIndex).trim();
      city.address = address;
      return city;
      }).catch(console.error);    
}

async function getCentreList(){
    const url = 'http://centers.iskcondesiretree.com/india/';
    await axios(url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      const citiesList = $('.azindex > ul > li');
      citiesList.each(function(){
          var current = $(this);
          if(current.text().length > 1) {
              var centreUrl = current.find('a').attr('href');
              cities.push({name:current.text(), url:centreUrl});
          }
      });
  }).catch(console.error);  
  for (let city of cities) {
    await getDetails(city)
    console.log(JSON.stringify(city))
  }
  console.log("Number of cities:"+cities.length);
  //store to db
  let docRef = db.collection('Centers').doc('IndianCenters');

  let setAda = docRef.set({
    cities: cities
  });
  
}

getCentreList();

