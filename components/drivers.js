import React,{useState,useEffect} from 'react'
import { updateDoc,doc,arrayUnion } from 'firebase/firestore'
import { DB } from '../firebaseConfig'
import { useGlobalState } from '../globalState'
import { BsArrowLeftShort } from "react-icons/bs"
import ClipLoader from "react-spinners/ClipLoader"

const Drivers = () => {
  const [nameFilter, setNameFilter] = useState("")
  const [carTypeFilter,setCarTypeFilter] = useState('')
  const [carPlateFilter,setCarPlateFilter] = useState('')
  const [selectedDriver,setSelectedDriver] = useState(null)
  const [assignedStudents, setAssignedStudents] = useState([])
  const [newRating, setNewRating] = useState("")
  const [ratingLoading,setRatingLoading] = useState(false)

  const { drivers,students,loading} = useGlobalState()

  // Filtered students based on search term
  const filteredDrivers = drivers.filter((driver) => {
    // Check name filter
    const matchesName = driver.driver_full_name.includes(nameFilter);
  
    // Check car type filter
    const matchesCarType = !carTypeFilter || driver.driver_car_type.trim() === carTypeFilter;
  
    // Check car plate filter
    const matchesCarPlate = driver.driver_car_plate.includes(carPlateFilter);
  
    // Combine all filters
    return matchesName && matchesCarType && matchesCarPlate;
  });
  
  // Handle search input change
  const handleNameFilterChange = (event) => {
    setNameFilter(event.target.value);
  };
  
  const handleCarPlateChange = (event) => {
    setCarPlateFilter(event.target.value);
  };
  
  const handleCarTypeFilterChange = (event) => {
    setCarTypeFilter(event.target.value);
  };

  // Select the driver
  const selectDriver = async (driver) => {
    setSelectedDriver(driver);
  };
  
  // Handle back action
  const goBack = () => {
    setSelectedDriver(null);
  };

  //Fetch assigned students
  const fetchAssignedStudents = () => {
    const assigned = students
      .filter(
        (student) => 
          student.driver_id === selectedDriver.driver_user_id
      )
    setAssignedStudents(assigned)
  }

  //Update data whenever the driver data changes
  useEffect(() => {
    if (selectedDriver) {
      fetchAssignedStudents();
    }
  }, [selectedDriver,students]);

  //Add Rating
  const addDriverRating = async (driverId) => {
    if (!newRating) {
      alert("الرجاء اختيار تقييم");
      return;
    }
    setRatingLoading(true)
    try {
      const driverRef = doc(DB, "drivers", driverId);

      // Update the `rating` array in Firestore
      await updateDoc(driverRef, {
        rating: arrayUnion(Number(newRating)), // Add the new rating to the array
      });

      alert("تم إضافة التقييم بنجاح!");
      setNewRating(""); // Reset the rating input
    } catch (error) {
      console.error("Error adding rating:", error);
      alert("فشل في إضافة التقييم. الرجاء المحاولة مرة أخرى.");
    } finally {
      setRatingLoading(false)
    }
  };

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
      {selectedDriver ? (
        <>
          <div className="item-detailed-data-container">

            <div className='item-detailed-data-header'>
              <div className='item-detailed-data-header-title'>
                <h5 style={{marginRight:'3px'}}>{selectedDriver.driver_family_name}</h5>
                <h5>{selectedDriver.driver_full_name}</h5>
              </div>
              <button className="info-details-back-button" onClick={goBack}>
                <BsArrowLeftShort size={24}/>
              </button>
            </div>
            
            <div className="item-detailed-data-main">

              <div className="item-detailed-data-main-box">
                  <div>
                    <h5>{selectedDriver.driver_car_type || '-'}</h5>
                  </div>
                  <div>
                    <h5>{selectedDriver.driver_phone_number || '-'}</h5>
                  </div>
                  <div>
                    <h5 style={{marginLeft:'10px'}}>موديل السيارة</h5>
                    <h5>{selectedDriver.driver_car_model || '-'}</h5>
                  </div>
                  <div>
                    <h5 style={{marginLeft:'10px'}}>لوحة السيارة</h5>
                    <h5>{selectedDriver.driver_car_plate || '-'}</h5>
                  </div>
                  <div className='select-rating-div'>
                    <h5 style={{marginLeft:'12px'}}>اضافة تقييم</h5>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(e.target.value)}
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                    {ratingLoading ? (
                      <div className='add-rating-button-loader'>
                        <ClipLoader
                          color={'#fff'}
                          loading={ratingLoading}
                          size={10}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                        />
                      </div>
                    ) : (
                      <button onClick={() => addDriverRating(selectedDriver.id)}>اضف</button>
                    )}
                    
                  </div>
              </div>

              <>
                {assignedStudents.length > 0 ? (
                  <div className='item-detailed-data-main-second-box'>
                    {assignedStudents.map((assign,index) => (
                    <div key={index} className="students-assigned-to-the-driver">
                      <h5 style={{marginLeft:'4px'}}>{assign.student_full_name}</h5>
                      <h5>{assign.student_family_name}</h5>
                    </div>
                    ))}
                  </div>
                ) : (
                  <div style={{marginBottom:'50px'}} className='item-detailed-data-main-box'>
                    <h5>لا يوجد طلاب</h5>
                  </div>
                )}
              </>
            </div>
          </div>
        </>
      ) : (
        <div className='students-section-inner'>
          <div className='students-section-inner-titles'>
            <div className='students-section-inner-title'>
              <input 
                onChange={handleNameFilterChange} 
                placeholder='الاسم' 
                type='text' 
                className='students-section-inner-title_search_input'
              />
            </div>
            <div className='students-section-inner-title'>
              <select
                value={carTypeFilter}
                onChange={handleCarTypeFilterChange}
              >
                <option value=''>نوع السيارة</option>
                <option value='ستاركس'>ستاركس</option>
                <option value='سيارة صالون ٥ راكب'>سيارة صالون ٥ راكب</option>
                <option value='سيارة خاصة ٧ راكب'>سيارة خاصة ٧ راكب</option>
                <option value='باص صغير ١٢ راكب'>باص صغير ١٢ راكب</option>
                <option value='باص متوسط ١٤ راكب'>باص متوسط ١٤ راكب</option>
                <option value='باص كبير ٣٠ راكب'>باص كبير ٣٠ راكب</option>
              </select>
            </div>
            <div className='students-section-inner-title'>
              <input 
                onChange={handleCarPlateChange} 
                placeholder='لوحة السيارة' 
                type='text' 
                className='students-section-inner-title_search_input'
              />
            </div>
          </div>
        <div className='all-items-list'>
          {filteredDrivers.map((driver, index) => (
            <div key={index} onClick={() => selectDriver(driver)} className='single-item'>
              <h5>{`${driver.driver_full_name} ${driver.driver_family_name}` || '-'}</h5>
              <h5>{driver.driver_car_type || '-'}</h5>
              <h5>{driver.driver_car_plate || '-'}</h5>
            </div>
          ))}
        </div>     
      </div>
      )}
      
    </div>
  )
}

export default Drivers