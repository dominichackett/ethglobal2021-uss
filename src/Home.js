/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  const colors = require('tailwindcss/colors')
  
  module.exports = {
    // ...
    theme: {
      extend: {
        colors: {
          cyan: colors.cyan,
        },
      },
    },
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { Fragment } from "react"
import DashBoardNav from "./DashBoardNav"
import HomeFeed from "./HomeFeed"

export default function Home() {

  return (
    <div className="relative h-screen flex overflow-hidden bg-gray-100">

      <DashBoardNav ><HomeFeed /></DashBoardNav>
        
     </div>

  
    
   
    
  )
}
