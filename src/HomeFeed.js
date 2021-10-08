import { useMoralisCloudFunction } from 'react-moralis'
import { format } from 'date-fns';
import {  useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom';


  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }  
  export default function HomeFeed() {
   const history = useHistory();
    const [events,setEvents] = useState([]);
    const { fetch, data, error, isLoading } = useMoralisCloudFunction(
      "getHomeFeed",
      {
        
      },
      { autoFetch: false }
    );
    
    useEffect(()=>{
      fetch({ 
        onSuccess: (data) =>{ 
           setEvents(data);
           console.log(data);
        },
        onError: (error) => console.log(error)
      });
    },[])
    
    

    return (
        <div className="px-8 mt-8">
    
      <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        {events.map((event) => (
          <li key={event.id} className="relative shadow-lg rounded-lg">
            <div  onClick={() => history.push(`/view/${event.id}`)}  className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-my-green overflow-hidden">
              <img crossorigin src={event.get("eventpic")} alt="" className="object-cover  group-hover:opacity-75" />
              <button  type="button" className="absolute inset-0 focus:outline-none">
               <span    className="sr-only">View details for {event.get("name")}</span>
              </button>
            </div>
           
                <div className="flex items-center mt-4 ">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img crossOrigin onClick={() => history.push(`/viewprofile/${event.get("owner").get("username")}`)} className="cursor-pointer ml-2 h-8 w-8 rounded-full" src={event.get("owner").get("profilePic")} alt="" />
                      </div>
                      <div className="ml-2 mr-2">
                      <div onClick={() => history.push(`/view/${event.id}`)} className="cursor-pointer text-sm font-medium text-gray-900">{event.get("name")}</div>

                         </div>
                    </div>
                    <div onClick={() => history.push(`/viewprofile/${event.get("owner").get("username")}`)} className="cursor-pointer ml-12 text-sm  text-gray-900">{event.get("owner").get("firstname")+" "+event.get("owner").get("lastname")}</div>
                     <div className="ml-12 text-xs text-gray-500">{format(event.get("eventdate"),"iii do MMM yyyy p")}</div>
                    
           
            <p  className={ classNames( event.get("live") ? ' m-2 px-2 rounded-lg inline-flex p-1 ring-1 ring-red-500 text-red-500': 'invisible')}> Live Now</p>
          </li>
        ))}
      </ul>
      </div>
    )

        }