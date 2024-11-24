import React,{useState} from 'react'
import ClipLoader from "react-spinners/ClipLoader"
import { useGlobalState } from '../globalState'

function Schools() {

  const [searchTerm,setSearchTerm] = useState('')

  const titles = ['المدرس','الفصل','عدد الطلاب']

  //const { schools, loading, error } = useGlobalState()

  const teachers = [
    {name:'خليل سالم علي',class:'الصف الاول',studentsNbr:'100'},
    {name:'ابراهيم جواد نور',class:'الصف الثاني',studentsNbr:'120'},
    {name:'اسماعيل محمود خالد',class:'الصف الثالث',studentsNbr:'110'},
  ]


    // Filtered students based on search term
    const filteredTeachers = teachers.filter((teacher) => {
      return(
        teacher.name.includes(searchTerm) || 
        teacher.class.includes(searchTerm) || 
        teacher.studentsNbr.includes(searchTerm)
      )
    })


   // Handle search input change
   const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };


  return (
    <div className='white_card-section-container'>
      <div className='students-section-inner'>
        <div className='students-section-inner-titles'>
          {titles.map(title => (
            <div key={title} className='students-section-inner-title'>
              <input onChange={handleSearchChange} placeholder={title} type='text' className='students-section-inner-title_search_input'/>
            </div>
          ))}
        </div>
        <div className='students-section-inner-infos'>
          {filteredTeachers.map((teacher, index) => (
            <div key={index} className='students-section-inner-info'>
              <h5>{teacher.name}</h5>
              <h5>{teacher.class}</h5>
              <h5>{teacher.studentsNbr}</h5>
            </div>
          ))}
        </div>     
      </div>
    </div>
  )
}

export default Schools