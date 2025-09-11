#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Zeabur 部署入口點
"""

import os
from app_mysql import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)