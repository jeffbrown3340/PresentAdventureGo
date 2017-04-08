function getEventfulObjs(){
  console.log("GEO howManyResults=", howManyResults);

  // harvest the values from HTML
  // change ID names to match Andrea
  // done, added IDs iL/iC to input fields 4-2-2017-1645
  var qL = $("#iL").val();
  var qC = $("#iC").val();
  
  // if values are empty, do nothing
  // rationale -- the input field placeholders give instructions
  if (qL === "" && qC === "") {return}
  if (qL !== "" && qC !== "") {
    if ((qL + "-" + qC).toUpperCase() === "NASHVILLE-MUSIC"){
      writeSearchData([(qL + "-" + qC).toUpperCase(), 11])
    }
    if ((qL + "-" + qC).toUpperCase() === "REPORT-CREATE"){
      windowOpen("chart/traffic.html");
      return;
    }
  } 

  // Next put the dates into a two element array
  // if grabbing from HTML
  //var d0 = [ $("#dateFrom").val(), $("#dateThru").val()];
  // if using current date thru plus 30 days
  var d0 = [moment().format("MM/DD/YYYY"), moment().add(30, 'days').format("MM/DD/YYYY")];
  console.log(qL, qC, d0[0], d0[1]);

  // validate both dates
  if (moment(d0[0], "MM/DD/YYYY").isValid() && moment(d0[1], "MM/DD/YYYY").isValid()) {
    console.log("dates are valid");

    //concate into Eventful string YYYYMMDD00-YYYYMMDD00
    //Eventful ignores the final two zeroes in the date strings
    var d1 = 
    (
      moment(d0[0], "MM/DD/YYYY").format("YYYYMMDD") + "00-" + 
      moment(d0[1], "MM/DD/YYYY").format("YYYYMMDD") + "00"
    ); 
      console.log(qL, qC, d1);


      //store query to Eventful DATA object
     var oArgs = {
        app_key: "RzH4FnhD29mKTN4g",
        //q: qC,
        //where: qL,
        "date": d1,
        "include": "tags,categories",
        page_size: 5,
        sort_order: "popularity",
     };

    if (qL !== ""){oArgs.where = qL}
    if (qC !== ""){oArgs.q = qC}


     // call Eventful API with our query
     // passing date string for test display, can be removed
      queryEventfulAPI(oArgs, d1);     

  }
  else
  {
    //error condition, discuss how to handle
    console.log(d0 + " is invalid");
  }
}

function windowOpen(url){
  window.open(url);
}

function queryEventfulAPI(oArgs, d1)
{
   // the Eventful call
   EVDB.API.call("/events/search", oArgs, function(oData) {

      // evts is the complete object
      // for production, return evts?
      var evts = oData.events;
      console.log(oData);

      //call the map and put it into the html
      $("#map").html(initMap(evts));

      // put the data into the HTML testing page
      // 4-2-2017 1645 put the data into Andrea's HTML
      for (var i=0; i < 5; i++) {

        // this line makes the entire div thumbnail a link to new window/event web page
        $("#th" + i).attr("onclick", "windowOpen('" + evts.event[i].url + "')");

        // continue populating the HTML
        var imageURL = evts.event[i].image;
        if (imageURL === null || imageURL === undefined) {
            imageURL = "default.JPEG";
        } else { imageURL = evts.event[i].image.medium.url}

        $("#th" + i + " .caption h3").html(evts.event[i].title);
        $("#th" + i + " .caption p").html
          (
            moment(evts.event[i].start_time).format("dddd, MMMM D, YYYY, h:mm:ss a") + "<br>" + 
            evts.event[i].venue_name + "<br>" + 
            evts.event[i].venue_address + "<br>" + evts.event[i].city_name
          );
        $("#th" + i + " img").attr("src", imageURL);
      }

    });
}

function writeSearchData(searchItem) {
     var dataRef = firebase.database();
     dataRef.ref().push({
        searchTerm: searchItem[0],
        count: searchItem[1]
      });
}
