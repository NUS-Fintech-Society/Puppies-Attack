import React from "react";
import Web3 from "web3";

class IncreaseLevel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myPuppies: [],
      myPuppiesList: [],
      selectedPuppyId: 0,
      selectedPuppyLevel: 1,
    };
    this.increasePuppyLevel = this.increasePuppyLevel.bind(this);
    this.revivePuppy = this.revivePuppy.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    const getPuppies = async () => {
      const contract = this.props.contract;
      const account = this.props.accounts;
      var myPuppies = [];
      var firstOwn = true;
      const length = await contract.methods.getAllPuppiesNumber().call();

      for (var i = 0; i < length; i++) {
        const puppy = await contract.methods.allPuppies(i).call();
        if (puppy.owner === account[0]) {
          myPuppies.push(puppy);
          if (firstOwn) {
            this.setState({
              selectedPuppyId: puppy.id,
              selectedPuppyLevel: puppy.level,
            });
            firstOwn = false;
          }
        }
      }

      var myPuppiesList = "";
      myPuppiesList = myPuppies.map((puppy) => (
        <option key={puppy.id} value={puppy.id}>
          Name: {puppy.name} Level: {puppy.level}
        </option>
      ));

      this.setState({
        myPuppies: myPuppies,
        myPuppiesList: myPuppiesList,
      });
    };

    getPuppies();
  }

  increasePuppyLevel(puppyId) {
    const {
      contract: { methods },
    } = this.props;
    methods
      ._levelUp(puppyId)
      .send({
        from: this.props.accounts[0],
        value: Web3.utils.toWei("0.005", "ether"),
      })
      .on("receipt", (receipt) => {
        alert("Successfully leveled up your puppy!");
        window.location.reload();
      })
      .on("error", (error) => {
        alert(error.message);
      });
  }

  revivePuppy(puppyId) {
    const {
      contract: { methods },
    } = this.props;
    methods
      .revive(puppyId)
      .send({
        from: this.props.accounts[0],
        value: Web3.utils.toWei("0.01", "ether"),
      })
      .on("receipt", (receipt) => {
        alert("Successfully revived your puppy!");
        window.location.reload();
      })
      .on("error", (error) => {
        alert(error.message);
      });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const selectedPuppyId = this.state.selectedPuppyId;
    const {
      contract: { methods },
    } = this.props;
    methods
      .getMyPuppiesLevel(this.state.selectedPuppyId)
      .call()
      .then((level) => {
        if (level < 1) {
          alert(
            "This will take a moment to update on the blockchain. Please press ok.",
          );
          this.revivePuppy(selectedPuppyId);
        } else {
          alert(
            "This will take a moment to update on the blockchain. Please press ok.",
          );
          this.increasePuppyLevel(selectedPuppyId);
        }
      });

    if (this.state.selectedPuppyId);
  };

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    this.setState({
      selectedPuppyId: value,
    });
    const {
      contract: { methods },
    } = this.props;
    methods
      .getMyPuppiesLevel(value)
      .call()
      .then((level) => {
        this.setState({ selectedPuppyLevel: level });
      });
  }

  render() {
    return (
      <div>
        <form name="LevelUpForm" onSubmit={this.handleSubmit}>
          <div className="row ml-2 centreRow">
            <div className="form-group col-md-4 ml-2">
              <h4 htmlFor="myPuppies">Select your puppy to level up/revive:</h4>
              <select
                className="form-control"
                id="myPuppies"
                name="selectedPuppyId"
                value={this.state.selectedPuppyId}
                onChange={this.handleInputChange}
                required
              >
                {this.state.myPuppiesList}
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              {this.state.selectedPuppyLevel > 0 ? "Level Up" : "Revive!"}
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default IncreaseLevel;
