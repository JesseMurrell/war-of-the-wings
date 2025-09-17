# Test Your Google Apps Script

## Quick Test URLs

To test if your Google Apps Script is working correctly, try these URLs in your browser:

### 1. Test Basic Response (JSON)

```
https://script.google.com/macros/s/AKfycbzw_QdGe6QVFFPfLwkATptGvvPKvqjczyvegSWSHfJYzvFwKckRnWZjX5JaaZZM_pEs/exec
```

**Expected:** JSON response with success message

### 2. Test JSONP Response (JavaScript)

```
https://script.google.com/macros/s/AKfycbzw_QdGe6QVFFPfLwkATptGvvPKvqjczyvegSWSHfJYzvFwKckRnWZjX5JaaZZM_pEs/exec?callback=testCallback
```

**Expected:** JavaScript response like `testCallback({"success":true,...})`

### 3. Test getPlayers Action (JSON)

```
https://script.google.com/macros/s/AKfycbzw_QdGe6QVFFPfLwkATptGvvPKvqjczyvegSWSHfJYzvFwKckRnWZjX5JaaZZM_pEs/exec?action=getPlayers
```

**Expected:** JSON response with players array

### 4. Test getPlayers with JSONP (JavaScript)

```
https://script.google.com/macros/s/AKfycbzw_QdGe6QVFFPfLwkATptGvvPKvqjczyvegSWSHfJYzvFwKckRnWZjX5JaaZZM_pEs/exec?action=getPlayers&callback=testCallback
```

**Expected:** JavaScript response like `testCallback({"success":true,"players":[...]})`

## What to Check

1. **Content-Type Header:** The JSONP responses (URLs with `callback=`) should have `Content-Type: text/javascript` or `application/javascript`
2. **Response Format:** JSONP responses should be wrapped in the callback function
3. **No CORS Errors:** Direct browser access shouldn't show CORS errors

## If Tests Fail

If any of these tests don't work as expected, it means you need to:

1. **Copy the updated `google-apps-script.js` code** from this project
2. **Paste it into Google Apps Script** (replacing all existing code)
3. **Save the script** (Ctrl+S)
4. **Deploy a new version** or update the existing deployment

The most important test is #4 - if that returns JavaScript (not JSON) and wraps the response in `testCallback(...)`, then your script is working correctly and the issue might be elsewhere.
