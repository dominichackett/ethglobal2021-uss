import React from 'react'
import DashBoardNav from "./DashBoardNav"
import MintNFTForm from './MintNFTForm'

export default function MintNFT() {
    return (
        <div className="relative h-screen flex  overflow-hidden bg-gray-100">
        <DashBoardNav ><MintNFTForm /></DashBoardNav>
        </div>
    )
}
