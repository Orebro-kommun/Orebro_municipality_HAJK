import React, { Component } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
//import DeleteIcon from "@mui/icons-material/Delete";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import BorderStyleIcon from "@mui/icons-material/BorderStyle";
import LinearScaleIcon from "@mui/icons-material/LinearScale";
//import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
//import FormatShapesIcon from "@mui/icons-material/FormatShapes";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "selected",
})(({ theme, selected }) => ({
  // Lägg &.MuiButton-contained sist för att vinna specifikiteten
  "&.MuiButton-contained": {
    backgroundColor: "white",
    color: selected ? "red" : "black",
    borderTop: `${theme.spacing(0.5)} solid transparent`,
    borderBottom: selected
      ? `${theme.spacing(0.5)} solid ${theme.palette.secondary.main}`
      : `${theme.spacing(0.5)} solid transparent`,
  },
}));

class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editFeature: undefined,
    };

    this.surveyTool = this.props.app.config.mapConfig.tools.find(
      (tool) => tool.type === "survey"
    );

    this.props.observer.subscribe("feature-to-update-view", (feature) => {
      this.setState({
        editFeature: feature,
      });
    });
    this.toolbarOptions = this.props.toolbarOptions ?? "all";
  }

  componentWillUnmount() {
    this.props.observer.unsubscribe("feature-to-update-view");
  }

  changeTool(type, geometryType) {
    const { model, activeTool } = this.props;
    if (geometryType && activeTool === geometryType.toLowerCase()) {
      model.deactivateInteraction();
      return;
    }
    if (activeTool === type) {
      model.deactivateInteraction();
      return;
    }
    model.deactivateInteraction();

    switch (type) {
      case "add":
        model.activateInteraction("add", geometryType);
        break;
      case "remove":
        model.activateInteraction("remove");
        break;
      case "modify":
        model.activateInteraction("modify");
        break;
      case "move":
        model.activateInteraction("move");
        break;
      default:
        break;
    }
  }

  onAddCoordinatesClicked() {
    this.props.model.layer.dragLocked = true;
    this.props.model.getCoordinates();

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const targetPlugin = this.props.app.windows.find(
        (window) => window.title === this.props.model.options.title
      );
      if (targetPlugin) {
        targetPlugin.closeWindow();
        this.props.toggleActiveTool("");
      }
    }
  }

  onAddPointClicked() {
    this.props.model.layer.dragLocked = true;
    this.props.toggleActiveTool("point");
    this.changeTool(
      "add",
      this.props.editSource.editMultiPoint ? "MultiPoint" : "Point"
    );
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const targetPlugin = this.props.app.windows.find(
        (window) => window.title === this.props.model.options.title
      );
      if (targetPlugin) {
        targetPlugin.closeWindow();
        this.props.toggleActiveTool("");
      }
    }
  }

  onAddLineClicked() {
    this.props.model.layer.dragLocked = true;
    this.props.toggleActiveTool("linestring");
    this.changeTool(
      "add",
      this.props.editSource.editMultiLine ? "MultiLineString" : "LineString"
    );
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const targetPlugin = this.props.app.windows.find(
        (window) => window.title === this.props.model.options.title
      );
      if (targetPlugin) {
        targetPlugin.closeWindow();
        this.props.toggleActiveTool("");
      }
    }
  }

  onAddPolygonClicked() {
    this.props.model.layer.dragLocked = true;
    this.props.toggleActiveTool("polygon");
    this.changeTool(
      "add",
      this.props.editSource.editMultiPolygon ? "MultiPolygon" : "Polygon"
    );
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const targetPlugin = this.props.app.windows.find(
        (window) => window.title === this.props.model.options.title
      );
      if (targetPlugin) {
        targetPlugin.closeWindow();
        this.props.toggleActiveTool("");
      }
    }
  }

  onRemoveClicked() {
    this.props.toggleActiveTool("remove");
    this.changeTool("remove");
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const targetPlugin = this.props.app.windows.find(
        (window) => window.title === this.props.model.options.title
      );
      if (targetPlugin) {
        targetPlugin.closeWindow();
        this.props.toggleActiveTool("");
      }
    }
  }

  onModifyClicked() {
    this.props.toggleActiveTool("modify");
    this.changeTool("modify");
  }

  onMoveClicked() {
    this.props.model.layer.dragLocked = false;
    this.props.toggleActiveTool("move");
    this.changeTool("move");
  }

  render() {
    const { editSource } = this.props;
    const { editFeature } = this.state;

    if (!editSource || editFeature) return null;

    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            {!this.props.geofencingWarningToolbar && (
              <Typography>
                <b>Markera i kartan</b>
              </Typography>
            )}
            {this.props.geofencingWarningToolbar && (
              <Box
                sx={{
                  backgroundColor: "orange",
                  padding: 1,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <WarningAmberIcon sx={{ mr: 0.5 }} />
                <Typography
                  variant="body1"
                  style={{
                    padding: 4,
                    fontSize: 14,
                  }}
                >
                  Vänligen rita inom det fördefinierade området.
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            {this.props.drawnGeometryMap[this.props.currentQuestionName] !==
              "added" && (
              <Typography
                style={{
                  color: "white",
                  backgroundColor: "orange",
                  padding: 4,
                  fontSize: 14,
                }}
              >
                Geometri ännu inte tillagd!
              </Typography>
            )}
            {this.props.geometryValidMap[this.props.currentQuestionName] ===
              false && (
              <Typography
                style={{
                  color: "white",
                  backgroundColor: "red",
                  padding: 4,
                  fontSize: 14,
                }}
              >
                Geometrin är ogiltig eftersom den korsar sig själv!
              </Typography>
            )}
            {this.props.drawnGeometryMap[this.props.currentQuestionName] ===
              "added" &&
              this.props.geometryValidMap[this.props.currentQuestionName] ===
                true && (
                <Typography
                  style={{
                    color: "white",
                    backgroundColor: "green",
                    padding: 4,
                    fontSize: 14,
                  }}
                >
                  Geometri tillagd!
                </Typography>
              )}
          </Box>
        </Grid>
        <Grid container spacing={2}>
          {(this.toolbarOptions === "all" ||
            this.toolbarOptions === "point" ||
            this.toolbarOptions === "position") && (
            <Grid item xs={4}>
              <StyledButton
                variant="contained"
                fullWidth
                disabled={!editSource.editPoint && !editSource.editMultiPoint}
                onClick={() => {
                  this.onAddPointClicked();
                }}
                selected={this.props.activeTool === "point"}
                type="button"
                title="Lägg till punkt"
              >
                Markera en plats
                <ScatterPlotIcon sx={{ marginLeft: 1 }} />
              </StyledButton>
            </Grid>
          )}

          {(this.toolbarOptions === "all" ||
            this.toolbarOptions === "position") && (
            <Grid item xs={4}>
              <StyledButton
                variant="contained"
                fullWidth
                disabled={!editSource.editPoint && !editSource.editMultiPoint}
                onClick={() => {
                  this.onAddCoordinatesClicked();
                }}
                type="button"
                title="Hämta min position"
              >
                Min position
              </StyledButton>
            </Grid>
          )}

          {(this.toolbarOptions === "all" ||
            this.toolbarOptions === "linestring") && (
            <Grid item xs={4}>
              <StyledButton
                variant="contained"
                fullWidth
                disabled={!editSource.editLine && !editSource.editMultiLine}
                onClick={() => {
                  this.onAddLineClicked();
                }}
                type="button"
                title="Lägg till linje"
                selected={this.props.activeTool === "linestring"}
              >
                Markera en sträcka
                <LinearScaleIcon sx={{ marginLeft: 1 }} />
              </StyledButton>
            </Grid>
          )}

          {(this.toolbarOptions === "all" ||
            this.toolbarOptions === "polygon") && (
            <Grid item xs={4}>
              <StyledButton
                variant="contained"
                fullWidth
                disabled={
                  !editSource.editPolygon && !editSource.editMultiPolygon
                }
                onClick={() => {
                  this.onAddPolygonClicked();
                }}
                type="button"
                title="Lägg till yta"
                selected={this.props.activeTool === "polygon"}
              >
                Markera ett område
                <BorderStyleIcon sx={{ marginLeft: 1 }} />
              </StyledButton>
              {this.surveyTool.options.activatedMapOrder && (
                <Typography style={{ fontSize: "12px", lineHeight: "1.4" }}>
                  <b>Area i kvm:</b> {this.props.area} <br />
                  <b>Pris:</b> {this.props.price} SEK
                </Typography>
              )}
            </Grid>
          )}
        </Grid>

        <Grid item xs={12}>
          {/*<Typography>Editera</Typography>*/}
        </Grid>
        <Grid item xs={6}>
          {/*<StyledButton
            variant="contained"
            fullWidth
            onClick={() => {
              this.onRemoveClicked();
            }}
            type="button"
            title="Ta bort geometri"
            selected={this.props.activeTool === "remove"}
          >
            Radera geometri
            <DeleteIcon sx={{ marginLeft: 1 }} />
          </StyledButton>*/}
        </Grid>
        <Grid item xs={4}>
          {/* <StyledButton
            variant="contained"
            fullWidth
            onClick={() => {
              this.onMoveClicked();
            }}
            type="button"
            title="Flytta geometri"
            selected={this.props.activeTool === "move"}
          >
            Flytta
            <ZoomOutMapIcon sx={{ marginLeft: 1 }} />
          </StyledButton>
          */}
        </Grid>
        <Grid item xs={4}>
          {/*<StyledButton
            variant="contained"
            fullWidth
            onClick={() => {
              this.onModifyClicked();
            }}
            type="button"
            title="Ändra geometri"
            selected={this.props.activeTool === "modify"}
          >
            Ändra
            <FormatShapesIcon sx={{ marginLeft: 1 }} />
          </StyledButton>*/}
        </Grid>
      </Grid>
    );
  }
}

export default Toolbar;
