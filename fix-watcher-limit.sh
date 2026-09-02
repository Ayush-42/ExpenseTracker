#!/bin/bash

# Script to fix file watcher limit issue

echo "Current file watcher limit:"
cat /proc/sys/fs/inotify/max_user_watches

echo ""
echo "Attempting to increase file watcher limit..."
echo "You may be prompted for your password."

# Try to increase the limit
sudo sysctl fs.inotify.max_user_watches=524288

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Successfully increased limit temporarily!"
    echo ""
    echo "New limit:"
    cat /proc/sys/fs/inotify/max_user_watches
    echo ""
    echo "To make this permanent, run:"
    echo "  echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf"
    echo "  sudo sysctl -p"
else
    echo ""
    echo "✗ Failed to increase limit. Using polling mode in Vite instead."
    echo "The dev server should still work, but may be slightly slower."
fi

