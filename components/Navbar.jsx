import React from "react";
// next image
import Image from "next/image";

const Navbar = () => {
  // css navbar with glassy effect
  // inline style for navbar
  return (
    <div className="navbar">
      <div className="navbar__container">
        <img className="navbar__logo" src={"/logo.png"} />
      </div>
    </div>
  );
};

export default Navbar;
