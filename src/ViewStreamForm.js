
import { useState,useEffect,useRef } from 'react'
import { useParams,useHistory } from "react-router-dom";
import MyNotification from "./MyNotification";
import {format} from 'date-fns';
import VideoJS from './VideoJS' // point to where the functional component is stored
import { useMoralisQuery,useMoralisSubscription,useMoralis } from 'react-moralis';
import ChatBox from './ChatBox';
import { CurrencyDollarIcon,GiftIcon } from '@heroicons/react/outline';
import PurchaseEventForm from "./PurchaseEventForm";
import SuperfluidSDK  from "@superfluid-finance/js-sdk";
import { DAI_CONTRACT,DAI_ABI} from "./contract";
import PrizeList from "./PrizeList";
import Web3 from "web3";


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}



export default function ViewStreamForm() {
  const playerRef = useRef(null);
  const [loadingEvent,setLoadingEvent] = useState(true);  
  const [isLive,setIsLive] = useState(false);
  const [eventNotFound,setEventNotFound] = useState(false);
  const [openNotification,setOpenNotification]  = useState(false);
  const [notificationHeader,setNotificationHeader]  = useState("");
  const [notificationBody,setNotificationBody]  = useState("");
  const [notificationType,setNotificationType]  = useState();
  const [livepeerStreamObject,setLivepeerStreamObject] = useState();
  const [openPayWall,setOpenPayWall] = useState(false);
  const [hasTicket,setHasTicket]  = useState(false);
  const [gotTicketInfo,setGotTicketInfo] = useState(false);
  const playbackRefURL= useRef();
  const [recordingURL,setRecordingURL]  = useState();
  const [recording,setRecording]  = useState();
  const [views,setViews] = useState(0);
  const [eventData,setEventData] = useState();
  const [streamingTokens,setStreamingTokens]  = useState(false);
  const [fetchPrizeList,setfetchPrizeList]    = useState(new Date());
  const {id} = useParams();
  const history = useHistory();
  const superfluid  = useRef();
  const superfluidUser = useRef();
  const { user,Moralis } = useMoralis()
  const walletWeb3 = new Web3(window.ethereum);
  const [isSaving,setIsSaving]  = useState();
    //DAI contract to approve funds
    const daiContract = new walletWeb3.eth.Contract(
      DAI_ABI,
      DAI_CONTRACT
    );
  
   
  

  
 //Setup superfluid
 useEffect(()=>{
  async function setupSuperFluid()
  {
    if(user)
   {  
       superfluid.current = new SuperfluidSDK.Framework({
       web3: new Web3(window.ethereum),
       });
      await superfluid.current.initialize();
       const balances = await Moralis.Web3API.account.getTokenBalances();

       //Create User
       superfluidUser.current = superfluid.current.user({
       address: user.get("ethAddress"),
       token: '0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f'  //fDAIx
      });
   }  
  }
  setupSuperFluid();
 },[user])

 // Check if the use has an NFT to view this stream
  useEffect(()=>{
  if(!loadingEvent && !eventNotFound)
  {
    Moralis.Cloud.run('userHasNFTTicket',{userAddress:user.get("ethAddress") ,eventId:id}).then((resp)=>{
      setGotTicketInfo(true);
      setHasTicket(resp);
      if(!resp)
        setOpenPayWall(true);
      else if (resp.live)
       startPlayBack();        
    }).catch((error)=>{
  
    });
  }
  
},[loadingEvent])


//Start Play back of stream when it has started
function startPlayBack()
 {


  var delayInMilliseconds = 12000; //12 seconds

setTimeout(function() {
  //delay to ensure the stream is actually ready.
  playerRef.current.src({ type: 'application/x-mpegURL', src: playbackRefURL.current });
    playerRef.current.play();
  
}, delayInMilliseconds);
    
   

  
 }

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


 //Subscribe to Event to know when the stream has started or stopped
  useMoralisSubscription(
       "Event", query=> 
        query
        .equalTo("objectId",id)
       // .include("user")
       // .include("event")
        ,[],
        {
           onUpdate: data => {
             console.log(data); 
             setRecording(data.get("recording"));
             setIsLive(data.get("live")); 
             if(playerRef.current && data.get("live"))
             {
                startPlayBack();

             }
           },
         }
     );
  
  const { fetch:fetchEvent, data: dataEvent, error:errorEvent, isLoading:isLoadingEvent } = useMoralisQuery(
    "Event", query=> 
     query
     .equalTo("objectId",id)
     ,
    { autoFetch: false }
  );
  

  //Fetch  Event Data to start stream
  useEffect(()=>{
   
    fetchEvent({ 
      onSuccess: (data) =>{
        if(data.length > 0)
        { 
          setEventData(data[0]);
           console.log(data[0]);
           setLoadingEvent(false);
           setEventNotFound(false);
           setIsLive(data[0].get("live"));
           let livePeerObject = JSON.parse(data[0].get("livepeerobject"));
           let url = `https://cdn.livepeer.com/hls/${livePeerObject.playbackId}/index.m3u8`;
          console.log(url)
           playbackRefURL.current=url;
           setRecording(data[0].get("recording"));
          /* setRecording(data[0].get("recording"));
           //if(!data[0].get("recording"))
           //{
alert(playerRef.current)
              if(playerRef.current && data[0].get("live"))
              {
                playerRef.current.src({ type: 'application/x-mpegURL', src: url });
                playerRef.current.play();

              }
           //}
           */
           setLivepeerStreamObject(livePeerObject);
           console.log(livePeerObject);
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

//Get Token Balance for FDAIx 
//The token needed to preview stream
async function getBalance()
{
  const balances = await Moralis.Web3API.account.getTokenBalances({chain:'mumbai'});
  console.log(balances); 
  console.log(user.get("ethAddress"));
  let userToken =null;

  balances.forEach((token)=>{
    console.log(token.token_address)
    if(token.token_address=='0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f'.toLowerCase())
    {
          userToken = token;

    }
  });
  console.log(userToken);
  
  console.log(walletWeb3.utils.fromWei(userToken.balance,"Ether"));
  if(userToken)
  {
    return  walletWeb3.utils.fromWei(userToken.balance,"Ether");
  }
  else
    return 0;
} 

  //Stop token flow
  // Can be called when user balance reach 0
  // Or the user can click the stop token flow button
  async function stopStreamPayment( )
  {
      if(superfluidUser.current)
      {
          //Stop Token Flow
          await superfluidUser.current.flow({
          recipient: eventData.get("owner").get("ethAddress"),
          flowRate: '0' 
          });    

          setHasTicket(false);
          setStreamingTokens(false);       
      }
  }
  
  const handleSpendNotApproved =  () =>
  {
    setOpenNotification(true);
    setNotificationHeader("ERROR USER REJECTED TRANSACTION")
    setNotificationBody("You did not approve the transaction.");
    setNotificationType(2); //Error 
  }
 const handlePurchaseError = () =>
  {
    setOpenNotification(true);
    setNotificationHeader("ERROR USER REJECTED TRANSACTION")
    setNotificationBody("You did not approve the transaction.");
    setNotificationType(2); //Error
    
  }

  const handlePurchaseSuccess = () =>
  {
    setOpenNotification(true);
    setNotificationHeader("PURCHASE SUCCESS")
    setNotificationBody("Your purchase was successful.");
    setNotificationType(1); //Error 
    setHasTicket(true)
  }


  const handlePreviewStream = async () =>
  {
    // alert("Preview")
    //console.log( eventData.get("owner").get("ethAddress"))
    // return;
     const bal = await getBalance();
     if(bal == 0)
     {
         setOpenNotification(true);
         setNotificationHeader("ERROR NOT ENOUGH FDAIx")
         setNotificationBody("You do not have enough tokens to preview this stream.");
         setNotificationType(2); //Error 
         return;        
     }
     
      
   
   //Create Token Flow
  await superfluidUser.current.flow({
    recipient: eventData.get("owner").get("ethAddress"),
    flowRate: '1000000000000000' // 2592 DAIx per month
  });
  
   setHasTicket(true);
   setStreamingTokens(true);
   startPlayBack();
  }
  const handleCloseNotification = () =>
  {
     setOpenNotification(false);
  }

  const [videoJsOptions,setVideoJsOptions] = useState(
    {controls: true,
              responsive: true,
              fluid: true,
             
             }
  );

  const handlePlayerReady = (player) => {
    playerRef.current = player;
    // you can handle player events here
    player.on('waiting', () => {
      console.log('player is waiting');
    });

    player.on('dispose', () => {
      console.log('player will dispose');
    });

   
  };

 
 
  //Send Tip to creator
  function SendTip(props)
  {
    
    const tipRef = useRef();
    
    async function tip()
    {
      if(tipRef.current.value)
      {
        daiContract.methods.transfer( eventData.get("owner").get("ethAddress"),walletWeb3.utils.toWei(tipRef.current.value)).send({from:user.get("ethAddress")})
        .on('receipt', function(receipt){
                  
                  const Tip  =  new Moralis.Object.extend("Tip");
                  let userTip = new Tip();
                  userTip.set("user",user);
                  userTip.set("event",eventData);
                  userTip.set("amount",parseFloat(tipRef.current.value));
                  userTip.save();
                  setOpenNotification(true);
                  setNotificationHeader("SUCCESSFULLY SENT TIP")
                  setNotificationBody("Successfully sent tip.");
                  setNotificationType(1); //Success
                  
                 
                  }).on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                   
                    setOpenNotification(true);
                    setNotificationHeader("ERROR SENDING TIP")
                    setNotificationBody("Tip not sent.");
                    setNotificationType(2); //Error
                      
                   
        });     
      }

    }     
    function onEnter(event)
     {
        if(event.keyCode==13 && tipRef.current.value)
           tip();
         
      }
      

   
    return( 
      <div className="p-2">
      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
        Tip Creator
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <div className="relative flex items-stretch flex-grow focus-within:z-10">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <GiftIcon className="h-5 w-5 text-my-green" aria-hidden="true" />
          </div>
          <input
            type="number"
            name="tip"
            id="tip"
            className="focus:ring-my-green focus:border-my-green block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
            placeholder="Enter Tip Amount in DAI"
            disabled={props.disabled}        
            ref={tipRef}
            onKeyDown={onEnter}
          />
        </div>
        <button
          type="button"
          className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-my-green focus:border-indigo-500"
          disabled={props.disabled} 
          onClick={tip}
        >
          <CurrencyDollarIcon className="h-5 w-5 text-my-green" aria-hidden="true" />
          <span>Tip</span>
        </button>
      </div>
    </div>
     )
  }

  return (
    (hasTicket && gotTicketInfo) ?
    <div className="h-screen bg-gray-50 flex overflow-hidden">

        {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
         {/* Main content */}
        <div className="flex-1 flex items-stretch overflow-hidden">
          <main className="flex-1 overflow-y-auto ">
            {/* Primary column */}
            <section
              aria-labelledby="primary-heading"
              className="min-w-0 flex-1 h-full flex flex-col overflow-y-auto overflow-hidden lg:order-last"
            >
              
              {/* Your content */}
              <h1 id="primary-heading" className="pl-2 font-medium">
              {eventData ? eventData.get("name"): ""}
              </h1>
              <span className="pl-2 text-sm">{eventData ? format(eventData.get("eventdate"),"iii do MMM yyyy p") : ""}</span>
  <div className="m-2">          
  <VideoJS options={videoJsOptions} onReady={handlePlayerReady}   />
  
  <button
    disabled={!recording}
    className="m-1 mt-3  inline-flex justify-center py-2 px-4 border 
    border-transparent shadow-sm text-sm font-medium 
    rounded-md text-white bg-my-green hover:bg-my-green-light  focus:outline-none 
    focus:ring-2 focus:ring-offset-2 focus:ring-my-green-light disabled:opacity-25 "
               onClick={()=> history.push(`/mint/${id}`)}
               >
                 View Recording / Mint NFTs
               </button>
   
               <button
    disabled={!streamingTokens}
    className="m-1 mt-3  inline-flex justify-center py-2 px-4 border 
    border-transparent shadow-sm text-sm font-medium 
    rounded-md text-white bg-my-green hover:bg-my-green-light focus:outline-none 
    focus:ring-2 focus:ring-offset-2 focus:ring-my-green-light disabled:opacity-25"
              onClick={stopStreamPayment}
              >
                 Stop Preview
               </button>
 </div>
 <SendTip disabled={loadingEvent || eventNotFound }/>

 <PrizeList eventId={id} key={fetchPrizeList}/>
            </section>
          </main>

          {/* Secondary column (hidden on smaller screens) */}
          <aside className=" w-96 bg-white border-l border-gray-200 overflow-y-auto lg:block">
            {/* Your content */}
            { eventData ?  <ChatBox live={!loadingEvent && isLive==true} eventId={eventData ? eventData.id : null}/>
           :""  
        }          </aside>
        </div>
      </div>
      <MyNotification type={notificationType} header={notificationHeader} body={notificationBody} open={openNotification} handleClose={handleCloseNotification}/>

    </div>
  : (gotTicketInfo && !hasTicket ? <PurchaseEventForm handlePreview={handlePreviewStream} handleSpendNotApproved={handleSpendNotApproved} handlePurchaseSuccess={handlePurchaseSuccess} handlePurchaseError={handlePurchaseError} live={isLive} event={eventData}/>: "")
)
}
