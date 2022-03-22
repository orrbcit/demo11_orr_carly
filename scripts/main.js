var currentUser;
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        currentUser = db.collection("users").doc(user.uid); //global
        console.log(currentUser);

        // the following functions are always called when someone is logged in
        read_display_Quote();
        insertName();
        populateCardsDynamically();
    } else {
        // No user is signed in.
        console.log("No user is signed in");
        window.location.href = "login.html";
    }
});


//----------------------------------------------------------
// This is a function that gets called everytime the page loads
// to display a quote of the day.  At the moment, it only displays
// the "tuesday" quote.  It can be enhanced to display a different
// one dependingon which day of the week it is!
//----------------------------------------------------------
function read_display_Quote() {
    //console.log("inside the function")

    //get into the right collection
    db.collection("quotes").doc("tuesday")
        .onSnapshot(function (tuesdayDoc) {
            //console.log(tuesdayDoc.data());
            document.getElementById("quote-goes-here").innerHTML = tuesdayDoc.data().quote;
        })
}
//read_display_Quote();

//---------------------------------------------------------------------------
// This is a function that gets called everytime the page loads.
// It is meant to get the name of the user who is logged in, and insert it 
// on the page for a warm welcome. 
//---------------------------------------------------------------------------
function insertName() {
    // to check if the user is logged in:
    currentUser.get().then(userDoc => {
        //get the user name
        var user_Name = userDoc.data().name;
        console.log(user_Name);
        $("#name-goes-here").text(user_Name); //jquery
        // document.getElementByID("name-goes-here").innetText=user_Name;
    })
}
//insertName();

//---------------------------------------------------------------------
// This function populates the Hikes collection with some fake data
// it has numerical values for length, duration, etc. so that we can sort later
// It also has an extra field to store timestamps
//----------------------------------------------------------------------
function writeHikes() {
    //define a variable for the collection you want to create in Firestore to populate data
    var hikesRef = db.collection("Hikes");

    hikesRef.add({
        id: "BBY01",
        name: "Burnaby Lake Park Trail", //replace with your own city?
        city: "Burnaby",
        province: "BC",
        level: "easy",
        length: 10, //number value
        length_time: 60, //number value
        last_updated: firebase.firestore.FieldValue.serverTimestamp() //current system time
    });
    hikesRef.add({
        id: "AM01",
        name: "Buntzen Lake Trail", //replace with your own city?
        city: "Anmore",
        province: "BC",
        level: "moderate",
        length: 10.5, //number value
        length_time: 80, //number value
        last_updated: firebase.firestore.Timestamp.fromDate(new Date("March 10, 2022"))
    });
    hikesRef.add({
        id: "NV01",
        name: "Mount Seymour Trail", //replace with your own city?
        city: "North Vancouver",
        province: "BC",
        level: "hard",
        length: 8.2, //number value
        length_time: 120, //number value
        last_updated: firebase.firestore.Timestamp.fromDate(new Date("January 1, 2022"))
    });
}

//---------------------------------------------------------------------
// This is a function that is called when everytime the page loads
// to read from the Hikes collection, go through each card,
// and dynamically creates a bootstrap card to display each hike.
// You can change the card style by using a different template. 
//---------------------------------------------------------------------
function populateCardsDynamically() {
    let hikeCardTemplate = document.getElementById("hikeCardTemplate");
    let hikeCardGroup = document.getElementById("hikeCardGroup");

    db.collection("Hikes")
    .orderBy("length_time")  //insert variable that represents the sortkey
    .limit(2)
    .get()
        .then(allHikes => {
            allHikes.forEach(doc => {
                var hikeName = doc.data().name; //gets the name field
                var hikeID = doc.data().id; //gets the unique ID field
                var hikeLength = doc.data().length; //gets the length field
                let testHikeCard = hikeCardTemplate.content.cloneNode(true);
                testHikeCard.querySelector('.card-title').innerHTML = hikeName;

                //testHikeCard.querySelector('.card-length').innerHTML = hikeLength;

                //NEW LINE: update to display length, duration, last updated
                testHikeCard.querySelector('.card-length').innerHTML =
                    "Length: " + doc.data().length + " km <br>" +
                    "Duration: " + doc.data().length_time + "min <br>" +
                    "Last updated: " + doc.data().last_updated.toDate();


                testHikeCard.querySelector('a').onclick = () => setHikeData(hikeID);
                testHikeCard.querySelector('img').src = `./images/${hikeID}.jpg`;

                testHikeCard.querySelector('i').id = 'save-' + hikeID;
                testHikeCard.querySelector('i').onclick = () => saveBookmark(hikeID);

                hikeCardGroup.appendChild(testHikeCard);
            })

        })
}
//populateCardsDynamically();

function saveBookmark(hikeID) {
    currentUser.set({
            bookmarks: firebase.firestore.FieldValue.arrayUnion(hikeID)
        }, {
            merge: true
        })
        .then(function () {
            console.log("bookmark has been saved for: " + currentUser);
            var iconID = 'save-' + hikeID;
            //console.log(iconID);
            document.getElementById(iconID).innerText = 'bookmark';
        });
}

//--------------------------------------------------------------
// This function saves the current hikeID into the localStorage
//--------------------------------------------------------------
function setHikeData(id) {
    localStorage.setItem('hikeID', id);
}