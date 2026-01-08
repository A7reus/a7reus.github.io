---
title: "CyberHero - TryHackMe Writeup"
description: "My solution to the room \"CyberHero\" on TryHackMe."
categories: [CTF Writeups]
tags: [Web, Cybersecurity]
---

[Link to the TryHackMe room.](https://tryhackme.com/room/cyberheroes)

### Performing a Scan

The first thing you can do is performing an nmap scan on the ip.

```
$ nmap -sV 10.201.72.211
Starting Nmap 7.80 ( https://nmap.org ) at 2025-11-01 09:13 GMT
mass_dns: warning: Unable to open /etc/resolv.conf. Try using --system-dns or specify valid servers with --dns-servers
mass_dns: warning: Unable to determine any DNS servers. Reverse DNS is disabled. Try using --system-dns or specify valid servers with --dns-servers
Nmap scan report for 10.201.72.211
Host is up (0.0011s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.4 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.48 ((Ubuntu))
MAC Address: 16:FF:F8:50:26:07 (Unknown)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.67 seconds
```

From the output, there seems to be an `http` service running on port `80`. Let's visit the site using a browser.

### Visiting the Website

At first glace, there isn't anything suspicious on the Home and About pages. As the problem description hints at an authentication bypass, the place we want to be is probably the Login page. Hit the Login option from the navigation bar.

This presents us with a typical login form. Let's input some typical credentials like admin:admin to start off. Upon doing this, we get the following alert from the browser: `Incorrect Password, try again.. you got this hacker!`

Two things you should notice right away are:

* There is no reload.
* The alert pops up way too quickly for a server-side authentication.

Suspicion: The authentication must be happening on the client side.

### Going Through the Client-Side Code

Let's dig a bit more. Check your network tab. So many javascript files! Let's also inspect the button element that submits the form.

```html
<button id="rm" onclick="authenticate()">login</button>
```

Apparently, it calls the `authenticate()` function. Go back to your network tab, and look for the function definition of `authenticate()`.

It's right inside the `login.html` file which has been loaded on the client side. Now all you have to do is read through the function definition, which contains handcoded username and password.

```javascript
function authenticate() {
  a = document.getElementById("uname");
  b = document.getElementById("pass");
  const RevereString = (str) => [...str].reverse().join("");
  if ((a.value == "<redacted>") & (b.value == RevereString("<redacted>"))) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("flag").innerHTML = this.responseText;
        document.getElementById("todel").innerHTML = "";
        document.getElementById("rm").remove();
      }
    };
    xhttp.open(
      "GET",
      "RandomLo0o0o0o0o0o0o0o0o0o0gpath12345_Flag_" +
        a.value +
        "_" +
        b.value +
        ".txt",
      true,
    );
    xhttp.send();
  } else {
    alert("Incorrect Password, try again.. you got this hacker !");
  }
}
```

Input the discovered username and (reversed) password into the login form to retrieve the flag.
