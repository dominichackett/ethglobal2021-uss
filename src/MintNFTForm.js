
import {Fragment,  useState,useEffect,useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useMoralisQuery,useMoralis } from 'react-moralis';

import React from 'react';
import VideoJS from './VideoJS' // point to where the functional component is stored
import axios from "axios";
import { Parser } from 'm3u8-parser';
import "videojs-markers-plugin"
import "videojs-markers-plugin/dist/videojs.markers.plugin.css"
import { useParams } from "react-router-dom";
import MyNotification from './MyNotification';
import { ExclamationIcon } from '@heroicons/react/outline';
import { NFTStorage } from 'nft.storage'
import { USS_CONTRACT_ADDRESS,USS_CONTRACT_ABI ,DAI_CONTRACT,DAI_ABI} from "./contract";
import {toBuffer} from "ethereumjs-util";

// Import Biconomy
import {Biconomy} from "@biconomy/mexa";
import Web3 from "web3";
let abi = require('ethereumjs-abi'); //dependencies


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}




function ErrorDialog(props) {
  //const [open, setOpen] = useState(false)

  return (
    <Transition.Root show={props.open} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={props.handleErrorDialogClose}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    {props.title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                     {props.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-500 text-base font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 sm:text-sm"
                  onClick={ props.handleErrorDialogClose}
                >
                 Close
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}


function ClipRange(props)
{
   

  return(<div className="w-full " >


  <div className="flex justify-center">
    <button onClick={props.handlePreview} className="ml-3  py-2 px-4 border border-transparent 
     shadow-sm text-sm font-medium rounded-md text-white 
     bg-my-green hover:bg-my-green-light 
     focus:outline-none focus:ring-2 
     focus:ring-offset-2 
     focus:ring-my-green-light">
       Preview
     </button>
  <button onClick={props.handleMint} className="ml-3   py-2 px-4 border border-transparent
      shadow-sm text-sm font-medium rounded-md 
      text-white bg-my-green hover:bg-my-green-light
      focus:outline-none focus:ring-2 focus:ring-offset-2 
      focus:ring-my-green-light">
      Mint NFT
  </button> 
    </div>

   
  </div>)
}
export default function MintNFTForm() {
  const playerRef = useRef(null);
  const livePearAPIKey =  process.env.REACT_APP_LIVEPEER_API_KEY;
  const parser =  useRef(new Parser());
  const [segments,setSegments] = useState([]);
  const [segmentsData,setSegmentsData] = useState([]);
  const clipDuration  = useRef([]);
  const selectedClips = useRef([])
  const [averageClipDuration,setAverageClipDuration] = useState(0);
  const [openErrorDialog,setOpenErrorDialog]   = useState(false);
  const [errorDialogMessage,setErrorDialogMessage] = useState("");
  const [errorDialogTitle,setErrorDialogTitle]  = useState("");
  const [videoFile,setVideoFile] = useState();
  const [recordingURL,setRecordingURL] = useState(null);
  const {id} = useParams();
  const [sessionId,setSessionId]  = useState();
  const [streamId,setStreamId] = useState();
  const [loadingEvent,setLoadingEvent] = useState(true);  
  const [eventNotFound,setEventNotFound] = useState(false);
  const [isMinting,setIsMinting]  = useState();
  const liveQuery = useRef();
  const subscription = useRef();
  const [openNotification,setOpenNotification]  = useState(false);
  const [notificationHeader,setNotificationHeader]  = useState("");
  const [notificationBody,setNotificationBody]  = useState("");
  const [notificationType,setNotificationType]  = useState();
  const [eventData,setEventData] = useState();
  const [clipLength,setClipLength] = useState("Clip not selected.");
  const [client] = useState(new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY }));

  const [biconomyReady,setBiconomyReady] = useState();
  const biconomy =  useRef(); 
  const web3 = useRef();
  const walletWeb3 = new Web3(window.ethereum);
  const contract = useRef(); 
  
  const handleCloseNotification = () =>
  {
     setOpenNotification(false);
  }

  const {user,Moralis} = useMoralis();
  const { fetch:fetchEvent, data: dataEvent, error:errorEvent, isLoading:isLoadingEvent } = useMoralisQuery(
    "Event", query=> 
     query
     .equalTo("objectId",id)
     ,
    { autoFetch: false }
  );
  

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
        setIsMinting(false);
       
      });
    }
    biconomySetup();
    
  },[])
  
  
  //Fetch  Event Data to Get Recording Data
