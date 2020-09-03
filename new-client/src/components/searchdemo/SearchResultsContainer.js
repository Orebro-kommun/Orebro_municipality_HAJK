import React from "react";
import { Paper } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";

//import SearchResultsList from "./SearchResultsList";
import SearchResultsDetails from "./SearchResultsDetails";

const styles = (theme) => ({
  searchResultContainer: {
    maxHeight: "calc(100vh - 380px)",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    marginTop: "10px",
    paddingBottom: "22px",
    [theme.breakpoints.down("xs")]: {
      maxHeight: "calc(100vh - 200px)",
    },
  },
  searchResultTopBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  searchResultTopBarLeft: {
    display: "flex",
  },
  hidden: {
    display: "none",
  },
  // New styles
  root: {
    marginTop: 5,
    minWidth: 200,
    [theme.breakpoints.up("sm")]: {
      maxWidth: 520,
    },
    [theme.breakpoints.down("xs")]: {
      minWidth: "100%",
      position: "absolute",
      left: 0,
    },
  },
});

class SearchResultsContainer extends React.PureComponent {
  state = {
    selectedFeatureAndSource: null,
    sumOfResults: this.props.searchResults.featureCollections
      .map((fc) => fc.value.totalFeatures)
      .reduce((a, b) => a + b, 0),
  };

  getTheSoleResult = () => {
    const { featureCollections } = this.props;
    // Check which OL collection (i.e. "dataset") has the result
    const datasetWithTheSoleResult = featureCollections.find(
      (fc) => fc.value.totalFeatures === 1
    );

    if (datasetWithTheSoleResult === undefined) {
      return null;
    } else {
      // Grab the first result from that dataset
      const feature = datasetWithTheSoleResult.value.features[0];

      // Grab source
      const source = datasetWithTheSoleResult.source;

      return { feature, source };
    }
  };

  setSelectedFeatureAndSource = () => {
    console.log("hej");
  };

  render() {
    const { classes, featureCollections, map, resultsSource } = this.props;
    const { sumOfResults, selectedFeatureAndSource } = this.state;
    console.log("sumofresultrs. ", sumOfResults);
    return (
      <>
        {sumOfResults === 0 ? (
          <Paper className={classes.root}>
            <Alert severity="warning">Sökningen gav inget resultat.</Alert>
          </Paper>
        ) : (
          <Paper className={classes.root}>
            <SearchResultsDetails
              featureAndSource={
                sumOfResults === 1
                  ? this.getTheSoleResult()
                  : selectedFeatureAndSource
              }
              setSelectedFeatureAndSource={this.setSelectedFeatureAndSource}
              showBackToResultsButton={sumOfResults === 1 ? false : true}
              handleBackToResultClick={() => console.log("HEJ")}
            />
          </Paper>
        )}
      </>
    );
  }
}

export default withStyles(styles)(SearchResultsContainer);