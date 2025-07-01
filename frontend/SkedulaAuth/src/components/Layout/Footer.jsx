import React from 'react'

function Footer() {
  return (
    <footer className="bg-light text-center py-3 mt-auto">
      <div className="container">
        <span className="text-muted d-block mb-2">
          &copy; {new Date().getFullYear()} Skedula &middot; All rights reserved.
        </span>
        <div>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-2 text-muted"
            aria-label="Twitter"
          >
            <i className="bi bi-twitter"></i>
          </a>
          <a
            href="https://facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-2 text-muted"
            aria-label="Facebook"
          >
            <i className="bi bi-facebook"></i>
          </a>
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-2 text-muted"
            aria-label="Instagram"
          >
            <i className="bi bi-instagram"></i>
          </a>
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-2 text-muted"
            aria-label="LinkedIn"
          >
            <i className="bi bi-linkedin"></i>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer