import PropTypes from "prop-types";
import Button from "react-bootstrap/Button";

const Header = ({
  subscription,
  onAdd,
  onSubscription,
  onCancel,
  showAdd,
  logout,
}) => {
  return (
    <header className="header">
      <h2>Add a Task</h2>
      <Button variant="primary" onClick={onAdd}>
        {showAdd ? "Close" : "Add"}
      </Button>
      {subscription && subscription.tier === "free" && (
        <Button variant="primary" onClick={() => onSubscription()}>
          Upgrade
        </Button>
      )}
      {subscription &&
        subscription.tier === "premium" &&
        subscription.canceled === false && (
          <Button variant="primary" onClick={() => onCancel()}>
            Downgrade
          </Button>
        )}
      <Button variant="primary" onClick={() => logout()}>
        Logout
      </Button>
    </header>
  );
};

Header.defaultProps = {
  title: "To-do List",
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
};

// CSS in JS
// const headingStyle = {
//   color: 'red',
//   backgroundColor: 'black',
// }

export default Header;
