import React, {useState, useEffect} from 'react';
import {Button, Card, Container, Row} from 'react-bootstrap';
import {useNanoPayment, nanoPaymentLink} from 'react-nano-payment';
import QRCode from 'qrcode.react';
import queryString from 'query-string';

export default function App() {
  const props = queryString.parse(window.location.search);
  const {api_url, amount, title, on_success, on_error} = props;
  const currency = (props.currency || 'nano').toUpperCase();
  const [currencyAmount, setCurrencyAmount] = useState('');
  const [show, setShow] = useState(true);
  const [err, setErr] = useState();
  const account = useNanoPayment({
    ...props,
    apiURL: api_url,
    paymentID: props.payment_id,
    show,
    onSuccess: ({id}) => {
      if (!on_success) return;
      window.location = `${on_success}&payment_id=${id}`;
    },
    onError: err => {
      setErr(err);
      setShow(false);
    },
  });
  useEffect(() => {
    if (show || !on_error) return;
    window.location = `${on_error}&err=${err ? encodeURIComponent(err.message) : 'Cancelled'}`;
  }, [show]);
  useEffect(() => {
    (async () => {
      const resp = await fetch(`${api_url}/rates/?amount=1&currency=${currency}`);
      const rate = await resp.text();
      setCurrencyAmount((amount / rate).toFixed(2));
    })();
  }, [amount, currency]);

  if (title) document.title = title;
  if (!account) return null;
  if (currency != 'NANO' && !currencyAmount) return null;
  return (
    <Container>
      <Row className="h-100 align-items-center justify-content-center">
        <Card bg="light" border="secondary" text="dark" style={{width: '24rem'}}>
          <Card.Header as="h4">{title}</Card.Header>
          <Card.Body>
            <Card.Text>
              Please send <code className="border">{amount}</code> NANO{' '}
              {currency != 'NANO' && <small className="text-muted">({currencyAmount} {currency})</small>}
              {' '}to <code>{account}</code>
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
