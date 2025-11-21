import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import GuestList from './components/GuestList';
import AddGuestForm from './components/AddGuestForm';
import AddUserForm from './components/AddUserForm';
import PermissionsPage from './pages/Permissions';
import RolesPage from './pages/Roles';
import UserRolesPage from './pages/UserRoles';
import PrivateRoute from './routes/PrivateRoute';
import Courses from "./pages/FrontPages/Courses";
import FrontPageLayout from "./pages/FrontPages/FrontPagesLayout";
import AboutUs from "./pages/FrontPages/Aboutus";
import Contact from "./pages/FrontPages/Contact";
import CourseDetail from "./pages/FrontPages/CourseDetail";
import StudentCourses from "./pages/StudentCourses";
import StudentCourseDetail from "./pages/StudentCourseDetail";
import CategoriesPage from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import AdminCategories from "./pages/AdminCategories";
import CourseEditor from "./pages/CourseEditor";
import CourseManagement from "./pages/CourseManagement";
import CreateCourse from "./pages/CreateCourse";
import AssignmentPage from './pages/AssignmentPage';
import PublicCourses from "./pages/PublicCourses";
import UserManagement from "./pages/UserManagement";
import UserEnrolledCourses from './pages/UserEnrolledCourses';
import CourseEnrollments from './pages/CourseEnrollments';
import UsersByRole from './pages/UsersByRole';
import MenuManager from "./features/menu/MenuManager";
import UserList from "./components/UserList";
import StudentAssignments from "./pages/StudentAssignments";
import InstructorAssignments from "./pages/InstructorAssignments";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Front-End Pages */}
          <Route element={<FrontPageLayout />}>
              <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Student & Admin Dashboard Layout */}
          <Route element={<AppLayout />}>
           <Route index path="/" element={<Dashboard />} />
         
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/public-courses" element={<PublicCourses />} />
            <Route element={<PrivateRoute />}>
              {/* Student Pages */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-courses" element={<StudentCourses />} />
              <Route path="/courses/view/:id" element={<StudentCourseDetail />} />
                
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/assignments" element={<InstructorAssignments />} />
              <Route path="/assignments/:id" element={<AssignmentPage />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={<div>Payment Successful!</div>} />
              <Route path="/checkout/cancel" element={<div>Payment Cancelled!</div>} />
              <Route path="/blank" element={<Blank />} />
  <Route path="/users-list" element={<UserList />} />
              {/* Admin Pages (Protected with /admin prefix) */}
              <Route path="/admin/dashboard" element={<Home />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/guests" element={<GuestList />} />
              <Route path="/admin/add-guest" element={<AddGuestForm />} />
              <Route path="/admin/add-user" element={<AddUserForm />} />
              <Route path="/admin/permissions" element={<PermissionsPage />} />
              <Route path="/admin/roles" element={<RolesPage />} />
              <Route path="/admin/user-roles" element={<UserRolesPage />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
              <Route path="/admin/courses/create" element={<CreateCourse />} />
              <Route path="/admin/courses/:id/editor" element={<CourseEditor />} />
              <Route path="/admin/categories-list" element={<CategoriesPage />} />
                <Route path="/admin/categories/:id" element={<CategoryDetail />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/users/:userId/enrolled-courses" element={<UserEnrolledCourses />} />
              <Route path="/admin/courses/:courseId/enrollments" element={<CourseEnrollments />} />
              <Route path="/admin/roles/:roleId/users" element={<UsersByRole />} />
              <Route path="/admin/menu-management" element={<MenuManager />} />
               </Route>

            {/* UI Component Pages (visible for testing) */}
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}