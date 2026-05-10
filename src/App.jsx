import React from 'react';
import { RouterProvider } from "react-router-dom";
import { router } from "./route/router";
import { Toaster } from 'react-hot-toast';

const App = () => {

<Toaster
  position="top-center"
  reverseOrder={false}
  containerStyle={{
    top: 20,
    zIndex: 999999,
  }}
  toastOptions={{
    duration: 2500,

    style: {
      background: "#111827",
      color: "#fff",
      borderRadius: "16px",
      padding: "14px 18px",
      fontWeight: "600",
      zIndex: 999999,
    },

    success: {
      iconTheme: {
        primary: "#2ca4ab",
        secondary: "#fff",
      },
    },
  }}
/>

  return <RouterProvider router={router} />;
};

export default App;