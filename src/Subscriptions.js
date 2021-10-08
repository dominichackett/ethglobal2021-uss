import React, { PureComponent } from 'react'
import SubFeed from './SubFeed'
import DashBoardNav from './DashBoardNav'
export default class Subscriptions extends PureComponent {
    render() {
        return (
            <div className="relative h-screen  flex overflow-hidden bg-gray-100">

            <DashBoardNav ><SubFeed/></DashBoardNav>
          
           </div>
        )
    }
}
