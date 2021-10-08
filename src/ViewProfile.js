import React from 'react'
import DashBoardNav from "./DashBoardNav"
import ProfileView from './ProfileView'

export default function ViewProfile() {
    return (
        <div className="relative h-screen  flex overflow-hidden bg-gray-100">

        <DashBoardNav ><ProfileView/></DashBoardNav>
      
       </div>
    )
}
