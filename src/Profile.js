import React from 'react'
import DashBoardNav from "./DashBoardNav"
import ProfleForm from './ProfileForm'

export default function Profile() {
    return (
        <div className="relative h-screen  flex overflow-hidden bg-gray-100">

        <DashBoardNav ><ProfleForm/></DashBoardNav>
      
       </div>
    )
}
