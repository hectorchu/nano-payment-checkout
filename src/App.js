import React, {useState, useEffect} from 'react';
import {useNanoPayment, nanoPaymentLink} from 'react-nano-payment';
import QRCode from 'qrcode.react';
import queryString from 'query-string';

export default function App() {
  const props = queryString.parse(window.location.search);
  const {amount, onSuccess, onError} = props;
  const [show, setShow] = useState(true);
  const [err, setErr] = useState();
  const account = useNanoPayment({
    ...props,
    show,
    onSuccess: ({id, block_hash}) => {
      fetch(`${onSuccess}&paymentID=${id}&blockHash=${block_hash}`);
    },
    onError: err => {
      setShow(false);
      setErr(err);
    },
  });
  useEffect(() => {
    if (show) return;
    if (err) {
      fetch(`${onError}&error=${err.message}`);
    } else {
      fetch(`${onError}&error=cancelled`);
    }
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
