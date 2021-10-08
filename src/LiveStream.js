import React from 'react'
import DashBoardNav from "./DashBoardNav"
import LiveStreamForm from './LiveStreamForm'

export default function LiveStream() {
    return (
        <div className="relative h-screen flex overflow-hidden bg-gray-100">
        <DashBoardNav ><LiveStreamForm /></DashBoardNav>
        </div>
    )
}
