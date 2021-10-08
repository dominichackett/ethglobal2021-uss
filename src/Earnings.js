import React from 'react'
import DashBoardNav from "./DashBoardNav"
import EarningsFeed from './EarningsFeed'

export default function Earnings() {
    return (
        <div className="relative h-screen flex overflow-hidden bg-gray-100">
        <DashBoardNav ><EarningsFeed/></DashBoardNav>
        </div>
    )
}
