import React from 'react'
import DashBoardNav from "./DashBoardNav"
import MyNFTFeed from './MyNFTFeed'

export default function MyNFTs() {
    return (
        <div className="relative h-screen flex overflow-hidden bg-gray-100">
        <DashBoardNav ><MyNFTFeed /></DashBoardNav>
        </div>
    )
}
