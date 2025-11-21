import { Outlet } from "react-router";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../hooks";
import {ThemeToggleButton} from "../../components/common/ThemeToggleButton";
import NotificationDropdown from "../../components/header/NotificationDropdown";
import UserDropdown from "../../components/header/UserDropdown";


const LayoutContent: React.FC = () => {

const user = useAppSelector((state) => state.user.data);
const cart = useAppSelector((state) => state.cart.data);
  return (
    <div className="min-h-screen xl:flex">
     
      <div className="flex-1 flex flex-col">
         <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
  
      {/* topbar middle design for menu and sub menu like courses have different category of courses */ }
      <div className="hidden lg:flex lg:mx-8">    
        <div className="w-full lg:w-auto">
          <Link to="/public-courses" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Courses
          </Link>
        </div>  
        <div className="w-full lg:w-auto lg:ml-6">
          <Link to="/about" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            About
          </Link>
        </div>  
        <div className="w-full lg:w-auto lg:ml-6">
          <Link to="/contact" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Contact
          </Link>
        </div>  
      </div>
      {/* topbar middle design for menu and sub menu like courses have different category of courses */ } 

        <div
          className= "hidden items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none"
        >

          <div className="flex items-center gap-2 2xsm:gap-3">

            {/* <!-- Dark Mode Toggler --> */}
            <ThemeToggleButton />
            {/* <!-- Dark Mode Toggler --> */}
            <NotificationDropdown />
           
            {/* <!-- Notification Menu Area --> */}
            <Link to="/cart" className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <span className="text-2xl">🛒</span>
              {cart && cart.items && cart.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.items.length}
                </span>
              )}
            </Link>
          </div>
          {/* <!-- User Area --> */}
          {user && (
            <div className="flex items-center gap-2">
              <span className="block font-medium text-gray-700 dark:text-gray-400">
                {user.firstname}
              </span>
              <UserDropdown />
            </div>
          ) || (
            <Link to="/signin" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Sign In</Link>
          )}
        </div>
      </div>
    </header>
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    
      <LayoutContent />
    
  );
};

export default AppLayout;
