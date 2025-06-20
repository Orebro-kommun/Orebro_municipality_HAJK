// src/questions/registerGeometryReact.js
import React from "react";
import { ReactQuestionFactory } from "survey-react-ui";
import { GEOMETRY_TYPES } from "./geometryTypes.js";
import { withSurveyEnv } from "./withSurveyEnv.js";
import EditView from "../EditView.js";

const EditViewWrapped = withSurveyEnv(EditView);
let reactRegistered = false;

export default function registerGeometryReact() {
  if (reactRegistered) return;
  reactRegistered = true;

  GEOMETRY_TYPES.forEach((type) => {
    ReactQuestionFactory.Instance.registerQuestion(type, (props) => {
      return React.createElement(EditViewWrapped, {
        ...props,
        geometryType: type,
        onSave: (wkt) => {
          props.question.value = wkt;
          // Trigger onChange to let SurveyJS know that the value has changed
          props.question.onValueChanged && props.question.onValueChanged();
        },
      });
    });
  });
}
