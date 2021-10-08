import React from 'react'
import DashBoardNav from "./DashBoardNav"
import AddEventForm from "./AddEventForm"

export default function AddEvent() {
    return (
        <div className="relative h-screen flex overflow-hidden bg-gray-100">
        <DashBoardNav ><AddEventForm/></DashBoardNav>
        </div>
    )
}
