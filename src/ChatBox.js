import {  useEffect, useState,useRef } from 'react';
import { useMoralisQuery,useMoralisSubscription,useMoralis } from 'react-moralis';
import UserImage from './images/user.png';



export default function ChatBox(props)
{
   const {user,Moralis} = useMoralis();
   const messageRef = useRef();
   const [fetchChat,setFetchChat] = useState(new Date());
   const [chatData,setChatData] = useState([]);
   const Event = Moralis.Object.extend("Event");
   const lastMessageRef = useRef();
   const thisEvent = new Event();
   thisEvent.id = props.eventId;

   useMoralisSubscription(
        "Chat", query=> 
         query
         .equalTo("event",thisEvent)
         .include("user")
        .include("event")
         ,[],
         {
            onCreate: data => setFetchChat(new Date()),
          }
      );
    
      const { fetch, data, error, isLoading } = useMoralisQuery(
        "Chat", query=> 
         query
         .equalTo("event",thisEvent)
         .ascending("createdAt")
         ,
        { autoFetch: false }
      );
      
      useEffect(()=>{
       /* fetch({ 
          onSuccess: (data) =>{
           setChatData(data);      
           console.log(data)       
        },
        });*/
        Moralis.Cloud.run('getChatMessages',{event:props.eventId}).then((resp)=>{
          setChatData(resp);      
          console.log(resp);       
                 
        }).catch((error)=>{
      
        });
     
      },[fetchChat])
      
    useEffect(()=>{
      if(lastMessageRef.current)
        lastMessageRef.current.scrollIntoView();
    },[chatData])

   function onEnter(event)
   {
      if(event.keyCode==13)
         sendChat();
       
    }
   
   function sendChat()
   {
      
       if(!messageRef.current.value )
         return;

      const Event = Moralis.Object.extend("Event");
      const  Chat = Moralis.Object.extend("Chat");
      
      let event = new Event();
      let chatMessage = new Chat();
      event.id = props.eventId;
      chatMessage.set("message",messageRef.current.value);
      chatMessage.set("event",event);
      chatMessage.set("user",user);
      chatMessage.save();
      messageRef.current.value = null;    
   }
  
   return(<div className="">
    <h1 id="primary-heading" className="pl-1   pt-0 p-2 font-medium">
     Chat
     </h1>   
   <div className="bg-gray-200  mt-5 h-96 p-2 m-2 overflow-x-hidden overflow-y-auto rounded-md shadow-lg ">

      {chatData.map((msg,index) => (
                    <div ref={(index+1 == chatData.length ? lastMessageRef : null)} className="flex items-center mb-2">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={ msg.get("user").get("profilePic") ? msg.get("user").get("profilePic") : UserImage} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{msg.get("user").get("firstname")+" " +msg.get("user").get("lastname")}</div>
                        <div className="text-sm text-gray-500">{msg.get("message")}</div>
                      </div>
                    </div>
                  
               
              ))}
           
      
   </div>
   <div className="mt-1 m-2 flex rounded-md shadow-sm">
     <div className="relative flex items-stretch flex-grow focus-within:z-10">
      
       <input
         type="text"
         name="message"
         id="message"
         className="focus:ring-my-green focus:border-my-green block
          w-full rounded-none rounded-l-md  sm:text-sm border-gray-300 "
         placeholder="Type Message"
        disabled={(props.live ? false:true)}  
        ref={messageRef}
        onKeyDown={onEnter}
      />
     </div>
     <button
       type="button"
       className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-my-green focus:border-indigo-500"
       disabled={(props.live ? false:true)}  
      onClick={sendChat}
     >
     Send       
     </button>
   </div>
 </div>
)
}
