'use client';
import React, { createContext, useReducer, useEffect } from 'react';
import { collection, onSnapshot, query, where,doc,getDoc } from 'firebase/firestore';
import { DB } from './firebaseConfig';

const GlobalStateContext = createContext();

const initialState = {
  users: [],
  students: [],
  drivers: [],
  schools: [],
  emails: [],
  privateCarRequests: [],
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

    // Real-time listeners
    const unsubscribeUsers = onSnapshot(collection(DB, 'users'), (snapshot) => {
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { users },
      });
    });

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
    
        // Filter drivers
        const matchingDrivers = [];
        for (const driver of drivers) {
          if (driver.assigned_students && driver.assigned_students.length > 0) {
            const firstStudentId = driver.assigned_students[0];
    
            // Fetch the first assigned student's data
            const studentRef = doc(DB, "students", firstStudentId);
            const studentDoc = await getDoc(studentRef);
    
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
    
              // Check if the student's school matches the logged-in school's name
              if (studentData.student_school === storedDashboardName) {
                matchingDrivers.push(driver);
              }
            }
          }
        }
    
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
    

    /*
    const unsubscribeDrivers = onSnapshot(collection(DB, 'drivers'), (snapshot) => {
      const drivers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { drivers },
      });
    });
  */
    const unsubscribeSchools = onSnapshot(collection(DB, 'schools'), (snapshot) => {
      const schools = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { schools },
      });
    });

    const unsubscribeEmails = onSnapshot(collection(DB, 'emails'), (snapshot) => {
      const emails = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { emails },
      });
    });

    const unsubscribePrivateCarRequests = onSnapshot(collection(DB, 'carRequest'), (snapshot) => {
      const privateCarRequests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { privateCarRequests },
      });
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeUsers();
      unsubscribeStudents();
      unsubscribeDrivers();
      unsubscribeSchools();
      unsubscribeEmails();
      unsubscribePrivateCarRequests();
    };
  }, []);

  return (
    <GlobalStateContext.Provider value={state}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => React.useContext(GlobalStateContext);
