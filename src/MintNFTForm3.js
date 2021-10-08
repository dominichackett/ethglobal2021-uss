
import {Fragment,  useState,useEffect,useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useMoralisQuery,useMoralisSubscription,useMoralis } from 'react-moralis';
import {format} from 'date-fns';

import React from 'react';
import VideoJS from './VideoJS' // point to where the functional component is stored
import axios from "axios";
import { Parser } from 'm3u8-parser';
import { createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg';
import "videojs-markers-plugin"
import "videojs-markers-plugin/dist/videojs.markers.plugin.css"
import { useParams } from "react-router-dom";
import {MyNotification} from './MyNotification';
import { ExclamationIcon } from '@heroicons/react/outline';
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


  <div className="relative flex items-stretch flex-grow focus-within:z-10">
        <span  className=" relative inline-flex items-center 
        space-x-2 px-4 py-2 ">{props.averageClipDuration}</span>
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
  const parser = new Parser();
  const [segments,setSegments] = useState([]);
  const [segmentsData,setSegmentsData] = useState([]);
  const clipDuration  = useRef([]);
  const selectedClips = useRef([])
  const [averageClipDuration,setAverageClipDuration] = useState(0);
  const [openErrorDialog,setOpenErrorDialog]   = useState(false);
  const [errorDialogMessage,setErrorDialogMessage] = useState("");
  const [errorDialogTitle,setErrorDialogTitle]  = useState("");
  const videoRef = useRef(null);
  const [videoFile,setVideoFile] = useState();
  const [recordingURL,setRecordingURL] = useState(null);
  const {id} = useParams();
  const [sessionId,setSessionId]  = useState();
  const [streamId,setStreamId] = useState();
  const [loadingEvent,setLoadingEvent] = useState(true);  
  const [eventNotFound,setEventNotFound] = useState(false);
  const [openNotification,setOpenNotification]  = useState(false);
  const [notificationHeader,setNotificationHeader]  = useState("");
  const [notificationBody,setNotificationBody]  = useState("");
  const [notificationType,setNotificationType]  = useState();
  const [eventData,setEventData] = useState();
  const [clipLength,setClipLength] = useState("");

  const { fetch:fetchEvent, data: dataEvent, error:errorEvent, isLoading:isLoadingEvent } = useMoralisQuery(
    "Event", query=> 
     query
     .equalTo("objectId",id)
     ,
    { autoFetch: false }
  );
  
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

      /*
      instance.get('https://livepeer.com/api/stream/7d627041-3e7d-4792-94a0-25fc76c89516/sessions?record=1').then(function(res){
         console.log(res)
      });*/


      //Get Clip Segment urls
      axios.get(`https://nyc-cdn.livepeer.com/recordings/${sessionId}/source.m3u8` 
      ).then(function(res){
        parser.push(res.data);
        parser.end();
        let duration = 0;
        let cDuration = [];
        let seg = [];
        
        parser.manifest.segments.forEach(function(item){
            duration += item.duration;
            cDuration.push(duration);
            seg.push(item.uri);
        })
        setAverageClipDuration(parser.manifest.targetDuration);
           clipDuration.current = cDuration;
           console.log(cDuration)
           setSegments(seg);
           console.log(segments)
          console.log(parser);
      })

      /*
      axios.get('https://nyc-rec-cdn.livepeer.com/7d6200fe-e3ad-4867-a68e-b61b9352d109/prod-livepeer-broadcaster-7fnv-7c74d5d69d-rjmrp/source/1.ts').then(function(res){
        console.log(res)
      })
*/

   
  },[sessionId])

    /*const videoJsOptions = { // lookup the options in the docs for more options
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    inactivityTimeout:0 ,
    sources: [{
src:'https://nyc-cdn.livepeer.com/recordings/7d6200fe-e3ad-4867-a68e-b61b9352d109/source.m3u8'
        , type:'application/x-mpegURL'
    }],
    controlBar: {
      progressControl: {
        seekBar:{
          mouseTimeDisplay:false
        }
      }
    }
  }
*/
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

 const ffmpeg = useRef(createFFmpeg({  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js"
, log:true}));


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
    generateClip();
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
       setClipLength(0);
  }

   const load = async () =>
   {
     // await ffmpeg.current.load()
      setFFmpegReady(true)
   }

   useEffect(() =>{
    load();
   },[])


   async function generateClip()
   {
       let lStart = 0;
       let lEnd = 0    
       let clipdata;
       let bufferLength=0;
       if (selectedClips.current[0].id > selectedClips.current[1].id  )
       {
            lStart = selectedClips.current[1].id;
            lEnd = selectedClips.current[0].id;
       }else
       {
          lStart = selectedClips.current[0].id;
          lEnd = selectedClips.current[1].id;
       }
       //Calculate the lenght of the UINT8ARRY needed to store clip
       for(var loop = lStart; loop < lEnd; loop++)
          bufferLength += segmentsData[loop].byteLength;
       
       
       clipdata = new Uint8Array(bufferLength);
       let offset = 0;

       //Concatinate segement data to create the clip
       for(var loop = lStart; loop < lEnd; loop++)
       {
           clipdata.set(segmentsData[loop],offset);
           offset += segmentsData[loop].byteLength;
       }
       //clipdata = new Uint8Array(segmentsData[0].byteLength+segmentsData[1].byteLength)
      //clipdata.set(segmentsData[0],0);
      //clipdata.set(segmentsData[1],segmentsData[0].byteLength);

     //const data = ffmpeg.current.FS('writeFile',"tempfile.ts", fetchFile("https://nyc-cdn.livepeer.com/recordings/7d6200fe-e3ad-4867-a68e-b61b9352d109/source.m3u8","output.mp4"));
     
    ffmpeg.current.FS('writeFile',"tempfile.ts", clipdata);
  // await ffmpeg.current.run('-i',"tempfile.ts",'output.mp4')
    //  await ffmpeg.current.run('-i', 'tempfile.ts' ,'-acodec', 'copy', '-vcodec', 'copy' ,'output.mp4');
  //  ffmpeg.current.run("-i","https://nyc-cdn.livepeer.com/recordings/7d6200fe-e3ad-4867-a68e-b61b9352d109/source.m3u8","output.mp4") 
    //const data = ffmpeg.current.FS('readFile', 'output.mp4');
    await ffmpeg.current.run("-i", "tempfile.ts", "-c", "copy" ,"output.mp4");
  
    const data = ffmpeg.current.FS('readFile', 'output.mp4');
     
       videoRef.current.src = window.URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      console.log(lEnd);
      console.log(lStart)
       console.log(bufferLength);
       console.log(clipdata.byteLength);
   } 

  const [ffmpegReady,setFFmpegReady] =  useState(false)
  return ffmpegReady ? (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center w-full">
       <h1 id="primary-heading" className="pl-2 font-medium">
       {eventData ? eventData.get("name"): ""}

              </h1>
              <div className="pl-2">{eventData ? format(eventData.get("eventdate"),"iii do MMM yyyy p") : ""}</div>
              <div className="pl-2">{eventData ? eventData.get("owner").get("firstname")+" "+eventData.get("owner").get("lastname"): ""}</div>

    </div>          
  <div className="p-4 w-2/4 flex flex-col items-center">      
    
  <VideoJS options={videoJsOptions} onReady={handlePlayerReady}   />

  </div>
  <div className="w-2/4 p-4 flex justify-start "><ClipRange  averageClipDuration={clipLength} handlePreview={handlePreview} handleMint={handleMint}/>
</div>
  
  <div>
 
  </div>
  <ErrorDialog title={errorDialogTitle} message={errorDialogMessage} open={openErrorDialog} handleErrorDialogClose={handleErrorDialogClose} />
  <video controls ref={videoRef} className="video-js  vjs-default-skin shadow-lg bg-black  focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-my-green "/>
   <br/>
   </div>     
   ) : (<p>Loading FFMPEG
        </p>)
}
