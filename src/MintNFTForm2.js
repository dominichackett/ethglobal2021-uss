
import {  useState,useEffect,useRef } from 'react'
import TestVideo from './images/test.mp4'
import React from 'react';
import VideoJS from './VideoJS' // point to where the functional component is stored
import axios from "axios";
import { Parser } from 'm3u8-parser';
import { createFFmpeg,fetchFile } from '@ffmpeg/ffmpeg';
import "videojs-markers-plugin"
import "videojs-markers-plugin/dist/videojs.markers.plugin.css"


const people = [
    {
      name: 'Jane Cooper',
      title: 'Regional Paradigm Technician',
      department: 'Optimization',
      role: 'Admin',
      email: 'jane.cooper@example.com',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
    },
    // More people...
  ]
  

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}




function ClipRange(props)
{
   return(<span className="flex items-center shadow-sm rounded-md p-2">
  <span className="p-3 font-medium "> Start:</span> <input  type="number" onChange={props.handleStartChange} value={props.start} min="0"  className=" text-sm  shadow-sm focus:ring-my-green focus:border-my-green block w-full sm:text-sm border-gray-300 rounded-md " />
  <span className="p-3 font-medium "> End:</span> <input  type="number" onChange={props.handleEndChange} value={props.end} min="0"  className="  text-sm  shadow-sm focus:ring-my-green focus:border-my-green block w-full sm:text-sm border-gray-300 rounded-md "/>
  <span className="p3 "><button
    
    className="ml-3  py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-my-green hover:bg-my-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-green-light"
           >
             Preview
           </button>
  </span>
  <span className="p3"><button
    
    className="ml-3   py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-my-green hover:bg-my-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-green-light"
           >
             Mint
           </button>
  </span>
 </span>)
}
export default function MintNFTForm() {
  const playerRef = useRef(null);
  const endRef = useRef(null);
  const livePearAPIKey =  process.env.REACT_APP_LIVEPEER_API_KEY;
  const parser = new Parser();
  const [segments,setSegments] = useState([]);
  const [start,setStart] = useState(null);
  const [end,setEnd] = useState(null);
  const clipDuration  = useRef([]);
  const handleStartChange = (event) => {
    if(event.target.value < end) 
    setStart(event.target.value);
    let markers = playerRef.current.markers.getMarkers();
    markers[0].time =event.target.value;
    playerRef.current.markers.updateTime();
  }


  const handleEndChange = (event) => {
    if(event.target.value > start) 
    setEnd(event.target.value);
    let markers = playerRef.current.markers.getMarkers();
    markers[1].time =event.target.value;
    playerRef.current.markers.updateTime();
  }

  useEffect(()=>{
    const instance = axios.create({
        baseURL: 'https://livepeer.com/api/',
        
        headers: {'Authorization': 'Bearer '+livePearAPIKey}
      });

      instance.get('https://livepeer.com/api/stream/7d627041-3e7d-4792-94a0-25fc76c89516/sessions').then(function(res) {
       console.log(res);
      });

      axios.get('https://nyc-cdn.livepeer.com/recordings/7d6200fe-e3ad-4867-a68e-b61b9352d109/source.m3u8' 
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
           clipDuration.current = cDuration;
           console.log(cDuration)
           setSegments(seg);
           setEnd(cDuration[seg.length-1].toFixed(0));
           endRef.current = cDuration[seg.length-2];
           setStart(0)
           console.log(segments)
          console.log(parser);
      })

      axios.get('https://nyc-rec-cdn.livepeer.com/7d6200fe-e3ad-4867-a68e-b61b9352d109/prod-livepeer-broadcaster-7fnv-7c74d5d69d-rjmrp/source/1.ts').then(function(res){
        console.log(res)
      })


   
  },[])

  /*useEffect(()=>{

     if(playerRef.current !=null)
     {
        let markers =playerRef.current.markers.getMarkers();
      if(markers.length > 0)
      {
        markers[0].time = start;
        markers[1].time = end;
        playerRef.current.markers.updateTime();
        alert("update")
      }
      }
      alert("Not")
    },[start,end,playerRef])
  */
    const videoJsOptions = { // lookup the options in the docs for more options
    autoplay: true,
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

 const ffmpeg = createFFmpeg({  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js"
, log:true});


  const handlePlayerReady = (player) => {
    playerRef.current = player;
    player.bigPlayButton.on('click', function(){
      // do the action
      alert(JSON.stringify(clipDuration))

      let markers =playerRef.current.markers.getMarkers();
      let clips = clipDuration.current;
      if(markers.length > 0)
      {
        markers[0].time = 0;
        for(let loop = 1; loop < clips.length;loop++ )
        {
          if(loop % 1 == 0)
           playerRef.current.markers.add( [{time: clips[loop-1],text:`Clip ${loop+1}`,id:loop,class: (loop % 2 == 0 ?   "special-green" : "special-blue")}]);
        
        }
       // playerRef.current.markers.updateTime();
      }  
         
  });    player.markers({
      markerTip:{
        display: true,
        text: function(marker) {
           return  marker.text+ " Time: "+marker.time;
        }},
       
      markers: [
         {time: 0,text:"Clip 1",id:0,class:"special-green"},
        
      ]});
    // you can handle player events here
    player.on('waiting', () => {
      console.log('player is waiting');
    });

    player.on('dispose', () => {
      console.log('player will dispose');
    });
  };

   const load = async () =>
   {
     // await ffmpeg.load()
      setFFmpegReady(true)
   }

   useEffect(() =>{
    load();
   },[])


   async function generateClip()
   {

   } 

  const [ffmpegReady,setFFmpegReady] =  useState(false)
  return ffmpegReady ? (
    <div className="flex flex-col items-center">
      <div className="bg-my-green w-full">
       <h1 id="primary-heading" className="pl-2 font-medium">
                Stream Name
              </h1>
              <span className="pl-2">Broadcast Time:</span>
              <span className="pl-2">User:</span>

    </div>          
  <div className="p-4 w-2/4 flex flex-col items-center">      
    
  <VideoJS options={videoJsOptions} onReady={handlePlayerReady}   />
  <ClipRange start={start} end={end} handleEndChange={handleEndChange} handleStartChange={handleStartChange}/>
  </div>
  <div>
 
  </div>
   </div>     
   ) : (<p>Loading FFMPEG
        </p>)
}
