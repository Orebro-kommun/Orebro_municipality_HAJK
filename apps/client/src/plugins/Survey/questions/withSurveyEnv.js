// src/questions/withSurveyEnv.js
import React from "react";
import { SurveyEnvContext } from "../SurveyEnvContext";

export function withSurveyEnv(InnerComponent) {
  return function Wrapper(p) {
    return (
      <SurveyEnvContext.Consumer>
        {(env) => <InnerComponent {...env} {...p} />}
      </SurveyEnvContext.Consumer>
    );
  };
}
