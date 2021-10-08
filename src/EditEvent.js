import React from 'react'
import DashBoardNav from "./DashBoardNav"
import EditEventForm from "./EditEventForm"

export default function EditEvent() {
    return (
        <div className="relative h-screen flex overflow-hidden bg-gray-100">
        <DashBoardNav ><EditEventForm/></DashBoardNav>
        </div>
    )
}
