import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import RoomListing from "./pages/RoomListing";
import RoomDetails from "./pages/RoomDetails";
import Reservation from "./pages/Reservation";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import TermsAndPrivacy from "./pages/TermsAndPrivacy";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import RoomsManagementPage from "./pages/admin/RoomsManagementPage";
import BookingsManagementPage from "./pages/admin/BookingsManagementPage";
import AdminLogin from "./pages/admin/AdminLogin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "rooms", Component: RoomListing },
      { path: "room/:type/:number", Component: RoomDetails },
      { path: "reservation", Component: Reservation },
      { path: "contact", Component: Contact },
      { path: "help", Component: HelpCenter },
      { path: "terms", Component: TermsAndPrivacy },
      { path: "privacy", Component: TermsAndPrivacy },
    ],
  },
  {
    path: "/admin",
    children: [
      { path: "login", Component: AdminLogin },
      {
        path: "",
        Component: AdminLayout,
        children: [
          { index: true, Component: DashboardPage },
          { path: "rooms", Component: RoomsManagementPage },
          { path: "bookings", Component: BookingsManagementPage },
        ],
      },
    ],
  },
]);

