import React, {useState, useEffect} from 'react';
import {useNanoPayment, nanoPaymentLink} from 'react-nano-payment';
import QRCode from 'qrcode.react';
import queryString from 'query-string';

export default function App() {
  const props = queryString.parse(window.location.search);
  const {amount} = props;
  const [show, setShow] = useState(true);
  const [err, setErr] = useState();
  const account = useNanoPayment({
    ...props,
    apiURL: props.api_url,
    paymentID: props.payment_id,
    show,
    onSuccess: ({id}) => {
      window.location = `${props.on_success}&payment_id=${id}`;
    },
    onError: err => {
      setShow(false);
      setErr(err);
    },
  });
  useEffect(() => {
    if (show) return;
    window.location = `${props.on_error}&err=${err ? encodeURIComponent(err.message) : 'Cancelled'}`;
  }, [show]);

  if (!account) return null;
  return (
    <div>
      <p>
        Please send {amount} NANO to
        <pre style={{overflowWrap: 'break-word', whiteSpace: 'pre-wrap'}}>
          {account}
        </pre>
      </p>
      <a href={nanoPaymentLink(account, amount)}>Payment Link</a>
      <div style={{textAlign: 'center'}}>
        <QRCode value={nanoPaymentLink(account, amount)} />
      </div>
      <button style={{float: 'right'}} onClick={() => setShow(false)}>
        Cancel
      </button>
    </div>
  )
}
