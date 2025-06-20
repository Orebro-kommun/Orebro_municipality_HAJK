// src/questions/registerGeometryCore.js
import { Question, Serializer } from "survey-core";
import { GEOMETRY_TYPES } from "./geometryTypes.js";

let coreRegistered = false;

export default function registerGeometryCore() {
  if (coreRegistered) return;
  coreRegistered = true;

  // Register each geometry type as a subclass of Question
  GEOMETRY_TYPES.forEach((type) => {
    try {
      // Create a dynamic class for each type
      const questionClass = class extends Question {
        getType() {
          return type;
        }

        get geometryType() {
          return type;
        }
      };

      // Register the class in Serializer
      Serializer.addClass(
        type,
        [{ name: "geometryType", default: type, visible: false }],
        function () {
          return new questionClass("");
        },
        "question"
      );
    } catch (error) {
      console.error(`Failed to register type ${type}:`, error);
    }
  });
}
