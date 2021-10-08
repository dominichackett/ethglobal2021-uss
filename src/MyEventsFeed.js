import { VideoCameraIcon,PencilIcon } from "@heroicons/react/outline"
import { Link,useHistory } from 'react-router-dom';
import {useMoralisQuery,useMoralis} from 'react-moralis';
import { useEffect } from "react";
import { format } from 'date-fns';

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }  
  export default function MyEventsFeed() {
    const history = useHistory();
    const {user} = useMoralis();
    const { data, error, isLoading } = useMoralisQuery("Event", query =>
      query
      .equalTo("owner",user)
      .descending("eventdate")
    
    );

    useEffect(()=>{
       if(!isLoading)
         console.log(data);  
    },[data])

    return (
        <div className="px-8 mt-8">
     
        <header>
        <div className="mt-5 mb-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <button
                    onClick={()=> history.push("/addevent")}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-my-green hover:bg-my-green-light md:py-4 md:text-lg md:px-10"
                  >
                    Create Stream 
                  </button>
                </div>
            
              </div>
        </header>

      <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        {data.map((event) => (
          <li key={event.id} className="relative bg-gray-200 shadow-lg">
            <div onClick={() => history.push(`/live/${event.id}`)} className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-my-green overflow-hidden">
              <img  src={event.get("eventpic")} alt="" className="object-cover pointer-events-none group-hover:opacity-75" />
              <button type="button" className="p-2 absolute inset-0 focus:outline-none">
                <span className="sr-only">View details for {event.get("name")}</span>
              </button>
            </div>
            <p className="pl-2 pr-2 mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">{event.get("name")}</p>

            <p className="p-2 block text-sm font-small text-gray-500 pointer-events-none  ">{format(event.get("eventdate"),"iii do MMM yyyy p")}</p>
            <p className="p-2 block text-sm font-small text-gray-500 flex justify-between mt-2 mb-2 "><Link className="hover:text-my-green " to={`/editevent/${event.id}`} >Edit </Link> <Link className="hover:text-my-green" to={`/live/${event.id}`}>Go Live</Link></p>
 
            
          </li>
        ))}
      </ul>
      </div>
    )

        }