import React from 'react'
import DashBoardNav from "./DashBoardNav"
import ViewStreamForm from './ViewStreamForm'

export default function ViewStream() {
    return (
        <div className="relative h-screen flex overflow-hidden bg-gray-100">
        <DashBoardNav ><ViewStreamForm /></DashBoardNav>
        </div>
    )
}
