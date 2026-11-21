import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./Mobilenav";




export default function Layout() {
  return (
    <div className="flex min-h-screen bg-light-bg dark:bg-dark-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}