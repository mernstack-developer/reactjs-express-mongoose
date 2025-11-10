import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UserList from './components/UserList';
import GuestList from './components/GuestList';
import AddGuestForm from './components/AddGuestForm';
import AddUserForm from './components/AddUserForm';
//import {  AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Courses from "./pages/FrontPages/Courses";
import FrontPageLayout from "./pages/FrontPages/FrontPagesLayout";
import AboutUs from "./pages/FrontPages/Aboutus";
import Contact from "./pages/FrontPages/Contact";
import CourseDetail from "./pages/FrontPages/CourseDetail";
export default function App() {
  return (
    <>
      <Router>
          <ScrollToTop />
          <Routes>
            <Route element={<FrontPageLayout />}>
           <Route index path="/" element={<Courses />} />
           <Route  path="/courses" element={<Courses />} />
           <Route path="/about" element={<AboutUs />} />
           <Route path="/contact" element={<Contact />} />
           <Route path="/courses/:_id" element={<CourseDetail />} />
           </Route>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
           <Route element={<PrivateRoute />}>
            <Route  path="/dashboard" element={<Home />} />
            <Route path="/users" element={<UserList />} />
          <Route path="/guests" element={<GuestList />} />
          <Route path="/add-guest" element={<AddGuestForm />} />
          <Route path="/add-user" element={<AddUserForm />} />
            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
           </Route>
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
         </Router>
      
    </>
  );
}