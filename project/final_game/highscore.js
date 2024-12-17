import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js"
import { Finalscore } from "./game.js";


const firebaseConfig = {
    apiKey: "AIzaSyA3nKMFkMmTKfcGiHDnT5QTAnBwRFbDNpM",
    authDomain: "fruit-ninja-b29b2.firebaseapp.com",
    projectId: "fruit-ninja-b29b2",
    storageBucket: "fruit-ninja-b29b2.firebasestorage.app",
    messagingSenderId: "536332668503",
    appId: "1:536332668503:web:b2478321443955798c9d12",
    measurementId: "G-P2N0LHL122"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);
var serverHighestscore;

console.log(myModule.getMyVariable());

saveuserScore(Finalscore)
function saveuserScore(Scoreholder){
    const user = auth.currentUser
    if(user) {
        const scoreDocRef = doc(collection(db, "users", user.uid, "scores"));
        try {
            setDoc(scoreDocRef, {
                score: Scoreholder
            });
            console.log("Score saved successfully");
        } catch(error) {
            console.error("Error saving score ", error);
        }
    } else {
        console.log("User not signed in");
    }

}

function getHighestScore() {
    const user = auth.currentUser
    if(user) {
        const scoreRef = collection(db, "users", user.uid, "scores");
        const q = query(scoreRef, orderBy("score", "desc"), limit(1));
        try{
            const querySnapshot = getDocs(q);
            if(!querySnapshot.empty) {
                return querySnapshot.docs[0].data().score
            } else {
                console.log("No scores found")
                return null;
            }
        } catch(error) {
            console.error("error fetching scores ", error);
            return null;
        }
    } else {
        console.log("User not signed in");
        return null;
    }


}

const serverScore = getHighestScore();
if (serverScore!=null){
    if (serverScore>Finalscore){
        serverHighestscore=serverScore
    }
    else{
        serverHighestscore=Finalscore
    }

}

export {serverHighestscore};