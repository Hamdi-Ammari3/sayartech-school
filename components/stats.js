import React from 'react'
import { useGlobalState } from '../globalState';
import { PiStudentLight } from "react-icons/pi";
import { PiVanLight } from "react-icons/pi"
import { PiCurrencyDollarLight } from "react-icons/pi"
import { TfiStatsUp } from "react-icons/tfi"
import ClipLoader from "react-spinners/ClipLoader"

const Stats = () => {
    const {students,drivers, loading } = useGlobalState()

    return (
    <div className='main_section_stat'>
        <div className='main_section_stat_header_div'>
            <h4>احصائيات</h4>
        </div>
        <div className='main_section_stat_items'>
            <div className='main_section_stat_item'>
                <div className='main_section_stat_item_icon_div' style={{backgroundColor:'#955BFE'}}>
                    <PiStudentLight className='main_section_stat_item_icon'/>
                </div>
                <div className='main_section_stat_info_item'>
                    <p>طالب</p>
                    {loading ? (
                    <div style={{ width:'50px',padding:'10px 0',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <ClipLoader
                        color={'#955BFE'}
                        loading={loading}
                        size={10}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        />
                    </div>
                    ) : (
                    <h5>{students.length}</h5>
                    )}
                </div>
            </div>

            <div className='main_section_stat_item'>
                <div className='main_section_stat_item_icon_div' style={{backgroundColor:'#16B1FF'}}>
                    <PiVanLight className='main_section_stat_item_icon'/>
                </div>
                <div className='main_section_stat_info_item'>
                    <p>سائق</p>
                    {loading ? (
                    <div style={{ width:'50px',padding:'10px 0',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <ClipLoader
                        color={'#955BFE'}
                        loading={loading}
                        size={10}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        />
                    </div>
                    ) : (
                    <h5>{drivers.length}</h5>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Stats