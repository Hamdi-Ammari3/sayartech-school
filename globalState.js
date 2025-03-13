'use client';
import React, { createContext, useReducer, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { DB } from './firebaseConfig';

const GlobalStateContext = createContext();

const initialState = {
  students: [],
  drivers: [],
  loading: true,
  error: null,
};

const globalStateReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return {
        ...state,
        ...action.payload,
        loading: false,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    default:
      return state;
  }
};

export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalStateReducer, initialState);

  useEffect(() => {
    const storedDashboardName = localStorage.getItem("adminDahboardName");
    if (!storedDashboardName) {
      console.log("No dashboard name found in local storage");
      return;
    }

    const unsubscribeStudents = onSnapshot(
      query(collection(DB, "riders"), where("destination", "==", storedDashboardName)),
      (snapshot) => {
        const riders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const students = riders.filter((rider) => rider.rider_type === 'student');
        dispatch({
          type: "FETCH_SUCCESS",
          payload: { students },
        });
      }
    );

    const unsubscribeDrivers = onSnapshot(collection(DB, "drivers"), async (snapshot) => {
      try {
        const drivers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        // Filter drivers based on `lineSchool` in their `lines` array
        const matchingDrivers = drivers.filter(driver =>
          driver.line?.some(line => line.line_destination === storedDashboardName)
        );
    
        // Dispatch filtered drivers
        dispatch({
          type: "FETCH_SUCCESS",
          payload: { drivers: matchingDrivers },
        });
    
      } catch (error) {
        console.error("Error filtering drivers:", error);
        dispatch({
          type: "FETCH_ERROR",
          error,
        });
      }
    });
    
    
    // Cleanup listeners on unmount
    return () => {
      unsubscribeStudents();
      unsubscribeDrivers();
    };
  }, []);

  return (
    <GlobalStateContext.Provider value={state}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => React.useContext(GlobalStateContext);
