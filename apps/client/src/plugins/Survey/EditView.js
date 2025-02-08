import React from "react";
import Toolbar from "./components/Toolbar";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

class EditView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sources: props.model.getSources(),
      editSource: undefined,
      editFeature: undefined,
      activeStep: 0,
      activeTool: undefined,
      surveyname: this.props.surveyJsData,
      isHidden: true,
    };
    this.subscriptions = [];
    this.bindSubscriptions();
  }

  componentDidMount() {
    const { sources } = this.state;
    if (sources && sources.length > 0) {
      this.setLayer(sources[0].id);

      const fieldNames = [
        "surveyId",
        "surveyAnswerId",
        "surveyAnswerDate",
        "surveyQuestion",
        "surveyQuestionName",
      ];

      fieldNames.forEach((fieldName) => {
        this[fieldName] = this.state.sources[0].editableFields.find(
          (field) => field.name.toLowerCase() === fieldName.toLowerCase()
        )?.name;
      });
    } else {
      this.setLayer("");
      this.simulated = true;
    }
    this.setState({ activeStep: 0 });
  }

  componentWillUnmount() {
    // Remove all subscriptions
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
  }

  bindSubscriptions = () => {
    const editFeatureHandler = (feature) => {
      this.props.observer.publish("feature-to-update-view", feature);
      this.setState({
        editFeature: feature,
        editSource: this.props.model.editSource,
      });
    };
    this.props.observer.subscribe("editFeature", editFeatureHandler);
    this.subscriptions.push(() => {
      this.props.observer.unsubscribe("editFeature", editFeatureHandler);
    });

    const resetViewHandler = () => {
      this.props.observer.publish("feature-to-update-view", undefined);
      this.setState({
        editFeature: undefined,
        editSource: undefined,
        activeStep: 0,
        activeTool: undefined,
      });
    };
    this.props.observer.subscribe("resetView", resetViewHandler);
    this.subscriptions.push(() => {
      this.props.observer.unsubscribe("resetView", resetViewHandler);
    });
    const deactivateEditInteractionHandler = () => {
      this.toggleActiveTool("");
    };
    this.props.observer.subscribe(
      "deactivateEditInteraction",
      deactivateEditInteractionHandler
    );
    this.subscriptions.push(() => {
      this.props.observer.unsubscribe(
        "deactivateEditInteraction",
        deactivateEditInteractionHandler
      );
    });
  };

  handleVectorLoadingDone = (status) => {
    this.setState({
      loading: false,
      loadingError: status === "data-load-error" ? true : false,
      activeStep: status === "data-load-error" ? 0 : 1,
    });
    this.potentiallyAutoActivateModify();
  };

  potentiallyAutoActivateModify = () => {
    // If the selected source only allows simple edit, let's
    // activate the "modify" tool automatically.
    if (this.state.editSource?.simpleEditWorkflow === true) {
      // Toggle state in View
      this.toggleActiveTool("modify");

      // Activate interaction in model
      this.props.model.activateModify();
    }
  };

  setLayer(serviceId) {
    this.props.model.reset();
    this.setState({
      loading: true,
    });
    this.props.model.setLayer(serviceId, this.handleVectorLoadingDone);
  }

  handlePrev = () => {
    const activeStep = this.state.activeStep - 1;
    if (activeStep === 0) {
      //this.props.model.reset();
      this.setState({
        editFeature: undefined,
        editSource: this.props.model.editSource,
        activeStep: 0,
        activeTool: undefined,
      });
    } else if (activeStep === 1) {
      this.setState({ activeStep });
      // If we end up on step 1 again, it means that user has
      // clicked on "Continue editing" button after a save has
      // been completed. In that case, we must check again if
      // the simple edit workflow is active and in that case
      // auto-activate the modify tool.
      this.potentiallyAutoActivateModify();
    } else {
      this.setState({ activeStep });
    }
  };

  handleNext = () => {
    const activeStep = this.state.activeStep + 1;
    this.setState({ activeStep });
  };

  toggleActiveTool = (toolName) => {
    let setTool = undefined;
    if (toolName !== this.state.activeTool) {
      setTool = toolName;
    }
    this.setState({
      activeTool: setTool,
    });
  };

  getStatusMessage = (data) => {
    if (!data) {
      return (
        <Typography>
          Uppdateringen lyckades men det upptäcktes inte några ändringar.
        </Typography>
      );
    }
    if (data.ExceptionReport) {
      return (
        <Typography>
          Uppdateringen misslyckades:{" "}
          {data.ExceptionReport.Exception.ExceptionText.toString()}
        </Typography>
      );
    }
    if (
      data.TransactionResponse &&
      data.TransactionResponse.TransactionSummary
    ) {
      return (
        <div>
          <Typography>Uppdateringen lyckades.</Typography>
          <Typography>
            Antal skapade objekt:{" "}
            {data.TransactionResponse.TransactionSummary.totalInserted?.toString() ||
              0}
          </Typography>
          <Typography>
            Antal borttagna objekt:{" "}
            {data.TransactionResponse.TransactionSummary.totalDeleted?.toString() ||
              0}
          </Typography>
          <Typography>
            Antal uppdaterade objekt:{" "}
            {data.TransactionResponse.TransactionSummary.totalUpdated?.toString() ||
              0}
          </Typography>
        </div>
      );
    } else {
      return (
        <Typography>
          Status för uppdateringen kunde inte avläsas ur svaret från servern.
        </Typography>
      );
    }
  };

  onSaveClicked = () => {
    const { model, app } = this.props;
    let editValues;
    if (this.simulated === true) {
      editValues = {
        SURVEYID: this.props.surveyJsData.surveyId,
        SURVEYANSWERID: this.props.surveyJsData.surveyAnswerId,
        SURVEYANSWERDATE: this.props.surveyJsData.surveyAnswerDate,
        SURVEYQUESTION: this.props.currentQuestionTitle,
        SURVEYQUESTIONNAME: this.props.currentQuestionName,
      };
    } else {
      editValues = {
        [this.surveyId]: this.props.surveyJsData.surveyId,
        [this.surveyAnswerId]: this.props.surveyJsData.surveyAnswerId,
        [this.surveyAnswerDate]: this.props.surveyJsData.surveyAnswerDate,
        [this.surveyQuestion]: this.props.currentQuestionTitle,
        [this.surveyQuestionName]: this.props.currentQuestionName,
      };
    }

    model.save(editValues, (response) => {
      if (
        response &&
        (response.ExceptionReport || !response.TransactionResponse)
      ) {
        this.props.observer.publish("editFeature", model.editFeatureBackup);
        app.globalObserver.publish(
          "core.alert",
          this.getStatusMessage(response)
        );
      } else {
        model.filty = false;
        model.refreshEditingLayer();
        model.editFeatureBackup = undefined;
        this.handleNext();
        this.toggleActiveTool(undefined);
        model.deactivateInteraction();
      }
      this.props.resetView();
    });
  };

  renderToolbar = () => {
    return (
      <Toolbar
        ref="toolbar"
        editSource={this.props.model.editSource}
        model={this.props.model}
        observer={this.props.observer}
        app={this.props.app}
        activeTool={this.state.activeTool}
        toggleActiveTool={(toolName) => this.toggleActiveTool(toolName)}
        toolbarOptions={this.props.toolbarOptions}
        area={this.props.area}
        price={this.props.price}
        geofencingWarningToolbar={this.props.geofencingWarningToolbar}
      />
    );
  };

  resetEditFeatureInModel = () => {
    this.props.model.resetEditFeature();
  };

  render() {
    const { editSource, loading } = this.state;
    return (
      <>
        <Grid container spacing={2} direction="row">
          <Grid item xs={12}>
            {loading ? <CircularProgress /> : null}
          </Grid>
        </Grid>
        <Grid container spacing={2} direction="row">
          <Grid item xs={12}>
            {editSource?.simpleEditWorkflow !== true && (
              <>
                {this.resetEditFeatureInModel()}
                {this.renderToolbar()}
              </>
            )}
            {editSource?.simpleEditWorkflow === true &&
              this.resetEditFeatureInModel()}
          </Grid>
        </Grid>
      </>
    );
  }
}
export default EditView;
