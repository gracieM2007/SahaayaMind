"""
SahaayaMind MVP - Local Server & Static Web Server
Smart India Hackathon 2026 (SIH26003)
Team Arbalest (AI006)
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("=" * 60)
        print(f"  🧠 SahaayaMind MVP Web Platform Running")
        print(f"  🌐 URL: http://localhost:{PORT}")
        print(f"  📁 Serving Directory: {DIRECTORY}")
        print("=" * 60)
        print("Press Ctrl+C to stop the server.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    start_server()
