pragma solidity  ^0.8.0;
// SPDX-License-Identifier: GPL-3.0-or-later
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SAFEERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./BasicMetaTransaction.sol";

/**
 * @title UnstoppableStreams Contract
 * @dev Main contract for Uncensored Live Streaming 
 * - Users can:
 *   # Create Events
 *   # Purchase Tickets
 *   # Mint NFTs from Streams
 *   # Received Streamed Payments for Live Streams 
 * @author Dominic Leon Hackett
 */


contract UnstoppableStreams is VRFConsumerBase, ERC721URIStorage, Ownable,BasicMetaTransaction {
    
	using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
	 bytes32 internal keyHash;
    uint256 internal fee;
	
    address DAI_ADDRESS = address(0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7); //Polygon Mumbai fDAI contract address
    IERC20 internal daiToken;

    struct _Event
	 {
	    string id; 
		string name;
		uint256 eventDate;
		uint256 price; 
		address owner;
		bool isValue;
		mapping (address => Subscriber) subscribers; 
	 }
	 
	 
	 
	 struct Subscriber
	 {
	    address viewer;
		uint dateSubscribed;
		bool isValue;
	 }
	 
	  struct User
     {
        address userAddress;
        bool isValue;		
     }
	 
	 
	 
	 mapping (string=>_Event) events;
     mapping  (address => User) users;
	 mapping (uint256 => string) _uri;
	 mapping (string=> address[]) eventSubscribers;
	 mapping(bytes32 => string) private r_request;
     mapping (bytes32 => string) private prize;
	 
	 event Event(string id,string name,uint256 eventDate,uint256 price,address owner);
	 event TicketPurchased(string eventID,uint256 datePurchased,uint256 tokenid,address eventOwner, address ticketOwner);
	 event NFTMinted(string eventID,uint256 dateMinted,uint256 tokenid,address eventOwner, address NFTOwner);
	 event PrizeWon(string eventID, uint256 datedDrawn,string prize,address winner);
 /**
   * @dev Modifier eventDoesntExist. Make sure event doesn't exist
   * @param   id  Event id
   **/	  
	  
    modifier eventDoesntExist (string memory  id){
	  require(events[id].isValue == false, "Event already exist");
   _; 
 }	  
 
 /**
   * @dev Modifier isValidEvent. Make sure event exist
   * @param   id  Event id
   **/	  
	  
    modifier isValidEvent (string memory  id){
	  require(events[id].isValue == true, "Event doesn't exist");
   _; 
 }

 /**
   * @dev Modifier isSubscribed. Make sure user is subscribered to event 
   * @param   id  Event id
   **/	  
	  
    modifier isSubscribed (string memory  id){
	
	  require(events[id].subscribers[msgSender()].isValue == true, "You have not subscribered to this event.");
   _; 
 }
 
 
 /**
   * @dev Modifier isNotSubscribed. Make sure user is not subscribed to event 
   * @param   id  Event id
   **/	  
	  
    modifier isNotSubscribed (string memory  id){
	  require(events[id].subscribers[msgSender()].isValue == false, "You have already subscribered to this event.");
   _; 
 }
 


 /**
   * @dev Modifier isSubscribedOrIsEventOwner. Make sure user is subscribered to event or is the owner 
   * @param   id  Event id
   **/	  
	  
    modifier isSubscribedOrIsEventOwner (string memory  id){
	 require(events[id].subscribers[msgSender() ].isValue == true || events[id].owner== msgSender() , "You cannot mint this NFT.");
   _; 
 }
 	 
/**
   * @dev Modifier isEventOwner. Make sure user is the owner of the event 
   * @param   id  Event id
   **/	  
	  
    modifier isEventOwner (string memory id){
	  require(events[id].owner== msgSender() , "You cannot draw this prize.");
   _; 
 }	 
    constructor() ERC721("Unstoppable Streams", "USS") 	 VRFConsumerBase(
            0x8C7382F9D8f56b33781fE506E897a4F1e2d17255, // VRF Coordinator
            0x326C977E6efc84E512bB9C30f76E30c160eD06FB  // LINK Token Polygon Mumbai
        ) {
		
		     daiToken = IERC20(DAI_ADDRESS);
			 keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
             fee = 0.0001 * 10 ** 18; // 0.0001 LINK (Varies by network)


	}
 
 /**
   * @dev Function allows users to create an event
   * @param eventID Event id.
   * @param name  Name of the event.
   * @param eventDate Event Date.
   * @param price Event Price
   **/
    
    function createEvent(string calldata eventID,string calldata name,uint256 eventDate,uint256 price ) external  eventDoesntExist(eventID)
   {
      events[eventID].id  = eventID;
	  events[eventID].eventDate  = eventDate;
	  events[eventID].price  = price;
	  events[eventID].owner = msgSender();
	  events[eventID].isValue = true;
	  events[eventID].name = name;
	  
	  if(users[msgSender()].isValue == false)
	  {
	     users[msgSender()].userAddress = msgSender();
		 users[msgSender()].isValue = true;
	  }
	  
	  emit Event(eventID,name,eventDate,price,msgSender());

	     
   }
   
   
   /**
   * @dev Function allows users to purchase ticket to an event
   * @param eventID Event id.
   * 
   **/
    
    function purchaseTicket(string calldata eventID,string calldata _metadataURI ) external  isValidEvent(eventID) isNotSubscribed(eventID)
   {
      uint256 price = events[eventID].price;
	  uint256 senderBalanceRequired = price* 10**18;
	  require(daiToken.balanceOf(msgSender()) >= senderBalanceRequired, "Not enough balance");
      if(senderBalanceRequired > 0)
      daiToken.transferFrom(msgSender(),address(this), senderBalanceRequired);
      
 	          
	  _safeMint(msgSender(), _tokenIdCounter.current());
	   _uri[_tokenIdCounter.current()] = _metadataURI;
	   events[eventID].subscribers[msgSender()].viewer = msgSender();
	   events[eventID].subscribers[msgSender()].dateSubscribed = block.timestamp;
	   events[eventID].subscribers[msgSender()].isValue = true;
	   eventSubscribers[eventID].push(msgSender());
       emit TicketPurchased(eventID, block.timestamp,_tokenIdCounter.current(),events[eventID].owner,msgSender());
	   _tokenIdCounter.increment();
   
   }   

/**
   * @dev Function allows event owner or subscribers to mint video from event stream
   * @param eventID Event id.
   * @param _metadataURI metadata URI 
   **/
    
    function mintNFT(string calldata eventID,string calldata _metadataURI ) external  isValidEvent(eventID) isSubscribedOrIsEventOwner(eventID)
   {
	  _safeMint(msgSender(), _tokenIdCounter.current());
	   _uri[_tokenIdCounter.current()] = _metadataURI;
       emit NFTMinted(eventID, block.timestamp,_tokenIdCounter.current(),events[eventID].owner,msgSender());

	   _tokenIdCounter.increment();
   
   }   
   
   
   /**
   * @dev Function allows event owner to draw a random prize
   * @param eventID Event id.
   * @param prizeName
   **/
    
    function drawPrize(string calldata eventID,string calldata prizeName ) external  isValidEvent(eventID) isEventOwner(eventID)
   {
   
       require(eventSubscribers[eventID].length > 0,"There are no subscribers");
       bytes32 requestId  = requestRandomness(keyHash, fee);
	   r_request[requestId] = eventID;
       prize[requestId] = prizeName;
	  
   }   

   /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
	
	     uint256 number = randomness % eventSubscribers[r_request[requestId]].length;
         emit PrizeWon(r_request[requestId], block.timestamp, prize[requestId],eventSubscribers[r_request[requestId]][number]);
	
	}
	
	
	function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        return string(abi.encodePacked( _uri[tokenId]));

    }

}
