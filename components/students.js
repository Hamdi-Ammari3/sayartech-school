import React,{useState,useEffect} from 'react'
import { useGlobalState } from '../globalState'
import { BsArrowLeftShort } from "react-icons/bs"
import { FaCaretUp,FaCaretDown } from "react-icons/fa6"
import { FcCalendar } from "react-icons/fc"
import { Modal, Table } from "antd"
import dayjs from "dayjs"

const Students = () => {
  const { students,drivers } = useGlobalState()

  const [selectedStudent,setSelectedStudent] = useState(null)
  const [driverInfo, setDriverInfo] = useState(null)
  const [nameFilter, setNameFilter] = useState("")
  const [addressFilter, setAddressFilter] = useState("")
  const [ageDirection, setAgeDirection] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingTimetable, setEditingTimetable] = useState([])
  const [isEditingTimeTable, setIsEditingTimeTable] = useState(false)
  const [selectedDays, setSelectedDays] = useState([])

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
  }

  // Filtered students based on search term
  let filteredStudents = students.filter((student) => {
    const matchesName = student.full_name.includes(nameFilter) // check name
    const matchesAddress = student.street.includes(addressFilter) // check address
    return matchesName && matchesAddress
  });

  // Sort students based on `ageDirection`
  if (ageDirection) {
    filteredStudents = [...filteredStudents].sort((a, b) => {
      const ageA = calculateAge(a.birth_date);
      const ageB = calculateAge(b.birth_date);
      return ageDirection === "asc" ? ageA - ageB : ageB - ageA;
    });
  }

  // Handle search input change
  const handleNameFilterChange = (event) => setNameFilter(event.target.value);

  // Handle address input change
  const handleAddressFilterChange = (event) => setAddressFilter(event.target.value);
  
  // Sort by bigger age
  const handleSortByBiggerAge = () => setAgeDirection("asc");

  // Sort by smallest age
  const handleSortBySmallestAge = () => setAgeDirection("desc");
  
  // Select the student
  const selectStudent = async (student) => {
    setSelectedStudent(student);
  };

  // Handle back action
  const goBack = () => {
    setSelectedStudent(null);
  };

  // Week days
  const daysOfWeek = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت"
  ];

  //Open the time-table Modal
  const handleOpenModal = () => {
    setEditingTimetable(
      daysOfWeek.map((day) => {
        const dayData =
          selectedStudent?.timetable?.find((t) => t.day === day) || {
            day,
            active: false,
            startTime: null,
            endTime: null,
          };
          return {
            ...dayData,
            active: dayData.active, // Ensure active is true if times are set
          };
      })
    );
    setIsModalVisible(true); // Show the modal
  };

  // Close the time-table Calendar
  const handleCloseModal = () => {
    setIsModalVisible(false)
    setIsEditingTimeTable(false)
  };
  
  // Find and set driver info when a student is selected
  useEffect(() => {
    if (selectedStudent) {
      const assignedDriver = drivers.find(
        (driver) => String(driver.id) === String(selectedStudent.driver_id)
      );
      setDriverInfo(assignedDriver || null)
      
    }
  }, [selectedStudent, drivers]);

  return (
    <div className='white_card-section-container'>

      {selectedStudent ? (
        <>
          <div className="item-detailed-data-container">

            <div className="item-detailed-data-header">
              <div className='item-detailed-data-header-title'>
                <h5>{selectedStudent.phone_number || '-'}</h5>
                <h5 style={{marginLeft:'5px',marginRight:'5px'}}>-</h5>
                <h5 style={{marginRight:'4px'}}>{selectedStudent.family_name}</h5>
                <h5>{selectedStudent.parent_full_name || selectedStudent.full_name}</h5>
              </div>
              <button className="info-details-back-button" onClick={goBack}>
                <BsArrowLeftShort size={24} className="email-back-button-icon"  />
              </button>  
            </div>

            <div className="item-detailed-data-main">

              <div className="student-detailed-data-main-firstBox">

                <div>
                  <h5 style={{marginLeft:'4px'}}>{selectedStudent.full_name}</h5>
                  <h5 style={{marginLeft:'4px'}}>-</h5>
                  <h5 style={{marginLeft:'4px'}}>{selectedStudent.birth_date ? calculateAge(selectedStudent.birth_date) : '-'}</h5>
                  <h5 style={{marginLeft:'10px'}}>سنة</h5>
                </div>

                <div>
                  <h5 style={{marginLeft:'5px'}}>التوقيت الدراسي</h5>
                  <button className="student-edit-car-type-btn" onClick={handleOpenModal}>
                    <FcCalendar size={24}/>
                  </button>
                  {/* Timetable Modal */}
                  <Modal
                    title="التوقيت الدراسي"
                    open={isModalVisible}
                    onCancel={handleCloseModal}
                    footer={null}
                      centered
                    >
                      <Table
                        dataSource={editingTimetable}
                        columns={[
                          {
                            title: "وقت النهاية",
                            dataIndex: "endTime",
                            key: "endTime",
                            render: (time, record) =>
                              record.day === isEditingTimeTable || selectedDays.includes(record.day) ? (
                                <input
                                  type="time"
                                  value={
                                    time ? dayjs(time.seconds ? time.toDate() : time).format("HH:mm") : ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(e.target.value, record.day, "endTime")
                                  }
                                />
                              ) : record.active && time ? (
                                dayjs(time.seconds ? time.toDate() : time).format("HH:mm")
                              ) : (
                                "-"
                              ),
                          },
                          {
                            title: "وقت البداية",
                            dataIndex: "startTime",
                            key: "startTime",
                            render: (time, record) =>
                              record.day === isEditingTimeTable || selectedDays.includes(record.day) ? (
                                <input
                                  type="time"
                                  value={
                                    time ? dayjs(time.seconds ? time.toDate() : time).format("HH:mm") : ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(e.target.value, record.day, "startTime")
                                  }
                                />
                              ) : record.active && time ? (
                                dayjs(time.seconds ? time.toDate() : time).format("HH:mm")
                              ) : (
                                "-"
                              ),
                          },
                          {
                            title: "اليوم",
                            dataIndex: "day",
                            key: "day",
                          },
                        ]}
                        rowKey="day"
                        pagination={false}
                      />
                    </Modal>
                </div>

                <div>
                  <h5 style={{marginLeft:'4px'}}>{selectedStudent.home_address || '-'}</h5>
                  <h5 style={{marginLeft:'4px'}}>-</h5>
                  <h5>{selectedStudent.street || '-'}</h5>
                </div>

                <div>
                  <h5 style={{marginLeft:'4px'}}>{selectedStudent.city || '-'}</h5>
                  <h5 style={{marginLeft:'4px'}}>-</h5>
                  <h5>{selectedStudent.state || '-'}</h5>
                </div>

              </div>

              <div className="student-detailed-data-main-second-box">
                {driverInfo ? (
                  <div>
                    <div className="eligible-item-item">
                      <h5 style={{fontWeight:'700'}}>السائق</h5>
                    </div>
                    <div className="eligible-item-item">
                      <h5 style={{marginLeft:'4px'}}>{driverInfo.driver_full_name || '-'}</h5>
                      <h5 style={{marginLeft:'4px'}}>{driverInfo.driver_family_name || '-'}</h5>
                      <h5 style={{marginLeft:'4px'}}>-</h5>
                      <h5>{driverInfo.driver_phone_number || '-'}</h5>
                    </div>
                    <div className="eligible-item-item">
                      <h5>{driverInfo.driver_car_type || '-'}</h5>
                    </div>
                    <div className="eligible-item-item">
                      <h5 style={{marginLeft:'10px'}}>موديل السيارة</h5>
                      <h5>{driverInfo.driver_car_model || '-'}</h5>
                    </div>
                    <div className="eligible-item-item">
                      <h5 style={{marginLeft:'10px'}}>رقم لوحة</h5>
                      <h5>{driverInfo.driver_car_plate || '-'}</h5>
                    </div>                      
                  </div>
                ) : (
                  <div style={{marginBottom:'50px'}} className='item-detailed-data-main-box'>
                    <h5>لا يوجد سائق</h5>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className='students-section-inner'>
          <div className='students-section-inner-titles'>
            <div  className='students-section-inner-title'>
              <input 
                onChange={handleNameFilterChange} 
                placeholder='الاسم' 
                type='text'
              />
            </div>

            <div className="students-section-inner-title">
              <input 
                onChange={handleAddressFilterChange} 
                placeholder="العنوان" 
                type="text" 
              />
            </div>

            <div className='students-section-inner-title'>
              <div className='driver-rating-box'>
                <button onClick={handleSortByBiggerAge}>
                  <FaCaretDown 
                    size={18} 
                    className={ageDirection === 'asc' ? 'driver-rating-box-icon-active':'driver-rating-box-icon'}/>
                </button>
                <h5>العمر</h5>
                <button onClick={handleSortBySmallestAge}>
                  <FaCaretUp 
                    size={18}
                    className={ageDirection === 'desc' ? 'driver-rating-box-icon-active':'driver-rating-box-icon'}/>
                </button>
              </div>
            </div>
          </div>

          <div className='all-items-list'>
            {filteredStudents.map((student, index) => (
              <div key={index} onClick={() => selectStudent(student)} className='single-item' >
                <h5>{student.full_name} {student.family_name}</h5>
                <h5>{student.street} - {student.city}</h5>
                <h5>{student.birth_date ? calculateAge(student.birth_date) : '-'}</h5>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Students