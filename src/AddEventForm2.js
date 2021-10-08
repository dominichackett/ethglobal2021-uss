import {useForm  } from "react-hook-form";
import {useState,useRef} from 'react';
import { useMoralis } from "react-moralis";
import { PhotographIcon } from '@heroicons/react/solid'
import MyNotification from "./MyNotification";
import axios from "axios";
import { useHistory } from 'react-router-dom';

import { USS_CONTRACT_ADDRESS,USS_CONTRACT_ABI } from "./contract";

// Import Biconomy
import {Biconomy} from "@biconomy/mexa";
import Web3 from "web3";
import { useEffect } from "react/cjs/react.development";

export default function AddEventForm() {

  const eventPicRef = useRef("");
  const [eventPic,setEventPic] = useState();
  const [openNotification,setOpenNotification]  = useState(false);
  const [notificationHeader,setNotificationHeader]  = useState("");
  const [notificationBody,setNotificationBody]  = useState("");
  const [notificationType,setNotificationType]  = useState();
  const [biconomyReady,setBiconomyReady] = useState();
  const [livepeerStreamObject,setLivepeerStreamObject] = useState();
  const [eventObject,setEventObject]  = useState();
  const [isSaving,setIsSaving]  = useState(false);
  const history = useHistory();
  const provider =  window["ethereum"];
  const biconomy =  useRef(); 
  const web3 = useRef();
  const walletWeb3 = new Web3(window.ethereum);
  // Initialize constants
  const domainType = [
     { name: "name", type: "string" },
     { name: "version", type: "string" },
     { name: "verifyingContract", type: "address" },
     { name: "salt", type: "bytes32" },
   ];
  const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" }
  ];
// replace the chainId 42 if network is not kovan
  const domainData = {
  name: "UnstoppableStreams",
  version: "1",
  verifyingContract: USS_CONTRACT_ADDRESS,
  // converts Number to bytes32. pass your chainId instead of 80001 if network is not Mumbai
  salt: '0x' + (80001).toString(16).padStart(64, '0')
};

const contract = useRef(); 

