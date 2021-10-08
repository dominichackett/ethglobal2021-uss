/* This example requires Tailwind CSS v2.0+ */
import { VideoCameraIcon } from '@heroicons/react/outline'
import { MailIcon, PhoneIcon } from '@heroicons/react/solid';
import { useEffect,useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Link } from 'react-router-dom';

export default function SubFeed() {
const [subscriptions,setSubscriptions] = useState([]);
const {user,Moralis} = useMoralis();
  useEffect(()=>{
  if(user)
   Moralis.Cloud.run('getSubscriptions',{userAddress:user.get("ethAddress")}).then(function(resp){
     setSubscriptions(resp);
     console.log(resp)
   })
},[])
  return (
    <div className="px-8 mt-8">

    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {subscriptions.map((person) => (
        <li
          key={person.id}
          className="col-span-1 flex flex-col text-center bg-white rounded-lg shadow divide-y divide-gray-200"
        >
          <div className="flex-1 flex flex-col p-8">
            <img className="w-32 h-32 flex-shrink-0 mx-auto rounded-full" src={person.objectId.profilePic} alt="" />
            <h3 className="mt-6 text-gray-900 text-sm font-medium">{person.objectId.firstname+" "+person.objectId.lastname}</h3>
            <dl className="mt-1 flex-grow flex flex-col justify-between">
              <dt className="sr-only">Location</dt>
              <dd className="text-gray-500 text-sm">{person.objectId.location}</dd>
              <dt className="sr-only">Status</dt>
              <dd className="mt-3">
                <span className="px-2 py-1 text-green-800 text-xs font-medium bg-green-100 rounded-full">
                  Subscribed
                </span>
              </dd>
            </dl>
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="w-0 flex-1 flex">
                <Link
                  to={`/viewprofile/${person.objectId.username}`}
                  className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                >
                  <VideoCameraIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  <span className="ml-3">View Channel</span>
                </Link>
              </div>
              
            </div>
          </div>
        </li>
      ))}
    </ul>
    </div>
  )
}
