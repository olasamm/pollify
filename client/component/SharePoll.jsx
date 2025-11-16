import React, { useState } from 'react';
import { Modal, Button, Card, Form, InputGroup, Alert } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

const SharePoll = ({ poll, show, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState('link');

  // Generate shareable link
  const getShareableLink = () => {
    if (!poll) return '';
    const baseUrl = 'https://pollify-tau.vercel.app';
    return `${baseUrl}/vote?id=${poll._id}`;
  };

  const shareLink = getShareableLink();

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Share via Web Share API (mobile)
  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poll?.title || 'Poll',
          text: `Check out this poll: ${poll?.title || ''}`,
          url: shareLink,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  // Share via email
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this poll: ${poll?.title || ''}`);
    const body = encodeURIComponent(`I'd like to share this poll with you:\n\n${poll?.title || ''}\n${poll?.description || ''}\n\nVote here: ${shareLink}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Check out this poll: ${poll?.title || ''}\n${shareLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Download QR Code
  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `poll-qr-${poll?._id || 'code'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (!poll) return null;

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="bi bi-share-fill me-2"></i>
          Share Poll
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="mb-4">
          <h5 className="mb-2">{poll.title}</h5>
          {poll.description && (
            <p className="text-muted small mb-0">{poll.description}</p>
          )}
        </div>

        <div className="mb-4">
          <Form.Label className="fw-bold">Share Method:</Form.Label>
          <div className="btn-group w-100 mb-3" role="group">
            <Button
              variant={shareMethod === 'link' ? 'primary' : 'outline-primary'}
              onClick={() => setShareMethod('link')}
            >
              <i className="bi bi-link-45deg me-2"></i>Link
            </Button>
            <Button
              variant={shareMethod === 'qr' ? 'primary' : 'outline-primary'}
              onClick={() => setShareMethod('qr')}
            >
              <i className="bi bi-qr-code me-2"></i>QR Code
            </Button>
          </div>
        </div>

        {shareMethod === 'link' ? (
          <div>
            <Form.Label className="fw-bold mb-2">Shareable Link:</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                value={shareLink}
                readOnly
                className="bg-light"
              />
              <Button
                variant="outline-secondary"
                onClick={copyToClipboard}
                title="Copy link"
              >
                <i className={`bi ${copied ? 'bi-check' : 'bi-clipboard'}`}></i>
              </Button>
            </InputGroup>

            {copied && (
              <Alert variant="success" className="py-2">
                <i className="bi bi-check-circle me-2"></i>
                Link copied to clipboard!
              </Alert>
            )}

            <div className="mt-4">
              <Form.Label className="fw-bold mb-2">Share via:</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {navigator.share && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={shareViaNative}
                  >
                    <i className="bi bi-share me-2"></i>
                    Share
                  </Button>
                )}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={shareViaEmail}
                >
                  <i className="bi bi-envelope me-2"></i>
                  Email
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={shareViaWhatsApp}
                >
                  <i className="bi bi-whatsapp me-2"></i>
                  WhatsApp
                </Button>
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => {
                    const text = encodeURIComponent(`Check out this poll: ${poll.title}\n${shareLink}`);
                    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                  }}
                >
                  <i className="bi bi-twitter me-2"></i>
                  Twitter
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, '_blank');
                  }}
                >
                  <i className="bi bi-facebook me-2"></i>
                  Facebook
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Card className="p-4 bg-light">
              <Card.Body>
                <div className="mb-3">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={shareLink}
                    size={256}
                    level="H"
                    includeMargin={true}
                    className="border rounded"
                  />
                </div>
                <p className="text-muted small mb-3">
                  Scan this QR code to vote on the poll
                </p>
                <Button
                  variant="primary"
                  onClick={downloadQRCode}
                  className="w-100"
                >
                  <i className="bi bi-download me-2"></i>
                  Download QR Code
                </Button>
              </Card.Body>
            </Card>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SharePoll;

