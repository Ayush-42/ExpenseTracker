# Fix File Watcher Limit Error (ENOSPC)

## Problem
The error `ENOSPC: System limit for number of file watchers reached` occurs when the system has too many files being watched.

## Solution

### Option 1: Temporary Fix (until next reboot)
Run this command in your terminal:
```bash
sudo sysctl fs.inotify.max_user_watches=524288
```

### Option 2: Permanent Fix (recommended)
Run these commands to make the change permanent:
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Option 3: Alternative - Reduce Vite's watch scope
If you can't use sudo, you can configure Vite to watch fewer files by adding this to `vite.config.ts`:
```typescript
server: {
  open: true,
  watch: {
    usePolling: false,
    ignored: ['**/node_modules/**', '**/.git/**']
  }
}
```

## Verify the fix
After applying the fix, check the new limit:
```bash
cat /proc/sys/fs/inotify/max_user_watches
```

It should show `524288` (or the value you set).

## Then try running the dev server again:
```bash
cd client
npm run dev
```

