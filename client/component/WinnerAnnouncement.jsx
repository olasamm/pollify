import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Card, Badge, Form } from 'react-bootstrap';
import 'animate.css';
import './WinnerAnnouncement.css';

const WinnerAnnouncement = ({ poll, show, onClose, autoAnnounce = true, customMessage }) => {
  const [announced, setAnnounced] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCustomMessage, setShowCustomMessage] = useState(false);
  const [customAnnouncementText, setCustomAnnouncementText] = useState('');
  const confettiContainerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Calculate winner
  const getWinner = () => {
    if (!poll || !poll.options || poll.options.length === 0) return null;
    
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    if (totalVotes === 0) return null;

    const maxVotes = Math.max(...poll.options.map(opt => opt.votes));
    const winners = poll.options.filter(opt => opt.votes === maxVotes && opt.votes > 0);
    
    if (winners.length === 0) return null;
    if (winners.length === 1) {
      return {
        option: winners[0],
        isTie: false,
        totalVotes,
        percentage: ((winners[0].votes / totalVotes) * 100).toFixed(1)
      };
    } else {
      return {
        options: winners,
        isTie: true,
        totalVotes,
        percentage: ((winners[0].votes / totalVotes) * 100).toFixed(1)
      };
    }
  };

  const winner = getWinner();

  // Generate celebration sound using Web Audio API
  const playCelebrationSound = () => {
    if (!soundEnabled) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const audioContext = audioContextRef.current;
      
      // Create a fanfare-like sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Play a sequence of notes (fanfare)
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (C major chord)
      let currentNote = 0;
      
      const playNote = (frequency, startTime, duration) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.frequency.value = frequency;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      notes.forEach((freq, index) => {
        playNote(freq, audioContext.currentTime + index * 0.15, 0.3);
      });
    } catch (error) {
      console.log('Sound playback not available:', error);
    }
  };

  // Create confetti animation
  const createConfetti = () => {
    if (!confettiContainerRef.current) return;
    
    setConfettiActive(true);
    const container = confettiContainerRef.current;
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      container.appendChild(confetti);
      
      // Remove confetti after animation
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 5000);
    }
    
    // Stop confetti after 3 seconds
    setTimeout(() => {
      setConfettiActive(false);
    }, 3000);
  };

  // Social media sharing functions
  const shareOnTwitter = () => {
    const text = winner.isTie
      ? `The poll "${poll.title}" has ended in a tie! Check out the results on Pollify!`
      : `🎉 The poll "${poll.title}" has ended! The winner is "${winner.option.text}" with ${winner.option.votes} votes! Check it out on Pollify!`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const text = winner.isTie
      ? `The poll "${poll.title}" has ended in a tie!`
      : `The poll "${poll.title}" has ended! The winner is "${winner.option.text}"!`;
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const copyToClipboard = () => {
    const text = winner.isTie
      ? `The poll "${poll.title}" has ended in a tie between ${winner.options.length} options with ${winner.options[0].votes} votes each.`
      : `🎉 The poll "${poll.title}" has ended! The winner is "${winner.option.text}" with ${winner.option.votes} votes (${winner.percentage}%)!`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Results copied to clipboard!');
    });
  };

  // Text-to-speech announcement with custom message support
  const announceWinner = (useCustom = false) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance();
      
      let announcementText = useCustom ? customAnnouncementText : (customMessage || '');
      
      if (!announcementText) {
        if (winner.isTie) {
          announcementText = `The poll "${poll.title}" has ended! It's a tie between ${winner.options.length} options with ${winner.options[0].votes} votes each.`;
        } else {
          announcementText = `The poll "${poll.title}" has ended! The winner is "${winner.option.text}" with ${winner.option.votes} votes, which is ${winner.percentage} percent of the total votes.`;
        }
      }
      
      utterance.text = announcementText;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
      if (!useCustom) {
        setAnnounced(true);
      }
    }
  };

  // Main effect: trigger animations and sounds when modal shows
  useEffect(() => {
    if (show && winner && !announced) {
      // Play sound
      playCelebrationSound();
      
      // Create confetti
      createConfetti();
      
      // Announce with text-to-speech
      if (autoAnnounce) {
        const timer = setTimeout(() => {
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance();
            
            let announcementText = customMessage || '';
            
            if (!announcementText) {
              if (winner.isTie) {
                announcementText = `The poll "${poll.title}" has ended! It's a tie between ${winner.options.length} options with ${winner.options[0].votes} votes each.`;
              } else {
                announcementText = `The poll "${poll.title}" has ended! The winner is "${winner.option.text}" with ${winner.option.votes} votes, which is ${winner.percentage} percent of the total votes.`;
              }
            }
            
            utterance.text = announcementText;
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 1;
            
            window.speechSynthesis.speak(utterance);
            setAnnounced(true);
          }
        }, 500);
        return () => {
          clearTimeout(timer);
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
        };
      }
    }
    
    // Cleanup confetti when modal closes
    if (!show && confettiContainerRef.current) {
      const confettiPieces = confettiContainerRef.current.querySelectorAll('.confetti-piece');
      confettiPieces.forEach(piece => piece.remove());
    }
  }, [show, winner, announced, autoAnnounce, customMessage, poll]);

  if (!show || !winner) return null;

  return (
    <>
      {/* Confetti container */}
      <div ref={confettiContainerRef} className="confetti-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}></div>
      
      <Modal 
        show={show} 
        onHide={onClose}
        centered
        size="lg"
        backdrop="static"
        className="winner-announcement-modal"
      >
      <Modal.Header className="bg-success text-white border-0">
        <Modal.Title className="w-100 text-center">
          <div className="d-flex align-items-center justify-content-center">
            <i className="bi bi-trophy-fill me-2 fs-3 animate__animated animate__bounce"></i>
            <span className="animate__animated animate__pulse">Poll Ended!</span>
          </div>
        </Modal.Title>
        <div className="position-absolute top-0 end-0 p-2">
          <Button
            variant="link"
            className="text-white p-1"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Disable sound' : 'Enable sound'}
          >
            <i className={`bi ${soundEnabled ? 'bi-volume-up-fill' : 'bi-volume-mute-fill'}`}></i>
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body className="p-4 text-center">
        <div className="mb-4">
          <h5 className="text-muted mb-3">{poll.title}</h5>
          
          {winner.isTie ? (
            <div>
              <Card className="bg-warning text-dark mb-3 animate__animated animate__fadeInUp">
                <Card.Body className="p-4">
                  <i className="bi bi-exclamation-triangle-fill fs-1 d-block mb-2"></i>
                  <h4 className="mb-2">It's a Tie!</h4>
                  <p className="mb-3">Multiple options received the same number of votes:</p>
                  <div className="d-flex flex-column gap-2">
                    {winner.options.map((option, idx) => (
                      <Badge key={idx} bg="primary" className="fs-6 p-2">
                        {option.text} - {option.votes} votes ({winner.percentage}%)
                      </Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <div>
              <Card className="bg-success text-white mb-3 animate__animated animate__zoomIn">
                <Card.Body className="p-4">
                  <i className="bi bi-trophy-fill fs-1 d-block mb-3 animate__animated animate__bounce animate__infinite"></i>
                  <h3 className="mb-3">🏆 Winner! 🏆</h3>
                  <h4 className="mb-2 fw-bold">{winner.option.text}</h4>
                  <div className="mt-3">
                    <Badge bg="light" text="dark" className="fs-5 p-2 me-2">
                      {winner.option.votes} votes
                    </Badge>
                    <Badge bg="light" text="dark" className="fs-5 p-2">
                      {winner.percentage}%
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}

          <div className="mt-4">
            <small className="text-muted">
              Total votes: {winner.totalVotes}
            </small>
          </div>

          {/* Custom Message Section */}
          <div className="mt-4">
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => setShowCustomMessage(!showCustomMessage)}
              className="mb-2"
            >
              <i className="bi bi-pencil me-2"></i>
              {showCustomMessage ? 'Hide' : 'Customize'} Announcement
            </Button>
            
            {showCustomMessage && (
              <Card className="mt-2">
                <Card.Body>
                  <Form.Group>
                    <Form.Label>Custom Announcement Message:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder={winner.isTie 
                        ? `The poll "${poll.title}" has ended! It's a tie between ${winner.options.length} options...`
                        : `The poll "${poll.title}" has ended! The winner is "${winner.option.text}"...`}
                      value={customAnnouncementText}
                      onChange={(e) => setCustomAnnouncementText(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      This message will be used for text-to-speech announcement
                    </Form.Text>
                  </Form.Group>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      announceWinner(true);
                    }}
                    className="mt-2"
                    disabled={!customAnnouncementText.trim()}
                  >
                    <i className="bi bi-megaphone-fill me-2"></i>
                    Announce with Custom Message
                  </Button>
                </Card.Body>
              </Card>
            )}
          </div>

          {/* Social Sharing Section */}
          <div className="mt-4 pt-3 border-top">
            <h6 className="mb-3">Share the Results:</h6>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={shareOnTwitter}
                className="share-btn"
              >
                <i className="bi bi-twitter me-2"></i>
                Twitter
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={shareOnFacebook}
                className="share-btn"
              >
                <i className="bi bi-facebook me-2"></i>
                Facebook
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={shareOnLinkedIn}
                className="share-btn"
              >
                <i className="bi bi-linkedin me-2"></i>
                LinkedIn
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={copyToClipboard}
                className="share-btn"
              >
                <i className="bi bi-clipboard me-2"></i>
                Copy
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 justify-content-center">
        <Button variant="primary" onClick={onClose} className="px-4">
          View Full Results
        </Button>
        <Button variant="outline-secondary" onClick={onClose} className="px-4">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default WinnerAnnouncement;

