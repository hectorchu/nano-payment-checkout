import React, {useState, useEffect} from 'react';
import {Button, Card, Container, Row} from 'react-bootstrap';
import {useNanoPayment, nanoPaymentLink} from 'react-nano-payment';
import QRCode from 'qrcode.react';
import queryString from 'query-string';

export default function App() {
  const props = queryString.parse(window.location.search);
  const {amount, title, on_success, on_error} = props;
  const [show, setShow] = useState(true);
  const [err, setErr] = useState();
  const account = useNanoPayment({
    ...props,
    apiURL: props.api_url,
    paymentID: props.payment_id,
    show,
    onSuccess: ({id}) => {
      if (!on_success) return;
      window.location = `${on_success}&payment_id=${id}`;
    },
    onError: err => {
      setShow(false);
      setErr(err);
    },
  });
  useEffect(() => {
    if (show || !on_error) return;
    window.location = `${on_error}&err=${err ? encodeURIComponent(err.message) : 'Cancelled'}`;
  }, [show]);

  if (title) document.title = title;
  if (!account) return null;
  return (
    <Container>
      <Row className="align-items-center justify-content-center vh-100">
        <Card bg="light" border="secondary" text="dark" style={{width: '24rem'}}>
          <Card.Header as="h4">{title}</Card.Header>
          <Card.Body>
            <Card.Text>
              Please send{' '}
              <code className="border">{amount}</code>
              {' '}NANO to <code>{account}</code>
            </Card.Text>
            <div className="text-center">
              <a href={nanoPaymentLink(account, amount)}>
                <QRCode value={nanoPaymentLink(account, amount)} />
              </a>
              <div>
                <small className="text-muted">Tap QR code to pay</small>
              </div>
            </div>
          </Card.Body>
          <Card.Footer>
            <Button className="float-right" variant="secondary" onClick={() => setShow(false)}>
              Cancel
            </Button>
          </Card.Footer>
        </Card>
      </Row>
    </Container>
  )
}