useEffect(()=>{
  async function biconomySetup()
  {
    await provider.enable();
    biconomy.current = new Biconomy(provider,{apiKey: process.env.REACT_APP_BICONOMY_API_KEY ,debug: true});
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
    const Event = Moralis.Object.extend("Event");
    let event = new Event();
 
    console.log(eventPicRef.current.files[0])
    // Save file input to IPFS
    const data = eventPicRef.current.files[0];
    const file = new Moralis.File(data.name, data);
    const saveresult = await file.saveIPFS();
    
    if(!saveresult)
    {
      setOpenNotification(true);
      setNotificationHeader("ERROR EVENT PICTURE")
      setNotificationBody("Event picture not saved.");
      setNotificationType(2); //Error
      setIsSaving(false);
      return;
    
    }
    

    if(eventObject)
    {
       event = eventObject;
    }
    else{
      event.set("eventdate",new Date());
      event.set("owner",user);
      
    }
    event.set("eventpic",file.ipfs());
      
    const result = await event.save();
    
   if(result)  
   {
      setEventPic(file.ipfs());
      setEventObject(event);
      setIsSaving(false);
    }else{
      setOpenNotification(true);
      setNotificationHeader("ERROR EVENT PICTURE")
      setNotificationBody("Event picture not saved.");
      setNotificationType(2); //Error
      setIsSaving(false);
      return;
    
    }
    
    
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

  const _handleSubmit = async (data,e) => {
    alert("submit")
    setIsSaving(true);
    if(!eventPic)
    {
      setOpenNotification(true);
      setNotificationHeader("ERROR EVENT PICTURE")
      setNotificationBody("Event picture not selected.");
      setNotificationType(2); //Error
      setIsSaving(false);
      return;
    }

    let lpObect = {};
    const instance = axios.create({
      baseURL: 'https://livepeer.com/api/',
      
      headers: {'Authorization': 'Bearer '+process.env.REACT_APP_LIVEPEER_API_KEY,
      'content-type': 'application/json'}
    });

    const result = instance.post('/stream',
    {
      "name": data.name,
      record:true,

      "profiles": [
        {
          "name": "720p",
          "bitrate": 2000000,
          "fps": 30,
          "width": 1280,
          "height": 720
        },
        {
          "name": "480p",
          "bitrate": 1000000,
          "fps": 30,
          "width": 854,
          "height": 480
        },
        {
          "name": "360p",
          "bitrate": 500000,
          "fps": 30,
          "width": 640,
          "height": 360
        }
      ]
    });

    result.then(async function(resp){

      let nonce = await contract.current.methods.getNonce(user.get("ethAddress")).call();
      // Create your target method signature.. here we are calling createEvent() method of our contract
      let functionSignature = contract.current.methods.createEvent(eventObject.id,data.name,new Date(data.eventdate).getTime(),(data.price =="" ? 0:data.price)).encodeABI();
      let message = {};
      message.nonce = parseInt(nonce);
      message.from = user.get("ethAddress");
      message.functionSignature = functionSignature;
      
      const dataToSign = JSON.stringify({
        types: {
          EIP712Domain: domainType,
          MetaTransaction: metaTransactionType
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message
      });
      
      // NOTE: Using walletWeb3 here, as it is connected to the wallet where user account is present.
      // Get the EIP-712 Signature and send the transaction
      walletWeb3.currentProvider.send({
          jsonrpc: "2.0",
          id: 999999999999,
          method: "eth_signTypedData_v4",
          params: [user.get("ethAddress"), dataToSign]
        },function(error, response) {
          // Check github repository for getSignatureParameters helper method
          let { r, s, v } = getSignatureParameters(response.result);
          let tx = contract.current.methods.executeMetaTransaction(user.get("ethAddress"),
          functionSignature, r, s, v).send({from: user.get("ethAddress")});
      
          tx.on("transactionHash", function(hash) {
            // Handle transaction hash
          }).once("confirmation", function(confirmationNumber, receipt) {
            // Handle confirmation
           /* lpObect =resp.data;
            console.log(lpObect);
            setLivepeerStreamObject(lpObect);
            
            let event = eventObject;
            event.set("livepeerobject",JSON.stringify(lpObect));
            event.set("streamId",lpObect.id);
            event.set("name",data.name);
            event.set("eventdate",new Date(data.eventdate));
            event.set("description",data.description);
            event.set("price",(data.price =="" ? 0:data.price));
            event.set("visible",true);
            event.save().then(function(resp){
              setOpenNotification(true);
              setNotificationHeader("SUCCESSFULLY SAVED")
              setNotificationBody("Your event has been saved.");
              setNotificationType(1); //Success
              setIsSaving(false);
              history.push("/myevents");
            }).catch((error)=>{
              setOpenNotification(true);
              setNotificationHeader("ERROR SAVING EVENT")
              setNotificationBody("Error saving your event.");
              setNotificationType(2); //Error
              setIsSaving(false);
              console.log(error)
            })*/
          }).on("error", function(error) {
            // Handle error

            console.log(error)
          });
          
        }
      );

    
    }).catch(function(error){

    })

  }
  const { register, formState: { errors }, handleSubmit } = useForm();
  const {user,Moralis} = useMoralis();
  return (
 <div className="px-8 mt-8">

   <form noValidate className="space-y-8 divide-y divide-gray-200" onSubmit={handleSubmit(_handleSubmit)}>
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Add Event</h3>
            
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
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
                  className="flex-1 focus:ring-my-green focus:border-my-green block w-full min-w-0 rounded-none rounded-md sm:text-sm border-gray-300"
                  {...register("name", { required: true })} 

               />
              </div>
              {errors.name?.type === 'required' && <span className="text-sm text-red-700">Name is required</span>}

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
                    {...register("eventdate", { required: true ,
                      validate: value =>( (new Date(value) instanceof Date && !isNaN(new Date(value).valueOf()))
                    )
                    })} 

                    />
              </div>
              {errors.eventdate?.type === 'required' && <span className="text-sm text-red-700">Event date is required</span>}
              {errors.eventdate?.type === 'validate' && <span className="text-sm text-red-700">Invalid event date</span>}

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
          {...register("price", { min: 0 })} 

        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm" id="price-currency">
            USD
          </span>
        </div>

      </div>
      {errors.price?.type === 'min' && <span className="text-sm text-red-700">Price is required</span>}

            </div>
            <div className="sm:col-span-6">
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                  Event Photo
                </label>
                <div className="mt-1 flex items-center">
                  <span className="h-40 w-40  overflow-hidden bg-gray-100">
                  
                  { eventPic ? <img
                 className="h-40 w-40 rounded-lg border-my-green border-2"
                 src={eventPic}
                 alt=""
               /> : <PhotographIcon  className="h-40 w-40 border-my-green border-2 rounded-lg"/>}
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
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="shadow-sm focus:ring-my-green focus:border-my-green block w-full h-40 sm:text-sm border border-gray-300 rounded-md"
                  {...register("description", { required: true })} 

                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Write a few sentences about your event.</p>
              {errors.description?.type === 'required' && <span className="text-sm text-red-700">Description is required</span>}

            </div>

           
          </div>
        </div>

            </div>

      <div className="pt-5 pb-10">
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-green"
          onClick={()=> history.push("/myevents")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-my-green hover:bg-my-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-green-light"
          disabled={isSaving}
          >
            Save
          </button>
        </div>
      </div>
    </form>
    <MyNotification type={notificationType} header={notificationHeader} body={notificationBody} open={openNotification} handleClose={handleCloseNotification}/>

    </div>
  )
}
