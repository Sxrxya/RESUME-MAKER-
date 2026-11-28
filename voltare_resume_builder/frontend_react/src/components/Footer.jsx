import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const handleAdminNavigation = (e) => {
    e.preventDefault();
    navigate('/admin');
  };

  return (
    <footer className="voltare-footer">
      <div className="voltare-footer-inner">
        <div className="voltare-footer-text">
          VOLTARE Consultancy — Official Resume Builder &nbsp;|&nbsp;{' '}
          All resumes follow the standardized Voltare format &nbsp;|&nbsp;{' '}
          <a href="https://www.voltare.in/" target="_blank" rel="noopener noreferrer">
            voltare.in
          </a>
        </div>
        <div className="voltare-footer-brand-corner">
          <a
            href="/admin"
            className="voltare-footer-logo-link"
            onClick={handleAdminNavigation}
            title="Voltare"
            aria-label="Voltare"
          >
            <img
              src="/company_logo.png"
              alt="Voltare"
              className="voltare-footer-logo"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
