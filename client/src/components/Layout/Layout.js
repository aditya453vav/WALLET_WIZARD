// import React from "react";
// import Footer from "./Footer";
// import Header from "./Header";
// //header line renders the header imported above
// const Layout = ({ children }) => {
//   return (
//     <>
//       <Header />  
//       <div className="content bg-success">{children}</div>
//       <Footer />
//     </>
//   );
// };

// export default Layout;

import React from "react";
import Footer from "./Footer";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="layout">  {/* Wrap everything in a layout div */}
      <Header />
      <main className="content"> {/* Use main tag for semantic meaning */}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;