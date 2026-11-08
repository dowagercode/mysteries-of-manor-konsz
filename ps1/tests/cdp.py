"""Tiny CDP client: open a URL in headless Brave, optionally run JS, save screenshots.
usage: cdp.py <url> <out-prefix> [js-step ...]   (each js-step runs, then a screenshot is taken)
"""
import base64, json, os, socket, subprocess, sys, time, urllib.request

SP = os.path.dirname(os.path.abspath(__file__))
B = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
PORT = 9333
url, prefix, steps = sys.argv[1], sys.argv[2], sys.argv[3:]
prof = os.path.join(SP, "prof-cdp")  # browser profile kept next to this script
proc = subprocess.Popen([B, "--headless=new", "--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
                         f"--remote-debugging-port={PORT}", f"--user-data-dir={prof}", "--window-size=900,800", "about:blank"],
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(60):
        try:
            tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json"))
            page = [t for t in tabs if t["type"] == "page"][0]
            break
        except Exception:
            time.sleep(0.5)
    ws = page["webSocketDebuggerUrl"]
    path = ws.split(str(PORT), 1)[1]
    s = socket.create_connection(("127.0.0.1", PORT))
    key = base64.b64encode(os.urandom(16)).decode()
    s.send(f"GET {path} HTTP/1.1\r\nHost: 127.0.0.1:{PORT}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n".encode())
    buf = b""
    while b"\r\n\r\n" not in buf:
        buf += s.recv(4096)
    buf = buf.split(b"\r\n\r\n", 1)[1]

    def recv_exact(n):
        nonlocal_buf = getattr(recv_exact, "b", buf_holder)
        while len(buf_holder[0]) < n:
            buf_holder[0] += s.recv(65536)
        out, buf_holder[0] = buf_holder[0][:n], buf_holder[0][n:]
        return out
    buf_holder = [buf]

    def send(obj):
        data = json.dumps(obj).encode()
        hdr = bytearray([0x81])
        mask = os.urandom(4)
        n = len(data)
        if n < 126: hdr.append(0x80 | n)
        elif n < 65536: hdr += bytes([0x80 | 126]) + n.to_bytes(2, "big")
        else: hdr += bytes([0x80 | 127]) + n.to_bytes(8, "big")
        s.send(bytes(hdr) + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))

    def recv():
        msg = b""
        while True:
            h = recv_exact(2)
            n = h[1] & 0x7F
            if n == 126: n = int.from_bytes(recv_exact(2), "big")
            elif n == 127: n = int.from_bytes(recv_exact(8), "big")
            msg += recv_exact(n)
            if h[0] & 0x80: return json.loads(msg)

    mid = [0]
    logs = []
    def call(method, params=None):
        mid[0] += 1
        send({"id": mid[0], "method": method, "params": params or {}})
        while True:
            r = recv()
            if r.get("method") == "Runtime.consoleAPICalled":
                logs.append(" ".join(str(a.get("value", a.get("description", ""))) for a in r["params"]["args"]))
            if r.get("method") == "Runtime.exceptionThrown":
                logs.append("EXCEPTION " + json.dumps(r["params"]["exceptionDetails"])[:400])
            if r.get("id") == mid[0]: return r

    call("Runtime.enable"); call("Page.enable")
    call("Page.navigate", {"url": url})
    time.sleep(8)
    def shot(name):
        r = call("Page.captureScreenshot", {"format": "png"})
        open(name, "wb").write(base64.b64decode(r["result"]["data"]))
        print("saved", name)
    shot(f"{prefix}-0.png")
    for i, js in enumerate(steps, 1):
        r = call("Runtime.evaluate", {"expression": js, "awaitPromise": True, "returnByValue": True})
        v = r.get("result", {}).get("result", {}).get("value"); print("step", i, v if isinstance(v, str) else json.dumps(v)[:300])
        time.sleep(3)
        shot(f"{prefix}-{i}.png")
    for l in logs:
        if "GL Driver" not in l: print("LOG", l[:300])
finally:
    proc.kill()
