import {  useEffect, useState,useRef } from 'react'
import { useMoralis } from 'react-moralis'
import { format ,parseISO} from 'date-fns';
import UserImage from './images/user.png';


export default function PrizeList(props)
{
    const {Moralis}  = useMoralis();
    const [prizeData,setPrizeData] = useState([]);
    useEffect(()=>{
        Moralis.Cloud.run('getPrizes',{event:props.eventId}).then((resp)=>{
            setPrizeData(resp);      
            console.log(resp);       
                   
          }).catch((error)=>{
        
          });
      
    },[]);
    
   return(
    <div className="p-2 mb-2" >
     <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
      Winners List
    </label>
    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Prize
                </th>
                              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prizeData.map((person) => (
                <tr key={person.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={person.profilePic ? person.profilePic : UserImage} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{person.firstname+" "+person.lastname}</div>
                        <div className="text-sm text-gray-500">{person.ethAddress}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{person.prize}</div>
                    <div className="text-sm text-gray-500">{format(new Date(parseInt(person.datedDrawn)*1000) ,"MMM do yyyy")}</div>
                 {person.id}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
   )
}
