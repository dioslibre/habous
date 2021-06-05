import { Header, HeaderName, HeaderGlobalBar } from "carbon-components-react";
import React from "react";

const Shell = () => {
  return (
    <Header className="bg-blue-700 relative" aria-label="Platform Name">
      <HeaderName href="#" prefix="SIG">
        Habous
      </HeaderName>
      <HeaderGlobalBar></HeaderGlobalBar>
    </Header>
  );
};

export default Shell;
