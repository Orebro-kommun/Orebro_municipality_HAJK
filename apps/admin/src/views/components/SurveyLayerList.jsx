import React from "react";

class SurveyLayerList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterText: "",
      sortAsc: true,
      chosenLayerId: this.props.chosenLayers || null, // Använd chosenLayerId
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.chosenLayers !== this.props.chosenLayers) {
      this.setState({ chosenLayerId: this.props.chosenLayers });
    }
  }

  handleFilterChange = (e) => {
    this.setState({ filterText: e.target.value });
  };

  handleSortToggle = () => {
    this.setState((prevState) => ({ sortAsc: !prevState.sortAsc }));
  };

  handleLayerSelect = (layer) => {
    console.log("Layer selected:", layer.id); // Debugging
    this.setState({ chosenLayerId: layer.id }, () => {
      if (this.props.onChosenLayersChange) {
        this.props.onChosenLayersChange(layer.id); // Skicka endast id
      }
      console.log("ChosenLayerId updated to:", this.state.chosenLayerId); // Debugging
    });
  };

  getFilteredAndSortedLayers() {
    const { allLayers = [] } = this.props;
    const { filterText, sortAsc } = this.state;

    const filteredLayers = allLayers
      .filter((layer) => (layer.caption || layer.id || "").toLowerCase().includes(filterText.toLowerCase()))
      .sort((a, b) => {
        const aVal = (a.caption || a.id || "").toLowerCase();
        const bVal = (b.caption || b.id || "").toLowerCase();
        if (aVal < bVal) return sortAsc ? -1 : 1;
        if (aVal > bVal) return sortAsc ? 1 : -1;
        return 0;
      });

    return filteredLayers;
  }

  render() {
    const { chosenLayerId, filterText, sortAsc } = this.state;
    const filteredLayers = this.getFilteredAndSortedLayers();

    const containerStyle = {
      maxWidth: "600px",
      border: "1px solid #ccc",
      padding: "10px",
      textAlign: "left",
    };

    const listContainerStyle = {
      maxHeight: "200px",
      overflowY: "auto",
      border: "1px solid #ddd",
      padding: "5px",
      marginTop: "10px",
    };

    return (
      <div style={containerStyle}>
        <h3>Lager</h3>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Filtrera"
            value={filterText}
            onChange={this.handleFilterChange}
            style={{ marginRight: "10px", width: "80%" }}
          />
          <button type="button" onClick={this.handleSortToggle} style={{ marginRight: "10px" }}>
            Sortera {sortAsc ? "A-Ö" : "Ö-A"}
          </button>
          {/* Eventuellt ta bort eller justera denna knapp */}
          {/* <button type="button" onClick={this.selectAllLayers}>
            Välj alla / rensa alla
          </button> */}
        </div>

        <div style={listContainerStyle}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filteredLayers.map((layer) => {
              const isChecked = chosenLayerId === layer.id;
              return (
                <li key={layer.id} style={{ marginBottom: "5px" }}>
                  <input
                    type="radio"
                    name="surveyLayer"
                    checked={isChecked}
                    onChange={() => this.handleLayerSelect(layer)}
                  />{" "}
                  {layer.caption || layer.id}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default SurveyLayerList;
