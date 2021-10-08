import {useState,useRef,useEffect} from 'react';
import { useMoralis } from "react-moralis";
import { InformationCircleIcon ,PhotographIcon} from '@heroicons/react/solid'
import MyNotification from "./MyNotification";
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { NFTStorage } from 'nft.storage'
import { USS_CONTRACT_ADDRESS,USS_CONTRACT_ABI ,DAI_CONTRACT,DAI_ABI} from "./contract";
import {toBuffer} from "ethereumjs-util";

// Import Biconomy
import {Biconomy} from "@biconomy/mexa";
import Web3 from "web3";
let abi = require('ethereumjs-abi'); //dependencies

export default function EditEventForm(props) {

  const eventPicRef = useRef("");
  const [eventPic,setEventPic] = useState();
  const [openNotification,setOpenNotification]  = useState(false);
  const [notificationHeader,setNotificationHeader]  = useState("");
  const [notificationBody,setNotificationBody]  = useState("");
  const [notificationType,setNotificationType]  = useState();
  const [isSaving,setIsSaving]  = useState();
  const [nftMetaDataURL,setNftMetaDataURL] = useState();
  const [eventPicData,setEventPicData] = useState();
  const {user} = useMoralis();
  const history = useHistory();
  const [client] = useState(new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY }));

  const [biconomyReady,setBiconomyReady] = useState();
  const biconomy =  useRef(); 
  const web3 = useRef();
  const walletWeb3 = new Web3(window.ethereum);

const contract = useRef(); 
const daiContract = useRef();
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

    //DAI contract to approve funds
    daiContract.current = new walletWeb3.eth.Contract(
      DAI_ABI,
      DAI_CONTRACT
    );
    biconomy.current.onEvent(biconomy.current.READY, () => {
      setBiconomyReady(true);
    }).onEvent(biconomy.current.ERROR, (error, message) => {
      setOpenNotification(true);
      setNotificationHeader("ERROR DAPP ERROR")
      setNotificationBody("Error loading configuration. Please refresh this page");
      setNotificationType(2); //Error
      setIsSaving(false);
     
    });
  }
  biconomySetup();
  
},[])

  

  
  const handleCloseNotification = () =>
  {
     setOpenNotification(false);
  }


  const eventPicClicked = (event) => {
    eventPicRef.current.click(); 
  }; 

  const eventPicSelected = async () => {
    setIsSaving(true);
    let event = props.event;
    console.log(eventPicRef.current.files[0])
    const metadata = await client.store({
        name: 'Event Ticket',
        description: props.event.get("description"),
        image: eventPicRef.current.files[0]
      });

    if(!metadata)
    {
      setOpenNotification(true);
      setNotificationHeader("ERROR NFT PHOTO")
      setNotificationBody("Error saving nft information.");
      setNotificationType(2); //Error
      setIsSaving(false);
      return;
    
    }
    setEventPic(window.URL.createObjectURL(eventPicRef.current.files[0]));
   console.log(JSON.stringify(metadata))   
    setNftMetaDataURL(metadata.url);
    setIsSaving(false);
     
    
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

 async function approveDAI()
 {
  daiContract.current.methods.approve(USS_CONTRACT_ADDRESS,walletWeb3.utils.toWei(props.event.get("price").toString())).send({from:user.get("ethAddress")})
  .on('receipt', function(receipt){

            purchaseEvent();    
            }).on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
             
           props.handleSpendNotApproved()  
             
  });

 } 

 async function purchaseEvent()
  {
    let nonce = await contract.current.methods.getNonce(user.get("ethAddress")).call();
    // Create your target method signature.. here we are calling createEvent() method of our contract
    let functionSignature = contract.current.methods.purchaseTicket(props.event.id,nftMetaDataURL).encodeABI();
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
   props.handlePurchaseError();
   setIsSaving(false);
}).then(function(receipt){
   props.handlePurchaseSuccess();
   setIsSaving(false);
});

  }

  // Helper methods
