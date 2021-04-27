import firebase from 'firebase/app'; 
import 'firebase/auth'; 
import 'firebase/firestore'; 
import 'firebase/storage'; 

const firebaseConfig = {
    apiKey: "AIzaSyAdKntD7iZ8Eoff8G_xN6ciDW_0rrQSb8A",
    authDomain: "blissfairy-d74c7.firebaseapp.com",
    projectId: "blissfairy-d74c7",
    storageBucket: "blissfairy-d74c7.appspot.com",
    messagingSenderId: "473113318149",
    appId: "1:473113318149:web:9139ae90ce73459e605d6c",
    measurementId: "G-VJQV32ZV3R"
};

const Firebase = firebase.initializeApp(firebaseConfig); 

export const AuthProviders = {
    google: new firebase.auth.GoogleAuthProvider()
}

export const auth = firebase.auth(); 
export const firestore = firebase.firestore(); 
export default Firebase;