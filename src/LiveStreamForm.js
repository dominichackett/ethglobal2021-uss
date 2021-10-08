import VideoSource from './images/camera.png'

import {  useState,useEffect,useRef } from 'react'
import { useParams } from "react-router-dom";
import MyNotification from "./MyNotification";
import {format} from 'date-fns';
import {
  
  VideoCameraIcon,
  GiftIcon,
  SparklesIcon
} from '@heroicons/react/outline'
import { Client } from '@livepeer/webrtmp-sdk'
import  ChatBox from './ChatBox'
import { useMoralisQuery,useMoralisSubscription,useMoralis } from 'react-moralis';
import PrizeList from "./PrizeList";
import { USS_CONTRACT_ADDRESS,USS_CONTRACT_ABI } from "./contract";

import {toBuffer} from "ethereumjs-util";
// Import Biconomy
import {Biconomy} from "@biconomy/mexa";
import Web3 from "web3";
let abi = require('ethereumjs-abi'); //dependencies

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}



function DrawPrize(props)
{
  
  const prizeRef = useRef();
  function onEnter(event)
   {
      if(event.keyCode==13 && prizeRef.current.value)
         draw();
       
    }
   
    function draw()
    {
      if(prizeRef.current.value)
          props.handleDrawPrize(prizeRef.current.value);

    }
  return(
    <div className="p-2">
    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
      Prize Name
    </label>
    <div className="mt-1 flex rounded-md shadow-sm">
      <div className="relative flex items-stretch flex-grow focus-within:z-10">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <GiftIcon className="h-5 w-5 text-my-green" aria-hidden="true" />
        </div>
        <input
          type="text"
          name="prize"
          id="prize"
          className="focus:ring-my-green focus:border-my-green block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
          placeholder="Video NFT"
          disabled={props.disabled}        
          ref={prizeRef}
          onKeyDown={onEnter}
        />
      </div>
      <button
        type="button"
        className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-my-green focus:border-indigo-500"
        disabled={props.disabled} 
        onClick={draw}
      >
        <SparklesIcon className="h-5 w-5 text-my-green" aria-hidden="true" />
        <span>Draw</span>
      </button>
    </div>
  </div>
   )
}

