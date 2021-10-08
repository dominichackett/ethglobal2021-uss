
import {  useEffect, useState } from 'react'
import { useMoralisCloudFunction,useMoralis } from 'react-moralis'
import { useParams } from "react-router-dom";
import UserImage from './images/user.png';
import { format } from 'date-fns';
import { Link,useHistory } from 'react-router-dom';

import {
  CalendarIcon,
  CogIcon,
  HomeIcon,
  MapIcon,

  SearchCircleIcon,
  SpeakerphoneIcon,
  UserGroupIcon,
  ViewGridAddIcon,
  XIcon,
} from '@heroicons/react/outline'
import {  MailIcon } from '@heroicons/react/solid'



const tabs = [
  { name: 'Profile', href: '#', current: true },
  { name: 'Videos', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function ProfileView() {
const [sidebarOpen, setSidebarOpen] = useState(false);
const {id}  = useParams();
const {user,Moralis} = useMoralis();
const [coverPic,setCoverPic] = useState( 'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
);

const [profilePic,setProfilePic]  = useState(UserImage);
const [userName,setUserName] = useState("");
const [about,setAbout]  = useState("");
const [location,setLocation] = useState("");
const [selectedTab,setSelectedTab] = useState("Profile");
const history = useHistory();
const [gotProfile,setGotProfile] = useState(false);
const [userId,setUserId] = useState();  
const [userVideos,setUserVideos] = useState([]);

const { fetch, data, error, isLoading } = useMoralisCloudFunction(
  "getUserProfile",
  {
    username:id
  },
  { autoFetch: false }
);
console.log(id)
useEffect(()=>{
  fetch({ 
    onSuccess: (data) =>{ 
      setGotProfile(true);
      console.log(JSON.stringify(data))
      if(data.id)
        setUserId(data.id);

      if(data.get("coverPic"))
         setCoverPic(data.get("coverPic"));
       if(data.get("profilePic"))
         setProfilePic(data.get("profilePic"))
         let firstname = (data?.get("firstname") ? data.get("firstname") : "");
         let lastname = (data?.get("lastname") ? data.get("lastname") : "");
         setUserName(firstname+" "+lastname);     
         setLocation((data?.get("country") ? data.get("country"): ""));
         setAbout((data?.get("about") ? data.get("about"): ""));
        
    },
    onError: (error) => console.log(error)
  });

  

},[])


useEffect(() => {
  if(userId)
  {
    Moralis.Cloud.run('getUserVideos',{id:userId}).then((resp)=>{
      setUserVideos(resp);
    }).catch((error)=>{
  
    });
  }
}, [userId])
  

  return (
       gotProfile ?
         <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        <div className="flex-1 relative z-0 flex overflow-hidden">
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none xl:order-last">
           
            <article>
              {/* Profile header */}
              <div>
                <div>
                  <img className="h-32 w-full object-cover lg:h-48" src={coverPic} alt="" />
                </div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                    <div className="flex">
                      <img
                        className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                        src={profilePic}
                        alt=""
                      />
                    </div>
                    <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                      <div className="sm:hidden 2xl:block mt-6 min-w-0 flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 truncate">{userName}</h1>
                      </div>
                      <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                        
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block 2xl:hidden mt-6 min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">{userName}</h1>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 sm:mt-2 2xl:mt-5">
                <div className="border-b border-gray-200">
                  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                      {tabs.map((tab) => (
                        <a
                          key={tab.name}
                          onClick={()=> setSelectedTab(tab.name)}
                          className={classNames(
                            selectedTab == tab.name
                              ? 'border-my-green text-gray-900 cursor-pointer'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer'
                          )}
                          aria-current={tab.current ? 'page' : undefined}
                        >
                          {tab.name}
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>

              {/* Description list */}
              <div hidden={(selectedTab!="Profile")} className="mt-8 max-w-5xl mx-auto px-4 pb-4 sm:px-6 lg:px-8">
                <h2 className="text-sm font-medium text-gray-500">Location</h2>
                <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <span className="mt-1 text-sm text-gray-900">{location}</span>

                  </div>
               </div>   
               <div hidden={(selectedTab!="Profile")} className="mt-2 w-full mx-auto px-4 pb-12 sm:px-6 lg:px-8">
                <h2 className="text-sm font-medium text-gray-500">About</h2>
                <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-1">
                <span className="mt-1 w-full text-sm text-gray-900 whitespace-pre-line">{about}</span>

                  </div>
               </div>   

               <div  hidden={(selectedTab!="Videos")} className="px-8 mt-8">
    
    <ul role="list" className="mb-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
      {userVideos.map((event) => (
        <li key={event.id} className="relative shadow-lg rounded-lg">
          <div  onClick={() => history.push(`/view/event.id`)}  className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-my-green overflow-hidden">
            <img src={event.get("eventpic")} alt="" className="object-cover  group-hover:opacity-75" />
            <button  type="button" className="absolute inset-0 focus:outline-none">
             <span    className="sr-only">View details for {event.get("name")}</span>
            </button>
          </div>
         
              <div className="flex items-center mt-4 ">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img  onClick={() => history.push(`/viewprofile/${event.get("owner").get("username")}`)} className="cursor-pointer ml-2 h-8 w-8 rounded-full" src={event.get("owner").get("profilePic")} alt="" />
                    </div>
                    <div className="ml-2">
                    <div onClick={() => history.push(`/view/event.id`)} className="cursor-pointer text-sm font-medium text-gray-900">{event.get("name")}</div>

                       </div>
                  </div>
                  <div onClick={() => history.push(`/viewprofile/${event.get("owner").get("username")}`)} className="cursor-pointer ml-12 text-sm  text-gray-900">{event.get("owner").get("firstname")+" "+event.get("owner").get("lastname")}</div>
                   <div className="ml-12 text-xs text-gray-500">{format(event.get("eventdate"),"iii do MMM yyyy p")}</div>
                  
         
          <p  className={ classNames( event.get("live") ? ' mt-2 px-2 rounded-lg inline-flex p-1 ring-1 ring-red-500 text-red-500': 'invisible')}> Live Now</p>
        </li>
      ))}
    </ul>
    </div>            </article>
          </main>
   </div>
      </div>
    : ""
  ) 
 
}
