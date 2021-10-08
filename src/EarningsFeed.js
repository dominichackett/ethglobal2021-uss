/* This example requires Tailwind CSS v2.0+ */
import { ArrowSmDownIcon, ArrowSmUpIcon } from '@heroicons/react/solid'
import { CalendarIcon, CashIcon, CreditCardIcon, CursorClickIcon, EyeIcon, FilmIcon, GiftIcon, MailOpenIcon, UsersIcon } from '@heroicons/react/outline'
import { useState,useEffect } from 'react'
import { useMoralis } from 'react-moralis'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function EarningsFeed() {
  const [totalSubscribers,setTotalSubscribers]  = useState(0);
  const [totalEarnings,setTotalEarnings]  = useState(0);
  const [totalPayments,setTotalPayments]  = useState(0);
  const [totalStreamedPayments,setTotalStreamedPayments]  = useState(0);
  const [totalNumberOfTips,setTotalNumberOfTips]  = useState(0);
  const [totalTips,setTotalTips]  = useState(0);
  const [totalNumberOfEvents,setTotalNumberOfEvents]  = useState(0);
  const [totalNumberOfNFTsMinted,setTotalNumberOfNFTsMinted]  = useState(0);
  const [totalViews,setTotalViews]  = useState(0);    
  const {user,Moralis} = useMoralis();
useEffect(()=>{

  Moralis.Cloud.run('getTotalSubscribers',{userAddress:user.get("ethAddress")}).then((resp)=>{
    setTotalSubscribers(resp);
  });
    
  Moralis.Cloud.run('getTotalNFTsMinted',{userAddress:user.get("ethAddress")}).then((resp)=>{
    setTotalNumberOfNFTsMinted(resp);
  });

  Moralis.Cloud.run('getNumberOfEvents',{userAddress:user.get("ethAddress")}).then((resp)=>{
    setTotalNumberOfEvents(resp);
  });

  Moralis.Cloud.run('getNumberOfTips',{id:user.id}).then((resp)=>{
    setTotalNumberOfTips(resp);
    console.log(resp)
  });
},[])
  return (
    <div className="px-8 mt-8">
    <h3 className="text-lg leading-6 font-medium text-gray-900">Totals</h3>

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
            key="1"
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">Total Subscribers</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{totalSubscribers}</p>
                            <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                 
                </div>
              </div>
            </dd>
          </div>
          <div
            key="1"
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
          
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <CashIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">Total Earnings</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{totalEarnings}</p>
                            <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                 
                </div>
              </div>
            </dd>
          </div>
          <div
            key="1"
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <CreditCardIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">Total Payments</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{totalPayments}</p>
                            <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                 
                </div>
              </div>
            </dd>
          </div>
          <div
            key="1"
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <CreditCardIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">Total Streamed Payments</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{totalStreamedPayments}</p>
                            <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                 
                </div>
              </div>
            </dd>
          </div>
          <div
            key="1"
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <GiftIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">Total Tips</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{totalTips}</p>
                            <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                 
                </div>
              </div>
            </dd>
          </div>
          <div
            key="1"
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <GiftIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">Total No. Tips</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{totalNumberOfTips}</p>
                            <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                 
                </div>
              </div>
            </dd>
          </div>
          <div
            key="1"
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <CalendarIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">Total No. Events</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{totalNumberOfEvents}</p>
                            <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                 
                </div>
              </div>
            </dd>
          </div>
          <div
            key="1"
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <FilmIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">Total NFTs Minted</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{totalNumberOfNFTsMinted}</p>
                            <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                 
                </div>
              </div>
            </dd>
          </div>
          <div
            key="1"
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <EyeIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">Total Views</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{totalViews}</p>
                            <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                 
                </div>
              </div>
            </dd>
          </div>
      
      </dl>
    </div>
  )
}
