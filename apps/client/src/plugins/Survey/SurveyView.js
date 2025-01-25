// Make sure to only import the hooks you intend to use
import React, { useEffect, useState, useRef } from "react";
import * as Survey from "survey-react-ui";
import { ComponentCollection } from "survey-core";
import { Model } from "survey-core";
//import * as SurveyTheme from "survey-core/themes";
import "survey-core/defaultV2.min.css";
import "survey-core/i18n/swedish";
import ReactDOM from "react-dom/client";
//import WKT from "ol/format/WKT";

import EditView from "./EditView.js";
import EditModel from "./EditModel.js";

import { useSnackbar } from "notistack";

//Register new "geometry" component
ComponentCollection.Instance.add({
  //Unique component name. It becomes a new question type. Please note, it should be written in lowercase.
  name: "geometry",
  //The text that shows on toolbox
  title: "Geometry",
  //The actual question that will do the job
  questionJSON: {
    type: "html",
    html: "<div class='editViewContainer'></div>",
  },
});

//Register new "geometrypoint" component
ComponentCollection.Instance.add({
  //Unique component name. It becomes a new question type. Please note, it should be written in lowercase.
  name: "geometrypoint",
  //The text that shows on toolbox
  title: "GeometryPoint",
  //The actual question that will do the job
  questionJSON: {
    type: "html",
    html: "<div class='editViewContainer'></div>",
  },
});

//Register new "geometrylinestring" component
ComponentCollection.Instance.add({
  //Unique component name. It becomes a new question type. Please note, it should be written in lowercase.
  name: "geometrylinestring",
  //The text that shows on toolbox
  title: "GeometryLinestring",
  //The actual question that will do the job
  questionJSON: {
    type: "html",
    html: "<div class='editViewContainer'></div>",
  },
});

//Register new "geometrypolygon" component
ComponentCollection.Instance.add({
  //Unique component name. It becomes a new question type. Please note, it should be written in lowercase.
  name: "geometrypolygon",
  //The text that shows on toolbox
  title: "geometryPolygon",
  //The actual question that will do the job
  questionJSON: {
    type: "html",
    html: "<div class='editViewContainer'></div>",
  },
});

//Register new "geometryposition" component
ComponentCollection.Instance.add({
  //Unique component name. It becomes a new question type. Please note, it should be written in lowercase.
  name: "geometrypointposition",
  //The text that shows on toolbox
  title: "geometryPointPosition",
  //The actual question that will do the job
  questionJSON: {
    type: "html",
    html: "<div class='editViewContainer'></div>",
  },
});

