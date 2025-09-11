#!/usr/bin/env python3
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Flask is working!"

if __name__ == '__main__':
    print("Starting test Flask app...")
    app.run(host='0.0.0.0', port=8001, debug=True)