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
      query(collection(DB, "students"), where("student_school", "==", storedDashboardName)),
      (snapshot) => {
        const students = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        dispatch({
          type: "FETCH_SUCCESS",
          payload: { students },
        });
      }
    );

    const unsubscribeDrivers = onSnapshot(collection(DB, "drivers"), async (snapshot) => {
      try {
        const drivers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
        // Filter drivers directly based on the `school_name` in `assigned_students`
        const matchingDrivers = drivers.filter(driver =>
          driver.assigned_students?.some(student => student.school_name === storedDashboardName)
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
