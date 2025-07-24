import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayOut from "../pages/MainLayOut";

const Home = lazy(() => import("../pages/Home/Home.jsx"));

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    element: <MainLayOut />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
]);

export default AppRoutes;