function SurveyView(props) {
  // We're gonna need to use the event observers. Let's destruct them so that we can
  // get a hold of them easily. The observers can be accessed directly via the props:
  const { localObserver } = props;

  const { enqueueSnackbar } = useSnackbar();
  const [surveyTheme, setSurveyTheme] = useState(null);
  const [surveyJSON, setSurveyJSON] = useState(null);
  const [showEditView, setShowEditView] = useState(false);
  const [editViewKey, setEditViewKey] = useState(Date.now());
  const [currentQuestionTitle, setCurrentQuestionTitle] = useState(null);
  const [currentQuestionName, setCurrentQuestionName] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [surveyJsData, setSurveyJsData] = React.useState(props.surveyJsData);
  const { responseMessage, restartButtonText } = props.options;
  const hasRestartButtonText =
    props.options.restartButtonText &&
    props.options.restartButtonText.trim() !== "";
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const rootMap = useRef(new Map());
  const visibleChangedHandlerRef = React.useRef(null);

  // Used for responseanswer
  const [isCompleted, setIsCompleted] = useState(false);
  const [surveyKey, setSurveyKey] = useState(0);

  // Used for areacalculations and pricecalcualations
  const [area, setArea] = useState(0);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    // showArea localObserver
    const unsubscribe = localObserver.subscribe("showArea", (polygonArea) => {
      setArea(polygonArea);
      setPrice(1068 + polygonArea * (1068 / 10000));
    });

    // Cleanup-funktion
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [localObserver, area, price]);

  // Checks if responseMessage contains html
  const containsHTML = (str) => /<\/?[a-z][\s\S]*>/i.test(str);
  const messageContainsHTML = containsHTML(responseMessage);

  //Unique ID and name on survey
  function generateUniqueID() {
    return (
      new Date().getTime().toString() +
      "-" +
      Math.random().toString(36).substring(2, 9)
    );
  }

  const handleAction = () => {
    closeSurvey();
  };

  const closeSurvey = () => {
    if (props.baseWindowRef && props.baseWindowRef.current) {
      restartSurvey();
      props.baseWindowRef.current.closeWindow();
    }
  };

  const restartSurvey = () => {
    let newSurveyAnswerId = generateUniqueID();
    setIsCompleted(false);

    setArea(0);
    setPrice(0);

    setSurveyJsData((prevSurveyJsData) => ({
      ...prevSurveyJsData,
      surveyAnswerId: newSurveyAnswerId,
    }));
    editModel.surveyJsData.surveyAnswerId = newSurveyAnswerId;
    editModel.reset();
    editModel.newMapData = [];

    rootMap.current.forEach((root, container) => {
      if (root) {
        root.unmount(); // Unmount component from root
        rootMap.current.delete(container); // Remove from rootMap
      }
    });

    setSurveyKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    // an asynchronous function that runs directly inside a useEffect
    (async () => {
      const theme = await props.model.fetchTheme();
      // The surveyTheme state is used later in the component for creating surveyModel.
      setSurveyTheme(theme);
    })();
    // eslint-disable-next-line
  }, []);

  // Here we create and retrieve the JSON content for the survey, which is loaded when we create the surveyModel.
  useEffect(() => {
    props.model
      .loadSurvey(props.options.selectedSurvey)
      .then((data) => setSurveyJSON(data))
      .catch((error) => console.error("Failed to load survey:", error));
    // eslint-disable-next-line
  }, []);

  // showEditView is used to render EditView in a editViewContainer-class
  const resetEditView = () => {
    setEditViewKey(Date.now());
  };

  const editViewRef = useRef(null);

  React.useEffect(() => {
    const snackbarHandler = (message) => {
      enqueueSnackbar(message, { variant: "info" });

      // Check that editViewRef is defined first
      if (editViewRef?.current?.onSaveClicked) {
        editViewRef.current.onSaveClicked();
      }
    };

    localObserver.subscribe("showSnackbar", snackbarHandler);

    // Clean prenumeration
    return () => {
      localObserver.unsubscribe("showSnackbar", snackbarHandler);
    };
  }, [localObserver, enqueueSnackbar]);

  const handleOnCompleting = () => {
    if (showEditView.show) {
      editViewRef.current.onSaveClicked();
    }
  };

  //Combine ID/Name and surveydata and geometry
  const handleOnComplete = React.useCallback(
    async (survey) => {
      const specificSurveyAnswerId = surveyJsData.surveyAnswerId;
      let featureData = [];

      if (
        editModel &&
        editModel.source &&
        editModel.source.id === "simulated"
      ) {
        // Collect feature data based on specific surveyAnswerId
        featureData = editModel.newMapData
          .filter(
            (feature) => feature.surveyAnswerId === specificSurveyAnswerId
          )
          .map((feature) => ({
            title: feature.surveyQuestion,
            value: feature.wktGeometry,
            name: feature.surveyQuestionName,
          }));
      }

      const resultData = [];
      const answeredQuestions = survey.data;

      // Iterate over all questions and include unanswered ones,
      // but only if they are not already in featureData
      survey.getAllQuestions().forEach((question) => {
        const existsInFeatureData = featureData.some(
          (feature) => feature.name === question.name
        );
        if (!existsInFeatureData) {
          const answer = answeredQuestions[question.name];
          resultData.push({
            title: question.title,
            value: answer !== undefined ? answer : null, // Set value to null if unanswered
            name: question.name,
          });
        }
      });

      // Merge resultData (survey data) and featureData
      const mergedResults = [...resultData, ...featureData];

      // Combine data into the final format to send to handleOnComplete
      const combinedData = {
        ...surveyJsData,
        surveyResults: mergedResults,
        mailTemplate: props.options.selectedMailTemplate,
      };

      try {
        // Call the handleOnComplete method with combined data
        await props.model.handleOnComplete(combinedData);
      } catch (error) {
        setShowErrorMessage(
          "Ett fel uppstod vid inlämning av enkät" // + error.message
        );
      }
      setIsCompleted(true);
      setShowEditView({ show: false });
    },
    // eslint-disable-next-line
    [surveyJsData.surveyAnswerId, props.model]
  );

  // Sets currentQuestionName and title after rendering question
  const handleAfterRenderQuestion = (sender, options) => {
    const currentQuestion = options.question;
    // If type is custom question geometry, it shows EditView with the prop toolbarOption set.
    // The Toolbar is filtered to show different sets of tools.
    if (currentQuestion.jsonObj.type === "geometry") {
      setCurrentQuestionTitle(currentQuestion.title);
      setCurrentQuestionName(currentQuestion.name);
      setShowEditView({ show: true, toolbarOptions: "all" });
    }
    if (currentQuestion.jsonObj.type === "geometrypointposition") {
      setCurrentQuestionTitle(currentQuestion.title);
      setCurrentQuestionName(currentQuestion.name);
      setShowEditView({ show: true, toolbarOptions: "position" });
    }
    if (currentQuestion.jsonObj.type === "geometrypoint") {
      setCurrentQuestionTitle(currentQuestion.title);
      setCurrentQuestionName(currentQuestion.name);
      setShowEditView({ show: true, toolbarOptions: "point" });
    }
    if (currentQuestion.jsonObj.type === "geometrylinestring") {
      setCurrentQuestionTitle(currentQuestion.title);
      setCurrentQuestionName(currentQuestion.name);
      setShowEditView({ show: true, toolbarOptions: "linestring" });
    }
    if (currentQuestion.jsonObj.type === "geometrypolygon") {
      setCurrentQuestionTitle(currentQuestion.title);
      setCurrentQuestionName(currentQuestion.name);
      setShowEditView({ show: true, toolbarOptions: "polygon" });
    }
  };

  const handlePageChange = () => {
    // 1) If EditView is visible, either save or clear any ongoing edits
    if (showEditView.show && editViewRef?.current?.onSaveClicked) {
      // onSaveClicked will send a WFS-T transaction or clear
      // newMapData in "simulated" mode, depending on your implementation
      editViewRef.current.onSaveClicked();
    }

    // 2) Clear all features from the map
    if (editModel?.vectorSource) {
      editModel.vectorSource.clear();
      // This removes ALL features from the layer
    }

    // 3) Hide EditView — if you want it to be unmounted entirely,
    setShowEditView({ show: false });
  };

  const [editModel] = React.useState(
    () =>
      new EditModel({
        map: props.map,
        app: props.app,
        observer: props.localObserver,
        options: props.options,
        surveyJsData: surveyJsData,
      })
  );

  editModel.currentQuestionName = currentQuestionName;
  editModel.currentQuestionTitle = currentQuestionTitle;

  React.useEffect(() => {
    const containers = Array.from(
      document.querySelectorAll(".editViewContainer")
    );

    if (showEditView.show) {
      // Creating new root if missing
      containers.forEach((container) => {
        if (!rootMap.current.has(container)) {
          const root = ReactDOM.createRoot(container);
          rootMap.current.set(container, root);

          root.render(
            <EditView
              key={editViewKey}
              app={props.app}
              model={editModel}
              observer={props.localObserver}
              surveyJsData={surveyJsData}
              resetView={resetEditView}
              currentQuestionTitle={currentQuestionTitle}
              currentQuestionName={currentQuestionName}
              onSaveCallback={handleOnComplete}
              ref={editViewRef}
              toolbarOptions={showEditView.toolbarOptions}
              area={area}
              price={price.toFixed(2)}
            />
          );
        }
      });

      // REnder existing root
      rootMap.current.forEach((root, container) => {
        if (containers.includes(container)) {
          root.render(
            <EditView
              key={editViewKey}
              app={props.app}
              model={editModel}
              observer={props.localObserver}
              surveyJsData={surveyJsData}
              resetView={resetEditView}
              currentQuestionTitle={currentQuestionTitle}
              currentQuestionName={currentQuestionName}
              onSaveCallback={handleOnComplete}
              ref={editViewRef}
              toolbarOptions={showEditView.toolbarOptions}
              area={area}
              price={price.toFixed(2)}
            />
          );
        }
      });
    }
  }, [
    showEditView,
    editViewKey,
    props.app,
    editModel,
    props.localObserver,
    surveyJsData,
    //resetEditView,
    currentQuestionTitle,
    currentQuestionName,
    handleOnComplete,
    editViewRef,
    showEditView.toolbarOptions,
    area,
    price,
  ]);

  useEffect(() => {
    const newSurvey = new Model(surveyJSON);
    newSurvey.applyTheme(surveyTheme);
    setSurvey(newSurvey);
    return () => {};
  }, [surveyJSON, surveyTheme, surveyKey]);

  useEffect(() => {
    if (!survey) return;

    visibleChangedHandlerRef.current = (sender, options) => {
      const q = options.question;
      if (!q) return;

      // If a question becomes hidden...
      if (!q.visible) {
        // 1) Check if it's one of your geometry types
        const qt = q.getType();
        const isAnyGeometryType = [
          "geometry",
          "geometrypoint",
          "geometrylinestring",
          "geometrypolygon",
          "geometrypointposition",
        ].includes(qt);

        if (isAnyGeometryType) {
          // 2) Clear the value in SurveyJS so that nothing is saved for this question
          sender.setValue(q.name, null);

          // 3) Handle either simulated or WFS-T mode
          if (editModel?.source?.id === "simulated") {
            // -- Simulated Mode: remove the geometry from newMapData
            if (editModel?.newMapData) {
              editModel.newMapData = editModel.newMapData.filter(
                (feature) => feature.surveyQuestionName !== q.name
              );
            }
          } else {
            // -- WFS-T Mode: mark the corresponding feature as "removed"
            //    so the WFS-T transaction knows to delete it
            if (editModel?.vectorSource) {
              const features = editModel.vectorSource.getFeatures();
              features.forEach((feature) => {
                if (feature.get("SURVEYQUESTIONNAME") === q.name) {
                  feature.modification = "removed";
                }
              });
            }
          }

          // 4) Call the existing save function in EditView
          if (editViewRef?.current?.onSaveClicked) {
            editViewRef.current.onSaveClicked();
          }
        }
      }
    };

    // Attach the event
    survey.onVisibleChanged.add(visibleChangedHandlerRef.current);

    // Remove the event when the component unmounts or 'survey' changes
    return () => {
      if (visibleChangedHandlerRef.current) {
        survey.onVisibleChanged.remove(visibleChangedHandlerRef.current);
      }
    };
  }, [survey, editModel, editViewRef]);

  Survey.surveyLocalization.defaultLocale = "sv";

  return (
    <>
      {!isCompleted ? (
        survey && (
          <Survey.Survey
            model={survey}
            onComplete={handleOnComplete}
            onCompleting={handleOnCompleting}
            onAfterRenderQuestion={handleAfterRenderQuestion}
            onCurrentPageChanged={handlePageChange}
          />
        )
      ) : (
        <div
          className="response-message-container"
          style={{
            backgroundColor: "#f0f0f0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
            textAlign: "center",
          }}
        >
          {messageContainsHTML ? (
            // If content HTML render as HTML
            <div
              className="response-message"
              dangerouslySetInnerHTML={{
                __html: responseMessage,
              }}
            ></div>
          ) : (
            // If not HTML, set style, render as text and manage \n
            <p
              style={{
                fontSize: "1.5em",
                margin: "0",
                fontWeight: "bold",
              }}
            >
              {responseMessage.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
          )}

          {hasRestartButtonText && (
            <button
              onClick={restartSurvey}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                fontSize: "1em",
                cursor: "pointer",
                backgroundColor: "#333333",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
              }}
            >
              {restartButtonText}
            </button>
          )}
          <br />
          <button
            onClick={handleAction}
            style={{
              padding: "10px 20px",
              fontSize: "1em",
              cursor: "pointer",
              backgroundColor: "#333333",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Stäng enkätfönster
          </button>
        </div>
      )}
      {showErrorMessage && (
        <div
          className="error-message"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 20px",
            fontSize: "1em",
            cursor: "pointer",
            backgroundColor: "#990000",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {showErrorMessage}
        </div>
      )}
    </>
  );
}

export default SurveyView;
