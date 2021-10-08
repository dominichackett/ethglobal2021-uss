import {useForm ,Controller } from "react-hook-form";
import {useState,useRef} from 'react';
import { useMoralis } from "react-moralis";
import { XCircleIcon } from '@heroicons/react/solid'
import MyNotification from "./MyNotification";
import UserImage from './images/user.png';

function Errors(props) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">There were errors with your submission</h3>
          <div className="mt-2 text-sm text-red-700">
            <ul role="list" className="list-disc pl-5 space-y-1">
              <li>props.error</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function ProfleForm() {
  const { user,userError, isUserUpdating,setUserData,Moralis } = useMoralis();
  const [openNotification,setOpenNotification]  = useState(false);
  const [notificationHeader,setNotificationHeader]  = useState("");
  const [notificationBody,setNotificationBody]  = useState("");
  const [notificationType,setNotificationType]  = useState();
  const profilePicRef = useRef("");
  const coverPicRef = useRef("");
  
  const coverPicClicked = (event) => {
    coverPicRef.current.click(); 
  }; 

  const profileClicked = (event) => {
    profilePicRef.current.click(); 
  }; 

  const coverPicSelected = async (event) => {
    console.log(coverPicRef.current.files[0])
    // Save file input to IPFS
    const data = coverPicRef.current.files[0];
    const file = new Moralis.File(data.name, data);
    await file.saveIPFS();

    setUserData( {coverPic:file.ipfs(),coverPicHash:file.hash}).then(function(results) {
      setOpenNotification(true);
      setNotificationHeader("SUCCESSFULLY SAVED")
      setNotificationBody("Your cover picture has been saved.");
      setNotificationType(1); //Success
       
      }).catch((error) => {
        setOpenNotification(true);
        setNotificationHeader("ERROR SAVING COVER PICTURE")
        setNotificationBody("Your cover picture has not been saved.");
        setNotificationType(2); //Error
         
      });
  };



  const profilePicSelected = async (event) => {
    console.log(profilePicRef.current.files[0])
    // Save file input to IPFS
    const data = profilePicRef.current.files[0];
    const file = new Moralis.File(data.name, data);
    await file.saveIPFS();

    setUserData( {profilePic:file.ipfs(),profileHash:file.hash}).then(function(results) {
      setOpenNotification(true);
      setNotificationHeader("SUCCESSFULLY SAVED")
      setNotificationBody("Your profile picture has been saved.");
      setNotificationType(1); //Success
       
      }).catch((error) => {
        setOpenNotification(true);
        setNotificationHeader("ERROR SAVING PROFILE PICTURE")
        setNotificationBody("Your profile picture has not been saved.");
        setNotificationType(2); //Eror
         
      });
  };


  const handleCloseNotification = () =>
  {
     setOpenNotification(false);
  }

  const _handleSubmit = (data,e) => {

    console.log(data);
  
    setUserData(data).then((resp)=>{
      setOpenNotification(true);
      setNotificationHeader("SUCCESSFULLY SAVED")
      setNotificationBody("Your user profile has been saved.");
      setNotificationType(1); //Success
    })
   
  };

  const { register, formState: { errors }, handleSubmit } = useForm({defaultValues:{
    username:user?.get("username"),
    firstname: user?.get("firstname"),
    lastname: user?.get("lastname"),
    email:user?.get("email"),
    about:user?.get("about"),
    street:user?.get("street"),
    country:user?.get("country"),
    city:user?.get("city"),
    state:user?.get("state"),
    zip:user?.get("zip")
  }});
  const [isSavingProfile,setIsSavingProfile]  = useState(false);
    return (
   <div className="px-8 mt-8">
        {userError && <Errors error={userError.message} />}
     <form noValidate className="space-y-8 divide-y divide-gray-200" onSubmit={handleSubmit(_handleSubmit)}>
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
              <p className="mt-1 text-sm text-gray-500">
                This information will be displayed publicly so be careful what you share.
              </p>
            </div>
  
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  
                  <input
                    type="text"
                    name="username"
                    id="username"
                    autoComplete="username"
                    className="flex-1 focus:ring-my-green focus:border-indigo-500 block w-full min-w-0  rounded-md sm:text-sm border-gray-300"
                    {...register("username", { required: true })} 
                  />
                </div>
                {errors.username?.type === 'required' && <span className="text-sm text-red-700">User name is required</span>}

             
              </div>
  
              <div className="sm:col-span-6">
                <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                  About
                </label>
                <div className="mt-1">
                  <textarea
                    id="about"
                    name="about"
                    rows={10}
                    className="shadow-sm focus:ring-my-green focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    {...register("about", { required: true })}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">Write a few sentences about yourself.</p>
                <p> {errors.about?.type === 'required' && <span className="text-sm text-red-700">About is required</span>}

</p> 
              </div>
  
              <div className="sm:col-span-6">
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                  Photo
                </label>
                <div className="mt-1 flex items-center">
                  <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                  <img
                 className="h-12 w-12 rounded-full"
                 src={(user?.get("profilePic") ? user?.get("profilePic"): UserImage)}
                 alt=""
               />
                  </span>
                  <button
                    type="button"
                    className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-green"
                    onClick={profileClicked}
                  >
                    Change
                  </button>
                  <input type="file"   accept="image/png, image/jpeg"  ref={profilePicRef} hidden="true" onChange={profilePicSelected}/>

                </div>
              </div>
  
              <div className="sm:col-span-6">
             
                   
                <label htmlFor="cover-photo" className="block text-sm font-medium text-gray-700">
                  Cover photo
                </label>
                <div
                 style={{
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                   backgroundImage: `url(${user?.get("coverPic")})`,
                }} 
                 className=" mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                
                    
                  <div className="space-y-1 text-centerb">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-my-green"
                     >
                        <button type="button" onClick={coverPicClicked}>Upload a file</button>
                        <input type="file" hidden id="file-upload" name="file-upload"  accept="image/png, image/jpeg" className="sr-only" onChange={coverPicSelected} ref={coverPicRef} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
              <p className="mt-1 text-sm text-gray-500">Use a permanent address where you can receive mail.</p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="firstname"
                    id="firstname"
                    autoComplete="given-name"
                    className="shadow-sm focus:ring-my-green focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register("firstname", { required: true })}

                 />
                </div>
                <p> {errors.firstname?.type === 'required' && <span className="text-sm text-red-700">First name is required</span>}</p> 
              </div>
  
              <div className="sm:col-span-3">
                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="lastname"
                    id="lastname"
                    autoComplete="family-name"
                    className="shadow-sm focus:ring-my-green focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register("lastname", { required: true })}

                  />
                </div>
                <p> {errors.lastname?.type === 'required' && <span className="text-sm text-red-700">Last name is required</span>}</p> 
              </div>
  
              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="shadow-sm focus:ring-my-green focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register("email", {  pattern:  /\S+@\S+.\S+/})}

                  />
                </div>
                <p> {errors.email?.type === 'required' && <span className="text-sm text-red-700"> Invalid email address</span>}</p> 

              </div>
  
              <div className="sm:col-span-3">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country / Region
                </label>
                <div className="mt-1">
                    <select id="country" name="country"
                    className="shadow-sm focus:ring-my-green focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register("country", { required: true })}
                    
                    >
                    <option value="Afganistan">Afghanistan</option>
                    <option value="Albania">Albania</option>
                    <option value="Algeria">Algeria</option>
                    <option value="American Samoa">American Samoa</option>
                    <option value="Andorra">Andorra</option>
                    <option value="Angola">Angola</option>
                    <option value="Anguilla">Anguilla</option>
                    <option value="Antigua & Barbuda">Antigua & Barbuda</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Armenia">Armenia</option>
                    <option value="Aruba">Aruba</option>
                    <option value="Australia">Australia</option>
                    <option value="Austria">Austria</option>
                    <option value="Azerbaijan">Azerbaijan</option>
                    <option value="Bahamas">Bahamas</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Barbados">Barbados</option>
                    <option value="Belarus">Belarus</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Belize">Belize</option>
                    <option value="Benin">Benin</option>
                    <option value="Bermuda">Bermuda</option>
                    <option value="Bhutan">Bhutan</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Bonaire">Bonaire</option>
                    <option value="Bosnia & Herzegovina">Bosnia & Herzegovina</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Brazil">Brazil</option>
                    <option value="British Indian Ocean Ter">British Indian Ocean Ter</option>
                    <option value="Brunei">Brunei</option>
                    <option value="Bulgaria">Bulgaria</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Burundi">Burundi</option>
                    <option value="Cambodia">Cambodia</option>
                    <option value="Cameroon">Cameroon</option>
                    <option value="Canada">Canada</option>
                    <option value="Canary Islands">Canary Islands</option>
                    <option value="Cape Verde">Cape Verde</option>
                    <option value="Cayman Islands">Cayman Islands</option>
                    <option value="Central African Republic">Central African Republic</option>
                    <option value="Chad">Chad</option>
                    <option value="Channel Islands">Channel Islands</option>
                    <option value="Chile">Chile</option>
                    <option value="China">China</option>
                    <option value="Christmas Island">Christmas Island</option>
                    <option value="Cocos Island">Cocos Island</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Comoros">Comoros</option>
                    <option value="Congo">Congo</option>
                    <option value="Cook Islands">Cook Islands</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Cote DIvoire">Cote DIvoire</option>
                    <option value="Croatia">Croatia</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Curaco">Curacao</option>
                    <option value="Cyprus">Cyprus</option>
                    <option value="Czech Republic">Czech Republic</option>
                    <option value="Denmark">Denmark</option>
                    <option value="Djibouti">Djibouti</option>
                    <option value="Dominica">Dominica</option>
                    <option value="Dominican Republic">Dominican Republic</option>
                    <option value="East Timor">East Timor</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Egypt">Egypt</option>
                    <option value="El Salvador">El Salvador</option>
                    <option value="Equatorial Guinea">Equatorial Guinea</option>
                    <option value="Eritrea">Eritrea</option>
                    <option value="Estonia">Estonia</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Falkland Islands">Falkland Islands</option>
                    <option value="Faroe Islands">Faroe Islands</option>
                    <option value="Fiji">Fiji</option>
                    <option value="Finland">Finland</option>
                    <option value="France">France</option>
                    <option value="French Guiana">French Guiana</option>
                    <option value="French Polynesia">French Polynesia</option>
                    <option value="French Southern Ter">French Southern Ter</option>
                    <option value="Gabon">Gabon</option>
                    <option value="Gambia">Gambia</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Germany">Germany</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Gibraltar">Gibraltar</option>
                    <option value="Great Britain">Great Britain</option>
                    <option value="Greece">Greece</option>
                    <option value="Greenland">Greenland</option>
                    <option value="Grenada">Grenada</option>
                    <option value="Guadeloupe">Guadeloupe</option>
                    <option value="Guam">Guam</option>
                    <option value="Guatemala">Guatemala</option>
                    <option value="Guinea">Guinea</option>
                    <option value="Guyana">Guyana</option>
                    <option value="Haiti">Haiti</option>
                    <option value="Hawaii">Hawaii</option>
                    <option value="Honduras">Honduras</option>
                    <option value="Hong Kong">Hong Kong</option>
                    <option value="Hungary">Hungary</option>
                    <option value="Iceland">Iceland</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="India">India</option>
                    <option value="Iran">Iran</option>
                    <option value="Iraq">Iraq</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Isle of Man">Isle of Man</option>
                    <option value="Israel">Israel</option>
                    <option value="Italy">Italy</option>
                    <option value="Jamaica">Jamaica</option>
                    <option value="Japan">Japan</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Kazakhstan">Kazakhstan</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Kiribati">Kiribati</option>
                    <option value="Korea North">Korea North</option>
                    <option value="Korea Sout">Korea South</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Kyrgyzstan">Kyrgyzstan</option>
                    <option value="Laos">Laos</option>
                    <option value="Latvia">Latvia</option>
                    <option value="Lebanon">Lebanon</option>
                    <option value="Lesotho">Lesotho</option>
                    <option value="Liberia">Liberia</option>
                    <option value="Libya">Libya</option>
                    <option value="Liechtenstein">Liechtenstein</option>
                    <option value="Lithuania">Lithuania</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Macau">Macau</option>
                    <option value="Macedonia">Macedonia</option>
                    <option value="Madagascar">Madagascar</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Malawi">Malawi</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Mali">Mali</option>
                    <option value="Malta">Malta</option>
                    <option value="Marshall Islands">Marshall Islands</option>
                    <option value="Martinique">Martinique</option>
                    <option value="Mauritania">Mauritania</option>
                    <option value="Mauritius">Mauritius</option>
                    <option value="Mayotte">Mayotte</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Midway Islands">Midway Islands</option>
                    <option value="Moldova">Moldova</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Mongolia">Mongolia</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Mozambique">Mozambique</option>
                    <option value="Myanmar">Myanmar</option>
                    <option value="Nambia">Nambia</option>
                    <option value="Nauru">Nauru</option>
                    <option value="Nepal">Nepal</option>
                    <option value="Netherland Antilles">Netherland Antilles</option>
                    <option value="Netherlands">Netherlands (Holland, Europe)</option>
                    <option value="Nevis">Nevis</option>
                    <option value="New Caledonia">New Caledonia</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Nicaragua">Nicaragua</option>
                    <option value="Niger">Niger</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Niue">Niue</option>
                    <option value="Norfolk Island">Norfolk Island</option>
                    <option value="Norway">Norway</option>
                    <option value="Oman">Oman</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Palau Island">Palau Island</option>
                    <option value="Palestine">Palestine</option>
                    <option value="Panama">Panama</option>
                    <option value="Papua New Guinea">Papua New Guinea</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Peru">Peru</option>
                    <option value="Phillipines">Philippines</option>
                    <option value="Pitcairn Island">Pitcairn Island</option>
                    <option value="Poland">Poland</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Puerto Rico">Puerto Rico</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Republic of Montenegro">Republic of Montenegro</option>
                    <option value="Republic of Serbia">Republic of Serbia</option>
                    <option value="Reunion">Reunion</option>
                    <option value="Romania">Romania</option>
                    <option value="Russia">Russia</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="St Barthelemy">St Barthelemy</option>
                    <option value="St Eustatius">St Eustatius</option>
                    <option value="St Helena">St Helena</option>
                    <option value="St Kitts-Nevis">St Kitts-Nevis</option>
                    <option value="St Lucia">St Lucia</option>
                    <option value="St Maarten">St Maarten</option>
                    <option value="St Pierre & Miquelon">St Pierre & Miquelon</option>
                    <option value="St Vincent & Grenadines">St Vincent & Grenadines</option>
                    <option value="Saipan">Saipan</option>
                    <option value="Samoa">Samoa</option>
                    <option value="Samoa American">Samoa American</option>
                    <option value="San Marino">San Marino</option>
                    <option value="Sao Tome & Principe">Sao Tome & Principe</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Senegal">Senegal</option>
                    <option value="Seychelles">Seychelles</option>
                    <option value="Sierra Leone">Sierra Leone</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Slovakia">Slovakia</option>
                    <option value="Slovenia">Slovenia</option>
                    <option value="Solomon Islands">Solomon Islands</option>
                    <option value="Somalia">Somalia</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Spain">Spain</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Sudan">Sudan</option>
                    <option value="Suriname">Suriname</option>
                    <option value="Swaziland">Swaziland</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Syria">Syria</option>
                    <option value="Tahiti">Tahiti</option>
                    <option value="Taiwan">Taiwan</option>
                    <option value="Tajikistan">Tajikistan</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Togo">Togo</option>
                    <option value="Tokelau">Tokelau</option>
                    <option value="Tonga">Tonga</option>
                    <option value="Trinidad & Tobago">Trinidad & Tobago</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Turkmenistan">Turkmenistan</option>
                    <option value="Turks & Caicos Is">Turks & Caicos Is</option>
                    <option value="Tuvalu">Tuvalu</option>
                    <option value="Uganda">Uganda</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="United Arab Erimates">United Arab Emirates</option>
                    <option value="United States of America">United States of America</option>
                    <option value="Uraguay">Uruguay</option>
                    <option value="Uzbekistan">Uzbekistan</option>
                    <option value="Vanuatu">Vanuatu</option>
                    <option value="Vatican City State">Vatican City State</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Virgin Islands (Brit)">Virgin Islands (Brit)</option>
                    <option value="Virgin Islands (USA)">Virgin Islands (USA)</option>
                    <option value="Wake Island">Wake Island</option>
                    <option value="Wallis & Futana Is">Wallis & Futana Is</option>
                    <option value="Yemen">Yemen</option>
                    <option value="Zaire">Zaire</option>
                    <option value="Zambia">Zambia</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                 </select>                </div>
                 <p> {errors.country?.type === 'required' && <span className="text-sm text-red-700">Country is required</span>}</p> 
              
              </div>
  
              <div className="sm:col-span-6">
                <label htmlFor="street-address" className="block text-sm font-medium text-gray-700">
                  Street address
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="street"
                    id="street"
                    autoComplete="street-address"
                    className="shadow-sm focus:ring-my-green focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register("street", { required: true })}

                  />
                </div>
                <p> {errors.street?.type === 'required' && <span className="text-sm text-red-700">Street is required</span>}</p> 
     
              </div>
  
              <div className="sm:col-span-2">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="city"
                    id="city"
                    className="shadow-sm focus:ring-my-green focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register("city", { required: true })}

                  />
                </div>
                <p> {errors.city?.type === 'required' && <span className="text-sm text-red-700">City is required</span>}</p> 
     
              </div>
  
              <div className="sm:col-span-2">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State / Province
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="state"
                    id="state"
                    className="shadow-sm focus:ring-my-green focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register("state", { required: true })}

                 />
                </div>
                <p> {errors.state?.type === 'required' && <span className="text-sm text-red-700">State is required</span>}</p> 
     
              </div>
  
              <div className="sm:col-span-2">
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                  ZIP / Postal
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="zip"
                    id="zip"
                    autoComplete="postal-code"
                    className="shadow-sm focus:ring-my-green focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register("zip", { required: true })}

                  />
                </div>
                <p> {errors.zip?.type === 'required' && <span className="text-sm text-red-700">Zip is required</span>}</p> 
     
              </div>
            </div>
          </div>
  
        </div>
  
        <div className="pt-5 pb-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-green"
            >
              Cancel
            </button>
            <button
              disabled={isSavingProfile || isUserUpdating}
                    type="submit"
              className="  ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-my-green hover:bg-my-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-green-light"
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
  