import React,{useState,useEffect} from 'react'
import { useGlobalState } from '../globalState'
import { BsArrowLeftShort } from "react-icons/bs"
import ClipLoader from "react-spinners/ClipLoader"

const Students = () => {
  const [selectedStudent,setSelectedStudent] = useState(null)
  const [driverInfo, setDriverInfo] = useState(null)
  const [nameFilter, setNameFilter] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [studentState,setStudentState] = useState('')

  const { students,drivers,loading } = useGlobalState()

  // Filtered students based on search term
  const filteredStudents = students.filter((student) => {
    // Check name
    const matchesName = student.student_full_name.includes(nameFilter);
  
    // Check address
    const matchesAddress = student.student_street.includes(addressFilter);
  
    // Check birthdate
    //const matchesBirthdate = formatDate(student.student_birth_date).includes(birthdateFilter);

    // Check student state
    const matchesState = student.student_trip_status.includes(studentState)
  
    // Combine filters
    return matchesName && matchesAddress && matchesState;
  });

  // Handle search input change
  const handleNameFilterChange = (event) => {
    setNameFilter(event.target.value);
  };
  
  const handleAddressFilterChange = (event) => {
    setAddressFilter(event.target.value);
  };
  
  const handleStudentStateChange = (event) => {
    setStudentState(event.target.value)
  }

  // Select the student
  const selectStudent = async (student) => {
    setSelectedStudent(student);
  };

  // Handle back action
  const goBack = () => {
    setSelectedStudent(null);
  };

  //Calculate student age
  const calculateAge = (birthdate) => {
    if (!birthdate?.seconds) return "-"; // Handle invalid timestamps
  
    const birthDate = new Date(birthdate.seconds * 1000); // Convert Firestore Timestamp to JS Date
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
  
    // Adjust age if the current date is before the birthdate this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age === 0 ? "-" : age; // Return "-" if age is 0
  };
  

  // Color based on student trip status
  const getTripClassName = (status) => {
    if (status === undefined || status === null) {
      return 'no-rating';
    }
    if (status === 'at home' || status === 'at school') {
      return 'student-at-home';
    }
    if (status === 'going to home' || status === 'going to school') {
      return 'in-route';
    }
  };

  // student current state based on trip status
  const getTripArabicName = (status) => {
    if (status === undefined || status === null) {
      return '--';
    }
    if (status === 'at home') {
      return 'في المنزل';
    }
    if (status === 'at school') {
      return 'في المدرسة';
    }
    if (status === 'going to home') {
      return 'في الطريق الى المنزل';
    }
    if (status === 'going to school') {
      return 'في الطريق الى المدرسة';
    }
  }

  // Find and set driver info when a student is selected
  useEffect(() => {
    if (selectedStudent) {
      const assignedDriver = drivers.find(
        (driver) => String(driver.id) === String(selectedStudent.driver_id)
      );
      setDriverInfo(assignedDriver || null)
      
    }
  }, [selectedStudent, drivers]);

  if(loading) {
    return(
      <div className='white_card-section-container'>
        <div style={{height:'100%',width:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <ClipLoader
            color={'#955BFE'}
            loading={loading}
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </div>
    )
  }

  return (
    <div className='white_card-section-container'>

      {selectedStudent ? (
        <>
          <div className="item-detailed-data-container">

            <div className="item-detailed-data-header">
              <div className='item-detailed-data-header-title'>
                <h5 style={{marginRight:'3px'}}>{selectedStudent.student_family_name}</h5>
                <h5>{selectedStudent.student_full_name}</h5>
              </div>
              <button className="info-details-back-button" onClick={goBack}>
                <BsArrowLeftShort size={24} className="email-back-button-icon"  />
              </button>  
            </div>

            <div className="item-detailed-data-main">

              <div className="item-detailed-data-main-box">
                  <div>
                    <h5 style={{marginLeft:'4px'}}>{selectedStudent.student_parent_full_name || selectedStudent.student_full_name}</h5>
                    <h5>{selectedStudent.student_family_name}</h5>
                  </div>
                  <div>
                    <h5>{selectedStudent.student_phone_number || '-'}</h5>
                  </div>
                  <div>
                    <h5 style={{marginLeft:'10px'}}>{selectedStudent.student_birth_date ? calculateAge(selectedStudent.student_birth_date) : '-'}</h5>
                    <h5>سنة</h5>
                  </div>
                  <div className="student-info-content-main-address-info">
                    <h5>{selectedStudent.student_home_address || '-'}</h5>
                    <h5>-</h5>
                   <h5>{selectedStudent.student_street || '-'}</h5>
                  </div>
                  <div className="student-info-content-main-address-info">
                    <h5>{selectedStudent.student_city || '-'}</h5>
                    <h5>-</h5>
                    <h5>{selectedStudent.student_state || '-'}</h5>
                  </div>
              </div>

              <>
                  {driverInfo ? (
                    <div className='item-detailed-data-main-box'>
                      <div>
                        <h5 style={{fontWeight:'700'}}>السائق</h5>
                      </div>
                      <div>
                        <h5 style={{marginLeft:'4px'}}>{driverInfo.driver_full_name || '-'}</h5>
                        <h5>{driverInfo.driver_family_name || '-'}</h5>
                      </div>
                      <div>
                        <h5>{driverInfo.driver_phone_number || '-'}</h5>
                      </div>
                      <div>
                        <h5>{driverInfo.driver_car_type || '-'}</h5>
                      </div>
                      <div>
                        <h5 style={{marginLeft:'10px'}}>موديل السيارة</h5>
                        <h5>{driverInfo.driver_car_model || '-'}</h5>
                      </div>
                      <div>
                        <h5 style={{marginLeft:'10px'}}>رقم لوحة</h5>
                        <h5>{driverInfo.driver_car_plate || '-'}</h5>
                      </div>                      
                    </div>
                  ) : (
                    <div style={{marginBottom:'50px'}} className='item-detailed-data-main-box'>
                      <h5>لا يوجد سائق</h5>
                    </div>
                  )}
                </>
              </div>
          </div>
        </>
      ) : (
        <div className='students-section-inner'>
          <div className='students-section-inner-titles'>
            <div  className='students-section-inner-title'>
              <input 
              onChange={handleNameFilterChange} 
              placeholder='الطالب' 
              type='text' 
              className='students-section-inner-title_search_input' />
            </div>
            <div className='students-section-inner-title'>
              <input 
              onChange={handleAddressFilterChange} 
              placeholder='العنوان' 
              type='text' 
              className='students-section-inner-title_search_input' />
            </div>
            <div className='students-section-inner-title'>
              <select onChange={handleStudentStateChange} value={studentState}>
                <option value=''>حالة الطالب</option>
                <option value='at home'>في المنزل</option>
                <option value='going to school'>في الطريق الى المدرسة</option>
                <option value='at school'>في المدرسة</option>
                <option value='going to home'>في الطريق الى المنزل</option>
              </select>
            </div>
          </div>
          <div className='all-items-list'>
            {filteredStudents.map((student, index) => (
              <div key={index} onClick={() => selectStudent(student)} className='single-item' >
                <h5>{student.student_full_name} {student.student_family_name}</h5>
                <h5>{student.student_street} - {student.student_city}</h5>
                <h5 className={getTripClassName(student.student_trip_status)}>{getTripArabicName(student.student_trip_status || '-')}</h5>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Students