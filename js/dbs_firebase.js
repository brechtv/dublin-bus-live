firebase.initializeApp({
  apiKey: 'AIzaSyAR1OXXpPz-rZ7hu8vpcJKo3iI3d7DkD7A',
  authDomain: 'dublinbuslive.firebaseapp.com',
  projectId: 'dublinbuslive'
});

var PROD = true;
// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};

firestore.settings(settings);

function fbw(term, collection) {
  if(PROD) {
  try {
    date_strf = new Date()

    db.collection(collection).add({
        term: term,
        date: date_strf
    })

  .then(function(docRef) {
      console.log(docRef);
  })
  .catch(function(error) {
      console.error("Error adding document: ", error);
  });
    } catch(err) {
    console.log(err)
  }
  }
}