export default function LiveStreamForm() {
  const [loadingEvent,setLoadingEvent] = useState(true);  
  const [isLive,setIsLive] = useState(false);
  const [isDrawing,setIsDrawing]  = useState(false);
  const [eventNotFound,setEventNotFound] = useState(false);
  const [openNotification,setOpenNotification]  = useState(false);
  const [notificationHeader,setNotificationHeader]  = useState("");
  const [notificationBody,setNotificationBody]  = useState("");
  const [notificationType,setNotificationType]  = useState();
  const [livepeerStreamObject,setLivepeerStreamObject] = useState();
  const [views,setViews] = useState(0);
  const videoRef = useRef(null);
  const stream = useRef(null);
  const clientRef = useRef(null);
  const sessionRef = useRef(null);
  const [fetchPrizeList,setfetchPrizeList]    = useState(new Date());
  const [biconomyReady,setBiconomyReady] = useState();

  const [eventData,setEventData] = useState();
  const {id} = useParams();
  const biconomy =  useRef(); 
  const web3 = useRef();
  const walletWeb3 = new Web3(window.ethereum);
  const {user} = useMoralis();
  const contract = useRef(); 
  const [subscriberCount,setSubscriberCount]  = useState(0);
  const [fetchSubcriberCount,setFetchSubscriberCount]  = useState(new Date());
  const {Moralis} = useMoralis();
  

  //Subscribe to TicketPurchased to know when to refresh Subcriber count
 useMoralisSubscription(
  "TicketPurchased", query=> 
   query
   .equalTo("eventID",id)
  
   ,[],
   {
      onCreate: data => {
         setFetchSubscriberCount(new Date());      
      },
    }
);

 // Get Subscriber Count
useEffect(()=>{
  if(!loadingEvent && !eventNotFound)
  {
    Moralis.Cloud.run('getEventSubscribersCount',{event:id}).then((resp)=>{
       setSubscriberCount(resp);
       
    }).catch((error)=>{
  
    });
  }
  
},[fetchSubcriberCount,loadingEvent])
 
 
useEffect(()=>{
  async function biconomySetup()
  {
    //await provider.enable();
    biconomy.current = new Biconomy(window.ethereum,{apiKey: process.env.REACT_APP_BICONOMY_API_KEY ,debug: true});
    web3.current = new Web3(biconomy.current); //Biconomy calls
    
    //Setup contract
    contract.current = new web3.current.eth.Contract(
      USS_CONTRACT_ABI,
      USS_CONTRACT_ADDRESS
    );
    biconomy.current.onEvent(biconomy.current.READY, () => {
      setBiconomyReady(true);
    }).onEvent(biconomy.current.ERROR, (error, message) => {
      setOpenNotification(true);
      setNotificationHeader("ERROR DAPP ERROR")
      setNotificationBody("Error loading configuration. Please refresh this page");
      setNotificationType(2); //Error
     
    });
  }
  biconomySetup();
  
},[])

const getSignatureParameters = signature => {
  if (!web3.current.utils.isHexStrict(signature)) {
      throw new Error(
          'Given value "'.concat(signature, '" is not a valid hex string.')
      );
  }
  var r = signature.slice(0, 66);
  var s = "0x".concat(signature.slice(66, 130));
  var v = "0x".concat(signature.slice(130, 132));
  v = web3.current.utils.hexToNumber(v);
  if (![27, 28].includes(v)) v += 27;
  return {
      r: r,
      s: s,
      v: v
  };
};


async function handleDrawPrize(prize)
  { 
    let nonce = await contract.current.methods.getNonce(user.get("ethAddress")).call();
  // Create your target method signature.. here we are calling drawPrize() method of our contract
  let functionSignature = contract.current.methods.drawPrize(eventData.id,prize).encodeABI();
  let messageToSign = constructMetaTransactionMessage(nonce, 
    80001, functionSignature,
    USS_CONTRACT_ADDRESS);

// NOTE: We are using walletWeb3 here to get signature from connected wallet
const signature = await walletWeb3.eth.personal.sign("0x" + 
  messageToSign.toString("hex"), user.get("ethAddress"));
// Check the repository link mentioned above for helper methods
let { r, s, v } = getSignatureParameters(signature);
let tx = contract.current.methods.executeMetaTransaction(
                    user.get("ethAddress"), functionSignature, r, s, v)
                   .send({from: user.get("ethAddress")});
 
  

tx.on("transactionHash", (hash)=>{
// Handle transaction hash
}).once("confirmation", (confirmation, recipet) => {
// Handle confirmation
}).on("error", error => {
  // Handle error
  setOpenNotification(true);
  setNotificationHeader("ERROR DRAWING PRIZE")
  setNotificationBody("Error drawing prize.");
  setNotificationType(2); //Error

}).then(function(receipt){
   setOpenNotification(true);
   setNotificationHeader("SUCCESSFUL DRAW")
   setNotificationBody("Prize draw was successful.");
   setNotificationType(2); //Error

});

}

// Helper methods
const constructMetaTransactionMessage = (nonce, chainId, functionSignature, contractAddress) => {
return abi.soliditySHA3(
    ["uint256","address","uint256","bytes"],
    [nonce, contractAddress, chainId, toBuffer(functionSignature)]
);
}


  const { fetch:fetchEvent, data: dataEvent, error:errorEvent, isLoading:isLoadingEvent } = useMoralisQuery(
    "Event", query=> 
     query
     .equalTo("objectId",id)
     ,
    { autoFetch: false }
  );

  //Subscribe to PizeWon to know when to refresh prize list
useMoralisSubscription(
  "PrizeWon", query=> 
   query
   .equalTo("eventID",id)
  
   ,[],
   {
      onCreate: data => {
         setfetchPrizeList(new Date());      
      },
    }
);


  
  useEffect(()=>{
    fetchEvent({ 
      onSuccess: (data) =>{
        if(data.length > 0)
        { 
           setEventData(data[0]);
           console.log(data[0]);
           setLoadingEvent(false);
           setEventNotFound(false);
           setLivepeerStreamObject(JSON.parse(data[0].get("livepeerobject")));
           console.log(JSON.parse(data[0].get("livepeerobject")));
          }
        else{
              errorLoadingEvent();
        } 
      },
      onError: (error) => errorLoadingEvent()
    });
  },[])
  
  function errorLoadingEvent()
  {
    setOpenNotification(true);
    setNotificationHeader("ERROR LOADING EVENT")
    setNotificationBody("Event was not found.");
    setNotificationType(2); //Error
    setEventNotFound(true);
    
  }
  const handleCloseNotification = () =>
  {
     setOpenNotification(false);
  }


   const streamButtonClicked = async()  =>
   {
     if(loadingEvent || eventNotFound)
       return;
     
     if(!isLive)
     {
        videoRef.current.volume = 0

      stream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
         if(!stream.current)
         {
          setOpenNotification(true);
          setNotificationHeader("ERROR LOADING MEDIA DEVICE")
          setNotificationBody("Your stream cannot be started.");
          setNotificationType(2); //Error
          setEventNotFound(true);
          
           return;
         }
         
         videoRef.current.srcObject = stream.current;
         videoRef.current.play();
         clientRef.current = new Client({opt:{baseUrl:'nyc-rtmp.livepeer.com/live'}})
         sessionRef.current = clientRef.current.cast(stream.current, livepeerStreamObject.streamKey)
     
         sessionRef.current.on('open', () => {
           console.log('Stream started.')
         })
     
         sessionRef.current.on('close', () => {
           console.log('Stream stopped.')
         })
     
         sessionRef.current.on('error', (err) => {
           console.log('Stream error.', err.message)
         })
         setIsLive(true);

        }
     else
     {
        if(videoRef.current)
        {
          videoRef.current.pause();
          
          stream.current.getTracks().forEach(function(track) {
            track.stop();
          });
          videoRef.current.srcObject = null;
          stream.current = null;
        }  
        setIsLive(false);
     }
       
    



   }
  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
         {/* Main content */}
        <div className="flex-1 flex items-stretch overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {/* Primary column */}
            <section
              aria-labelledby="primary-heading"
              className="min-w-0 flex-1  flex flex-col overflow-hidden lg:order-last"
            >
              
              {/* Your content */}
              <h1 id="primary-heading" className="pl-2 font-medium">
                {eventData ? eventData.get("name"): ""}
              </h1>
              <span className="pl-2 text-sm">{eventData ? format(eventData.get("eventdate"),"iii do MMM yyyy p") : ""}</span>
              <video poster={eventData ? eventData.get("eventpic"): ""} ref={videoRef}   className={
                isLive ? "h-5/6 max-w-96  shadow-lg bg-black m-2 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-my-green overflow-hidden shadow-lg"
: "h-5/6 max-h-96 shadow-lg bg-black m-2 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-my-green overflow-hidden shadow-lg"
              }
                >
  <source src={VideoSource} / >
  Your browser does not support the video tag.
</video>  
        <VideoCameraIcon  onClick={()=>streamButtonClicked()}  className={!isLive ? "h-14 text-white z-0  text-white  p-2 -mt-16 ml-2 w-14 hover:text-red-500 cursor-pointer" :
      "h-14 text-white z-0  text-red-500  p-2 -mt-16 ml-2 w-14 hover:text-white cursor-pointer"}/>
        <div className="p-2">
    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
      
      {subscriberCount} Subscribers   
      </label>
      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
      
      {views} Views    
      </label>
     </div>
     
        <DrawPrize disabled={loadingEvent || eventNotFound || !isLive || isDrawing} handleDrawPrize={handleDrawPrize}/>
        <PrizeList eventId={id} key={fetchPrizeList}/>

            </section>
          
          </main>

          {/* Secondary column (hidden on smaller screens) */}
          <aside className=" w-96 bg-white border-l border-gray-200 overflow-y-auto lg:block">
            {/* Your content */}

          { eventData ?  <ChatBox live={!loadingEvent && isLive==true} eventId={eventData ? eventData.id : null}/>
           :""  
        }
          </aside>
        </div>
      </div>
      <MyNotification type={notificationType} header={notificationHeader} body={notificationBody} open={openNotification} handleClose={handleCloseNotification}/>

    </div>
  )
}
