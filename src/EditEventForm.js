import {useForm  } from "react-hook-form";
import {useState,useRef,useEffect} from 'react';
import { useMoralis } from "react-moralis";
import { PhotographIcon } from '@heroicons/react/solid'
import MyNotification from "./MyNotification";
import axios from "axios";
import { useHistory,useParams } from 'react-router-dom';
import { format ,parseISO} from 'date-fns';

export default function EditEventForm() {

  const eventPicRef = useRef("");
  const [eventPic,setEventPic] = useState();
  const [openNotification,setOpenNotification]  = useState(false);
  const [notificationHeader,setNotificationHeader]  = useState("");
  const [notificationBody,setNotificationBody]  = useState("");
  const [notificationType,setNotificationType]  = useState();
  const {user,Moralis} = useMoralis();
 
  const [livepeerStreamObject,setLivepeerStreamObject] = useState();
  const [eventObject,setEventObject]  = useState();
  const [isSaving,setIsSaving]  = useState(false);
  const history = useHistory();
  const [loadingEvent,setLoadingEvent]  = useState(true);
  const {id} = useParams();
  const queryEvent  = new Moralis.Query("Event");
  
  

  useEffect(() => 
  {  
       
     queryEvent.equalTo("objectId",id);

      //Query the Event to edit
     queryEvent.first().then((result)=>{
      if(!result)  //Event not found
      {
        setOpenNotification(true);
        setNotificationHeader("ERROR FETCHING EVENT")
        setNotificationBody("Event not found.");
        setNotificationType(2); //Error
      
      }
      else  //Event Found
      {
        setValue("name", result.get("name"));
        setValue("eventdate", format(result.get("eventdate"),"yyyy-MM-dd'T'HH:mm"));
        setValue("price", result.get("price"));
        setValue("description", result.get("description")); 
        setEventObject(result);
        setEventPic(result.get("eventpic"));
        setLoadingEvent(false);
      }
     }).catch((err)=>{
        setOpenNotification(true);
        setNotificationHeader("ERROR FETCHING EVENT")
        setNotificationBody("Event not found.");
        setNotificationType(2); //Error
      
     })  

    
  }, [])
  const handleCloseNotification = () =>
  {
     setOpenNotification(false);
  }


  const eventPicClicked = (event) => {
    eventPicRef.current.click(); 
  }; 

  const eventPicSelected = async () => {
    setIsSaving(true);
    let event = eventObject;
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
   
 

  const _handleSubmit = async (data,e) => {
    setIsSaving(true);

        
        let event = eventObject;
        event.set("name",data.name);
        event.set("eventdate",new Date(data.eventdate));
        event.set("description",data.description);
        event.set("price",(data.price =="" ? 0:parseFloat(data.price)));

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
        })

  }
  const { register,setValue, formState: { errors }, handleSubmit } = useForm();
  return (
 <div className="px-8 mt-8">

   <form noValidate className="space-y-8 divide-y divide-gray-200" onSubmit={handleSubmit(_handleSubmit)}>
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Event</h3>
            
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
               /> : <PhotographIcon  className="h-40 w-40 border-my-green border-2"/>}
                  </span>
                  <button
                    type="button"
                    className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-green"
                    onClick={eventPicClicked}
                    disabled={loadingEvent}
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
          disabled={isSaving || loadingEvent}
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
