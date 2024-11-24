import React,{useState,useEffect} from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { addDoc, collection,Timestamp } from 'firebase/firestore';
import { DB } from '../firebaseConfig'

const cars = [
  {label: 'سيارة خاصة صالون ',value: 'سيارة خاصة صالون ' },
  {label:'سيارة خاصة ٧ راكب ',value:'سيارة خاصة ٧ راكب '},
  {label:'ستاركس ',value:'ستاركس '},
  {label:'باص صغير ١٢ راكب',value:'باص صغير ١٢ راكب'},
  {label:'باص متوسط ١٤ راكب',value:'باص متوسط ١٤ راكب'},
  {label:'باص كبير ٣٠ راكب',value:'باص كبير ٣٠ راكب'}
]

const PrivateCarRequest = () => {

  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [numberOfCars, setNumberOfCars] = useState(0);
  const [carType, setCarType] = useState(null);
  const [schoolName,setSchoolName] = useState('')
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get the logged in school name
  useEffect(() => {
    const storedName = localStorage.getItem('adminDahboardName');
    setSchoolName(storedName)
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime || !numberOfCars || !carType) {
      setError('الرجاء التاكد من ادخال جميع البيانات');
      return;
    }
    setError('');
    setLoading(true);
  
    // Combine the selected date with the times for accurate datetime storage
    const combinedStartTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      startTime.getHours(),
      startTime.getMinutes()
    );
    
    const combinedEndTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      endTime.getHours(),
      endTime.getMinutes()
    );
  
    try {
      await addDoc(collection(DB, 'carRequest'), {
        sender:schoolName,
        date: Timestamp.fromDate(new Date(date.setHours(0, 0, 0, 0))), // Date part only
        startTime: Timestamp.fromDate(combinedStartTime), // Exact start time
        endTime: Timestamp.fromDate(combinedEndTime), // Exact end time
        numberOfCars,
        carType: carType.value,
        request_send_date: Timestamp.fromDate(new Date()), // Current timestamp
      });
      alert('تم ارسال الطلب بنجاح');
      setDate(null);
      setStartTime(null);
      setEndTime(null);
      setNumberOfCars(0);
      setCarType(null);
    } catch (err) {
      alert('حدث خطا ما الرجاء المحاولة مرة ثانية');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className='white_card-section-container'>
      <div className='private_car_request_header'>
        <h4>طلب سيارات خاصة</h4>
      </div>
      <div className='private_car_request_form_div'>
      <form onSubmit={handleSubmit} className='private_car_request_form'>
        <div className='private_car_request_form_date'>
        <div className='private_car_request_form_date_day'>
          <DatePicker 
          selected={date} 
          onChange={(date) => setDate(date)} 
          className='private_car_request_form_date_day_input'
          placeholderText= 'اليوم'
          />
        </div>
        <div className='private_car_request_form_date_time'>
          <DatePicker
            selected={startTime}
            onChange={(time) => setStartTime(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Start Time"
            dateFormat="h:mm aa"
            className='private_car_request_form_date_day_input'
            placeholderText='وقت الحضور'
          />
        </div>
        <div>
          <DatePicker
            selected={endTime}
            onChange={(time) => setEndTime(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="End Time"
            dateFormat="h:mm aa"
            className='private_car_request_form_date_day_input'
            placeholderText='وقت المغادرة'
          />
        </div>
        </div>
        
        <div className='private_car_request_form_car'>
          
          <div className='private_car_request_form_car_carNumber'>
            <h5>عدد السيارات</h5>
            <input
              type="number"
              value={numberOfCars}
              onChange={(e) => setNumberOfCars(e.target.value)}
              min="1"
              required
              className='private_car_request_form_date_day_input'
            />
          </div>

          <div className='private_car_request_form_car_carType'>
            <Select
              value={carType}
              onChange={setCarType}
              options={cars}
              placeholder="نوع السيارات"
              className='private_car_request_form_car_carType_input'
            />
          </div>
        </div>
        {error && <p className='car_request_error_message'>{error}</p>}
        <div className='private_car_request_header'>
          <button type="submit" disabled={loading} className='send_request_button'>
            {loading ? (
              <h5>جاري الارسال</h5>
            ) : (
              <h5>ارسال الطلب</h5>
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

export default PrivateCarRequest