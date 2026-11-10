import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

export default function LoadError({ message, onRetry }) {
  return <Alert variant="warning">
    <p>{message}</p>
    <Button variant="outline-secondary" onClick={onRetry}>Try again</Button>
  </Alert>;
}
