import { Outlet } from "react-router";
import MainFooter from "../layouts/MainFooter/MainFooter";
import MainHeader from "../layouts/MainHeader/MainHeader";

function MainLayOut() {
  return (
    <>
      <MainHeader />
      <main>
        <Outlet />
      </main>
      <MainFooter />
    </>
  );
}

export default MainLayOut;