useEffect(()=>{
   
  fetchEvent({ 
    onSuccess: (data) =>{
      if(data.length > 0)
      { 
        setEventData(data[0]);
         console.log(data[0]);
         setLoadingEvent(false);
         setEventNotFound(false);
         let livePeerObject = JSON.parse(data[0].get("livepeerobject"));
         let url = `https://cdn.livepeer.com/hls/${livePeerObject.playbackId}/index.m3u8`;
        console.log(url)
        // playbackRefURL.current=url;
         console.log(livePeerObject);
         setStreamId(livePeerObject.id);
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

  //Get the Stream Segments Data
  useEffect(()=>{
   async function getStreamData()
   {
     let  data = [];
      for (const item of segments) {
     
     let response = await fetch(item);
     console.log(response) 
     data.push(new Uint8Array(await response.arrayBuffer()));
      }        
     
    setSegmentsData(data);
     console.log(data);
     
  }
  getStreamData();
   
}
  
     ,[segments]) 
  
  useEffect(()=>{
    if(recordingURL !=null)
    fetch(recordingURL).then(function(res){
      let r = res.arrayBuffer()
       setVideoFile(r)
       console.log(r)
    })
  },[recordingURL])

// Get stream recording url and the session Id
  useEffect(()=>{
    
    if(!streamId)
      return;
    //Setup axios with credentials    
     const instance = axios.create({
       baseURL: 'https://livepeer.com/api/',
       
       headers: {'Authorization': 'Bearer '+livePearAPIKey}
     });

     // Get the stream recording url
     instance.get(`https://livepeer.com/api/stream/${streamId}/sessions`).then(function(res) {
      console.log(res);
      setRecordingURL(res.data[0].mp4Url)
      setSessionId(res.data[0].id);
      console.log(res.data[0].mp4Url)
      console.log(res.data[0].id)
      playerRef.current.src({ type: 'application/x-mpegURL', src: `https://nyc-cdn.livepeer.com/recordings/${res.data[0].id}/source.m3u8`});

     });

    },[streamId]);

  useEffect(()=>{
    
    if(!sessionId)
      return;
     //Setup axios with credentials    
      const instance = axios.create({
        baseURL: 'https://livepeer.com/api/',
        
        headers: {'Authorization': 'Bearer '+livePearAPIKey}
      });



      //Get Clip Segment urls
      axios.get(`https://nyc-cdn.livepeer.com/recordings/${sessionId}/source.m3u8` 
      ).then(function(res){
        parser.current.push(res.data);
        parser.current.end();
        let duration = 0;
        let cDuration = [];
        let seg = [];
        
        parser.current.manifest.segments.forEach(function(item){
            
            duration += item.duration;
            cDuration.push(duration);
            seg.push(item.uri);
        })
        console.log(parser.current.manifest)
        setAverageClipDuration(parser.current.manifest.targetDuration);
           clipDuration.current = cDuration;
           console.log(cDuration)
           setSegments(seg);
           console.log(segments)
          console.log(parser);
      })


   
  },[sessionId])

const [videoJsOptions,setVideoJsOptions] = useState(
  {controls: true,
            responsive: true,
            fluid: true,
            controlBar: {
              progressControl: {
                seekBar:{
                  mouseTimeDisplay:false
                }
              }
            }
           
           }
);

 

const handleErrorDialogClose = ( ) =>
{
   setOpenErrorDialog(false);
}

const handleMint = () => {
  if(selectedClips.current.length < 2)
  {
    setOpenErrorDialog(true);
    setErrorDialogMessage("Please highlight the clips on the video timeline.  Click on the timeline to set the start and the end.");
    setErrorDialogTitle("Mint NFT Error!")
  }else
  {
    newClip();
  }
  
}
const handlePreview = () => {
  if(selectedClips.current.length < 2)
  {
     setOpenErrorDialog(true);
     setErrorDialogMessage("Please highlight the clip on the video timeline. Click on the timeline to set the start and the end.");
     setErrorDialogTitle("Preview Clip!")
  }
  else
  {
    let clips = selectedClips.current;
    playerRef.current.currentTime((clips[0].time < clips[1].time ? clips[0].time : clips[1].time));
    playerRef.current.play();
  }
}

  const handlePlayerReady = (player) => {
    playerRef.current = player;
    player.bigPlayButton.on('click', function(){
      // do the action

      let markers =playerRef.current.markers.getMarkers();
      let clips = clipDuration.current;
      if(markers.length > 0)
      {
        markers[0].time = 0;
        for(let loop = 1; loop < clips.length;loop++ )
        {
          if(loop % 1 == 0)
           playerRef.current.markers.add( [{time: clips[loop-1],text:`Clip ${loop+1}`,id:loop,class: "special-green" }]);
        
        }
       // playerRef.current.markers.updateTime();
      }  
         
  });    player.markers({
      markerTip:{
        display: true,
        text: function(marker) {
           return  marker.text;
        }},
  
  onMarkerReached: function(marker) {
         if(selectedClips.current.length == 2)
         {
              let lastMarker = (selectedClips.current[0].id > selectedClips.current[1].id 
                                ? selectedClips.current[0] : selectedClips.current[1]);
              
            //stop player when last marker reached                    
            if(marker.id == lastMarker.id)
            {
                playerRef.current.pause();
            }     
         }
         
     },
    
  onMarkerClick: function(marker) {
    
    if(selectedClips.current.length == 0)
     {
          marker.class= "special-red";
          selectedClips.current.push(marker);
     }
     else if (selectedClips.current.length == 1)
     {
       
        if(marker.id == selectedClips.current[0].id)
         {
             marker.class = "special-green";
             selectedClips.current = [];
         }
         else
         {
          marker.class= "special-red";
          selectedClips.current.push(marker);
    
         }
     }else if(selectedClips.current.length == 2)
     {
       
         //If the marker is not selected 
         if(marker.id != selectedClips.current[0].id && marker.id != selectedClips.current[1].id)
           {
             marker.class = "special-red";
             let markers = playerRef.current.markers.getMarkers();
             markers[selectedClips.current[1].id].class = "special-green";
             selectedClips.current[1] = marker;
   
          } else //marker previously selected
          {

              marker.class = "special-green";
              let markers = playerRef.current.markers.getMarkers();
              
              
              if(marker.id == selectedClips.current[0].id)
              {
                 let temp = selectedClips.current[1];
                 selectedClips.current = [];
                 selectedClips.current.push(temp);    
              }else
              {
                 let temp = selectedClips.current[0];
                  
                 selectedClips.current = [];
                 selectedClips.current.push(temp);  
              }
          
            

          }     
        }
   
     playerRef.current.markers.updateTime();
    calculateClipLength()
    },
 
      markers: [
         {time: 0,text:"Clip 1",id:0,class:"special-green"},
        
      ]},
      
      );
     };
  function calculateClipLength()
  {
  
    if(selectedClips.current.length == 2)
     {
      let firstMarker = (selectedClips.current[0].id < selectedClips.current[1].id 
        ? selectedClips.current[0] : selectedClips.current[1]);
      let lastMarker = (selectedClips.current[0].id > selectedClips.current[1].id 
          ? selectedClips.current[0] : selectedClips.current[1]);
      let time =  lastMarker.time-firstMarker.time;
      let minutes = Math.floor(time / 60);
      let seconds = time - minutes * 60;
          setClipLength(`Clip is ${minutes } Minutes ${seconds.toFixed(0)} Seconds`);
     }
     else
       setClipLength(
        "Clip not selected.");
  }

  
  
 
  async function newClip()
  {
    let lStart = 0;
    let lEnd = 0    
    setIsMinting(true)
    if (selectedClips.current[0].id > selectedClips.current[1].id  )
    {
         lStart = selectedClips.current[1].id;
         lEnd = selectedClips.current[0].id;
    }else
    {
       lStart = selectedClips.current[0].id;
       lEnd = selectedClips.current[1].id;
    }
    
    //Create new playlist
    let playlist ="#EXTM3U\n\r"; 
    playlist+=`#EXT-X-VERSION:${parser.current.manifest.version}\n\r`;        
    playlist+= `#EXT-X-MEDIA-SEQUENCE:${parser.current.manifest.mediaSequence}\n\r`;
    playlist += `#EXT-X-TARGETDURATION:${parser.current.manifest.targetDuration}\n\r`;


    for(var loop = lStart; loop < lEnd; loop++)
    {
        playlist+=`#EXTINF:${parser.current.manifest.segments[loop].duration},\n`;
        playlist+= `${parser.current.manifest.segments[loop].uri}\n`;

    }
    playlist+="#EXT-X-ENDLIST";
    console.log(playlist)

    
    const metadata = await client.store({
      name: 'Event Clip',
       description: 'Unstoppable Streams Event: '+eventData.get("eventname"),
      image: new File([playlist], 'source.m3u8', { type: 'application/x-mpegURL' })
    })

    createNFT(metadata.url);
}


async function createNFT(url)
{
  let nonce = await contract.current.methods.getNonce(user.get("ethAddress")).call();
    // Create your target method signature.. here we are calling createEvent() method of our contract
    let functionSignature = contract.current.methods.mintNFT(eventData.id,url).encodeABI();
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
  setNotificationHeader("ERROR MINTING NFT")
  setNotificationBody("There was an error minting this NFT.");
  setNotificationType(2); //Error

   setIsMinting(false);
}).then(function(receipt){
     setOpenNotification(true);
     setNotificationHeader("SUCCESSFULLY MINTED NFT")
     setNotificationBody("You successfully minted this NFT.");
     setNotificationType(1); //Success

     setIsMinting(false);
});

  }

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
 
  // Helper methods
const constructMetaTransactionMessage = (nonce, chainId, functionSignature, contractAddress) => {
  return abi.soliditySHA3(
      ["uint256","address","uint256","bytes"],
      [nonce, contractAddress, chainId, toBuffer(functionSignature)]
  );
}

  return  ( <div
    
    className="ring-2 ring-my-green ml-40 mr-40 mt-2 relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col  items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-my-green"
  >
    <div className="flex-shrink-0">
      <img className="h-20 w-20 rounded-full" src={eventData?.get("owner").get("profilePic")} alt="" />
    </div>
    <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{eventData ? eventData.get("owner").get("firstname")+" "+eventData.get("owner").get("lastname"): ""}</p>
        <p className="text-sm text-gray-500 truncate">{eventData ? eventData.get("name") : ""}</p>

    </div>
    
    <div className="p-2 w-4/6 flex flex-col items-center">      
    
    <VideoJS options={videoJsOptions} onReady={handlePlayerReady}   />
  
    </div>
    <div className="w-5/6  flex flex-col items-center ">
    <span  className="mb-2 px-2 py-1 text-green-800 text-xs font-medium bg-green-100 rounded-full" 
         >{clipLength}</span>
    <ClipRange  averageClipDuration={clipLength} handlePreview={handlePreview} handleMint={handleMint}/>
    <ErrorDialog title={errorDialogTitle} message={errorDialogMessage} open={openErrorDialog} handleErrorDialogClose={handleErrorDialogClose} />
    <MyNotification type={notificationType} header={notificationHeader} body={notificationBody} open={openNotification} handleClose={handleCloseNotification}/>

    </div>


  </div>) 
}
