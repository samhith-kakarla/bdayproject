import React, { FC, useState, createContext, useContext } from 'react';  
import firebase from '../../firebase/firebaseConfig';

// TYPES
import { Fairy } from '../types'; 
import { Twin } from '../types';
import { Cake } from '../types'; 
import { Order } from '../types'; 

export type FairyContextType = {
    // STATE
    fairy: Fairy | null; 
    matchedTwins: Twin[];
    selectedTwin: Twin | null; 
    matchedCakes: Cake[], 
    selectedCake: Cake | null;
    order: Order | null; 

    // ACTIONS
    setFairy: (fairy: Fairy) => void;
    setMatchedTwins: (matchedTwins: Twin[]) => void;
    setSelectedTwin: (selectedTwin: Twin) => void; 
    setMatchedCakes: (matchedCakes: Cake[]) => void; 
    setSelectedCake: (selectedCake: Cake) => void; 
    setOrder: (order: Order) => void; 
}

export const fairyContextDefault: FairyContextType = {
    // STATE
    fairy: null, 
    matchedTwins: [],
    selectedTwin: null,
    matchedCakes: [],
    selectedCake: null,
    order: null,

    // ACTIONS
    setFairy: () => {}, 
    setMatchedTwins: () => {}, 
    setSelectedTwin: () => {}, 
    setMatchedCakes: () => {}, 
    setSelectedCake: () => {}, 
    setOrder: () => {}, 
}


export const FairyContext = createContext<FairyContextType>(fairyContextDefault); 
export const useFairyContext = () => useContext(FairyContext); 



const FairyContextProvider: FC = ({ children }) => {
    const [fairy, setFairy] = useState(fairyContextDefault.fairy); 
    const [matchedTwins, setMatchedTwins] = useState(fairyContextDefault.matchedTwins); 
    const [selectedTwin, setSelectedTwin] = useState(fairyContextDefault.selectedTwin); 
    const [matchedCakes, setMatchedCakes] = useState(fairyContextDefault.matchedCakes); 
    const [selectedCake, setSelectedCake] = useState(fairyContextDefault.selectedCake); 
    const [order, setOrder] = useState(fairyContextDefault.order); 

    
    function becomeAFairy (fairy: Fairy) {
        firebase.firestore().collection('fairys').add({
            name: fairy.name, email: fairy.email, birthday: fairy.birthday, 
        }).then((doc) => {
            console.log(doc.id); 
            const newFairy = {
                id: doc.id, name: fairy.name, email: fairy.email, birthday: fairy.birthday
            }; 
            setFairy(newFairy); 
        }).catch((error) => {
            console.log(error); 
            console.log("Fairy not added"); 
        });
    }

    function getMatchedTwins (birthday: string) {
        firebase.firestore().collection('twins').where("birthday", "==", birthday).get().then((query) => {
            console.log(query); 
            query.docs.forEach((doc) => {
                const matchedTwin: Twin = {
                    id: doc.id, 
                    name: doc.data().name, 
                    age: doc.data().age, 
                    birthday: doc.data().birthday,
                    address: doc.data().address, 
                    cake_tags: doc.data().cake_tags,
                }
                setMatchedTwins([...matchedTwins, matchedTwin]); 
            });
            console.log(matchedTwins); 
            console.log("Got matched Twins!"); 
        }).catch((error) => {
            console.log(error); 
            console.log("Error getting matched twins");
        });
    }

    function selectATwin (twin: Twin) {
        setSelectedTwin(twin); 
        firebase.firestore().collection('twins').doc(twin.id).update({
            match: fairy?.email, 
        }).then(() => {
            console.log("Twin Selected!"); 
        }).catch((error) => {
            console.log(error); 
            console.log("Twin not selected"); 
        });
    }

    async function getFilteredCakes (tag1: string, tag2: string, tag3: string) {
        const tag1CakesRef = firebase.firestore().collection('cakes').where("tag", "==", tag1).get(); 
        const tag2CakesRef = firebase.firestore().collection('cakes').where("tag", "==", tag2).get(); 
        const tag3CakesRef = firebase.firestore().collection('cakes').where("tag", "==", tag3).get(); 

        const [tag1CakesSnapshot, tag2CakesSnapshot, tag3CakesSnapshot] = await Promise.all([
            tag1CakesRef, tag2CakesRef, tag3CakesRef
        ]);

        const tag1Cakes = tag1CakesSnapshot.docs; 
        const tag2Cakes = tag2CakesSnapshot.docs;
        const tag3Cakes = tag3CakesSnapshot.docs;
        const filteredCakes = tag1Cakes.concat(tag2Cakes).concat(tag3Cakes);

        filteredCakes.forEach((cake: any) => {
            setMatchedCakes([...matchedCakes, cake]); 
        }); 
    }

    function selectACake (cake: Cake) {
        setSelectedCake(cake); 
    }

    function purchaseCake (order: Order) {
        setOrder(order); 
        firebase.firestore().collection('orders').add({
            cakeID: order.cakeID, 
            address: order.address, 
            complete: false, 
        }).then((doc) => {
            console.log(doc); 
            console.log("Order sent to DB"); 
            setOrder(null); 
        }).then((error) => {
            console.log(error); 
            console.log("Order not sent to DB"); 
        });
    }


    return (
        <FairyContext.Provider value={{ 
            fairy, matchedTwins, selectedTwin, matchedCakes, selectedCake, order, 
            setFairy, setMatchedTwins, setSelectedTwin, setMatchedCakes, setSelectedCake, setOrder
        }}>
            { children }
        </FairyContext.Provider>
    )
}


export default FairyContextProvider; 