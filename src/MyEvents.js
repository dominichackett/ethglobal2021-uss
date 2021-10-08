import React from 'react'
import DashBoardNav from "./DashBoardNav"
import MyEventsFeed from './MyEventsFeed'

export default function MyEvents() {
    return (
        <div className="relative h-screen flex overflow-hidden bg-gray-100">
        <DashBoardNav ><MyEventsFeed></MyEventsFeed></DashBoardNav>
        </div>
    )
}