const constructMetaTransactionMessage = (nonce, chainId, functionSignature, contractAddress) => {
  return abi.soliditySHA3(
      ["uint256","address","uint256","bytes"],
      [nonce, contractAddress, chainId, toBuffer(functionSignature)]
  );
}


  async function handlePurchaseClicked() 
  {
      setIsSaving(true);
      if(!nftMetaDataURL)
      {
        setOpenNotification(true);
        setNotificationHeader("ERROR NFT PHOTO")
        setNotificationBody("Error NFT image not selected.");
        setNotificationType(2); //Error
        setIsSaving(false);
        return;
      
      } 
      else{
          if(props.event.get("price") > 0)
             approveDAI();
          else
            purchaseEvent();   

        }  
  }
   
 function  PurchaseMessage()
 {
    return (
        <div className="rounded-md bg-blue-50 p-4 border-my-green border-2 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Information</h3>
              <div className="mt-2 text-sm text-blue-700">
              <ul role="list" className="list-disc pl-5 space-y-1">
              <li>You have not subscribed to this event</li>
              <li>Viewers access streaming by holding an event NFT even if the even is free</li>
              <li>Gas for NFTs are paid for by Unstoppable Streams</li>
              <li>You can preview this stream before purchasing it </li>
              <li>You need super tokens (Super DAIx) to preview streams  <a href="https://app.superfluid.finance/" target="_blank" className="text-my-green underline">Get Super Tokens</a></li>

            </ul>
              </div>
            </div>
          </div>
        </div>
      )
 }

    return (
 <div className="px-8 mt-8">

   <form noValidate className="space-y-8 divide-y divide-gray-200" >
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Purchase Event</h3>
            
          </div>
       
          <div className="pt-4">
          <PurchaseMessage />
        <div className="flex justify-start">
          <button
            type="button"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-my-green hover:bg-my-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-green-light"
          onClick={handlePurchaseClicked}
          >
            Purchase
          </button>
          <button
            type="button"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-my-green hover:bg-my-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-green-light disabled:opacity-25 hover:bg-my-green"
          disabled={!props.live }
          onClick={props.handlePreview}
          >
            Preview
          </button>
        </div>
      </div>
  
          <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="shadow-sm focus:ring-my-green focus:border-my-green block w-full sm:text-sm border-gray-300 rounded-md"
>
                
                <input
                  type="text"
                  name="name"
                  id="name"
                  autoComplete="name"
                  disabled = "true"
                  className="flex-1 focus:ring-my-green focus:border-my-green block w-full min-w-0 rounded-none rounded-md sm:text-sm border-gray-300"
                  value={props.event ? props.event.get("name") : ""}

               />
              </div>
             
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                Date
              </label>
              <div className="shadow-sm focus:ring-my-green focus:border-my-green block w-full sm:text-sm border-gray-300 rounded-md"
>
                
                <input
                  type="datetime-local"
                  name="eventdate"
                  id="eventdate"
                  autoComplete="eventdate"
                  className="flex-1 focus:ring-my-green focus:border-my-green block w-full min-w-0 rounded-none rounded-md sm:text-sm border-gray-300"
                  disabled="true" 
                  value={props.event ? format(props.event.get("eventdate"),"yyyy-MM-dd'T'HH:mm") : ""}

                 />
              </div>
              
            </div>


            <div className="sm:col-span-4">
            <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">
        Price
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">$</span>
        </div>
        <input
          type="number"
          name="price"
          id="price"
          className="focus:ring-my-green focus:border-my-green block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
          placeholder="0.00"
          aria-describedby="price-currency"
         disabled="true"
         value={props.event ? props.event.get("price") : ""}

        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm" id="price-currency">
            USD
          </span>
        </div>

      </div>
      
            </div>
            <div className="sm:col-span-6">
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                  NTF Photo
                </label>
                <div className="mt-1 flex items-center">
                  <span className="h-40 w-40  overflow-hidden bg-gray-100">
                  
                  { eventPic ?  <img
                 className="h-40 w-40 rounded-lg border-my-green border-2"
                 src={eventPic}
                 alt=""
               /> :  <PhotographIcon  className="h-40 w-40 border-my-green border-2 rounded-lg"/>}
               
                  </span>
                  <button
                    type="button"
                    className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-green"
                    onClick={eventPicClicked}
                  >
                    Change
                  </button>
                  <input type="file"   accept="image/png, image/jpeg"  ref={eventPicRef} hidden="true" onChange={eventPicSelected}/>

                </div>
              </div>
  

            <div className="sm:col-span-6">
              <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                Event Description
              </label>
              <div className="mt-1 mb-4">
              <span className=" w-full text-sm text-gray-900 whitespace-pre-line">{props.event ? props.event.get("description") :""}</span>

              </div>
              
            </div>

           
          </div>
        </div>

            </div>

    </form>
    <MyNotification type={notificationType} header={notificationHeader} body={notificationBody} open={openNotification} handleClose={handleCloseNotification}/>

    </div>
  )
}
