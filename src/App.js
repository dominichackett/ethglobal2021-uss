import logo from './logo.svg';
import './App.css';
import{BrowserRouter as Router,Switch,Route} from 'react-router-dom';
import LandingPage from './LandingPage';
import Features from './Features';
import  Home  from "./Home";
import Profile from './Profile';
import MyEvents from './MyEvents';
import Earnings from './Earnings';
import MyNFTs from './MyNFTs';
import Payments from './Payments';
import Subscriptions from './Subscriptions';
import AddEvent from './AddEvent';
import EditEvent from './EditEvent';

import ViewProfile from './ViewProfile';
import LiveStream from './LiveStream';
import ViewStream from './ViewStream';
import MintNFT from './MintNFT';

function App() {
  return (
    <Router>
    <Switch>


 <Route exact path="/" component={LandingPage} />
 <Route exact path="/features" component={Features} />
 <Route exact path="/home" component={Home} />
 <Route exact path="/profile" component={Profile} />
 <Route exact path="/myevents" component={MyEvents} />
 <Route exact path="/earnings" component={Earnings} />
 <Route exact path="/mynfts" component={MyNFTs} />
 <Route exact path="/payments" component={Payments} />
 <Route exact path="/subscriptions" component={Subscriptions} />
 <Route exact path="/addevent" component={AddEvent} />
 <Route exact path="/editevent/:id" component={EditEvent} />
 <Route exact path="/viewprofile/:id" component={ViewProfile} />
 <Route exact path="/live/:id" component={LiveStream} />
 <Route exact path="/view/:id" component={ViewStream} />
 <Route exact path="/mint/:id" component={MintNFT} />





</Switch>
</Router>
  );
}

export default App;
