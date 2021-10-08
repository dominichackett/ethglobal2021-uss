/* This example requires Tailwind CSS v2.0+ */
import { VideoCameraIcon } from '@heroicons/react/outline'
import { useEffect,useState } from 'react'
import { useMoralis } from 'react-moralis'
import {USS_CONTRACT_ADDRESS} from './contract';
import { Link } from 'react-router-dom';
import VideoJS from './VideoJS';


export default function MyNFTFeed() {
  const {user,Moralis}  = useMoralis();
  const [nfts, setNfts]  = useState([]);
  const [videoJsOptions,setVideoJsOptions] = useState(
    {controls: true,
              responsive: true,
              fluid: true,
             
             }
  );
  //Get the user NFT tokens
  useEffect(()=>{
    async function getNFT()
    {
       const polygonNFTs = await Moralis.Web3API.account.getNFTs({chain:"mumbai"});
       const resp = await Moralis.Cloud.run('getEventsForUserNFTs',{userAddress:user.get("ethAddress")});
       let events = new Map();
        resp.forEach(function(data){
          events[data.tokenid] = {eventID:data.eventID,name:data.name};
          console.log(data)  
        });
        
        console.log(events)
       console.log(JSON.stringify(polygonNFTs))
       console.log(polygonNFTs)
       let tokens = [];
       polygonNFTs.result.forEach(function(_nft){
        
        //I only want Unstoppable Stream Tokens
        if(_nft.token_address == USS_CONTRACT_ADDRESS.toLowerCase())
         {
              let  url ="";
              let metadata = JSON.parse(_nft.metadata);  
              console.log(metadata)
             if(metadata.image)
             {
               url = metadata.image.replace("ipfs://","");
              url = "https://ipfs.moralis.io:2053/ipfs/"+url;
             }
              //Check if we have a video file or an image
              let type = (url.substr(url.length - 4).toLowerCase() == "m3u8" ? 1: 2);

              tokens.push({token_id:_nft.token_id
                           ,name:metadata.name,
                           url:url,
                           type:type,
                           token_name:_nft.name,
                           symbol:_nft.symbol,event:events[_nft.token_id]});
                           
         }
         
       });
       console.log(tokens);
        setNfts(tokens);
  
    }
    
    if(user)
       getNFT();
  },[user])
  
  

  return (
    <div className="px-8 mt-8 mb-4 ">

    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
      {nfts.map((nft) => (
        <li
          key={nft.token_id}
          className="col-span-1 flex flex-col text-center bg-white rounded-lg shadow divide-y divide-gray-200"
        >
          <div className="flex-1 flex flex-col p-8">
          {
            nft.type == 1 ?
            <VideoJS         options={videoJsOptions} >
          
  Your browser does not support the video tag.
  <source src={nft.url} type="application/x-mpegURL" />

</VideoJS> : <img src={nft.url}    /> }       
            <dl className="mt-1 flex-grow flex flex-col justify-end">
            <dt className="sr-only">Event</dt>
              <dd>     <h3 className="mt-6 text-gray-900 text-sm font-medium">{nft.token_name}</h3>
</dd>
              <dt className="sr-only">Name</dt>
              <dd className="text-gray-500 text-sm">{nft.name}</dd>
              <dt className="sr-only">Role</dt>
              <dd className="mt-3">
                <span className="px-2 py-1 text-green-800 text-xs font-medium bg-green-100 rounded-full">
                  {nft.event.name}
                </span>
              </dd>
            </dl>
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="w-0 flex-1 flex">
                <Link
                  to={`/view/${nft.event.eventID}`}
                  className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                >
                  <VideoCameraIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  <span className="ml-3">View Event</span>
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
